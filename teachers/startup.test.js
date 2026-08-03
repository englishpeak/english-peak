import test from 'node:test';
import assert from 'node:assert/strict';
import { withTimeout } from './startup.js';

test('startup guard returns a completed operation', async () => {
  assert.equal(await withTimeout(Promise.resolve('ready'), 20), 'ready');
});

test('startup guard rejects an operation that never settles', async () => {
  await assert.rejects(withTimeout(new Promise(() => {}), 5, 'startup timed out'), /startup timed out/);
});

test('startup guard preserves the original error', async () => {
  await assert.rejects(withTimeout(Promise.reject(new Error('auth failed')), 20), /auth failed/);
});
