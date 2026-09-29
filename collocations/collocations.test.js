import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { COLLOCATIONS, SESSION_SIZE, VALID_PARTNERS, acceptedPartners, createEasySession, createMediumChoices, createMediumQuestion, createMediumSession, createSession, filterByLevels, isAcceptedPair, isCorrectAnswer, isUnambiguousEasyBoard, isValidPartner, isValidatedDistractor, reduceDragState, safeMediumDistractors } from './collocations.js';

test('dashboard route uses canonical collocations asset URLs', async () => {
  const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');
  const stylesheet = html.match(/<link rel="stylesheet" href="([^"]*collocations\.css)"/u)?.[1];
  const module = html.match(/<script type="module" src="([^"]*collocations\.js)"/u)?.[1];

  assert.equal(stylesheet, '/collocations/collocations.css');
  assert.equal(module, '/collocations/collocations.js');
  assert.equal(new URL(stylesheet, 'https://epeak.app/collocations').pathname, '/collocations/collocations.css');
  assert.equal(new URL(module, 'https://epeak.app/collocations').pathname, '/collocations/collocations.js');
});

test('catalogue has 300 valid and unique records across every CEFR level', () => {
  assert.equal(COLLOCATIONS.length, 300);
  assert.equal(new Set(COLLOCATIONS.map(item => item.id)).size, 300);
  assert.deepEqual([...new Set(COLLOCATIONS.map(item => item.level))], ['A1','A2','B1','B2','C1']);
  COLLOCATIONS.forEach(item => assert.equal(item.full, `${item.first} ${item.second}`));
});
test('canonical partner index automatically contains every target', () => {
  assert.equal(new Set(COLLOCATIONS.map(item => item.full.trim().replace(/\s+/gu, ' ').toLowerCase())).size, 300);
  COLLOCATIONS.forEach(item => assert.equal(VALID_PARTNERS.get(item.first)?.has(item.second), true, item.full));
  assert.deepEqual(COLLOCATIONS.slice(200).map(item => item.id), Array.from({ length: 100 }, (_, index) => index + 201));
});
test('all 300 records have only positively validated, canonically invalid Medium distractors', () => {
  COLLOCATIONS.forEach(item => {
    const knownCompletions = new Set(COLLOCATIONS.filter(candidate => candidate.first === item.first).map(candidate => candidate.second));
    assert.ok(Array.isArray(item.mediumDistractors), `${item.full} needs distractors`);
    assert.ok(item.mediumDistractors.length >= 2, `${item.full} needs at least two distractors`);
    assert.equal(new Set(item.mediumDistractors).size, item.mediumDistractors.length, `${item.full} repeats a distractor`);
    assert.equal(item.mediumDistractors.includes(item.second), false, `${item.full} includes its answer as a distractor`);
    item.mediumDistractors.forEach(distractor => {
      const identity = `record ${item.id}: ${item.first} ${item.second}; offending distractor: ${distractor}`;
      assert.equal(isValidatedDistractor(item, distractor), true, identity);
      assert.equal(knownCompletions.has(distractor), false, identity);
      assert.equal(item.acceptedAlternatives.includes(distractor), false, identity);
      assert.equal(acceptedPartners(item).has(distractor), false, identity);
      assert.equal(isValidPartner(item.first, distractor), false, identity);
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
  assert.equal(filterByLevels(COLLOCATIONS, []).length, 300);
});
test('every CEFR filter supplies a complete seven-item exercise pool', () => {
  for (const level of ['A1', 'A2', 'B1', 'B2', 'C1']) {
    const pool = filterByLevels(COLLOCATIONS, [level]);
    assert.ok(pool.length >= 7);
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
test('hundreds of Easy boards across every CEFR filter satisfy the full 7x7 invariant', () => {
  const random = seededRandom(981723);
  for (const levels of [[], ['A1'], ['A2'], ['B1'], ['B2'], ['C1']]) {
    const pool = filterByLevels(COLLOCATIONS, levels);
    for (let run = 0; run < 100; run += 1) {
      const board = createEasySession(pool, SESSION_SIZE, random);
      assert.equal(board.length, SESSION_SIZE);
      assert.equal(isUnambiguousEasyBoard(board), true);
      const firsts = board.map(item => item.first); const seconds = board.map(item => item.second);
      assert.equal(new Set(board.map(item => item.id)).size, SESSION_SIZE);
      firsts.forEach(first => assert.equal(seconds.filter(second => isAcceptedPair(first, second)).length, 1));
      seconds.forEach(second => assert.equal(firsts.filter(first => isAcceptedPair(first, second)).length, 1));
    }
  }
});
test('known valid partner families are represented and can never oppose one another', () => {
  for (const [first, second] of [['make','a mistake'], ['make','a decision'], ['make','progress'], ['make','sense'], ['make','an appointment'], ['make','a difference'], ['make','a complaint'], ['take','a break'], ['take','a chance'], ['take','a picture'], ['take','a seat'], ['take','notes'], ['take','responsibility'], ['take','advantage of'], ['take','action'], ['take','part'], ['take','control'], ['talk','to'], ['talk','about'], ['care','for'], ['care','about'], ['smell','of'], ['smell','like'], ['agree','with'], ['agree','on'], ['agree','about'], ['result','in'], ['result','from'], ['quick','meal'], ['quick','learner'], ['hear','about'], ['hear','of'], ['hear','from'], ['think','about'], ['think','of'], ['ask','for'], ['ask','about'], ['complain','about'], ['complain','to']]) {
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
    assert.ok(item.mediumDistractors.includes(first[1]), `${item.full} used an uncurated distractor`);
    assert.ok(item.mediumDistractors.includes(last[0]), `${item.full} used an uncurated distractor`);
    assert.equal(acceptedPartners(item).has(first[1]), false);
  }
});
test('at least 1,000 Medium questions across every CEFR filter satisfy all three invariants', () => {
  let questionCount = 0;
  for (const levels of [[], ['A1'], ['A2'], ['B1'], ['B2'], ['C1']]) {
    const pool = filterByLevels(COLLOCATIONS, levels);
    const random = seededRandom(42 + pool.length);
    for (let run = 0; run < 100; run += 1) {
      const session = createMediumSession(pool, SESSION_SIZE, random);
      assert.equal(session.length, SESSION_SIZE);
      session.forEach(item => {
        const question = createMediumQuestion(item, random);
        assert.ok(question);
        questionCount += 1;
        assert.equal(isValidPartner(item.first, question.correct), true);
        assert.equal(isValidatedDistractor(item, question.distractor), true);
        assert.equal(COLLOCATIONS.some(candidate => candidate.first === item.first && candidate.second === question.distractor), false);
        assert.equal(item.acceptedAlternatives.includes(question.distractor), false);
        assert.equal(isValidPartner(item.first, question.distractor), false, `${item.first} ${question.distractor} is valid`);
      });
    }
  }
  assert.ok(questionCount >= 1000, `only generated ${questionCount} Medium questions`);
});

test('Medium renders the existing contextual example without changing Advanced recall', async () => {
  const source = await readFile(new URL('./collocations.js', import.meta.url), 'utf8');
  assert.match(source, /const mediumQuestion = hard \? null : createMediumQuestion\(item\)/u);
  assert.match(source, /<p class="context-sentence">“\$\{item\.example\}”<\/p>/u);
  assert.match(source, /hard \? `<form id="answer-form"/u);
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
