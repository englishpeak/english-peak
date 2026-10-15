import assert from 'node:assert/strict';
import test from 'node:test';
import { activatePayDay } from './pay-days.js';

const day = (id, pay_date, status = 'Open') => ({
  id, pay_date, status, period_start: '2026-10-10', period_end: pay_date,
  created_by_user_id: 'original-admin', created_at: '2026-10-09T00:00:00Z'
});
const options = { isAdmin: true, userId: 'admin', payDate: '2026-10-16', periodStart: '2026-10-10', periodEnd: '2026-10-16' };

// Stateful PostgREST double: fail any unexpected table or unfiltered update.
function database(initial, { fail, race } = {}) {
  const rows = structuredClone(initial), writes = [];
  let raced = false;
  const client = { from(table) {
    assert.equal(table, 'ep_pay_days');
    let operation = 'select', payload, filter;
    const execute = async () => {
      if (fail === operation) return { error: { code: '42501', message: `${operation} denied` } };
      if (operation === 'select') return { data: structuredClone(rows.find(row => row[filter[0]] === filter[1]) || null) };
      if (operation === 'insert') {
        if (race && !raced) { rows.push(structuredClone(race)); raced = true; }
        if (rows.some(row => row.pay_date === payload.pay_date)) return { error: { code: '23505', message: 'duplicate date' } };
        const row = { id: `new-${rows.length}`, ...payload };
        rows.push(row); writes.push({ operation, payload });
        return { data: structuredClone(row) };
      }
      assert.equal(filter?.[0], 'id', 'updates must target one pay day');
      const row = rows.find(row => row.id === filter[1]);
      assert.ok(row);
      Object.assign(row, payload); writes.push({ operation, payload, filter });
      return { data: structuredClone(row) };
    };
    const query = {
      select() { return query; },
      eq(key, value) { filter = [key, value]; return query; },
      insert(value) { operation = 'insert'; payload = value; return query; },
      update(value) { operation = 'update'; payload = value; return query; },
      maybeSingle: execute, single: execute
    };
    return query;
  } };
  return { client, rows, writes };
}

test('reopening October 16 preserves its row and reports while October 23 stays open', async () => {
  const original = day('16', '2026-10-16', 'Closed'), later = day('23', '2026-10-23');
  const db = database([original, later]);
  const result = await activatePayDay(db.client, { ...options, periodStart: '2026-01-01' });
  assert.deepEqual(db.rows, [{ ...original, status: 'Open' }, later]);
  assert.equal(result.day.id, original.id);
  assert.match(result.message, /reopened/);
  assert.deepEqual(db.writes, [{ operation: 'update', payload: { status: 'Open' }, filter: ['id', '16'] }]);
});

test('activating a third date leaves every other date active', async () => {
  const initial = [day('23', '2026-10-23'), day('30', '2026-10-30')], db = database(initial);
  await activatePayDay(db.client, options);
  assert.deepEqual(db.rows.slice(0, 2), initial);
  assert.equal(db.rows.filter(row=>row.status==='Open').length, 3);
  assert.equal(db.rows[2].created_by_user_id, 'admin');
});

test('activating an already open date succeeds without writes', async () => {
  const initial = [day('16', '2026-10-16'), day('23', '2026-10-23')], db = database(initial);
  const result = await activatePayDay(db.client, options);
  assert.match(result.message, /already open/);
  assert.deepEqual(db.rows, initial);
  assert.deepEqual(db.writes, []);
});

for (const status of ['Open', 'Closed']) {
  test(`a concurrent activation reuses the ${status.toLowerCase()} row without changing its metadata`, async () => {
    const concurrent = day('concurrent', '2026-10-16', status);
    const db = database([day('23', '2026-10-23')], { race: concurrent });
    const result = await activatePayDay(db.client, options);
    assert.deepEqual(result.day, { ...concurrent, status: 'Open' });
    assert.equal(db.rows.length, 2);
    assert.equal(db.rows[0].status, 'Open');
  });
}

for (const operation of ['select', 'insert', 'update']) {
  test(`a failed ${operation} preserves every pay day and surfaces the error`, async () => {
    const initial = [day('23', '2026-10-23'), ...(operation === 'update' ? [day('16', '2026-10-16', 'Closed')] : [])];
    const db = database(initial, { fail: operation });
    await assert.rejects(activatePayDay(db.client, options), { message: `${operation} denied` });
    assert.deepEqual(db.rows, initial);
    assert.deepEqual(db.writes, []);
  });
}

test('non-admin activation is rejected before accessing the database', async () => {
  await assert.rejects(activatePayDay(null, { ...options, isAdmin: false }), /Only admins/);
});

test('invalid new reporting periods cannot change existing active dates', async () => {
  const initial = [day('23', '2026-10-23')], db = database(initial);
  await assert.rejects(activatePayDay(db.client, { ...options, periodStart: '2026-10-24' }), /start on or before/);
  assert.deepEqual(db.rows, initial);
  assert.deepEqual(db.writes, []);
});

