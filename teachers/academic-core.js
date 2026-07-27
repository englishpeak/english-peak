export function getWeekRange(value = new Date()) {
  const date = new Date(value);
  const day = date.getUTCDay() || 7;
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - day + 1));
  const end = new Date(start); end.setUTCDate(start.getUTCDate() + 6);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export function isBillable(session) {
  return session.status === 'Completed' || session.status === 'Make-up class' ||
    (session.status === 'No-show' && session.billing_status === 'Billable no-show');
}

export function calculateReport(sessions) {
  return sessions.reduce((total, session) => {
    const minutes = Number(session.duration_minutes) || 0;
    if (session.status === 'Completed' || session.status === 'Make-up class') {
      total.totalCompletedMinutes += minutes;
      total.totalCompletedClasses += 1;
    }
    if (session.status === 'No-show') total.totalNoShows += 1;
    if (isBillable(session)) total.totalBillableMinutes += minutes;
    const student = session.student?.full_name || session.student_name || 'Unassigned';
    total.byStudent[student] = (total.byStudent[student] || 0) + (isBillable(session) ? minutes : 0);
    return total;
  }, { totalCompletedMinutes: 0, totalBillableMinutes: 0, totalCompletedClasses: 0, totalNoShows: 0, byStudent: {} });
}

export function canAccessStudent({ isAdmin, userId }, assignments, studentId) {
  return Boolean(isAdmin || assignments.some(a => a.student_id === studentId && a.teacher_user_id === userId && a.status === 'Active'));
}

