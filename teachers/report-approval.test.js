import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const appSource = await readFile(new URL('./app.js', import.meta.url), 'utf8');
const migrationSource = await readFile(
  new URL('../supabase/migrations/202608110001_deduct_approved_report_hours.sql', import.meta.url),
  'utf8'
);

test('admin report actions use the atomic review RPC', () => {
  assert.match(appSource, /sb\.rpc\('ep_review_weekly_report'/);
  assert.match(appSource, /Report approved and class balances updated/);
  assert.doesNotMatch(appSource, /reports\)\.update\(\{status:'Approved'/);
});

test('approval records one negative credit entry per reported class', () => {
  assert.match(migrationSource, /for update/);
  assert.match(migrationSource, /-round\(sum\(line\.hours\), 2\)/);
  assert.match(migrationSource, /not line\.is_extra/);
  assert.match(migrationSource, /on conflict \(weekly_report_id, class_id\)/);
  assert.match(migrationSource, /set status = 'Approved', approved_at = now\(\)/);
});

test('requesting changes reverses a prior report deduction', () => {
  assert.match(migrationSource, /delete from public\.ep_class_credit_transactions[\s\S]*weekly_report_id = p_report_id/);
  assert.match(migrationSource, /p_status = 'Needs Changes'[\s\S]*admin comment is required/i);
});
