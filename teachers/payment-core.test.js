import test from 'node:test';
import assert from 'node:assert/strict';
import { paymentTotals } from './payment-core.js';

test('calculates class charges and uses the 80/20 default split', () => {
  assert.deepEqual(paymentTotals([{ class_id: 'a', hours: 2 }], [{ class_id: 'a', charge_rate: 50 }]), { hours: 2, charged: 100, teacherPay: 80, schoolShare: 20 });
});

test('uses configured teacher rates and manual totals', () => {
  const lines = [{ class_id: 'a', hours: 1.5 }, { class_id: null, hours: .5 }];
  assert.equal(paymentTotals(lines, [{ class_id: 'a', charge_rate: 60, teacher_rate: 30 }], 20).teacherPay, 55);
  assert.equal(paymentTotals(lines, [], 20, { teacher_total: 70, school_total: 10 }).schoolShare, 10);
});
