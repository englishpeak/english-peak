import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
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

test('teacher page loads its Supabase bootstrap locally instead of blocking on a CDN', () => {
  const page = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  assert.match(page, /<script src="\/teachers\/vendor\/supabase\.js"><\/script>/);
  assert.doesNotMatch(page, /cdn\.jsdelivr\.net\/npm\/@supabase/);
  assert.ok(statSync(new URL('./vendor/supabase.js', import.meta.url)).size > 100_000);
});
