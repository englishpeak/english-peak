-- English Peak academic management v1. Run once in the Supabase SQL editor.
-- This migration extends the existing auth.users -> public.profiles identity model.

create extension if not exists pgcrypto;

create or replace function public.ep_is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce((select is_admin from public.profiles where id = auth.uid()), false) $$;

create or replace function public.ep_is_teacher()
returns boolean language sql stable security definer set search_path = public
as $$ select coalesce((select tier = 'teacher' from public.profiles where id = auth.uid()), false) $$;

create table if not exists public.teacher_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'Active' check (status in ('Active','Inactive','Paused')),
  timezone text not null default 'America/Mexico_City',
  hourly_rate numeric(10,2),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(), full_name text not null, email text,
  phone text, company text, level text,
  status text not null default 'Active' check (status in ('Active','Paused','Inactive','Prospect')),
  start_date date, class_type text, classes_per_week integer check (classes_per_week >= 0),
  default_class_duration integer not null default 60 check (default_class_duration > 0),
  timezone text not null default 'America/Mexico_City', academic_notes text,
  administrative_notes text, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_teacher_assignments (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students(id) on delete cascade,
  teacher_user_id uuid not null references auth.users(id) on delete restrict,
  start_date date not null default current_date, end_date date,
  status text not null default 'Active' check (status in ('Active','Ended','Planned')),
  created_at timestamptz not null default now(), check (end_date is null or end_date >= start_date)
);
create unique index if not exists one_active_teacher_per_student on public.student_teacher_assignments(student_id) where status = 'Active';

create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(), student_id uuid not null references public.students(id) on delete cascade,
  teacher_user_id uuid not null references auth.users(id) on delete restrict, date date not null,
  start_time time not null, end_time time not null, duration_minutes integer not null check (duration_minutes > 0),
  status text not null default 'Scheduled' check (status in ('Scheduled','Completed','Cancelled','Rescheduled','No-show','Make-up class')),
  billing_status text not null default 'Pending' check (billing_status in ('Pending','Billable','Non-billable','Billable no-show','Non-billable no-show')),
  teacher_payment_status text not null default 'Pending' check (teacher_payment_status in ('Pending','Payable','Paid','Not payable')),
  notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(), teacher_user_id uuid not null references auth.users(id) on delete restrict,
  week_start date not null, week_end date not null, total_completed_minutes integer not null default 0,
  total_billable_minutes integer not null default 0, total_completed_classes integer not null default 0,
  total_no_shows integer not null default 0,
  status text not null default 'Draft' check (status in ('Draft','Submitted','Needs Changes','Approved','Paid')),
  teacher_comments text, admin_comments text, submitted_at timestamptz, approved_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(teacher_user_id, week_start), check (week_end >= week_start)
);

create table if not exists public.weekly_report_sessions (
  report_id uuid not null references public.weekly_reports(id) on delete cascade,
  session_id uuid not null references public.class_sessions(id) on delete restrict,
  primary key(report_id, session_id)
);

create table if not exists public.teacher_tasks (
  id uuid primary key default gen_random_uuid(), title text not null, description text,
  assigned_teacher_id uuid not null references auth.users(id) on delete restrict,
  related_student_id uuid references public.students(id) on delete set null,
  assigned_by_user_id uuid not null references auth.users(id) on delete restrict, due_date date,
  status text not null default 'Not Started' check (status in ('Not Started','In Progress','Completed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.teacher_tasks(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete restrict, comment text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.academic_notes (
  id uuid primary key default gen_random_uuid(), author_user_id uuid not null references auth.users(id) on delete restrict,
  student_id uuid references public.students(id) on delete cascade,
  session_id uuid references public.class_sessions(id) on delete cascade,
  teacher_user_id uuid references auth.users(id) on delete cascade,
  weekly_report_id uuid references public.weekly_reports(id) on delete cascade,
  content text not null, context text not null check (context in ('Student','Class session','Teacher','Weekly report')),
  visibility text not null default 'Admin and assigned teacher' check (visibility in ('Admin only','Admin and assigned teacher')),
  created_at timestamptz not null default now(),
  check (num_nonnulls(student_id, session_id, teacher_user_id, weekly_report_id) = 1)
);

create or replace function public.ep_touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['teacher_profiles','students','class_sessions','weekly_reports','teacher_tasks'] loop
  execute format('drop trigger if exists touch_updated_at on public.%I', t);
  execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.ep_touch_updated_at()', t);
end loop; end $$;

-- RLS selects the task row; this trigger limits teachers to workflow status.
create or replace function public.ep_guard_teacher_task_update() returns trigger language plpgsql as $$
begin
  if not ep_is_admin() and (new.title, new.description, new.assigned_teacher_id, new.related_student_id,
    new.assigned_by_user_id, new.due_date, new.created_at) is distinct from
    (old.title, old.description, old.assigned_teacher_id, old.related_student_id,
    old.assigned_by_user_id, old.due_date, old.created_at) then
    raise exception 'Teachers may only update task status';
  end if;
  return new;
end $$;
drop trigger if exists guard_teacher_task_update on public.teacher_tasks;
create trigger guard_teacher_task_update before update on public.teacher_tasks
for each row execute function public.ep_guard_teacher_task_update();

create or replace function public.ep_teacher_has_student(student uuid, teacher uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from student_teacher_assignments where student_id=student and teacher_user_id=teacher and status='Active')
$$;

-- Student administrative notes are column-filtered as well as row-filtered. The
-- function returns them only to admins and restricts teachers to assigned rows.
create or replace function public.ep_students()
returns table (id uuid, full_name text, email text, phone text, company text, level text,
  status text, start_date date, class_type text, classes_per_week integer,
  default_class_duration integer, timezone text, academic_notes text,
  administrative_notes text, created_at timestamptz, updated_at timestamptz)
language sql stable security definer set search_path=public as $$
  select s.id,s.full_name,s.email,s.phone,s.company,s.level,s.status,s.start_date,s.class_type,
    s.classes_per_week,s.default_class_duration,s.timezone,s.academic_notes,
    case when ep_is_admin() then s.administrative_notes else null end,s.created_at,s.updated_at
  from students s
  where ep_is_admin() or (ep_is_teacher() and ep_teacher_has_student(s.id))
$$;
revoke all on function public.ep_students() from public;
grant execute on function public.ep_students() to authenticated;
revoke select on public.students from authenticated;
grant select (id,full_name,email,phone,company,level,status,start_date,class_type,
  classes_per_week,default_class_duration,timezone,academic_notes,created_at,updated_at)
on public.students to authenticated;

alter table public.teacher_profiles enable row level security;
alter table public.students enable row level security;
alter table public.student_teacher_assignments enable row level security;
alter table public.class_sessions enable row level security;
alter table public.weekly_reports enable row level security;
alter table public.weekly_report_sessions enable row level security;
alter table public.teacher_tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.academic_notes enable row level security;

create policy "teacher_profiles_admin_all" on public.teacher_profiles for all using (ep_is_admin()) with check (ep_is_admin());
create policy "teacher_profiles_own_read" on public.teacher_profiles for select using (user_id=auth.uid() and ep_is_teacher());
create policy "students_admin_all" on public.students for all using (ep_is_admin()) with check (ep_is_admin());
create policy "students_assigned_read" on public.students for select using (ep_is_teacher() and ep_teacher_has_student(id));
create policy "assignments_admin_all" on public.student_teacher_assignments for all using (ep_is_admin()) with check (ep_is_admin());
create policy "assignments_own_read" on public.student_teacher_assignments for select using (ep_is_teacher() and teacher_user_id=auth.uid());
create policy "sessions_admin_all" on public.class_sessions for all using (ep_is_admin()) with check (ep_is_admin());
create policy "sessions_teacher_read" on public.class_sessions for select using (ep_is_teacher() and teacher_user_id=auth.uid() and ep_teacher_has_student(student_id));
create policy "sessions_teacher_update" on public.class_sessions for update using (ep_is_teacher() and teacher_user_id=auth.uid() and ep_teacher_has_student(student_id)) with check (teacher_user_id=auth.uid() and ep_teacher_has_student(student_id));
create policy "sessions_teacher_insert" on public.class_sessions for insert with check (ep_is_teacher() and teacher_user_id=auth.uid() and ep_teacher_has_student(student_id));
create policy "reports_admin_all" on public.weekly_reports for all using (ep_is_admin()) with check (ep_is_admin());
create policy "reports_own_read" on public.weekly_reports for select using (ep_is_teacher() and teacher_user_id=auth.uid());
create policy "reports_own_insert" on public.weekly_reports for insert with check (ep_is_teacher() and teacher_user_id=auth.uid() and status in ('Draft','Submitted'));
create policy "reports_own_update" on public.weekly_reports for update using (ep_is_teacher() and teacher_user_id=auth.uid() and status in ('Draft','Needs Changes')) with check (teacher_user_id=auth.uid() and status in ('Draft','Submitted'));
create policy "report_sessions_admin_all" on public.weekly_report_sessions for all using (ep_is_admin()) with check (ep_is_admin());
create policy "report_sessions_own" on public.weekly_report_sessions for all using (exists(select 1 from weekly_reports r where r.id=report_id and r.teacher_user_id=auth.uid() and r.status in ('Draft','Needs Changes'))) with check (exists(select 1 from weekly_reports r where r.id=report_id and r.teacher_user_id=auth.uid() and r.status in ('Draft','Needs Changes')));
create policy "tasks_admin_all" on public.teacher_tasks for all using (ep_is_admin()) with check (ep_is_admin());
create policy "tasks_own_read" on public.teacher_tasks for select using (ep_is_teacher() and assigned_teacher_id=auth.uid());
create policy "tasks_own_update" on public.teacher_tasks for update using (ep_is_teacher() and assigned_teacher_id=auth.uid()) with check (assigned_teacher_id=auth.uid());
create policy "comments_admin_all" on public.task_comments for all using (ep_is_admin()) with check (ep_is_admin());
create policy "comments_task_teacher_read" on public.task_comments for select using (exists(select 1 from teacher_tasks t where t.id=task_id and t.assigned_teacher_id=auth.uid()));
create policy "comments_task_teacher_insert" on public.task_comments for insert with check (author_user_id=auth.uid() and exists(select 1 from teacher_tasks t where t.id=task_id and t.assigned_teacher_id=auth.uid()));
create policy "notes_admin_all" on public.academic_notes for all using (ep_is_admin()) with check (ep_is_admin());
create policy "notes_teacher_read" on public.academic_notes for select using (ep_is_teacher() and visibility='Admin and assigned teacher' and (teacher_user_id=auth.uid() or (student_id is not null and ep_teacher_has_student(student_id)) or exists(select 1 from class_sessions s where s.id=session_id and s.teacher_user_id=auth.uid()) or exists(select 1 from weekly_reports r where r.id=weekly_report_id and r.teacher_user_id=auth.uid())));
create policy "notes_teacher_insert" on public.academic_notes for insert with check (ep_is_teacher() and author_user_id=auth.uid() and visibility='Admin and assigned teacher' and (teacher_user_id=auth.uid() or (student_id is not null and ep_teacher_has_student(student_id)) or exists(select 1 from class_sessions s where s.id=session_id and s.teacher_user_id=auth.uid()) or exists(select 1 from weekly_reports r where r.id=weekly_report_id and r.teacher_user_id=auth.uid())));

-- Existing Teacher accounts appear automatically; no auth account or profile data is duplicated.
insert into public.teacher_profiles(user_id)
select id from public.profiles where lower(tier)='teacher'
on conflict (user_id) do nothing;
