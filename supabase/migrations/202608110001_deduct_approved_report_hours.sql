-- Deduct class hours exactly once when a Master Admin approves a pay report.
-- Ledger entries update ep_class_credit_balances and preserve an audit trail.
alter table public.ep_class_credit_transactions
  add column if not exists weekly_report_id uuid references public.ep_weekly_reports(id) on delete restrict;

alter table public.ep_class_credit_transactions
  drop constraint if exists ep_class_credit_transactions_transaction_type_check,
  drop constraint if exists ep_class_credit_transactions_check,
  drop constraint if exists ep_credit_payment_currency_check,
  drop constraint if exists ep_credit_exchange_snapshot_check;

alter table public.ep_class_credit_transactions
  add constraint ep_class_credit_transactions_transaction_type_check
    check (transaction_type in ('Payment', 'Manual adjustment', 'Approved report')),
  add constraint ep_credit_transaction_details_check
    check ((transaction_type = 'Payment' and payment_amount is not null and payment_date is not null)
      or (transaction_type in ('Manual adjustment', 'Approved report') and payment_amount is null)),
  add constraint ep_credit_payment_currency_check
    check ((transaction_type in ('Manual adjustment', 'Approved report') and payment_currency is null)
      or (transaction_type = 'Payment' and payment_currency in ('USD', 'MXN'))),
  add constraint ep_credit_exchange_snapshot_check check (
    (transaction_type in ('Manual adjustment', 'Approved report')
      and exchange_rate_usd_mxn is null and payment_amount_mxn is null
      and exchange_rate_source is null and exchange_rate_fetched_at is null)
    or (transaction_type = 'Payment' and (
      (payment_currency = 'MXN'
        and exchange_rate_usd_mxn is null and payment_amount_mxn is null
        and exchange_rate_source is null and exchange_rate_fetched_at is null)
      or (payment_currency = 'USD'
        and exchange_rate_usd_mxn is not null and exchange_rate_usd_mxn > 0
        and payment_amount_mxn is not null and payment_amount_mxn >= 0
        and nullif(trim(exchange_rate_source), '') is not null
        and exchange_rate_fetched_at is not null)
    )));

create unique index if not exists ep_credit_approved_report_class_unique
  on public.ep_class_credit_transactions(weekly_report_id, class_id)
  where transaction_type = 'Approved report';

create or replace function public.ep_review_weekly_report(
  p_report_id uuid, p_status text, p_admin_comments text default null
) returns void
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare current_status text;
begin
  if not public.ep_is_admin() then
    raise exception using errcode = '42501', message = 'Only Master Admin can review pay reports';
  end if;
  if p_status not in ('Approved', 'Needs Changes', 'Draft') then
    raise exception 'Unsupported report review status';
  end if;

  select status into current_status from public.ep_weekly_reports
  where id = p_report_id for update;
  if current_status is null then raise exception 'Pay report not found'; end if;

  if p_status = 'Approved' then
    if current_status <> 'Submitted' then raise exception 'Only submitted reports can be approved'; end if;
    insert into public.ep_class_credit_transactions(
      class_id, transaction_type, quantity, note, created_by_user_id, weekly_report_id
    )
    select line.class_id, 'Approved report', -round(sum(line.hours), 2),
      'Hours deducted for approved weekly report', auth.uid(), p_report_id
    from public.ep_pay_report_lines line
    where line.report_id = p_report_id and line.class_id is not null
      and not line.is_extra and line.hours > 0
    group by line.class_id
    on conflict (weekly_report_id, class_id) where transaction_type = 'Approved report'
    do update set quantity = excluded.quantity, created_by_user_id = excluded.created_by_user_id;

    update public.ep_weekly_reports
    set status = 'Approved', approved_at = now(), admin_comments = p_admin_comments
    where id = p_report_id;
  else
    if p_status = 'Needs Changes' and nullif(trim(p_admin_comments), '') is null then
      raise exception 'An admin comment is required when requesting changes';
    end if;
    delete from public.ep_class_credit_transactions
    where weekly_report_id = p_report_id and transaction_type = 'Approved report';
    update public.ep_weekly_reports set status = p_status, approved_at = null,
      admin_comments = case when p_status = 'Needs Changes' then trim(p_admin_comments) else null end
    where id = p_report_id;
  end if;
end $$;

revoke all on function public.ep_review_weekly_report(uuid,text,text) from public, anon;
grant execute on function public.ep_review_weekly_report(uuid,text,text) to authenticated;
notify pgrst, 'reload schema';
