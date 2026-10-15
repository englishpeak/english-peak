import { ACADEMIC_TABLES } from './academic-data.js';

const editableStatuses = ['Draft', 'Needs Changes', 'Submitted'];

// A deployment may still have the original teacher/week constraint. Avoid an
// ON CONFLICT target that only exists after the multiple-pay-days migration.
// Always look up the exact teacher and pay day; never reuse another day's row.
export async function savePayDayReport(client, payload) {
  const table = ACADEMIC_TABLES.reports;
  const findReport = () => client.from(table).select('id,status')
    .eq('teacher_user_id', payload.teacher_user_id)
    .eq('pay_day_id', payload.pay_day_id).maybeSingle();
  const updateReport = async report => {
    if (!editableStatuses.includes(report.status)) {
      throw new Error('This report has already been reviewed and cannot be edited.');
    }
    const result = await client.from(table).update(payload).eq('id', report.id)
      .eq('teacher_user_id', payload.teacher_user_id)
      .eq('pay_day_id', payload.pay_day_id)
      .in('status', editableStatuses).select('id').single();
    if (result.error) throw result.error;
    return result.data;
  };

  const existing = await findReport();
  if (existing.error) throw existing.error;
  if (existing.data) return updateReport(existing.data);

  const result = await client.from(table).insert(payload).select('id').single();
  if (result.error?.code === '23505') {
    // Another submission may have created this report after our lookup.
    const current = await findReport();
    if (current.error) throw current.error;
    if (current.data) return updateReport(current.data);
    // The old teacher/week rule may instead be blocking a different pay day.
    // Preserve that report and its hours until the migration is applied.
    throw new Error('This pay day cannot be saved yet. Ask an administrator to finish the pay-day reporting update.', { cause: result.error });
  }
  if (result.error) throw result.error;
  return result.data;
}
