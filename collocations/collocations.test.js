import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { COLLOCATIONS, SESSION_SIZE, acceptedPartners, createEasySession, createMediumChoices, createMediumSession, createSession, filterByLevels, isAcceptedPair, isCorrectAnswer, isUnambiguousEasyBoard, reduceDragState, safeMediumDistractors } from './collocations.js';

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
test('every catalogue record has at least two distinct curated Medium distractors', () => {
  COLLOCATIONS.forEach(item => {
    const knownCompletions = new Set(COLLOCATIONS.filter(candidate => candidate.first === item.first).map(candidate => candidate.second));
    assert.ok(Array.isArray(item.distractors), `${item.full} needs distractors`);
    assert.ok(item.distractors.length >= 2, `${item.full} needs at least two distractors`);
    assert.equal(new Set(item.distractors).size, item.distractors.length, `${item.full} repeats a distractor`);
    assert.equal(item.distractors.includes(item.second), false, `${item.full} includes its answer as a distractor`);
    item.distractors.forEach(distractor => {
      assert.equal(knownCompletions.has(distractor), false, `${item.first} ${distractor} is another catalogue answer`);
      assert.equal(acceptedPartners(item).has(distractor), false, `${item.first} ${distractor} is accepted English`);
    });
  });
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
test('every CEFR filter supplies a complete seven-item exercise pool', () => {
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
    const pool = filterByLevels(COLLOCATIONS, [level]);
    assert.equal(pool.length, 40);
    assert.ok(pool.every(item => item.level === level));
    assert.equal(createSession(pool, SESSION_SIZE, () => 0.37).length, 7);
  }
});
test('easy sessions select different first groups whenever the pool permits', () => {
  const session = createEasySession(COLLOCATIONS, SESSION_SIZE, () => 0.42);
  assert.equal(session.length, 7); assert.equal(new Set(session.map(item => item.id)).size, 7);
  assert.equal(new Set(session.map(item => item.first)).size, 7);
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
    const levelSession = createEasySession(filterByLevels(COLLOCATIONS, [level]), SESSION_SIZE, () => 0.31);
    assert.equal(new Set(levelSession.map(item => item.first)).size, 7);
  }
});
test('many randomized Easy boards expose exactly one accepted partner per first', () => {
  const random = seededRandom(981723);
  for (let run = 0; run < 500; run += 1) {
    const board = createEasySession(COLLOCATIONS, SESSION_SIZE, random);
    assert.equal(board.length, SESSION_SIZE);
    assert.equal(isUnambiguousEasyBoard(board), true);
    const visibleSeconds = board.map(item => item.second);
    board.forEach(item => assert.equal(visibleSeconds.filter(second => isAcceptedPair(item.first, second)).length, 1));
  }
});
test('known valid alternatives are represented and cannot oppose one another', () => {
  for (const [first, second] of [['talk','to'], ['talk','about'], ['care','for'], ['care','about'], ['smell','of'], ['smell','like'], ['quick','meal'], ['quick','learner']]) {
    assert.equal(isAcceptedPair(first, second), true, `${first} ${second} should be accepted`);
  }
  const byFull = full => COLLOCATIONS.find(item => item.full === full);
  assert.equal(isUnambiguousEasyBoard([byFull('talk about'), byFull('listen to')]), false);
  assert.equal(isUnambiguousEasyBoard([byFull('smell of'), { ...byFull('fast learner'), second: 'like' }]), false);
  assert.equal(isUnambiguousEasyBoard([byFull('quick meal'), byFull('fast learner')]), false);
});
test('sessions never repeat a collocation and new sets remain valid', () => {
  for (const creator of [createSession, createEasySession]) {
    const first = creator(COLLOCATIONS, SESSION_SIZE, () => 0.17);
    const next = creator(COLLOCATIONS, SESSION_SIZE, () => 0.73);
    assert.equal(first.length, 7); assert.equal(next.length, 7);
    assert.equal(new Set(first.map(item => item.id)).size, 7);
    assert.ok(first.every(item => COLLOCATIONS.includes(item)));
  }
});
test('Medium draws only from curated distractors and randomizes answer position', () => {
  for (const item of COLLOCATIONS) {
    const first = createMediumChoices(item, sequenceRandom(0, 0));
    const last = createMediumChoices(item, sequenceRandom(0, 0.9));
    assert.equal(first[0], item.second);
    assert.equal(last[1], item.second);
    assert.ok(item.distractors.includes(first[1]), `${item.full} used an uncurated distractor`);
    assert.ok(item.distractors.includes(last[0]), `${item.full} used an uncurated distractor`);
    assert.equal(acceptedPartners(item).has(first[1]), false);
  }
});
test('every generated Medium question rejects targets and all known valid partners', () => {
  const session = createMediumSession(COLLOCATIONS, COLLOCATIONS.length, seededRandom(42));
  assert.equal(session.length, COLLOCATIONS.length);
  session.forEach(item => {
    const safe = safeMediumDistractors(item);
    assert.ok(safe.length > 0, `${item.full} should have a safe distractor`);
    for (let run = 0; run < 10; run += 1) {
      const distractor = createMediumChoices(item, seededRandom(run)).find(choice => choice !== item.second);
      assert.notEqual(distractor, item.second);
      assert.equal(acceptedPartners(item).has(distractor), false, `${item.first} ${distractor} is valid`);
    }
  });
});
test('drag state tracks candidates, cancellations, attempts, and cleanup', () => {
  const idle = { active: false, candidate: null, result: null };
  const started = reduceDragState(idle, { type: 'start' });
  assert.deepEqual(started, { active: true, candidate: null, result: null });
  const overFirst = reduceDragState(started, { type: 'candidate', id: 12 });
  assert.equal(overFirst.candidate, 12);
  const overSecond = reduceDragState(overFirst, { type: 'candidate', id: 18 });
  assert.equal(overSecond.candidate, 18);
  const cleared = reduceDragState(overSecond, { type: 'candidate', id: null });
  assert.equal(reduceDragState(cleared, { type: 'drop' }).result, 'cancel');
  const attempted = reduceDragState(overSecond, { type: 'drop' });
  assert.deepEqual(attempted, { active: false, candidate: null, result: 'attempt' });
  assert.deepEqual(reduceDragState(attempted, { type: 'cleanup' }), attempted);
});
test('the Collocations UI uses seven-item progress and completion copy', async () => {
  const source = await readFile(new URL('./collocations.js', import.meta.url), 'utf8');
  assert.equal(SESSION_SIZE, 7);
  assert.match(source, /Build \$\{SESSION_SIZE\} collocations/u);
  assert.doesNotMatch(source, /Build 10 collocations|10 items/u);
});
test('typed comparison ignores case and harmless spacing only', () => {
  assert.equal(isCorrectAnswer('  A   Decision ', 'a decision'), true);
  assert.equal(isCorrectAnswer('decision', 'a decision'), false);
  assert.equal(isCorrectAnswer('a decisions', 'a decision'), false);
});

function sequenceRandom(...values) {
  let index = 0;
  return () => values[index++] ?? values.at(-1);
}

function seededRandom(seed) {
  let value = seed >>> 0;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
}

test('dashboard places one Collocations card first in New Practice before Listen and Write', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const newPractice = html.slice(html.indexOf('id="new-practice-section"'), html.indexOf('<div class="section-header"><h2>Free Exercises'));
  assert.equal((html.match(/onclick="openCollocations\(\)"/gu) ?? []).length, 1);
  assert.ok(newPractice.indexOf('Collocations Practice') < newPractice.indexOf('Listen and Write'));
});

test('dashboard marks Collocations as member-only and unlocks solely from authentication', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /id="access-collocations">🔐 Members/u);
  assert.match(html, /id="meta-collocations">Free account required/u);
  assert.match(html, /var hasCollocationsAccess = Boolean\(_currentUser\)/u);
  assert.doesNotMatch(html, /hasCollocationsAccess = hasFullAccessTier/u);
  assert.match(html, /function openCollocations\(\) \{\s*if \(!_currentUser\)/u);
});

test('direct Collocations route uses the shared ePeak Supabase session and has a locked state', async () => {
  const [html, source] = await Promise.all([
    readFile(new URL('./index.html', import.meta.url), 'utf8'),
    readFile(new URL('./collocations.js', import.meta.url), 'utf8')
  ]);
  assert.match(html, /id="member-lock"/u);
  assert.match(html, /Create a free ePeak account to practice\./u);
  assert.match(html, /href="\/\?auth=register"/u);
  assert.match(html, /href="\/\?auth=login"/u);
  assert.match(source, /storageKey: 'ep-auth-token'/u);
  assert.match(source, /auth\.getSession\(\)/u);
  assert.match(source, /auth\.onAuthStateChange/u);
  assert.match(source, /renderAccessState\(Boolean\(session\?\.user\)\)/u);
  assert.doesNotMatch(source, /tier|premium|subscription/iu);
});
