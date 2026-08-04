-- Allow payment records to be registered without a paid-by student and edited later.
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
 if p_student_id is not null and not exists(select 1 from public.ep_class_students where class_id=p_class_id and student_id=p_student_id and status='Active') then raise exception 'Student is not actively enrolled in this class'; end if;
 if p_quantity is null or p_quantity<=0 then raise exception 'Hours covered must be greater than zero'; end if;
 if p_payment_amount is null or p_payment_amount<=0 then raise exception 'Payment amount must be greater than zero'; end if;
 if currency not in ('MXN','USD') then raise exception 'Unsupported payment currency'; end if;
 if currency='USD' and (p_exchange_rate_usd_mxn is null or p_exchange_rate_usd_mxn<=0 or nullif(trim(p_exchange_rate_source),'') is null or p_exchange_rate_fetched_at is null) then raise exception 'USD payments require a captured exchange rate'; end if;
 if currency='MXN' and num_nonnulls(p_exchange_rate_usd_mxn,p_exchange_rate_source,p_exchange_rate_fetched_at)>0 then raise exception 'MXN payments cannot contain exchange-rate data'; end if;
 insert into public.ep_class_credit_transactions(class_id,student_id,transaction_type,quantity,payment_amount,payment_currency,payment_date,exchange_rate_usd_mxn,payment_amount_mxn,exchange_rate_source,exchange_rate_fetched_at,payment_reference,note,created_by_user_id)
 values(p_class_id,p_student_id,'Payment',round(p_quantity,2),round(p_payment_amount,2),currency,p_payment_date,case when currency='USD' then p_exchange_rate_usd_mxn end,case when currency='USD' then round(p_payment_amount*p_exchange_rate_usd_mxn,2) end,case when currency='USD' then trim(p_exchange_rate_source) end,case when currency='USD' then p_exchange_rate_fetched_at end,nullif(trim(p_reference),''),nullif(trim(p_note),''),auth.uid()) returning * into result;
 return result;
end $$;

create or replace function public.ep_update_class_payment(
 p_payment_id uuid, p_class_id uuid, p_student_id uuid, p_quantity numeric, p_payment_amount numeric,
 p_payment_currency text, p_payment_date date, p_exchange_rate_usd_mxn numeric default null,
 p_exchange_rate_source text default null, p_exchange_rate_fetched_at timestamptz default null,
 p_reference text default null, p_note text default null)
returns public.ep_class_credit_transactions
language plpgsql security definer set search_path = pg_catalog, public
as $$ declare result public.ep_class_credit_transactions; currency text := upper(trim(p_payment_currency)); begin
 if not public.ep_is_admin() then raise exception using errcode='42501', message='Administrator authorization required'; end if;
 if not exists(select 1 from public.ep_class_credit_transactions where id=p_payment_id and transaction_type='Payment') then raise exception 'Payment not found'; end if;
 if not exists(select 1 from public.ep_classes where id=p_class_id) then raise exception 'Class not found'; end if;
 if p_student_id is not null and not exists(select 1 from public.ep_class_students where class_id=p_class_id and student_id=p_student_id and status='Active') then raise exception 'Student is not actively enrolled in this class'; end if;
 if p_quantity is null or p_quantity<=0 then raise exception 'Hours covered must be greater than zero'; end if;
 if p_payment_amount is null or p_payment_amount<=0 then raise exception 'Payment amount must be greater than zero'; end if;
 if currency not in ('MXN','USD') then raise exception 'Unsupported payment currency'; end if;
 if currency='USD' and (p_exchange_rate_usd_mxn is null or p_exchange_rate_usd_mxn<=0 or nullif(trim(p_exchange_rate_source),'') is null or p_exchange_rate_fetched_at is null) then raise exception 'USD payments require a captured exchange rate'; end if;
 if currency='MXN' and num_nonnulls(p_exchange_rate_usd_mxn,p_exchange_rate_source,p_exchange_rate_fetched_at)>0 then raise exception 'MXN payments cannot contain exchange-rate data'; end if;
 update public.ep_class_credit_transactions set
  class_id=p_class_id, student_id=p_student_id, quantity=round(p_quantity,2), payment_amount=round(p_payment_amount,2),
  payment_currency=currency, payment_date=p_payment_date, exchange_rate_usd_mxn=case when currency='USD' then p_exchange_rate_usd_mxn end,
  payment_amount_mxn=case when currency='USD' then round(p_payment_amount*p_exchange_rate_usd_mxn,2) end,
  exchange_rate_source=case when currency='USD' then trim(p_exchange_rate_source) end,
  exchange_rate_fetched_at=case when currency='USD' then p_exchange_rate_fetched_at end,
  payment_reference=nullif(trim(p_reference),''), note=nullif(trim(p_note),'')
 where id=p_payment_id and transaction_type='Payment' returning * into result;
 return result;
end $$;

revoke all on function public.ep_register_class_payment(uuid,uuid,numeric,numeric,text,date,numeric,text,timestamptz,text,text) from public, anon;
grant execute on function public.ep_register_class_payment(uuid,uuid,numeric,numeric,text,date,numeric,text,timestamptz,text,text) to authenticated;
revoke all on function public.ep_update_class_payment(uuid,uuid,uuid,numeric,numeric,text,date,numeric,text,timestamptz,text,text) from public, anon;
grant execute on function public.ep_update_class_payment(uuid,uuid,uuid,numeric,numeric,text,date,numeric,text,timestamptz,text,text) to authenticated;
notify pgrst, 'reload schema';
