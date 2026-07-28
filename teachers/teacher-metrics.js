import { calculateReport } from './academic-core.js';

export const TEACHER_STATUSES = Object.freeze(['Active', 'Paused', 'Inactive']);

export function profileStatus(profile) {
  return profile && TEACHER_STATUSES.includes(profile.status) ? profile.status : 'Profile incomplete';
}

export function activeTeacherClasses(teacherId, classes, classTeachers) {
  const activeIds = new Set(classes.filter(item => item.status === 'Active').map(item => item.id));
  return classTeachers.filter(link => link.teacher_user_id === teacherId && link.status === 'Active' && activeIds.has(link.class_id));
}

export function uniqueTeacherStudentIds(teacherId, assignments, classes, classTeachers, classStudents) {
  const ids = new Set(assignments.filter(link => link.teacher_user_id === teacherId && link.status === 'Active').map(link => link.student_id));
  const classIds = new Set(activeTeacherClasses(teacherId, classes, classTeachers).map(link => link.class_id));
  classStudents.filter(link => link.status === 'Active' && classIds.has(link.class_id)).forEach(link => ids.add(link.student_id));
  return ids;
}

export function teacherRoleCounts(teacherId, classes, classTeachers) {
  return activeTeacherClasses(teacherId, classes, classTeachers).reduce((counts, link) => {
    counts[link.role] = (counts[link.role] || 0) + 1;
    return counts;
  }, {});
}

export function weeklyTeacherHours(teacherId, sessions) {
  const totals = calculateReport(sessions.filter(item => item.teacher_user_id === teacherId));
  return { taughtMinutes: totals.totalCompletedMinutes, billableMinutes: totals.totalBillableMinutes };
}

export function currentTeacherReport(teacherId, reports, weekStart) {
  return reports.find(report => report.teacher_user_id === teacherId && report.week_start === weekStart) || null;
}

export function canLoadTeacherDetail({ isAdmin }, teacherId) {
  return Boolean(isAdmin && teacherId);
}

export function teacherScopedData(teacherId, data) {
  return {
    sessions: data.sessions.filter(row => row.teacher_user_id === teacherId),
    reports: data.reports.filter(row => row.teacher_user_id === teacherId),
    tasks: data.tasks.filter(row => row.assigned_teacher_user_id === teacherId),
    notes: (data.notes || []).filter(row => row.teacher_user_id === teacherId && row.visibility === 'Admin only')
  };
}
