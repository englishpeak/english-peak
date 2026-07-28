-- Phase 1 Academic Management. Apply with Supabase CLI or SQL Editor.
-- Reuses auth.users and public.profiles; it does not create another identity/role system.
create extension if not exists pgcrypto;

create or replace function public.ep_is_admin() returns boolean language sql stable security definer set search_path=public
as $$ select coalesce((select is_admin from public.profiles where id=auth.uid()),false) $$;
create or replace function public.ep_is_teacher() returns boolean language sql stable security definer set search_path=public
as $$ select coalesce((select lower(tier)='teacher' from public.profiles where id=auth.uid()),false) $$;

create table if not exists public.ep_teacher_profiles (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
 status text not null default 'Active' check(status in ('Active','Inactive','Paused')), timezone text not null default 'America/Mexico_City',
 hourly_rate numeric(10,2), internal_notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.ep_students (
 id uuid primary key default gen_random_uuid(), full_name text not null, email text, phone text, company text, level text,
 status text not null default 'Active' check(status in ('Active','Paused','Inactive','Prospect')), start_date date, class_type text,
 classes_per_week integer check(classes_per_week>=0), default_class_duration integer not null default 60 check(default_class_duration>0),
 timezone text not null default 'America/Mexico_City', academic_notes text, administrative_notes text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.ep_student_teacher_assignments (
 id uuid primary key default gen_random_uuid(), student_id uuid not null references public.ep_students(id) on delete cascade,
 teacher_user_id uuid not null references auth.users(id) on delete restrict, start_date date not null default current_date, end_date date,
 status text not null default 'Active' check(status in ('Active','Ended','Planned')), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(end_date is null or end_date>=start_date));
create unique index if not exists ep_one_active_teacher_per_student on public.ep_student_teacher_assignments(student_id) where status='Active';
create table if not exists public.ep_class_sessions (
 id uuid primary key default gen_random_uuid(), student_id uuid not null references public.ep_students(id) on delete cascade,
 teacher_user_id uuid not null references auth.users(id) on delete restrict, class_date date not null, start_time time not null, end_time time not null,
 duration_minutes integer not null check(duration_minutes>0), status text not null default 'Scheduled' check(status in ('Scheduled','Completed','Cancelled','Rescheduled','No-show','Make-up class')),
 billing_status text not null default 'Pending' check(billing_status in ('Pending','Billable','Non-billable','Billable no-show','Non-billable no-show')),
 teacher_payment_status text not null default 'Pending' check(teacher_payment_status in ('Pending','Payable','Paid','Not payable')),
 is_billable boolean not null default false, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.ep_weekly_reports (
 id uuid primary key default gen_random_uuid(), teacher_user_id uuid not null references auth.users(id) on delete restrict,
 week_start date not null, week_end date not null, total_completed_minutes integer not null default 0, total_billable_minutes integer not null default 0,
 total_completed_classes integer not null default 0, total_no_shows integer not null default 0,
 status text not null default 'Draft' check(status in ('Draft','Submitted','Needs Changes','Approved','Paid')), teacher_comments text, admin_comments text,
 submitted_at timestamptz, approved_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(teacher_user_id,week_start), check(week_end>=week_start));
create table if not exists public.ep_tasks (
 id uuid primary key default gen_random_uuid(), title text not null, description text,
 assigned_teacher_user_id uuid not null references auth.users(id) on delete restrict, related_student_id uuid references public.ep_students(id) on delete set null,
 assigned_by_user_id uuid not null references auth.users(id) on delete restrict, due_date date,
 status text not null default 'Not Started' check(status in ('Not Started','In Progress','Completed')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.ep_task_comments (
 id uuid primary key default gen_random_uuid(), task_id uuid not null references public.ep_tasks(id) on delete cascade,
 author_user_id uuid not null references auth.users(id) on delete restrict, comment text not null, created_at timestamptz not null default now());
create table if not exists public.ep_notes (
 id uuid primary key default gen_random_uuid(), student_id uuid references public.ep_students(id) on delete cascade,
 class_session_id uuid references public.ep_class_sessions(id) on delete cascade, teacher_user_id uuid references auth.users(id) on delete cascade,
 weekly_report_id uuid references public.ep_weekly_reports(id) on delete cascade, author_user_id uuid not null references auth.users(id) on delete restrict,
 content text not null, visibility text not null default 'Admin and assigned teacher' check(visibility in ('Admin only','Admin and assigned teacher')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(num_nonnulls(student_id,class_session_id,teacher_user_id,weekly_report_id)>=1));

create or replace function public.ep_touch_updated_at() returns trigger language plpgsql set search_path=public as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin foreach t in array array['ep_teacher_profiles','ep_students','ep_student_teacher_assignments','ep_class_sessions','ep_weekly_reports','ep_tasks','ep_notes'] loop
 execute format('drop trigger if exists ep_touch_updated_at on public.%I',t); execute format('create trigger ep_touch_updated_at before update on public.%I for each row execute function public.ep_touch_updated_at()',t); end loop; end $$;
create or replace function public.ep_teacher_has_student(student uuid, teacher uuid default auth.uid()) returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.ep_student_teacher_assignments where student_id=student and teacher_user_id=teacher and status='Active') $$;
create or replace function public.ep_guard_teacher_task_update() returns trigger language plpgsql set search_path=public as $$ begin
 if not public.ep_is_admin() and (new.title,new.description,new.assigned_teacher_user_id,new.related_student_id,new.assigned_by_user_id,new.due_date,new.created_at) is distinct from (old.title,old.description,old.assigned_teacher_user_id,old.related_student_id,old.assigned_by_user_id,old.due_date,old.created_at) then raise exception 'Teachers may only update task status'; end if; return new; end $$;
drop trigger if exists ep_guard_teacher_task_update on public.ep_tasks;
create trigger ep_guard_teacher_task_update before update on public.ep_tasks for each row execute function public.ep_guard_teacher_task_update();
create or replace function public.ep_guard_teacher_session_write() returns trigger language plpgsql set search_path=public as $$ begin
 if not public.ep_is_admin() and ((tg_op='INSERT' and (new.billing_status,new.teacher_payment_status,new.is_billable) is distinct from ('Pending'::text,'Pending'::text,false)) or (tg_op='UPDATE' and (new.billing_status,new.teacher_payment_status,new.is_billable) is distinct from (old.billing_status,old.teacher_payment_status,old.is_billable))) then raise exception 'Teachers may not change billing or payment fields'; end if; return new; end $$;
drop trigger if exists ep_guard_teacher_session_write on public.ep_class_sessions;
create trigger ep_guard_teacher_session_write before insert or update on public.ep_class_sessions for each row execute function public.ep_guard_teacher_session_write();

alter table public.ep_teacher_profiles enable row level security; alter table public.ep_students enable row level security;
alter table public.ep_student_teacher_assignments enable row level security; alter table public.ep_class_sessions enable row level security;
alter table public.ep_weekly_reports enable row level security; alter table public.ep_tasks enable row level security;
alter table public.ep_task_comments enable row level security; alter table public.ep_notes enable row level security;
do $$ declare t text; p record; begin foreach t in array array['ep_teacher_profiles','ep_students','ep_student_teacher_assignments','ep_class_sessions','ep_weekly_reports','ep_tasks','ep_task_comments','ep_notes'] loop for p in select policyname from pg_policies where schemaname='public' and tablename=t loop execute format('drop policy if exists %I on public.%I',p.policyname,t); end loop; end loop; end $$;

create policy ep_teacher_profiles_admin on public.ep_teacher_profiles for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_teacher_profiles_own_select on public.ep_teacher_profiles for select using(ep_is_teacher() and user_id=auth.uid());
create policy ep_teacher_profiles_own_insert on public.ep_teacher_profiles for insert with check(ep_is_teacher() and user_id=auth.uid());
create policy ep_students_admin on public.ep_students for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_students_assigned_select on public.ep_students for select using(ep_is_teacher() and ep_teacher_has_student(id));
create policy ep_assignments_admin on public.ep_student_teacher_assignments for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_assignments_own_select on public.ep_student_teacher_assignments for select using(ep_is_teacher() and teacher_user_id=auth.uid());
create policy ep_sessions_admin on public.ep_class_sessions for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_sessions_own_select on public.ep_class_sessions for select using(ep_is_teacher() and teacher_user_id=auth.uid() and ep_teacher_has_student(student_id));
create policy ep_sessions_own_insert on public.ep_class_sessions for insert with check(ep_is_teacher() and teacher_user_id=auth.uid() and ep_teacher_has_student(student_id));
create policy ep_sessions_own_update on public.ep_class_sessions for update using(ep_is_teacher() and teacher_user_id=auth.uid() and ep_teacher_has_student(student_id)) with check(teacher_user_id=auth.uid() and ep_teacher_has_student(student_id));
create policy ep_reports_admin on public.ep_weekly_reports for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_reports_own_select on public.ep_weekly_reports for select using(ep_is_teacher() and teacher_user_id=auth.uid());
create policy ep_reports_own_insert on public.ep_weekly_reports for insert with check(ep_is_teacher() and teacher_user_id=auth.uid() and status in ('Draft','Submitted'));
create policy ep_reports_own_update on public.ep_weekly_reports for update using(ep_is_teacher() and teacher_user_id=auth.uid() and status in ('Draft','Needs Changes')) with check(teacher_user_id=auth.uid() and status in ('Draft','Submitted'));
create policy ep_tasks_admin on public.ep_tasks for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_tasks_own_select on public.ep_tasks for select using(ep_is_teacher() and assigned_teacher_user_id=auth.uid());
create policy ep_tasks_own_update on public.ep_tasks for update using(ep_is_teacher() and assigned_teacher_user_id=auth.uid()) with check(assigned_teacher_user_id=auth.uid());
create policy ep_comments_admin on public.ep_task_comments for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_comments_own_select on public.ep_task_comments for select using(exists(select 1 from public.ep_tasks t where t.id=task_id and t.assigned_teacher_user_id=auth.uid()));
create policy ep_comments_own_insert on public.ep_task_comments for insert with check(ep_is_teacher() and author_user_id=auth.uid() and exists(select 1 from public.ep_tasks t where t.id=task_id and t.assigned_teacher_user_id=auth.uid()));
create policy ep_notes_admin on public.ep_notes for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_notes_teacher_select on public.ep_notes for select using(ep_is_teacher() and visibility='Admin and assigned teacher' and (teacher_user_id=auth.uid() or (student_id is not null and ep_teacher_has_student(student_id)) or exists(select 1 from public.ep_class_sessions s where s.id=class_session_id and s.teacher_user_id=auth.uid()) or exists(select 1 from public.ep_weekly_reports r where r.id=weekly_report_id and r.teacher_user_id=auth.uid())));
create policy ep_notes_teacher_insert on public.ep_notes for insert with check(ep_is_teacher() and author_user_id=auth.uid() and visibility='Admin and assigned teacher' and (teacher_user_id=auth.uid() or (student_id is not null and ep_teacher_has_student(student_id)) or exists(select 1 from public.ep_class_sessions s where s.id=class_session_id and s.teacher_user_id=auth.uid()) or exists(select 1 from public.ep_weekly_reports r where r.id=weekly_report_id and r.teacher_user_id=auth.uid())));

-- Table privileges are necessary for PostgREST; RLS decides which rows each existing project role can use.
-- The web adapter additionally uses an explicit teacher-safe column list, and the trigger above blocks
-- teachers from changing session billing/payment fields.
revoke all on public.ep_teacher_profiles,public.ep_students,public.ep_student_teacher_assignments,public.ep_class_sessions,public.ep_weekly_reports,public.ep_tasks,public.ep_task_comments,public.ep_notes from authenticated;
grant select,insert,update,delete on public.ep_teacher_profiles,public.ep_students,public.ep_student_teacher_assignments,public.ep_class_sessions,public.ep_weekly_reports,public.ep_tasks,public.ep_task_comments,public.ep_notes to authenticated;

insert into public.ep_teacher_profiles(user_id)
select id from public.profiles where lower(tier)='teacher' on conflict(user_id) do nothing;
notify pgrst,'reload schema';
