import test from 'node:test';
import assert from 'node:assert/strict';
import { groupReceivablesByMonth, receiptTotals, renderReceivablesMonths } from './receivables-ledger.js';

const receipt = (date, amount, extra = {}) => ({ transaction_type: 'Payment', payment_date: date, payment_currency: 'MXN', payment_amount: amount, quantity: 1, ...extra });
const now = new Date(2026, 9, 12);

test('opens on the local current month with older months newest first and dates sorted within each month', () => {
  const rows = [receipt('2025-12-31', 10), receipt('2026-09-01', 20), receipt('2026-10-01', 30), receipt('2026-09-30', 40)];
  const groups = groupReceivablesByMonth(rows, now);
  assert.deepEqual(groups.map(group => group.month), ['2026-10', '2026-09', '2025-12']);
  assert.equal(groups[0].current, true);
  assert.equal(groups[0].label, 'October 2026');
  assert.deepEqual(groups[1].payments.map(payment => payment.payment_date), ['2026-09-30', '2026-09-01']);
  assert.equal(rows[1].payment_date, '2026-09-01');
});

test('retains a zero-total current month when there are only older payments or no payments', () => {
  const groups = groupReceivablesByMonth([receipt('2026-09-30', 100)], now);
  assert.equal(groups[0].payments.length, 0);
  assert.deepEqual(groups[0].totals, { mxn: 0, usd: 0, mxnValue: 0, hours: 0, count: 0 });
  assert.equal(groupReceivablesByMonth([], new Date(2027, 0, 1))[0].month, '2027-01');
});

test('separates monthly totals and uses stored USD equivalents without converting again', () => {
  const groups = groupReceivablesByMonth([
    receipt('2026-10-01', '0.10', { quantity: '0.25' }),
    receipt('2026-10-02', '0.20', { payment_currency: null }),
    receipt('2026-10-03', '10.50', { payment_currency: 'USD', payment_amount_mxn: '197.925', exchange_rate_usd_mxn: 100 }),
    receipt('2026-09-30', 500),
    receipt('2026-10-04', 999, { voided_at: '2026-10-05' }),
    receipt('2026-10-05', 999, { transaction_type: 'Manual adjustment' })
  ], now);
  assert.deepEqual(groups[0].totals, { mxn: 0.3, usd: 10.5, mxnValue: 198.23, hours: 2.25, count: 3 });
  assert.equal(groups[1].totals.mxnValue, 500);
  assert.equal(receiptTotals([receipt('2026-10-01', 10, { payment_currency: 'USD' })]).mxnValue, 0);
});

test('keeps future-dated and undated receipts accessible without adding them to the current totals', () => {
  const groups = groupReceivablesByMonth([receipt('2026-11-01', 20), receipt(null, 10)], now);
  assert.deepEqual(groups.map(group => group.month), ['2026-10', '2026-11', 'undated']);
  assert.equal(groups[0].totals.count, 0);
  assert.equal(groups[2].totals.mxn, 10);
});

test('renders the current month directly, collapses history, and places totals after each table', () => {
  const groups = groupReceivablesByMonth([receipt('2026-10-01', 10), receipt('2026-09-01', 20)], now);
  const html = renderReceivablesMonths(groups, payment => `<tr><td>${payment.payment_date}</td></tr>`, (heads, rows, empty) => `<table>${rows || empty}</table>`, String);
  assert.match(html, /<section class="receivables-month current-month"/);
  assert.match(html, /<details class="receivables-month archived-month"><summary>September 2026/);
  assert.doesNotMatch(html, /<details[^>]*\bopen\b/);
  assert.match(html, /2026-10-01<\/td><\/tr><\/table><\/div><div class="receivables-month-totals"><h3>October 2026 totals/);
  assert.match(html, /2026-09-01<\/td><\/tr><\/table><\/div><div class="receivables-month-totals"><h3>September 2026 totals/);
});
