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

test('class creation keeps roster checkboxes and provides student search', () => {
  assert.match(appSource, /id="classStudentSearch"/);
  assert.match(appSource, /data-class-student data-search/);
  assert.match(appSource, /student\.hidden=!visible/);
  assert.match(appSource, /name="student_ids"/);
  assert.match(appSource, /Students can be added now or later/);
  assert.doesNotMatch(appSource, /Select at least one student for this class/);
  assert.match(appSource, /ep_create_class_with_team/);
});

test('modal controls bind after modal content is rendered', () => {
  assert.match(appSource, /classList\.remove\('hidden'\);bindModalControls\(\)/);
  assert.match(appSource, /input\.showPicker\?\.\(\)/);
});

test('payment rate editing supports automatic teacher pay and remaining-class adjustments', () => {
  assert.match(appSource, /name="manual_teacher_rate"/);
  assert.match(appSource, /defaultTeacherRate\(charge\?\.value\)/);
  assert.match(appSource, /Classes remaining/);
  assert.match(appSource, /p_classes_remaining:nextBalance/);
  assert.match(appSource, /ep_save_class_payment_rate/);
});

test('payment rate editor stores explicit shared currency and uses the atomic save RPC', () => {
  assert.match(appSource, /name="charge_in_usd"/);
  assert.match(appSource, /currencyCode=new FormData\(f\)\.has\('charge_in_usd'\)\?'USD':'MXN'/);
  assert.match(appSource, /ep_save_class_payment_rate/);
  assert.match(appSource, /formatRateAmount\(rate\?\.charge_rate,currency\)/);
  assert.doesNotMatch(appSource, /money\(rate\?\.charge_rate,\s*OPERATING_CURRENCY\)/);
});

test('payment rates expose accessible balance states and do not clamp negative balances', () => {
  assert.match(appSource, /aria-label="\$\{balance\} classes remaining, \$\{status\.label\}"/);
  assert.match(appSource, /title="\$\{status\.label\}"/);
  assert.doesNotMatch(appSource, /<small>\$\{status\.label\}<\/small>/);
  assert.match(appSource, /rateBalanceStatus\(balance\)/);
  assert.match(appSource, /Negative balances remain visible/);
});

test('class creation and payments support records without students atomically', async () => {
  const source = await readFile(
    new URL('../supabase/migrations/202608030001_optional_class_students_and_payment_payers.sql', import.meta.url),
    'utf8'
  );
  assert.match(source, /ep_create_class_with_team/);
  assert.match(source, /unnest\(coalesce\(p_student_ids,'\{\}'\)\)/);
  assert.match(source, /p_student_id is not null and not exists/);
  assert.match(appSource, /p_student_id:d\.student_id\|\|null/);
  assert.doesNotMatch(appSource, /select name="student_id" required/);
});
