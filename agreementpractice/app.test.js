import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const html = fs.readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const questionsSource = source.match(/const QUESTIONS = (\[[\s\S]*?\n\]);/)[1];
const questions = vm.runInNewContext(questionsSource);

test('practice assets resolve correctly when the page URL has no trailing slash', () => {
  const assetPaths = [...html.matchAll(/(?:href|src)="(\/(?:styles|agreementpractice)\/[^\"]+)"/g)]
    .map(([, path]) => path);

  assert.deepEqual(assetPaths, [
    '/styles/brand-tokens.css',
    '/agreementpractice/styles.css',
    '/agreementpractice/app.js'
  ]);
  for (const path of assetPaths) {
    assert.equal(new URL(path, 'https://example.com/agreementpractice').pathname, path);
  }
});

test('deployment routing leaves practice assets available to the browser', () => {
  const vercelConfig = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const practiceRewrites = vercelConfig.rewrites.filter(({ source }) => source.startsWith('/agreementpractice'));

  assert.deepEqual(practiceRewrites, [
    { source: '/agreementpractice', destination: '/agreementpractice/index.html' }
  ]);
});

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
