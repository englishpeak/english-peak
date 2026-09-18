import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('./app.js', import.meta.url), 'utf8');

test('payments provides separate rate book and receivables tabs', () => {
  assert.match(app, /\['rates','Rate Book'\]/);
  assert.match(app, /\['receivables','Receivables Ledger'\]/);
  assert.match(app, /activeTab==='rates'\?rateBook:receivables/);
});

test('rate book includes a class-name search with an empty result state', () => {
  assert.match(app, /id="paymentRateSearch" type="search"/);
  assert.match(app, /data-payment-rate-row data-search=/);
  assert.match(app, /function filterPaymentRates\(\)/);
  assert.match(app, /No class rates match the current filters\./);
});

test('rate book defaults to active classes and offers status, balance, and sort controls', () => {
  assert.match(app, /id="paymentShowInactive" type="checkbox"/);
  assert.match(app, /Show paused and ended classes/);
  assert.match(app, /id="paymentBalanceFilter"/);
  assert.match(app, /rateSortHead\('name','Class'\)/);
  assert.match(app, /rateSortHead\('balance','Classes remaining'\)/);
  assert.match(app, /function sortPaymentRates\(button\)/);
  assert.match(app, /filterPaymentRates\(\);/);
});
