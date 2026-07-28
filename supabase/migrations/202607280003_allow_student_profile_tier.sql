-- Follow-up for projects that applied the student roster migration before its
-- profiles constraint update was added. Safe to run more than once.
alter table public.profiles drop constraint if exists profiles_tier_check;
alter table public.profiles
  add constraint profiles_tier_check
  check (tier in ('free', 'premium', 'teacher', 'student', 'courtesy'));

notify pgrst, 'reload schema';
