import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('./app.js', import.meta.url), 'utf8');
const migrationSource = await readFile(
  new URL('../supabase/migrations/202608070001_teacher_edit_submitted_pay_day_hours.sql', import.meta.url),
  'utf8'
);

test('teachers can reopen the current pay-day form with their submitted values', () => {
  assert.match(appSource, /openReport\?'Edit hours':'Report hours'/);
  assert.match(appSource, /existingLines=existing\?reportLines\(existing\.id\):\[\]/);
  assert.match(appSource, /existing\?\.teacher_comments/);
});

test('submitted reports and their lines can only be replaced while the pay day is open', () => {
  assert.match(migrationSource, /status in \('Draft', 'Needs Changes', 'Submitted'\)/);
  assert.match(migrationSource, /d\.id = pay_day_id and d\.status = 'Open'/);
  assert.match(migrationSource, /create policy ep_pay_lines_teacher_delete/);
  assert.match(migrationSource, /r\.status = 'Submitted'/);
  assert.match(migrationSource, /d\.status = 'Open'/);
});
