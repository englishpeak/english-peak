import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGoogleFinanceRate } from './exchange-rate.js';

test('reads the USD/MXN quote from Google Finance markup', () => {
  assert.equal(parseGoogleFinanceRate('<div data-last-price="18.7654"></div>'), 18.7654);
  assert.equal(parseGoogleFinanceRate('<html>no quote</html>'), null);
});
