begin;

-- Group attendance corrections belong to the report, so replacing class lines
-- during a teacher resubmission preserves those corrections.
alter table public.ep_weekly_reports
  add column if not exists student_hours_by_class jsonb not null default '{}'::jsonb;

create or replace function public.ep_protect_report_student_hours()
returns trigger language plpgsql set search_path = pg_catalog, public as $$
begin
  if not public.ep_is_admin() and (
    (tg_op = 'INSERT' and new.student_hours_by_class <> '{}'::jsonb)
    or (tg_op = 'UPDATE' and new.student_hours_by_class is distinct from old.student_hours_by_class)
  ) then
    raise exception using errcode = '42501', message = 'Only Master Admin can adjust student hours';
  end if;
  return new;
end $$;

drop trigger if exists ep_protect_report_student_hours on public.ep_weekly_reports;
create trigger ep_protect_report_student_hours
before insert or update of student_hours_by_class on public.ep_weekly_reports
for each row execute function public.ep_protect_report_student_hours();

create or replace function public.ep_adjust_pay_report(
  p_report_id uuid, p_expected_updated_at timestamptz, p_lines jsonb,
  p_teacher_total numeric, p_school_total numeric, p_admin_note text
) returns void
language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  report public.ep_weekly_reports%rowtype;
  line public.ep_pay_report_lines%rowtype;
  edit record;
  student record;
  student_hours jsonb;
  class_key text;
  class_hours numeric;
begin
  if not public.ep_is_admin() then
    raise exception using errcode = '42501', message = 'Only Master Admin can adjust pay reports';
  end if;

  -- Use the same report lock as approval and reject adjustments from stale forms.
  select * into report from public.ep_weekly_reports where id = p_report_id for update;
  if not found then raise exception 'Pay report not found'; end if;
  if report.updated_at is distinct from p_expected_updated_at then
    raise exception 'This pay report has changed. Reload the page and try again.';
  end if;

  for edit in select * from jsonb_to_recordset(p_lines)
    as input(id uuid, previous_hours numeric, hours numeric, student_hours jsonb)
  loop
    select * into line from public.ep_pay_report_lines
    where id = edit.id and report_id = p_report_id for update;
    if not found or line.hours is distinct from edit.previous_hours then
      raise exception 'The reported hours have changed. Reload the page and try again.';
    end if;
    if edit.hours is null or edit.hours not between 0 and 99999.99 or edit.hours <> round(edit.hours, 2) then
      raise exception 'Enter valid reported hours with up to two decimal places';
    end if;

    if edit.student_hours <> '{}'::jsonb then
      if line.is_extra or line.class_id is null then
        raise exception 'Student hours must belong to a reported class';
      end if;
      class_key := line.class_id::text;
      student_hours := coalesce(report.student_hours_by_class -> class_key, '{}'::jsonb);
      for student in select * from jsonb_each(edit.student_hours) loop
        if not (student_hours ? student.key) and not exists (
          select 1 from public.ep_class_students
          where class_id = line.class_id and student_id = student.key::uuid
        ) then
          raise exception 'The student is no longer on the class roster. Reload the page and try again.';
        end if;
        if student.value <> 'null'::jsonb and (
          jsonb_typeof(student.value) <> 'number'
          or student.value::numeric not between 0 and 99999.99
          or student.value::numeric <> round(student.value::numeric, 2)
        ) then
          raise exception 'Enter valid student hours with up to two decimal places';
        end if;
      end loop;
      student_hours := jsonb_strip_nulls(student_hours || edit.student_hours);
      if student_hours = '{}'::jsonb then
        report.student_hours_by_class := report.student_hours_by_class - class_key;
      else
        report.student_hours_by_class := jsonb_set(report.student_hours_by_class, array[class_key], student_hours);
      end if;
    end if;

    if edit.hours = line.hours then continue; end if;
    update public.ep_pay_report_lines set hours = edit.hours where id = line.id;

    -- Reviewed reports already affect the balance. Keep the single deduction per
    -- class at the corrected quantity, while attendance and extra hours stay separate.
    if report.status in ('Approved', 'Paid') and not line.is_extra and line.class_id is not null then
      select coalesce(sum(hours), 0) into class_hours from public.ep_pay_report_lines
      where report_id = p_report_id and class_id = line.class_id and not is_extra;
      if class_hours = 0 then
        delete from public.ep_class_credit_transactions
        where weekly_report_id = p_report_id and class_id = line.class_id and transaction_type = 'Approved report';
      else
        insert into public.ep_class_credit_transactions(
          class_id, transaction_type, quantity, note, created_by_user_id, weekly_report_id
        ) values (line.class_id, 'Approved report', -class_hours,
          'Hours deducted for approved weekly report', auth.uid(), p_report_id)
        on conflict (weekly_report_id, class_id) where transaction_type = 'Approved report'
        do update set quantity = excluded.quantity;
      end if;
    end if;
  end loop;

  update public.ep_weekly_reports set student_hours_by_class = report.student_hours_by_class
  where id = p_report_id;

  p_admin_note := nullif(trim(p_admin_note), '');
  if p_teacher_total is not null or p_school_total is not null or p_admin_note is not null
    or exists (select 1 from public.ep_payment_adjustments where report_id = p_report_id)
  then
    insert into public.ep_payment_adjustments (report_id, teacher_total, school_total, admin_note)
    values (p_report_id, p_teacher_total, p_school_total, p_admin_note)
    on conflict (report_id) do update set teacher_total = excluded.teacher_total,
      school_total = excluded.school_total, admin_note = excluded.admin_note, updated_at = now();
  end if;
end $$;

revoke all on function public.ep_adjust_pay_report(uuid,timestamptz,jsonb,numeric,numeric,text) from public, anon;
grant execute on function public.ep_adjust_pay_report(uuid,timestamptz,jsonb,numeric,numeric,text) to authenticated;
notify pgrst, 'reload schema';
commit;
