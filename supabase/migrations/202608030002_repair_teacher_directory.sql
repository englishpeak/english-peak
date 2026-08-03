-- Repair the Teachers directory without broadening access to public.profiles.
-- The browser receives only the fields used by Academic Management, and only a
-- signed-in Master Admin can execute the function.
create or replace function public.ep_admin_teacher_directory()
returns table (
  id uuid,
  email text,
  full_name text,
  tier text,
  is_admin boolean,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.email, p.full_name, p.tier, p.is_admin, p.created_at
  from public.profiles p
  where public.ep_is_admin()
    and lower(coalesce(p.tier, '')) = 'teacher'
  order by p.created_at desc;
$$;

revoke all on function public.ep_admin_teacher_directory() from public, anon;
grant execute on function public.ep_admin_teacher_directory() to authenticated;

-- Repair table privileges that PostgREST needs. Row-level security remains the
-- authority for which records an authenticated user may see or change.
grant select, insert, update, delete on
  public.ep_teacher_profiles,
  public.ep_students,
  public.ep_student_teacher_assignments,
  public.ep_class_sessions,
  public.ep_weekly_reports,
  public.ep_tasks,
  public.ep_task_comments,
  public.ep_notes,
  public.ep_classes,
  public.ep_class_students,
  public.ep_class_teachers,
  public.ep_pay_report_lines,
  public.ep_pay_days,
  public.ep_class_payment_rates,
  public.ep_payment_adjustments,
  public.ep_class_credit_transactions
to authenticated;

grant select on public.ep_class_credit_balances to authenticated;

insert into public.ep_teacher_profiles (user_id)
select p.id
from public.profiles p
where lower(coalesce(p.tier, '')) = 'teacher'
on conflict (user_id) do nothing;

notify pgrst, 'reload schema';
