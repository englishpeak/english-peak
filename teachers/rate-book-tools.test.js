import test from 'node:test';
import assert from 'node:assert/strict';
import { compareRateBookRows, rateBookRowMatches } from './rate-book-tools.js';

test('rate book initially includes only active classes', () => {
  assert.equal(rateBookRowMatches({ status: 'Active', search: 'Conversation', balanceStatus: 'healthy' }), true);
  assert.equal(rateBookRowMatches({ status: 'Paused', search: 'Conversation', balanceStatus: 'healthy' }), false);
  assert.equal(rateBookRowMatches({ status: 'Ended', search: 'Conversation', balanceStatus: 'healthy' }), false);
});

test('rate book can show inactive classes and combine search and balance filters', () => {
  const row = { status: 'Paused', search: 'Business English', balanceStatus: 'low' };
  assert.equal(rateBookRowMatches(row, { showInactive: true, search: 'business', balance: 'low' }), true);
  assert.equal(rateBookRowMatches(row, { showInactive: true, search: 'business', balance: 'healthy' }), false);
});

test('rate book sorts names naturally and remaining balances numerically', () => {
  const rows = [{ name: 'Zulu 2', balance: '12' }, { name: 'alpha 10', balance: '2' }, { name: 'Alpha 2', balance: '0' }];
  assert.deepEqual([...rows].sort((a, b) => compareRateBookRows(a, b, 'name')).map(row => row.name), ['Alpha 2', 'alpha 10', 'Zulu 2']);
  assert.deepEqual([...rows].sort((a, b) => compareRateBookRows(a, b, 'balance', 'desc')).map(row => row.balance), ['12', '2', '0']);
});
