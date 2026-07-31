-- Prepaid class balances, auditable manual credits, and atomic class roster/team editing.
create table if not exists public.ep_class_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.ep_classes(id) on delete cascade,
  transaction_type text not null check (transaction_type in ('Payment','Manual adjustment')),
  quantity integer not null check (quantity <> 0),
  payment_amount numeric(12,2) check (payment_amount is null or payment_amount >= 0),
  payment_date date,
  note text,
  created_by_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  check ((transaction_type = 'Payment' and payment_amount is not null and payment_date is not null)
    or (transaction_type = 'Manual adjustment' and payment_amount is null))
);

alter table public.ep_class_credit_transactions enable row level security;
create policy ep_class_credit_transactions_admin on public.ep_class_credit_transactions
  for all using (public.ep_is_admin()) with check (public.ep_is_admin());
revoke all on public.ep_class_credit_transactions from authenticated;
grant select, insert on public.ep_class_credit_transactions to authenticated;

create or replace view public.ep_class_credit_balances with (security_invoker=true) as
select c.id as class_id,
  coalesce((select sum(t.quantity) from public.ep_class_credit_transactions t where t.class_id=c.id),0)::integer as classes_added,
  coalesce((select count(*) from public.ep_class_sessions s where s.class_id=c.id and s.status in ('Completed','Make-up class')),0)::integer as classes_used,
  (coalesce((select sum(t.quantity) from public.ep_class_credit_transactions t where t.class_id=c.id),0)
   - coalesce((select count(*) from public.ep_class_sessions s where s.class_id=c.id and s.status in ('Completed','Make-up class')),0))::integer as classes_remaining
from public.ep_classes c;
grant select on public.ep_class_credit_balances to authenticated;

create or replace function public.ep_update_class_roster_and_team(
  p_class_id uuid, p_name text, p_class_types text[], p_classes_per_week integer,
  p_status text, p_student_ids uuid[], p_main_teacher_id uuid, p_secondary_teacher_ids uuid[]
) returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.ep_is_admin() then raise exception 'Only Master Admin can reassign classes'; end if;
  if nullif(trim(p_name),'') is null or cardinality(p_class_types)=0 or p_classes_per_week < 1 then
    raise exception 'Class name, type, and weekly frequency are required';
  end if;
  update public.ep_classes set name=trim(p_name), class_type=p_class_types,
    classes_per_week=p_classes_per_week, status=p_status where id=p_class_id;
  update public.ep_class_students set status='Ended' where class_id=p_class_id;
  insert into public.ep_class_students(class_id,student_id,status)
    select p_class_id,student_id,'Active' from unnest(coalesce(p_student_ids,'{}')) student_id
    on conflict(class_id,student_id) do update set status='Active';
  update public.ep_class_teachers set status='Ended' where class_id=p_class_id;
  insert into public.ep_class_teachers(class_id,teacher_user_id,role,status)
    values(p_class_id,p_main_teacher_id,'Main teacher','Active')
    on conflict(class_id,teacher_user_id) do update set role='Main teacher',status='Active';
  insert into public.ep_class_teachers(class_id,teacher_user_id,role,status)
    select p_class_id,teacher_id,'Secondary teacher','Active'
    from unnest(coalesce(p_secondary_teacher_ids,'{}')) teacher_id where teacher_id<>p_main_teacher_id
    on conflict(class_id,teacher_user_id) do update set role='Secondary teacher',status='Active';
end $$;

revoke all on function public.ep_update_class_roster_and_team(uuid,text,text[],integer,text,uuid[],uuid,uuid[]) from public;
grant execute on function public.ep_update_class_roster_and_team(uuid,text,text[],integer,text,uuid[],uuid,uuid[]) to authenticated;
notify pgrst, 'reload schema';
