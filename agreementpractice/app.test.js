import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const questionsSource = source.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/)[1];
const questions = vm.runInNewContext(questionsSource);

test('contains exactly 50 locally stored questions with the requested distribution', () => {
  assert.equal(questions.length, 50);
  assert.deepEqual(Object.fromEntries(['affirmative','negative','question'].map(type => [type, questions.filter(q => q.type === type).length])), { affirmative: 20, negative: 15, question: 15 });
});

test('every question has two distinct choices and a valid answer', () => {
  for (const q of questions) {
    assert.equal((q.sentence.match(/___/g) || []).length, 1);
    assert.notEqual(q.base, q.third);
    assert.ok([q.base, q.third].includes(q.answer));
    assert.ok(q.explanation.length > 0);
  }
});

test('questions and negatives always use the base lexical verb', () => {
  for (const q of questions.filter(q => q.type !== 'affirmative')) assert.equal(q.answer, q.base, q.sentence);
});
