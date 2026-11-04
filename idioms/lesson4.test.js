import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { IDIOM_LESSON_CONTENT } from '../api/idioms.js';
import { IDIOM_LESSONS } from './catalog.js';

// These known inflections cover the published idioms. Extend for new verbs;
// normalisation supplements editorial review rather than inferring synonyms.
const verbs = Object.fromEntries([
  'be is are was were been being', 'break breaks broke broken breaking',
  'hit hits hitting', 'cost costs costing', 'spill spills spilled spilt spilling',
  'bite bites bit bitten biting', 'call calls called calling',
  'pull pulls pulled pulling', 'beat beats beaten beating',
  'cut cuts cutting', 'get gets got gotten getting', 'go goes went gone going',
  'throw throws threw thrown throwing', 'take takes took taken taking',
  'burn burns burned burnt burning', 'read reads reading',
  'keep keeps kept keeping', 'miss misses missed missing',
  'jump jumps jumped jumping', 'see sees saw seen seeing',
  'draw draws drew drawn drawing', 'make makes made making',
].flatMap(group => {
  const [lemma, ...forms] = group.split(' ');
  return forms.map(form => [form, lemma]);
}));

function normaliseIdiom(value) {
  return value.normalize('NFKC').toLowerCase().replace(/[’']/g, '')
    .replace(/\bher(?= (?:leg|chest|chin|court|bridges)\b)/g, 'possessive')
    .replace(/\b(?:someones|ones|my|your|his|its|our|their)\b/g, 'possessive')
    .replace(/\b(?:someone|somebody|me|you|him|her|us|them)\b/g, 'person')
    .replace(/\b(?:something|it|everything)\b/g, 'thing')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(/\s+/)
    .map(word => verbs[word] || word).join(' ').replace(/^(?:(?:to|be) )+/, '');
}

test('all published idioms remain unique across lessons, pronouns and known verb forms', () => {
  const seen = new Map();
  for (const lesson of IDIOM_LESSONS.filter(item => item.published)) {
    for (const item of IDIOM_LESSON_CONTENT[lesson.id]) {
      const key = normaliseIdiom(item.idiom);
      assert.ok(!seen.has(key),
        `Duplicate "${item.idiom}" in Lesson ${lesson.id}; already in Lesson ${seen.get(key)}`);
      seen.set(key, lesson.id);
    }
  }
  assert.equal(seen.size, IDIOM_LESSONS.filter(item => item.published).length * 10);
});

test('duplicate detection catches pronoun and verb variants without merging distinct idioms', () => {
  for (const [original, variant] of [
    ['Break the ice', 'Broke the ice!'],
    ['The ball is in your court', 'The ball was in their court'],
    ["Pull someone's leg", 'Pulling my leg'],
    ['Get cold feet', 'Got cold feet'],
    ['Go the extra mile', 'Going the extra mile'],
    ['Throw in the towel', 'Threw in the towel'],
    ['Take it with a grain of salt', 'Took it with a grain of salt'],
    ['Keep someone in the loop', 'Kept me in the loop'],
    ['Keep someone in the loop', 'Keeping her in the loop'],
    ['Get something off your chest', 'Getting it off his chest'],
    ['See eye to eye', 'Saw eye to eye'],
    ['Keep your chin up', 'Kept her chin up'],
    ['Draw the line', 'Drawing the line'],
    ['Make ends meet', 'Made ends meet'],
  ]) {
    assert.equal(normaliseIdiom(original), normaliseIdiom(variant));
  }
  assert.notEqual(normaliseIdiom('On the same page'), normaliseIdiom('See eye to eye'));
  assert.notEqual(normaliseIdiom('Once in a blue moon'), normaliseIdiom('Out of the blue'));
});

test('Lesson 4 preserves the approved answer sequence and contains no answer markers', () => {
  const items = IDIOM_LESSON_CONTENT[4];
  assert.deepEqual(items.map(item => 'ABCD'[item.correct]), ['C', 'A', 'D', 'B', 'A', 'C', 'B', 'D', 'A', 'B']);
  assert.doesNotMatch(JSON.stringify(items), /✅/);
});

test('Lesson 4 and future lessons balance answers and avoid repeated or cyclic patterns', () => {
  for (const lesson of IDIOM_LESSONS.filter(item => item.published && item.id >= 4)) {
    const answers = IDIOM_LESSON_CONTENT[lesson.id].map(item => item.correct);
    const counts = [0, 1, 2, 3].map(answer => answers.filter(value => value === answer).length);
    assert.ok(Math.max(...counts) - Math.min(...counts) <= 1);
    if (answers.length === 10) assert.deepEqual(counts.toSorted(), [2, 2, 3, 3]);
    assert.ok(!answers.some((value, i) => i >= 2 && value === answers[i - 1] && value === answers[i - 2]));
    assert.ok(!answers.every((value, i) => value === answers[i % 4]));
    for (const earlier of IDIOM_LESSONS.filter(item => item.published && item.id < lesson.id)) {
      assert.notDeepEqual(answers, IDIOM_LESSON_CONTENT[earlier.id].map(item => item.correct));
    }
  }
});

test('direct Lesson 4 access reuses sign-in, upgrade and verified practice flows', async () => {
  const app = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
  const source = app.slice(app.indexOf('async function verifyAccess('), app.indexOf('async function refreshAccess('));
  for (const scenario of ['visitor', 'free', 'premium', 'expired', 'backend-error']) {
    const events = [];
    const signedIn = { access_token: 'session-token', user: { id: 'verified-user' } };
    const statusCode = { free: 403, premium: 200, expired: 401, 'backend-error': 503 }[scenario];
    const sandbox = {
      AbortController, generation: 0, controller: null, activeLessonId: null,
      verifiedUserId: null, checking: false, session: null, plusAccess: false,
      clearAccess() { events.push('clear'); },
      buildGrid() {}, closeModal() {}, status() {},
      signIn() { events.push('signIn'); },
      upgrade() { events.push('upgrade'); },
      showHome() { events.push('home'); },
      updateLocation(id) { events.push(['location', id]); },
      showPractice(lesson, items) { events.push(['practice', lesson.id, items]); },
      async fetch(url, options) {
        assert.equal(url, '/api/idioms?lesson=4');
        assert.equal(options.headers.Authorization, 'Bearer session-token');
        assert.equal(options.cache, 'no-store');
        const payload = { userId: 'verified-user', plusAccess: scenario === 'premium' };
        if (scenario === 'premium') Object.assign(payload, { lesson: IDIOM_LESSONS[3], items: IDIOM_LESSON_CONTENT[4] });
        return { status: statusCode, ok: statusCode === 200, async json() { return payload; } };
      },
    };
    vm.runInNewContext(source, sandbox);
    await sandbox.verifyAccess(scenario === 'visitor' ? null : signedIn, 4);
    const practice = events.find(event => Array.isArray(event) && event[0] === 'practice');
    if (scenario === 'premium') {
      assert.equal(practice[1], 4);
      assert.equal(practice[2], IDIOM_LESSON_CONTENT[4]);
      assert.ok(events.some(event => Array.isArray(event) && event[0] === 'location' && event[1] === 4));
    } else {
      assert.equal(practice, undefined);
      if (scenario === 'free') assert.ok(events.includes('upgrade'));
      if (['visitor', 'expired'].includes(scenario)) assert.ok(events.includes('signIn'));
    }
  }
});
