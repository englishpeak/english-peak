-- Pay-day reports belong to a teacher and a specific pay day. Two open dates
-- may fall in the same week; submitting one must never replace the other.
begin;

alter table public.ep_weekly_reports
  drop constraint if exists ep_weekly_reports_teacher_user_id_week_start_key;

create unique index if not exists ep_reports_teacher_pay_day_key
  on public.ep_weekly_reports (teacher_user_id, pay_day_id);

-- Preserve the original uniqueness rule for historical weekly-only reports.
create unique index if not exists ep_reports_teacher_legacy_week_key
  on public.ep_weekly_reports (teacher_user_id, week_start)
  where pay_day_id is null;

notify pgrst, 'reload schema';
commit;
