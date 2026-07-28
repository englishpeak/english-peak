import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('./app.js', import.meta.url), 'utf8');
const migrationSource = await readFile(
  new URL('../supabase/migrations/202607280007_teacher_edit_students_and_classes.sql', import.meta.url),
  'utf8'
);

test('student and class edit controls are available in the teacher panel', () => {
  assert.match(appSource, /data-edit-student/);
  assert.match(appSource, /id="studentEditForm"/);
  assert.match(appSource, /data-edit-class/);
  assert.match(appSource, /id="classEditForm"/);
});

test('account matching is rendered and invoked only for admins', () => {
  assert.match(appSource, /state\.isAdmin\?`<button class="btn compact" data-match/);
  assert.match(appSource, /function matchForm\(studentId\)\{\s+if\(!state\.isAdmin\)return;/);
  assert.match(appSource, /if\(!state\.isAdmin\)throw new Error\('Only Admins can match student accounts\.'/);
});

test('database policies limit teacher edits to assigned records and protect account fields', () => {
  assert.match(migrationSource, /ep_students_assigned_update/);
  assert.match(migrationSource, /ep_teacher_has_student\(id\)/);
  assert.match(migrationSource, /ep_classes_teacher_update/);
  assert.match(migrationSource, /ep_teacher_assigned_class\(id\)/);
  assert.match(migrationSource, /new\.account_matched_at/);
  assert.match(migrationSource, /new\.account_matched_by/);
  assert.doesNotMatch(migrationSource, /ep_class_(students|teachers)_teacher_(insert|update|delete)/);
});

test('student scheduling preferences use an optional date and left-side steppers', () => {
  assert.match(appSource, /data-start-date-toggle/);
  assert.match(appSource, /input\.disabled=!enabled/);
  assert.match(appSource, /start_date:d\.start_date\|\|null/);
  assert.match(appSource, /class="number-stepper"/);
  assert.doesNotMatch(appSource, /Default duration/);
  assert.doesNotMatch(appSource, /default_class_duration:Number/);
});

test('Test Prep and Other are rendered as separate class categories', () => {
  assert.match(appSource, /'Test Prep','Other'/);
  assert.doesNotMatch(appSource, /'Test Prep & Other'\]/);
});
