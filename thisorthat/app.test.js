import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const match = html.match(/const QUESTIONS = (\[[\s\S]*?\]);/);
const questions = vm.runInNewContext(match[1]);

test('contains exactly 100 unique This or That questions', () => {
  assert.equal(questions.length, 100);
  assert.equal(new Set(questions).size, 100);
  assert.equal(questions[0], 'Early bird or night owl?');
  assert.equal(questions[99], 'Have a comfortable predictable life or an exciting unpredictable one?');
});

test('uses a complete shuffled sequence and supports backward navigation', () => {
  const originalRandom = Math.random;
  Math.random = () => 0.25;
  try {
    const sequence = questions.slice();
    for (let i = sequence.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
    }
    assert.equal(sequence.length, 100);
    assert.equal(new Set(sequence).size, 100);
    let position = 0;
    position += 1;
    const second = sequence[position];
    position -= 1;
    position += 1;
    assert.equal(sequence[position], second);
  } finally {
    Math.random = originalRandom;
  }
});
