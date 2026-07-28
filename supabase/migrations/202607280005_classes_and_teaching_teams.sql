-- Classes, many-to-many rosters, teaching teams, and class-scoped weekly reports.
create table if not exists public.ep_classes (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 class_type text not null,
 classes_per_week integer not null check (classes_per_week > 0),
 status text not null default 'Active' check (status in ('Active','Paused','Ended')),
 created_by_user_id uuid not null references auth.users(id) on delete restrict,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.ep_class_students (
 id uuid primary key default gen_random_uuid(),
 class_id uuid not null references public.ep_classes(id) on delete cascade,
 student_id uuid not null references public.ep_students(id) on delete cascade,
 status text not null default 'Active' check (status in ('Active','Ended')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (class_id, student_id)
);

create table if not exists public.ep_class_teachers (
 id uuid primary key default gen_random_uuid(),
 class_id uuid not null references public.ep_classes(id) on delete cascade,
 teacher_user_id uuid not null references auth.users(id) on delete restrict,
 role text not null check (role in ('Main teacher','Secondary teacher')),
 status text not null default 'Active' check (status in ('Active','Ended')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (class_id, teacher_user_id)
);
create unique index if not exists ep_one_active_main_teacher_per_class
 on public.ep_class_teachers(class_id) where role='Main teacher' and status='Active';

alter table public.ep_class_sessions add column if not exists class_id uuid references public.ep_classes(id) on delete restrict;

create or replace function public.ep_teacher_has_class(class_uuid uuid, teacher uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$ select exists(
 select 1 from public.ep_class_teachers ct join public.ep_classes c on c.id=ct.class_id
 where ct.class_id=class_uuid and ct.teacher_user_id=teacher and ct.status='Active' and c.status='Active'
) $$;

create or replace function public.ep_teacher_has_student(student uuid, teacher uuid default auth.uid())
returns boolean language sql stable security definer set search_path=public
as $$ select exists(
 select 1 from public.ep_student_teacher_assignments
 where student_id=student and teacher_user_id=teacher and status='Active'
) or exists(
 select 1 from public.ep_class_students cs join public.ep_class_teachers ct on ct.class_id=cs.class_id
 join public.ep_classes c on c.id=cs.class_id
 where cs.student_id=student and cs.status='Active' and ct.teacher_user_id=teacher
 and ct.status='Active' and c.status='Active'
) $$;

create or replace function public.ep_set_teacher_report_totals() returns trigger
language plpgsql security definer set search_path=public as $$
declare totals record;
begin
 if public.ep_is_admin() then return new; end if;
 select coalesce(sum(s.duration_minutes) filter (where s.status in ('Completed','Make-up class')),0)::integer completed_minutes,
        coalesce(sum(s.duration_minutes) filter (where s.is_billable or s.status in ('Completed','Make-up class') or (s.status='No-show' and s.billing_status='Billable no-show')),0)::integer billable_minutes,
        count(*) filter (where s.status in ('Completed','Make-up class'))::integer completed_classes,
        count(*) filter (where s.status='No-show')::integer no_shows
 into totals from public.ep_class_sessions s
 where s.teacher_user_id=auth.uid() and s.class_date between new.week_start and new.week_end
 and s.class_id is not null and public.ep_teacher_has_class(s.class_id,auth.uid());
 new.total_completed_minutes=totals.completed_minutes;
 new.total_billable_minutes=totals.billable_minutes;
 new.total_completed_classes=totals.completed_classes;
 new.total_no_shows=totals.no_shows;
 return new;
end $$;
drop trigger if exists ep_set_teacher_report_totals on public.ep_weekly_reports;
create trigger ep_set_teacher_report_totals before insert or update on public.ep_weekly_reports
for each row execute function public.ep_set_teacher_report_totals();

drop trigger if exists ep_touch_updated_at on public.ep_classes;
create trigger ep_touch_updated_at before update on public.ep_classes for each row execute function public.ep_touch_updated_at();
drop trigger if exists ep_touch_updated_at on public.ep_class_students;
create trigger ep_touch_updated_at before update on public.ep_class_students for each row execute function public.ep_touch_updated_at();
drop trigger if exists ep_touch_updated_at on public.ep_class_teachers;
create trigger ep_touch_updated_at before update on public.ep_class_teachers for each row execute function public.ep_touch_updated_at();

alter table public.ep_classes enable row level security;
alter table public.ep_class_students enable row level security;
alter table public.ep_class_teachers enable row level security;
create policy ep_classes_admin on public.ep_classes for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_classes_teacher_select on public.ep_classes for select using(ep_is_teacher() and ep_teacher_has_class(id));
create policy ep_class_students_admin on public.ep_class_students for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_class_students_teacher_select on public.ep_class_students for select using(ep_is_teacher() and ep_teacher_has_class(class_id));
create policy ep_class_teachers_admin on public.ep_class_teachers for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_class_teachers_teacher_select on public.ep_class_teachers for select using(ep_is_teacher() and teacher_user_id=auth.uid() and status='Active');

drop policy if exists ep_sessions_own_select on public.ep_class_sessions;
drop policy if exists ep_sessions_own_insert on public.ep_class_sessions;
drop policy if exists ep_sessions_own_update on public.ep_class_sessions;
create policy ep_sessions_own_select on public.ep_class_sessions for select using(ep_is_teacher() and teacher_user_id=auth.uid() and class_id is not null and ep_teacher_has_class(class_id) and ep_teacher_has_student(student_id));
create policy ep_sessions_own_insert on public.ep_class_sessions for insert with check(ep_is_teacher() and teacher_user_id=auth.uid() and class_id is not null and ep_teacher_has_class(class_id) and ep_teacher_has_student(student_id));
create policy ep_sessions_own_update on public.ep_class_sessions for update using(ep_is_teacher() and teacher_user_id=auth.uid() and class_id is not null and ep_teacher_has_class(class_id)) with check(teacher_user_id=auth.uid() and class_id is not null and ep_teacher_has_class(class_id) and ep_teacher_has_student(student_id));

revoke all on public.ep_classes,public.ep_class_students,public.ep_class_teachers from authenticated;
grant select,insert,update,delete on public.ep_classes,public.ep_class_students,public.ep_class_teachers to authenticated;
notify pgrst,'reload schema';
