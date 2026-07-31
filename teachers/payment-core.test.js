import test from 'node:test';
import assert from 'node:assert/strict';
import { convertUsdToMxn, defaultTeacherRate, paymentDisplay, paymentTotals } from './payment-core.js';

test('calculates the automatic teacher rate as 80% of the class charge', () => {
  assert.equal(defaultTeacherRate(140), 112);
  assert.equal(defaultTeacherRate(279.99), 223.99);
  assert.equal(defaultTeacherRate(''), 0);
});

test('calculates class charges and uses the 80/20 default split', () => {
  assert.deepEqual(paymentTotals([{ class_id: 'a', hours: 2 }], [{ class_id: 'a', charge_rate: 50 }]), { hours: 2, charged: 100, teacherPay: 80, schoolShare: 20 });
});

test('uses configured teacher rates and manual totals', () => {
  const lines = [{ class_id: 'a', hours: 1.5 }, { class_id: null, hours: .5 }];
  assert.equal(paymentTotals(lines, [{ class_id: 'a', charge_rate: 60, teacher_rate: 30 }], 20).teacherPay, 55);
  assert.equal(paymentTotals(lines, [], 20, { teacher_total: 70, school_total: 10 }).schoolShare, 10);
});

test('applies the 80% class split per line while retaining the profile rate for extra hours', () => {
  const lines = [{ class_id: 'a', hours: 2 }, { class_id: 'b', hours: 1 }, { class_id: null, hours: .5 }];
  const rates = [{ class_id: 'a', charge_rate: 100 }, { class_id: 'b', charge_rate: 50, teacher_rate: 45 }];
  assert.equal(paymentTotals(lines, rates, 20).teacherPay, 215);
});

test('converts and displays USD payment snapshots in both currencies', () => {
  assert.equal(convertUsdToMxn(100, 18.7654), 1876.54);
  assert.equal(convertUsdToMxn(100, 0), null);
  assert.deepEqual(paymentDisplay({ payment_currency: 'USD', payment_amount: 100, payment_amount_mxn: 1876.54 }), { primary: '$100.00', equivalent: '$1,876.54' });
  assert.deepEqual(paymentDisplay({ payment_currency: 'MXN', payment_amount: 1876.54 }), { primary: '$1,876.54', equivalent: null });
});
