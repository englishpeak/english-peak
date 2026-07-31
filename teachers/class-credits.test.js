import test from 'node:test';
import assert from 'node:assert/strict';
import { classesUsed, classCreditSummary } from './class-credits.js';

test('only completed and make-up sessions consume class credits', () => {
  const sessions = [
    { class_id: 'a', status: 'Completed' }, { class_id: 'a', status: 'Make-up class' },
    { class_id: 'a', status: 'Scheduled' }, { class_id: 'b', status: 'Completed' }
  ];
  assert.equal(classesUsed('a', sessions), 2);
});

test('payments and manual adjustments combine into the remaining balance', () => {
  const transactions = [
    { class_id: 'a', quantity: 10 }, { class_id: 'a', quantity: 2 }, { class_id: 'b', quantity: 50 }
  ];
  const sessions = [{ class_id: 'a', status: 'Completed' }, { class_id: 'a', status: 'No-show' }];
  assert.deepEqual(classCreditSummary('a', transactions, sessions), { added: 12, used: 1, remaining: 11 });
});
