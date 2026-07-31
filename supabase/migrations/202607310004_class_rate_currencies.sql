-- Explicit per-class rate currency and an atomic rate/balance editor.
-- Existing amounts are intentionally left unchanged; legacy rows begin as MXN.
alter table public.ep_class_payment_rates
  add column if not exists currency_code text;

update public.ep_class_payment_rates
set currency_code = 'MXN'
where currency_code is null;

alter table public.ep_class_payment_rates
  alter column currency_code set default 'MXN',
  alter column currency_code set not null;

alter table public.ep_class_payment_rates
  drop constraint if exists ep_class_payment_rates_currency_code_check;
alter table public.ep_class_payment_rates
  add constraint ep_class_payment_rates_currency_code_check
  check (currency_code in ('MXN', 'USD'));

create or replace function public.ep_save_class_payment_rate(
  p_class_id uuid,
  p_charge_rate numeric,
  p_teacher_rate numeric,
  p_currency_code text,
  p_classes_remaining integer
) returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_balance integer;
  balance_delta integer;
  normalized_currency text := upper(trim(p_currency_code));
begin
  if not public.ep_is_admin() then
    raise exception 'Only Master Admin can change class payment rates';
  end if;
  if p_charge_rate is null or p_charge_rate < 0
     or (p_teacher_rate is not null and p_teacher_rate < 0) then
    raise exception 'Rates must be non-negative';
  end if;
  if normalized_currency not in ('MXN', 'USD') then
    raise exception 'Unsupported class rate currency';
  end if;
  if p_classes_remaining is null then
    raise exception 'Classes remaining is required';
  end if;

  select classes_remaining into current_balance
  from public.ep_class_credit_balances
  where class_id = p_class_id;
  if current_balance is null then
    raise exception 'Class not found';
  end if;

  insert into public.ep_class_payment_rates
    (class_id, charge_rate, teacher_rate, currency_code, updated_at)
  values
    (p_class_id, p_charge_rate, p_teacher_rate, normalized_currency, now())
  on conflict (class_id) do update set
    charge_rate = excluded.charge_rate,
    teacher_rate = excluded.teacher_rate,
    currency_code = excluded.currency_code,
    updated_at = excluded.updated_at;

  balance_delta := p_classes_remaining - current_balance;
  if balance_delta <> 0 then
    insert into public.ep_class_credit_transactions
      (class_id, transaction_type, quantity, note, created_by_user_id)
    values
      (p_class_id, 'Manual adjustment', balance_delta,
       'Balance set from Payments rate editor', auth.uid());
  end if;
end;
$$;

revoke all on function public.ep_save_class_payment_rate(uuid,numeric,numeric,text,integer) from public;
grant execute on function public.ep_save_class_payment_rate(uuid,numeric,numeric,text,integer) to authenticated;
notify pgrst, 'reload schema';
