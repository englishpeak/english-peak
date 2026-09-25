import assert from 'node:assert/strict';
import test from 'node:test';
import { COLLOCATIONS, createSession, filterByLevels, getDistractor, isCorrectAnswer } from './collocations.js';

test('catalogue has 200 valid and unique records across every CEFR level', () => {
  assert.equal(COLLOCATIONS.length, 200);
  assert.equal(new Set(COLLOCATIONS.map(item => item.id)).size, 200);
  assert.deepEqual([...new Set(COLLOCATIONS.map(item => item.level))], ['A1','A2','B1','B2','C1']);
  COLLOCATIONS.forEach(item => assert.equal(item.full, `${item.first} ${item.second}`));
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
test('sessions avoid duplicate records and prompts where possible', () => {
  const session = createSession(COLLOCATIONS, 10, () => 0.42);
  assert.equal(session.length, 10); assert.equal(new Set(session.map(item => item.id)).size, 10);
  assert.equal(new Set(session.map(item => item.first)).size, 10);
  assert.equal(new Set(session.map(item => item.second)).size, 10);
});
test('distractors are distinct and favor compatible metadata', () => {
  const answer = COLLOCATIONS.find(item => item.full === 'make a mistake');
  const distractor = getDistractor(answer, COLLOCATIONS, () => 0);
  assert.notEqual(distractor.second, answer.second); assert.notEqual(distractor.first, answer.first);
  assert.equal(distractor.category, answer.category); assert.equal(distractor.level, answer.level);
});
test('typed comparison ignores case and harmless spacing only', () => {
  assert.equal(isCorrectAnswer('  A   Decision ', 'a decision'), true);
  assert.equal(isCorrectAnswer('decision', 'a decision'), false);
  assert.equal(isCorrectAnswer('a decisions', 'a decision'), false);
});
