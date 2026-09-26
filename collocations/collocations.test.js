import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { COLLOCATIONS, createEasySession, createSession, filterByLevels, getDistractor, isCorrectAnswer } from './collocations.js';

test('dashboard route uses canonical collocations asset URLs', async () => {
  const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const stylesheet = html.match(/<link rel="stylesheet" href="([^"]*collocations\.css)"/u)?.[1];
  const module = html.match(/<script type="module" src="([^"]*collocations\.js)"/u)?.[1];

  assert.equal(stylesheet, '/collocations/collocations.css');
  assert.equal(module, '/collocations/collocations.js');
  assert.equal(new URL(stylesheet, 'https://epeak.app/collocations').pathname, '/collocations/collocations.css');
  assert.equal(new URL(module, 'https://epeak.app/collocations').pathname, '/collocations/collocations.js');
});

test('catalogue has 200 valid and unique records across every CEFR level', () => {
  assert.equal(COLLOCATIONS.length, 200);
  assert.equal(new Set(COLLOCATIONS.map(item => item.id)).size, 200);
  assert.deepEqual([...new Set(COLLOCATIONS.map(item => item.level))], ['A1','A2','B1','B2','C1']);
  COLLOCATIONS.forEach(item => assert.equal(item.full, `${item.first} ${item.second}`));
});
test('every catalogue record has one contextual answer blank', () => {
  COLLOCATIONS.forEach(item => {
    assert.equal(typeof item.example, 'string');
    assert.ok(item.example.trim().length > 0, `${item.full} needs an example`);
    assert.equal(item.example.match(/_____/gu)?.length, 1, `${item.full} needs exactly one blank`);
  });
});
test('catalogue contains the supplied groups in their original order', () => {
  assert.deepEqual(
    [COLLOCATIONS[0].full, COLLOCATIONS[49].full, COLLOCATIONS[50].full, COLLOCATIONS[99].full],
    ['make a mistake', 'break the news', 'heavy rain', 'great importance']
  );
  assert.deepEqual(
    [COLLOCATIONS[100].full, COLLOCATIONS[149].full, COLLOCATIONS[150].full, COLLOCATIONS[199].full],
    ['agree with', 'wish for', 'fully aware', 'perfectly honest']
  );
  assert.deepEqual(
    [...new Set(COLLOCATIONS.map(item => item.category))],
    ['Verb + Noun', 'Adjective + Noun', 'Verb + Preposition', 'Adverb + Adjective / Verb']
  );
});
test('level filter is ready for one or multiple selections', () => {
  const result = filterByLevels(COLLOCATIONS, ['A1','C1']);
  assert.ok(result.length > 10); assert.ok(result.every(item => ['A1','C1'].includes(item.level)));
  assert.equal(filterByLevels(COLLOCATIONS, []).length, 200);
});
test('every CEFR filter supplies a complete ten-item exercise pool', () => {
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
    const pool = filterByLevels(COLLOCATIONS, [level]);
    assert.equal(pool.length, 40);
    assert.ok(pool.every(item => item.level === level));
    assert.equal(createSession(pool, 10, () => 0.37).length, 10);
  }
});
test('easy sessions select different first groups whenever the pool permits', () => {
  const session = createEasySession(COLLOCATIONS, 10, () => 0.42);
  assert.equal(session.length, 10); assert.equal(new Set(session.map(item => item.id)).size, 10);
  assert.equal(new Set(session.map(item => item.first)).size, 10);
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
    const levelSession = createEasySession(filterByLevels(COLLOCATIONS, [level]), 10, () => 0.31);
    assert.equal(new Set(levelSession.map(item => item.first)).size, 10);
  }
});
test('sessions never repeat a collocation and new sets remain valid', () => {
  for (const creator of [createSession, createEasySession]) {
    const first = creator(COLLOCATIONS, 10, () => 0.17);
    const next = creator(COLLOCATIONS, 10, () => 0.73);
    assert.equal(first.length, 10); assert.equal(next.length, 10);
    assert.equal(new Set(first.map(item => item.id)).size, 10);
    assert.ok(first.every(item => COLLOCATIONS.includes(item)));
  }
});
test('distractors are distinct and favor compatible metadata', () => {
  const answer = COLLOCATIONS.find(item => item.full === 'make a mistake');
  const distractor = getDistractor(answer, COLLOCATIONS, () => 0);
  assert.notEqual(distractor.second, answer.second); assert.notEqual(distractor.first, answer.first);
  assert.equal(distractor.category, answer.category); assert.equal(distractor.level, answer.level);
});
test('medium distractors are never another valid completion from the full catalogue', () => {
  for (const answer of COLLOCATIONS) {
    const validSeconds = new Set(COLLOCATIONS.filter(item => item.first === answer.first).map(item => item.second));
    const distractor = getDistractor(answer, filterByLevels(COLLOCATIONS, [answer.level]), () => 0.5);
    assert.ok(distractor, `missing distractor for ${answer.full}`);
    assert.equal(validSeconds.has(distractor.second), false, `${distractor.second} is valid after ${answer.first}`);
  }
});
test('typed comparison ignores case and harmless spacing only', () => {
  assert.equal(isCorrectAnswer('  A   Decision ', 'a decision'), true);
  assert.equal(isCorrectAnswer('decision', 'a decision'), false);
  assert.equal(isCorrectAnswer('a decisions', 'a decision'), false);
});

test('dashboard places one Collocations card first in New Practice before Listen and Write', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const newPractice = html.slice(html.indexOf('id="new-practice-section"'), html.indexOf('<div class="section-header"><h2>Free Exercises'));
  assert.equal((html.match(/onclick="openCollocations\(\)"/gu) ?? []).length, 1);
  assert.ok(newPractice.indexOf('Collocations Practice') < newPractice.indexOf('Listen and Write'));
});
