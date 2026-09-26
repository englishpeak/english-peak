import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const adminPage = readFileSync(new URL('./english_peak_admin.html', import.meta.url), 'utf8');

test('admin user search debounces input before filtering', () => {
  assert.match(adminPage, /oninput="scheduleUserFilter\(\)"/);
  assert.match(adminPage, /function scheduleUserFilter\(\)[\s\S]*?setTimeout\(filterUsers, 120\)/);
});

test('admin user results render in one DOM update and cache reusable work', () => {
  const renderUsers = adminPage.match(/function renderUsers\(data\) \{[\s\S]*?\n\}/)?.[0] || '';

  assert.doesNotMatch(renderUsers, /innerHTML\s*\+=/);
  assert.match(renderUsers, /data\.map\(user =>/);
  assert.match(renderUsers, /\.join\(''\)/);
  assert.match(adminPage, /userRowCache = new WeakMap\(\)/);
  assert.match(adminPage, /userSearchCache = new WeakMap\(\)/);
});
