alter table public.ep_students
  add column if not exists payment_currency text not null default 'MXN'
  check (payment_currency in ('USD', 'MXN'));

alter table public.ep_class_credit_transactions
  add column if not exists student_id uuid references public.ep_students(id) on delete set null,
  add column if not exists payment_currency text,
  add column if not exists exchange_rate_usd_mxn numeric(14,6),
  add column if not exists payment_amount_mxn numeric(12,2),
  add column if not exists exchange_rate_source text,
  add column if not exists exchange_rate_fetched_at timestamptz;

update public.ep_class_credit_transactions
set payment_currency = 'MXN'
where transaction_type = 'Payment' and payment_currency is null;

alter table public.ep_class_credit_transactions
  add constraint ep_credit_payment_currency_check
    check (payment_currency is null or payment_currency in ('USD', 'MXN')),
  add constraint ep_credit_exchange_snapshot_check check (
    (transaction_type = 'Manual adjustment' and payment_currency is null and exchange_rate_usd_mxn is null and payment_amount_mxn is null)
    or
    (transaction_type = 'Payment' and (
      (payment_currency = 'MXN' and exchange_rate_usd_mxn is null and payment_amount_mxn is null)
      or
      (payment_currency = 'USD' and exchange_rate_usd_mxn > 0 and payment_amount_mxn >= 0 and exchange_rate_source is not null and exchange_rate_fetched_at is not null)
    ))
  );

create index if not exists ep_class_credit_transactions_student_idx
  on public.ep_class_credit_transactions(student_id, payment_date desc);
