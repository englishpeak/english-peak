import { ACADEMIC_TABLES } from './academic-data.js';

// Reuse the original row so reports, dates, and creator metadata stay intact.
// RLS on ep_pay_days also enforces the admin requirement on the server.
export async function activatePayDay(client, { isAdmin, userId, payDate, periodStart, periodEnd }) {
  if (!isAdmin) throw new Error('Only admins can activate pay days.');
  if (!payDate) throw new Error('Choose a pay date.');
  const table = ACADEMIC_TABLES.payDays;
  const findDay = () => client.from(table).select('*').eq('pay_date', payDate).maybeSingle();
  const reopen = async day => {
    if (day.status === 'Open') return { day, message: 'This pay day is already open.' };
    const result = await client.from(table).update({ status: 'Open' }).eq('id', day.id).select('*').single();
    if (result.error) throw result.error;
    return { day: result.data, message: 'Pay day reopened. Other open pay days remain active.' };
  };
  const existing = await findDay();
  if (existing.error) throw existing.error;
  if (existing.data) return reopen(existing.data);
  if (!periodStart || !periodEnd || periodStart > periodEnd) {
    throw new Error('The reporting period must start on or before it ends.');
  }
  const result = await client.from(table).insert({
    pay_date: payDate, period_start: periodStart, period_end: periodEnd,
    status: 'Open', created_by_user_id: userId
  }).select('*').single();
  // Another admin may have activated this date after our lookup.
  if (result.error?.code === '23505') {
    const current = await findDay();
    if (current.error) throw current.error;
    if (current.data) return reopen(current.data);
  }
  if (result.error) throw result.error;
  return { day: result.data, message: 'Pay day activated. Other open pay days remain active.' };
}
