-- Create a class, its optional roster, and its teaching team as one operation.
-- This avoids leaving an unusable class behind when one of the related writes fails.
create or replace function public.ep_create_class_with_team(
  p_name text,
  p_class_types text[],
  p_classes_per_week integer,
  p_student_ids uuid[],
  p_main_teacher_id uuid,
  p_secondary_teacher_ids uuid[]
) returns uuid
language plpgsql
set search_path = public
as $$
declare
  new_class_id uuid;
begin
  if not public.ep_is_admin() then
    raise exception 'Only Master Admin can create classes';
  end if;
  if nullif(trim(p_name), '') is null then
    raise exception 'Class name is required';
  end if;
  if coalesce(cardinality(p_class_types), 0) = 0 then
    raise exception 'Select at least one type of class';
  end if;
  if p_classes_per_week is null or p_classes_per_week < 1 then
    raise exception 'Classes per week must be at least 1';
  end if;
  if p_main_teacher_id is null then
    raise exception 'Select a main teacher';
  end if;

  insert into public.ep_classes
    (name, class_type, classes_per_week, status, created_by_user_id)
  values
    (trim(p_name), p_class_types, p_classes_per_week, 'Active', auth.uid())
  returning id into new_class_id;

  insert into public.ep_class_teachers
    (class_id, teacher_user_id, role, status)
  values
    (new_class_id, p_main_teacher_id, 'Main teacher', 'Active');

  insert into public.ep_class_teachers
    (class_id, teacher_user_id, role, status)
  select new_class_id, teacher_id, 'Secondary teacher', 'Active'
  from unnest(coalesce(p_secondary_teacher_ids, array[]::uuid[])) as teacher_id
  where teacher_id <> p_main_teacher_id;

  insert into public.ep_class_students
    (class_id, student_id, status)
  select new_class_id, student_id, 'Active'
  from unnest(coalesce(p_student_ids, array[]::uuid[])) as student_id;

  return new_class_id;
end;
$$;

revoke all on function public.ep_create_class_with_team(text,text[],integer,uuid[],uuid,uuid[]) from public, anon;
grant execute on function public.ep_create_class_with_team(text,text[],integer,uuid[],uuid,uuid[]) to authenticated;
notify pgrst, 'reload schema';
