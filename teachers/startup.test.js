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

test('every startup action points to a defined form function', () => {
  const app = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
  const actionMap = app.match(/const actionHandlers=\{([^}]+)\}/)?.[1];
  assert.ok(actionMap, 'the startup action map must exist');
  const handlers = [...actionMap.matchAll(/:\s*([A-Za-z_$][\w$]*)/g)].map(match => match[1]);
  assert.ok(handlers.length > 0, 'the startup action map must contain handlers');
  for (const handler of handlers) {
    assert.match(app, new RegExp(`function\\s+${handler}\\s*\\(`), `${handler} must be defined before startup`);
  }
});

test('teacher page has a non-module fallback for bootstrap crashes', () => {
  const page = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  const guard = page.indexOf('revealStartupFailure');
  const module = page.indexOf('<script type="module" src="/teachers/app.js"></script>');
  assert.ok(guard > -1 && guard < module, 'the startup fallback must load before app.js');
  assert.match(page, /addEventListener\('error'/);
  assert.match(page, /setTimeout\(\(\) => revealStartupFailure/);
});
