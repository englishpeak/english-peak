-- Create classes atomically without requiring a roster, and allow anonymous payer receipts.
create or replace function public.ep_create_class_with_team(
  p_name text, p_class_types text[], p_classes_per_week integer,
  p_student_ids uuid[], p_main_teacher_id uuid, p_secondary_teacher_ids uuid[]
) returns uuid language plpgsql security definer set search_path=public as $$
declare class_id uuid;
begin
  if not public.ep_is_admin() then raise exception 'Only Master Admin can create classes'; end if;
  if nullif(trim(p_name),'') is null or cardinality(p_class_types)=0 or p_classes_per_week < 1 or p_main_teacher_id is null then
    raise exception 'Class name, type, weekly frequency, and main teacher are required';
  end if;
  insert into public.ep_classes(name,class_type,classes_per_week,status,created_by_user_id)
    values(trim(p_name),p_class_types,p_classes_per_week,'Active',auth.uid()) returning id into class_id;
  insert into public.ep_class_students(class_id,student_id,status)
    select class_id,student_id,'Active' from unnest(coalesce(p_student_ids,'{}')) student_id;
  insert into public.ep_class_teachers(class_id,teacher_user_id,role,status)
    values(class_id,p_main_teacher_id,'Main teacher','Active');
  insert into public.ep_class_teachers(class_id,teacher_user_id,role,status)
    select class_id,teacher_id,'Secondary teacher','Active'
    from unnest(coalesce(p_secondary_teacher_ids,'{}')) teacher_id where teacher_id<>p_main_teacher_id;
  return class_id;
end $$;
revoke all on function public.ep_create_class_with_team(text,text[],integer,uuid[],uuid,uuid[]) from public, anon;
grant execute on function public.ep_create_class_with_team(text,text[],integer,uuid[],uuid,uuid[]) to authenticated;

-- A receipt belongs to its class; identifying the individual payer is optional.
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
revoke all on function public.ep_register_class_payment(uuid,uuid,numeric,numeric,text,date,numeric,text,timestamptz,text,text) from public, anon;
grant execute on function public.ep_register_class_payment(uuid,uuid,numeric,numeric,text,date,numeric,text,timestamptz,text,text) to authenticated;
notify pgrst, 'reload schema';
