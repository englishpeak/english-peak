-- Allow teachers to maintain details for students and classes currently assigned to them.
-- Account linkage, administrative notes, rosters, and teaching teams stay Admin-only.
create or replace function public.ep_guard_teacher_student_update() returns trigger
language plpgsql set search_path=public as $$
begin
  if not public.ep_is_admin() and
    (new.id,new.user_id,new.administrative_notes,new.created_at,new.account_matched_at,new.account_matched_by)
      is distinct from
    (old.id,old.user_id,old.administrative_notes,old.created_at,old.account_matched_at,old.account_matched_by) then
    raise exception 'Teachers may not change student account or administrative fields';
  end if;
  return new;
end $$;

drop trigger if exists ep_guard_teacher_student_update on public.ep_students;
create trigger ep_guard_teacher_student_update before update on public.ep_students
for each row execute function public.ep_guard_teacher_student_update();

create or replace function public.ep_guard_teacher_class_update() returns trigger
language plpgsql set search_path=public as $$
begin
  if not public.ep_is_admin() and
    (new.id,new.created_by_user_id,new.created_at) is distinct from (old.id,old.created_by_user_id,old.created_at) then
    raise exception 'Teachers may not change class ownership fields';
  end if;
  return new;
end $$;

drop trigger if exists ep_guard_teacher_class_update on public.ep_classes;
create trigger ep_guard_teacher_class_update before update on public.ep_classes
for each row execute function public.ep_guard_teacher_class_update();

create policy ep_students_assigned_update on public.ep_students for update
using (ep_is_teacher() and ep_teacher_has_student(id))
with check (ep_is_teacher() and ep_teacher_has_student(id));

create or replace function public.ep_teacher_assigned_class(class_uuid uuid, teacher uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$ select exists(
  select 1 from public.ep_class_teachers
  where class_id=class_uuid and teacher_user_id=teacher and status='Active'
) $$;

create policy ep_classes_teacher_update on public.ep_classes for update
using (ep_is_teacher() and ep_teacher_assigned_class(id))
with check (ep_is_teacher() and ep_teacher_assigned_class(id));

notify pgrst, 'reload schema';
