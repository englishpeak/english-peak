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

test('atomic payment RPC validates enrollment and calculates MXN server-side', async () => {
  const source=await sql(new URL('./migrations/202607310003_atomic_student_payments.sql',import.meta.url));
  assert.match(source,/security definer set search_path = pg_catalog, public/);
  assert.match(source,/status='Active'/);
  assert.match(source,/round\(p_payment_amount\*p_exchange_rate_usd_mxn,2\)/);
  assert.doesNotMatch(source,/p_payment_amount_mxn/);
  assert.match(source,/revoke all on function/);
});

test('class-rate currency migration defaults legacy rows to MXN and constrains supported codes', async () => {
  const source = await sql(new URL('./migrations/202607310004_class_rate_currencies.sql', import.meta.url));
  assert.match(source, /add column if not exists currency_code text/);
  assert.match(source, /set currency_code = 'MXN'[\s\S]*where currency_code is null/);
  assert.match(source, /alter column currency_code set default 'MXN'/);
  assert.match(source, /check \(currency_code in \('MXN', 'USD'\)\)/);
  assert.match(source, /create or replace function public\.ep_save_class_payment_rate/);
  assert.match(source, /security definer[\s\S]*set search_path = pg_catalog, public/);
  assert.match(source, /notify pgrst, 'reload schema'/);
});

test('fractional payment migration stores covered hours and accepts decimal RPC quantities', async () => {
  const source = await sql(new URL('./migrations/202607310005_fractional_payment_hours.sql', import.meta.url));
  const dropBalanceView = source.indexOf('drop view if exists public.ep_class_credit_balances');
  const alterQuantity = source.indexOf('alter column quantity type numeric(10,2)');
  const recreateBalanceView = source.indexOf('create view public.ep_class_credit_balances');
  assert.ok(dropBalanceView >= 0 && dropBalanceView < alterQuantity, 'the dependent balance view must be dropped before altering quantity');
  assert.ok(recreateBalanceView > alterQuantity, 'the balance view must be recreated after altering quantity');
  assert.match(source, /alter column quantity type numeric\(10,2\)/);
  assert.match(source, /p_quantity numeric/);
  assert.match(source, /Hours covered must be greater than zero/);
  assert.match(source, /round\(p_quantity,2\)/);
  assert.match(source, /numeric\(10,2\) as classes_remaining/);
});
