import test from 'node:test';
import assert from 'node:assert/strict';
import { QuizRound } from './quiz.js';
import { IDIOM_LESSON_CONTENT } from '../api/idioms.js';

test('a shuffled round preserves every option and maps the correct answer without mutating source content', () => {
  const source = IDIOM_LESSON_CONTENT[1];
  const original = JSON.stringify(source);
  const round = new QuizRound(source, () => 0);
  source.forEach((item, i) => {
    assert.deepEqual([...round.items[i].options].sort(), [...item.options].sort());
    assert.equal(round.items[i].options[round.items[i].correct], item.options[item.correct]);
  });
  assert.notDeepEqual(round.items[0].options, source[0].options);
  assert.equal(JSON.stringify(source), original);
});

test('all four choices give feedback data; only the first answer counts, including after returning', () => {
  for (let answer = 0; answer < 4; answer++) {
    const round = new QuizRound(IDIOM_LESSON_CONTENT[1]);
    assert.equal(round.next(), false);
    assert.equal(round.previous(), false);
    assert.equal(round.choose(-1), false);
    assert.equal(round.choose(4), false);
    assert.equal(round.choose(answer), true);
    assert.equal(round.score, Number(answer === round.item.correct));
    assert.equal(round.choose(round.item.correct), false);
    assert.equal(round.next(), true);
    assert.equal(round.previous(), true);
    assert.equal(round.answer, answer);
    assert.equal(round.choose(round.item.correct), false);
  }
});

test('completion, previous from completion, mixed scoring and restarting stay consistent', () => {
  const round = new QuizRound(IDIOM_LESSON_CONTENT[1]);
  for (let i = 0; i < 10; i++) {
    round.choose(i % 2 === 0 ? round.item.correct : (round.item.correct + 1) % 4);
    round.next();
  }
  assert.equal(round.complete, true);
  assert.equal(round.score, 5);
  assert.equal(round.next(), false);
  assert.equal(round.choose(0), false);
  round.previous();
  assert.equal(round.pos, 9);
  assert.equal(round.choose(round.item.correct), false);
  round.next();
  assert.equal(round.complete, true);
  round.reset();
  assert.equal(round.complete, false);
  assert.equal(round.pos, 0);
  assert.equal(round.score, 0);
  assert.ok(round.selected.every(answer => answer === null));
});
