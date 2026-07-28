-- Atomically attach a manually-created academic student to a registered
-- English Peak Student account. Only Master Admins may perform this operation.
alter table public.ep_students add column if not exists account_matched_at timestamptz;
alter table public.ep_students add column if not exists account_matched_by uuid references auth.users(id) on delete set null;

create or replace function public.ep_match_student_account(
  p_roster_student_id uuid,
  p_account_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_student public.ep_students%rowtype;
  account_profile public.profiles%rowtype;
  generated_student public.ep_students%rowtype;
begin
  if not public.ep_is_admin() then
    raise exception 'Only a Master Admin can match student accounts' using errcode = '42501';
  end if;

  select * into target_student from public.ep_students
    where id = p_roster_student_id for update;
  if not found then raise exception 'Student record not found'; end if;
  if target_student.user_id is not null and target_student.user_id <> p_account_user_id then
    raise exception 'Student record is already matched to another account';
  end if;

  select * into account_profile from public.profiles
    where id = p_account_user_id and lower(coalesce(tier, '')) = 'student' for update;
  if not found then raise exception 'English Peak Student account not found'; end if;

  select * into generated_student from public.ep_students
    where user_id = p_account_user_id for update;

  if generated_student.id is not null and generated_student.id <> target_student.id
     and generated_student.account_matched_at is not null then
    raise exception 'English Peak Student account is already matched';
  end if;

  if generated_student.id is not null and generated_student.id <> target_student.id then
    -- Preserve any activity that may have reached the automatically-created row.
    update public.ep_class_sessions set student_id = target_student.id where student_id = generated_student.id;
    update public.ep_tasks set related_student_id = target_student.id where related_student_id = generated_student.id;
    update public.ep_notes set student_id = target_student.id where student_id = generated_student.id;

    -- There can only be one active assignment. Prefer the manually maintained
    -- record's active teacher, while retaining the account row's assignment history.
    if exists (select 1 from public.ep_student_teacher_assignments where student_id = target_student.id and status = 'Active') then
      update public.ep_student_teacher_assignments
        set status = 'Ended', end_date = greatest(start_date, current_date)
        where student_id = generated_student.id and status = 'Active';
    end if;
    update public.ep_student_teacher_assignments set student_id = target_student.id
      where student_id = generated_student.id;
    delete from public.ep_students where id = generated_student.id;
  end if;

  update public.ep_students
    set user_id = account_profile.id,
        email = account_profile.email,
        full_name = coalesce(nullif(trim(target_student.full_name), ''), nullif(trim(account_profile.full_name), ''), split_part(account_profile.email, '@', 1)),
        status = case when target_student.status = 'Prospect' then 'Active' else target_student.status end,
        account_matched_at = now(),
        account_matched_by = auth.uid()
    where id = target_student.id;

  insert into public.admin_log (admin_id, action, target_user_id, details)
  values (auth.uid(), 'student_account_matched', account_profile.id,
    jsonb_build_object('student_id', target_student.id, 'merged_student_id', generated_student.id, 'email', account_profile.email));

  return jsonb_build_object('student_id', target_student.id, 'user_id', account_profile.id, 'email', account_profile.email);
end;
$$;

revoke all on function public.ep_match_student_account(uuid, uuid) from public;
grant execute on function public.ep_match_student_account(uuid, uuid) to authenticated;
notify pgrst, 'reload schema';
