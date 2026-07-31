-- Store purchased balances as hours, including fractional hour packages.
alter table public.ep_class_credit_transactions
  alter column quantity type numeric(10,2) using quantity::numeric;

drop view if exists public.ep_class_credit_balances;
create view public.ep_class_credit_balances
with (security_invoker = true) as
select c.id as class_id,
  coalesce((select sum(t.quantity) from public.ep_class_credit_transactions t where t.class_id=c.id),0)::numeric(10,2) as classes_added,
  coalesce((select count(*) from public.ep_class_sessions s where s.class_id=c.id and s.status in ('Completed','Make-up class')),0)::numeric(10,2) as classes_used,
  (coalesce((select sum(t.quantity) from public.ep_class_credit_transactions t where t.class_id=c.id),0)
   - coalesce((select count(*) from public.ep_class_sessions s where s.class_id=c.id and s.status in ('Completed','Make-up class')),0))::numeric(10,2) as classes_remaining
from public.ep_classes c;

-- Replace the integer signature so decimal hours can be registered atomically.
drop function if exists public.ep_register_class_payment(uuid,uuid,integer,numeric,text,date,numeric,text,timestamptz,text,text);
create or replace function public.ep_register_class_payment(
 p_class_id uuid, p_student_id uuid, p_quantity numeric, p_payment_amount numeric,
 p_payment_currency text, p_payment_date date, p_exchange_rate_usd_mxn numeric default null,
 p_exchange_rate_source text default null, p_exchange_rate_fetched_at timestamptz default null,
 p_reference text default null, p_note text default null)
returns public.ep_class_credit_transactions
language plpgsql security definer set search_path = pg_catalog, public
as $$ declare result public.ep_class_credit_transactions; currency text := upper(trim(p_payment_currency)); begin
 if not public.ep_is_admin() then raise exception using errcode='42501', message='Administrator authorization required'; end if;
 if not exists(select 1 from public.ep_classes where id=p_class_id) then raise exception 'Class not found'; end if;
 if not exists(select 1 from public.ep_class_students where class_id=p_class_id and student_id=p_student_id and status='Active') then raise exception 'Student is not actively enrolled in this class'; end if;
 if p_quantity is null or p_quantity<=0 then raise exception 'Hours covered must be greater than zero'; end if;
 if p_payment_amount is null or p_payment_amount<=0 then raise exception 'Payment amount must be greater than zero'; end if;
 if currency not in ('MXN','USD') then raise exception 'Unsupported payment currency'; end if;
 if currency='USD' and (p_exchange_rate_usd_mxn is null or p_exchange_rate_usd_mxn<=0 or nullif(trim(p_exchange_rate_source),'') is null or p_exchange_rate_fetched_at is null) then raise exception 'USD payments require a captured exchange rate'; end if;
 if currency='MXN' and num_nonnulls(p_exchange_rate_usd_mxn,p_exchange_rate_source,p_exchange_rate_fetched_at)>0 then raise exception 'MXN payments cannot contain exchange-rate data'; end if;
 insert into public.ep_class_credit_transactions(class_id,student_id,transaction_type,quantity,payment_amount,payment_currency,payment_date,exchange_rate_usd_mxn,payment_amount_mxn,exchange_rate_source,exchange_rate_fetched_at,payment_reference,note,created_by_user_id)
 values(p_class_id,p_student_id,'Payment',round(p_quantity,2),round(p_payment_amount,2),currency,p_payment_date,case when currency='USD' then p_exchange_rate_usd_mxn end,case when currency='USD' then round(p_payment_amount*p_exchange_rate_usd_mxn,2) end,case when currency='USD' then trim(p_exchange_rate_source) end,case when currency='USD' then p_exchange_rate_fetched_at end,nullif(trim(p_reference),''),nullif(trim(p_note),''),auth.uid()) returning * into result;
 return result;
end $$;
revoke all on function public.ep_register_class_payment(uuid,uuid,numeric,numeric,text,date,numeric,text,timestamptz,text,text) from public, anon;
grant execute on function public.ep_register_class_payment(uuid,uuid,numeric,numeric,text,date,numeric,text,timestamptz,text,text) to authenticated;
notify pgrst, 'reload schema';

-- Keep the rate editor compatible with fractional remaining-hour balances.
drop function if exists public.ep_save_class_payment_rate(uuid,numeric,numeric,text,integer);
create or replace function public.ep_save_class_payment_rate(
  p_class_id uuid, p_charge_rate numeric, p_teacher_rate numeric,
  p_currency_code text, p_classes_remaining numeric
) returns void
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare
  current_balance numeric;
  balance_delta numeric;
  normalized_currency text := upper(trim(p_currency_code));
begin
  if not public.ep_is_admin() then raise exception 'Only Master Admin can change class payment rates'; end if;
  if p_charge_rate is null or p_charge_rate < 0 or (p_teacher_rate is not null and p_teacher_rate < 0) then raise exception 'Rates must be non-negative'; end if;
  if normalized_currency not in ('MXN', 'USD') then raise exception 'Unsupported class rate currency'; end if;
  if p_classes_remaining is null then raise exception 'Hours remaining is required'; end if;
  select classes_remaining into current_balance from public.ep_class_credit_balances where class_id = p_class_id;
  if current_balance is null then raise exception 'Class not found'; end if;
  insert into public.ep_class_payment_rates (class_id,charge_rate,teacher_rate,currency_code,updated_at)
  values (p_class_id,p_charge_rate,p_teacher_rate,normalized_currency,now())
  on conflict (class_id) do update set charge_rate=excluded.charge_rate,teacher_rate=excluded.teacher_rate,currency_code=excluded.currency_code,updated_at=excluded.updated_at;
  balance_delta := p_classes_remaining-current_balance;
  if balance_delta <> 0 then
    insert into public.ep_class_credit_transactions(class_id,transaction_type,quantity,note,created_by_user_id)
    values(p_class_id,'Manual adjustment',balance_delta,'Balance set from Payments rate editor',auth.uid());
  end if;
end $$;
revoke all on function public.ep_save_class_payment_rate(uuid,numeric,numeric,text,numeric) from public;
grant execute on function public.ep_save_class_payment_rate(uuid,numeric,numeric,text,numeric) to authenticated;
notify pgrst, 'reload schema';
