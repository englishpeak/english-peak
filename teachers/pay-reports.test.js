import assert from 'node:assert/strict';
import test from 'node:test';
import { savePayDayReport } from './pay-reports.js';

const payload = {
  teacher_user_id: 'teacher', pay_day_id: 'oct-16', week_start: '2026-10-12',
  week_end: '2026-10-18', status: 'Submitted', teacher_comments: 'Updated hours'
};
const saved = (overrides = {}) => ({ id: 'saved', ...payload, ...overrides });

// Model the actual uniqueness rules both before and after today's migration.
// The old schema rejects ON CONFLICT(teacher_user_id,pay_day_id) with 42P10.
function database(initial = [], { migrated = false, race, fail, reviewDuringUpdate = false } = {}) {
  const rows = structuredClone(initial), writes = [];
  let raced = false;
  const client = { from(table) {
    assert.equal(table, 'ep_weekly_reports');
    let operation = 'select', value;
    const filters = [];
    const execute = async () => {
      if (fail === operation) return { error: { code: '42501', message: `${operation} denied` } };
      if (operation === 'insert') {
        if (race && !raced) { rows.push(structuredClone(race)); raced = true; }
        if (rows.some(row => row.teacher_user_id === value.teacher_user_id &&
          (migrated ? row.pay_day_id === value.pay_day_id : row.week_start === value.week_start))) {
          return { error: { code: '23505', message: 'duplicate report' } };
        }
        const row = { id: `report-${rows.length}`, ...value };
        rows.push(row); writes.push({ operation, id: row.id });
        return { data: { id: row.id } };
      }
      if (operation === 'update' && reviewDuringUpdate) rows[0].status = 'Approved';
      const matches = rows.filter(row => filters.every(([key, expected]) =>
        Array.isArray(expected) ? expected.includes(row[key]) : row[key] === expected));
      if (matches.length > 1) return { error: { code: 'PGRST116', message: 'Multiple reports found' } };
      const row = matches[0];
      if (operation === 'select') return { data: row ? structuredClone(row) : null };
      if (!row) return { error: { code: 'PGRST116', message: 'Report is no longer editable' } };
      Object.assign(row, value); writes.push({ operation, id: row.id });
      return { data: { id: row.id } };
    };
    const query = {
      select() { return query; },
      eq(key, expected) { filters.push([key, expected]); return query; },
      in(key, expected) { filters.push([key, expected]); return query; },
      insert(data) { operation = 'insert'; value = data; return query; },
      update(data) { operation = 'update'; value = data; return query; },
      upsert() { throw new Error('42P10: no unique constraint matching the ON CONFLICT specification'); },
      single: execute, maybeSingle: execute
    };
    return query;
  } };
  return { client, rows, writes };
}

for (const migrated of [false, true]) {
  test(`new reports save ${migrated ? 'after' : 'before'} the pay-day index migration`, async () => {
    const db = database([], { migrated });
    const report = await savePayDayReport(db.client, payload);
    assert.equal(report.id, db.rows[0].id);
    assert.deepEqual(db.rows[0], { id: report.id, ...payload });
  });

  test(`submitted reports keep their IDs when edited on the ${migrated ? 'new' : 'old'} schema`, async () => {
    const db = database([saved({ teacher_comments: 'Before' })], { migrated });
    assert.deepEqual(await savePayDayReport(db.client, payload), { id: 'saved' });
    assert.deepEqual(db.rows, [saved()]);
    assert.deepEqual(db.writes, [{ operation: 'update', id: 'saved' }]);
  });
}

test('two dates in the same week stay separate with the migrated schema', async () => {
  const first = saved(), otherTeacher = saved({ id: 'other-teacher', teacher_user_id: 'someone-else', pay_day_id: 'oct-17' });
  const db = database([first, otherTeacher], { migrated: true });
  const second = { ...payload, pay_day_id: 'oct-17', teacher_comments: 'Second pay day' };
  const report = await savePayDayReport(db.client, second);
  await savePayDayReport(db.client, { ...second, teacher_comments: 'Correction' });
  assert.deepEqual(db.rows.slice(0, 2), [first, otherTeacher]);
  assert.equal(db.rows.length, 3);
  assert.equal(db.rows[2].id, report.id);
  assert.equal(db.rows[2].teacher_comments, 'Correction');
});

test('an old weekly constraint cannot overwrite a different pay day or a legacy report', async () => {
  for (const payDay of ['oct-15', null]) {
    const original = saved({ pay_day_id: payDay });
    const db = database([original]);
    await assert.rejects(savePayDayReport(db.client, payload), /finish the pay-day reporting update/);
    assert.deepEqual(db.rows, [original]);
    assert.deepEqual(db.writes, []);
  }
});

test('a concurrent first submission reuses only the exact teacher and pay day', async () => {
  const db = database([], { migrated: true, race: saved({ id: 'concurrent' }) });
  assert.deepEqual(await savePayDayReport(db.client, payload), { id: 'concurrent' });
  assert.equal(db.rows.length, 1);
});

for (const status of ['Approved', 'Paid']) {
  test(`${status} reports cannot be changed, including during a concurrent submission`, async () => {
    for (const concurrent of [false, true]) {
      const original = saved({ status });
      const db = database(concurrent ? [] : [original], { migrated: true, race: concurrent ? original : null });
      await assert.rejects(savePayDayReport(db.client, payload), /already been reviewed/);
      assert.deepEqual(db.rows, [original]);
      assert.deepEqual(db.writes, []);
    }
  });
}

test('approval after the lookup prevents updating the report', async () => {
  const db = database([saved()], { reviewDuringUpdate: true });
  await assert.rejects(savePayDayReport(db.client, payload), { code: 'PGRST116', message: 'Report is no longer editable' });
  assert.equal(db.rows[0].status, 'Approved');
  assert.deepEqual(db.writes, []);
});

for (const operation of ['select', 'insert', 'update']) {
  test(`a failed ${operation} surfaces the database error without changing reports`, async () => {
    const initial = operation === 'update' ? [saved()] : [], db = database(initial, { fail: operation });
    await assert.rejects(savePayDayReport(db.client, payload), { code: '42501', message: `${operation} denied` });
    assert.deepEqual(db.rows, initial);
    assert.deepEqual(db.writes, []);
  });
}
