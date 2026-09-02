import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { classMatchesSearch, classMatchesTeacherFilter, compareClassRows } from './class-list-tools.js';

const stylesSource = await readFile(new URL('./styles.css', import.meta.url), 'utf8');

test('class search matches names and related class details case-insensitively', () => {
  const searchableText = 'Business Advanced Acme Corp Jane Smith Active';
  assert.equal(classMatchesSearch(searchableText, 'business advanced'), true);
  assert.equal(classMatchesSearch(searchableText, 'JANE SMITH'), true);
  assert.equal(classMatchesSearch(searchableText, '  acme corp  '), true);
  assert.equal(classMatchesSearch(searchableText, 'beginner'), false);
  assert.equal(classMatchesSearch(searchableText, ''), true);
});

test('teacher filter includes classes taught by any selected teacher', () => {
  assert.equal(classMatchesTeacherFilter(['alex', 'sam'], ['sam'], 'include'), true);
  assert.equal(classMatchesTeacherFilter(['alex'], ['sam'], 'include'), false);
});

test('teacher filter excludes classes taught by any selected teacher', () => {
  assert.equal(classMatchesTeacherFilter(['alex', 'sam'], ['sam'], 'exclude'), false);
  assert.equal(classMatchesTeacherFilter(['alex'], ['sam'], 'exclude'), true);
  assert.equal(classMatchesTeacherFilter(['alex'], [], 'exclude'), true);
});

test('class rows sort case-insensitively in both directions', () => {
  const rows = [{ class: 'Zulu 10' }, { class: 'alpha 2' }, { class: 'Alpha 11' }];
  assert.deepEqual([...rows].sort((a, b) => compareClassRows(a, b, 'class')).map(row => row.class), ['alpha 2', 'Alpha 11', 'Zulu 10']);
  assert.deepEqual([...rows].sort((a, b) => compareClassRows(a, b, 'class', 'desc')).map(row => row.class), ['Zulu 10', 'Alpha 11', 'alpha 2']);
});

test('class status badges distinguish active, paused, and ended classes', () => {
  assert.match(stylesSource, /\.badge\{[^}]*background:#eaf0f8;color:var\(--ep-navy\)/);
  assert.match(stylesSource, /\.badge\.Paused[^}]*\{background:#fff4d6;color:#765400\}/);
  assert.match(stylesSource, /\.badge\.Ended\{background:#fdeaea;color:var\(--ep-error\)\}/);
});
