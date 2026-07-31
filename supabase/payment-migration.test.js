import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationPath = new URL('./migrations/202607310002_student_payment_currencies.sql', import.meta.url);
const editorPath = new URL('./sql-editor/student_payment_currencies.sql', import.meta.url);

async function sql(path) {
  return readFile(path, 'utf8');
}

test('payment migration drops every named constraint before recreating it', async () => {
  const source = await sql(migrationPath);
  for (const constraint of [
    'ep_students_payment_currency_check',
    'ep_credit_payment_currency_check',
    'ep_credit_exchange_snapshot_check'
  ]) {
    const drop = source.indexOf(`drop constraint if exists ${constraint}`);
    const add = source.indexOf(`add constraint ${constraint}`);
    assert.ok(drop >= 0, `missing resumable drop for ${constraint}`);
    assert.ok(add > drop, `${constraint} must be dropped before it is recreated`);
  }
});

test('SQL Editor script is plain resumable SQL rather than a Git patch', async () => {
  const source = await sql(editorPath);
  assert.doesNotMatch(source, /^diff --git/m);
  assert.doesNotMatch(source, /^\+\+\+ |^--- /m);
  assert.match(source, /drop constraint if exists ep_credit_payment_currency_check/);
  assert.match(source, /drop constraint if exists ep_credit_exchange_snapshot_check/);
  assert.match(source, /notify pgrst, 'reload schema';/);
});
