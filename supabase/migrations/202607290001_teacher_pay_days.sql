-- Admin-created pay days, teacher-entered hour lines, and admin-only financial configuration.
create table if not exists public.ep_pay_days (
  id uuid primary key default gen_random_uuid(), pay_date date not null unique,
  period_start date not null, period_end date not null, status text not null default 'Open' check (status in ('Open','Closed')),
  created_by_user_id uuid not null references auth.users(id), created_at timestamptz not null default now(),
  check (period_start <= period_end)
);
create table if not exists public.ep_pay_report_lines (
  id uuid primary key default gen_random_uuid(), report_id uuid not null references public.ep_weekly_reports(id) on delete cascade,
  teacher_user_id uuid not null references auth.users(id), pay_day_id uuid not null references public.ep_pay_days(id) on delete restrict,
  class_id uuid references public.ep_classes(id) on delete set null, hours numeric(7,2) not null check (hours >= 0),
  is_extra boolean not null default false, comment text, created_at timestamptz not null default now(),
  check (not is_extra or length(trim(coalesce(comment,''))) > 0)
);
create table if not exists public.ep_class_payment_rates (
  class_id uuid primary key references public.ep_classes(id) on delete cascade,
  charge_rate numeric(10,2) not null default 0 check(charge_rate >= 0), teacher_rate numeric(10,2) check(teacher_rate >= 0),
  currency text not null default 'USD', updated_at timestamptz not null default now()
);
create table if not exists public.ep_payment_adjustments (
  report_id uuid primary key references public.ep_weekly_reports(id) on delete cascade,
  teacher_total numeric(10,2) check(teacher_total >= 0), school_total numeric(10,2) check(school_total >= 0),
  admin_note text, updated_at timestamptz not null default now()
);
alter table public.ep_weekly_reports add column if not exists pay_day_id uuid references public.ep_pay_days(id);
alter table public.ep_pay_days enable row level security;
alter table public.ep_pay_report_lines enable row level security;
alter table public.ep_class_payment_rates enable row level security;
alter table public.ep_payment_adjustments enable row level security;
create policy ep_pay_days_admin on public.ep_pay_days for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_pay_days_teacher_select on public.ep_pay_days for select using(ep_is_teacher() and status='Open');
create policy ep_pay_lines_admin on public.ep_pay_report_lines for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_pay_lines_teacher_select on public.ep_pay_report_lines for select using(ep_is_teacher() and teacher_user_id=auth.uid());
create policy ep_pay_lines_teacher_insert on public.ep_pay_report_lines for insert with check(ep_is_teacher() and teacher_user_id=auth.uid() and exists(select 1 from public.ep_weekly_reports r where r.id=report_id and r.teacher_user_id=auth.uid()) and exists(select 1 from public.ep_pay_days d where d.id=pay_day_id and d.status='Open'));
create policy ep_rates_admin_only on public.ep_class_payment_rates for all using(ep_is_admin()) with check(ep_is_admin());
create policy ep_adjustments_admin_only on public.ep_payment_adjustments for all using(ep_is_admin()) with check(ep_is_admin());
grant select,insert,update,delete on public.ep_pay_days,public.ep_pay_report_lines,public.ep_class_payment_rates,public.ep_payment_adjustments to authenticated;
create index if not exists ep_pay_lines_report_idx on public.ep_pay_report_lines(report_id);
create index if not exists ep_pay_lines_teacher_day_idx on public.ep_pay_report_lines(teacher_user_id,pay_day_id);
