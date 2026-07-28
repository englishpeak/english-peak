-- Keep English Peak Student accounts in the academic-management student roster.
-- The auth profile remains the source of truth; the roster row stores its user id
-- so repeated tier changes cannot create duplicate students.
alter table public.ep_students
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create unique index if not exists ep_students_user_id_unique
  on public.ep_students(user_id)
  where user_id is not null;

create or replace function public.ep_sync_student_from_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(coalesce(new.tier, '')) = 'student' then
    insert into public.ep_students (user_id, full_name, email, status, start_date)
    values (
      new.id,
      coalesce(nullif(trim(new.full_name), ''), split_part(new.email, '@', 1), 'English Peak Student'),
      new.email,
      'Active',
      current_date
    )
    on conflict (user_id) where user_id is not null do update
      set full_name = excluded.full_name,
          email = excluded.email,
          status = case when ep_students.status = 'Prospect' then 'Active' else ep_students.status end;
  end if;
  return new;
end;
$$;

drop trigger if exists ep_sync_student_from_profile on public.profiles;
create trigger ep_sync_student_from_profile
after insert or update of tier, full_name, email on public.profiles
for each row execute function public.ep_sync_student_from_profile();

insert into public.ep_students (user_id, full_name, email, status, start_date)
select p.id,
       coalesce(nullif(trim(p.full_name), ''), split_part(p.email, '@', 1), 'English Peak Student'),
       p.email,
       'Active',
       current_date
from public.profiles p
where lower(coalesce(p.tier, '')) = 'student'
on conflict (user_id) where user_id is not null do update
  set full_name = excluded.full_name,
      email = excluded.email;

notify pgrst, 'reload schema';
