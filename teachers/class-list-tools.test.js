import test from 'node:test';
import assert from 'node:assert/strict';
import { classMatchesTeacherFilter, compareClassRows } from './class-list-tools.js';

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
