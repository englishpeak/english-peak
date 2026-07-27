import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateReport, canAccessStudent, getWeekRange } from './academic-core.js';

test('billable no-show is payable but not completed', () => {
  const totals = calculateReport([{ status: 'No-show', billing_status: 'Billable no-show', duration_minutes: 60, student_name: 'Ana' }]);
  assert.deepEqual(totals, { totalCompletedMinutes: 0, totalBillableMinutes: 60, totalCompletedClasses: 0, totalNoShows: 1, byStudent: { Ana: 60 } });
});

test('report totals and student grouping are accurate', () => {
  const totals = calculateReport([
    { status: 'Completed', billing_status: 'Billable', duration_minutes: 45, student_name: 'Ana' },
    { status: 'Cancelled', billing_status: 'Non-billable', duration_minutes: 60, student_name: 'Ana' },
    { status: 'Make-up class', billing_status: 'Billable', duration_minutes: 30, student_name: 'Luis' }
  ]);
  assert.equal(totals.totalCompletedMinutes, 75); assert.equal(totals.totalBillableMinutes, 75);
  assert.deepEqual(totals.byStudent, { Ana: 45, Luis: 30 });
});

test('teacher access is restricted to active assignments', () => {
  const assignments = [{ student_id: 'a', teacher_user_id: 'teacher-1', status: 'Active' }, { student_id: 'b', teacher_user_id: 'teacher-2', status: 'Active' }];
  assert.equal(canAccessStudent({ isAdmin: false, userId: 'teacher-1' }, assignments, 'a'), true);
  assert.equal(canAccessStudent({ isAdmin: false, userId: 'teacher-1' }, assignments, 'b'), false);
  assert.equal(canAccessStudent({ isAdmin: true, userId: 'admin' }, assignments, 'b'), true);
});

test('week range runs Monday through Sunday', () => assert.deepEqual(getWeekRange('2026-07-24T12:00:00Z'), { start: '2026-07-20', end: '2026-07-26' }));
