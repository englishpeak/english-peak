-- Let teachers correct a submitted pay-day report while that pay day remains open.
-- Admin review/approval and closed pay days remain protected.
drop policy if exists ep_reports_own_update on public.ep_weekly_reports;
create policy ep_reports_own_update
on public.ep_weekly_reports
for update
using (
  ep_is_teacher()
  and teacher_user_id = auth.uid()
  and status in ('Draft', 'Needs Changes', 'Submitted')
  and exists (
    select 1
    from public.ep_pay_days d
    where d.id = pay_day_id and d.status = 'Open'
  )
)
with check (
  teacher_user_id = auth.uid()
  and status in ('Draft', 'Submitted')
  and exists (
    select 1
    from public.ep_pay_days d
    where d.id = pay_day_id and d.status = 'Open'
  )
);

drop policy if exists ep_pay_lines_teacher_delete on public.ep_pay_report_lines;
create policy ep_pay_lines_teacher_delete
on public.ep_pay_report_lines
for delete
using (
  ep_is_teacher()
  and teacher_user_id = auth.uid()
  and exists (
    select 1
    from public.ep_weekly_reports r
    join public.ep_pay_days d on d.id = r.pay_day_id
    where r.id = report_id
      and r.teacher_user_id = auth.uid()
      and r.status = 'Submitted'
      and d.status = 'Open'
  )
);
