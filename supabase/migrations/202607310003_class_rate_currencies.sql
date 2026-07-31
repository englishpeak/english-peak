alter table public.ep_class_payment_rates
  add column if not exists payment_currency text not null default 'MXN'
  check (payment_currency in ('USD', 'MXN'));
