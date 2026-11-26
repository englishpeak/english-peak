import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { test } from 'node:test';
import { createSpellingBeeHandler } from '../../api/_lib/spelling-bee.js';
import { LEVELS_BY_DIFFICULTY, SPELLING_BEE_WORDS } from '../../api/_lib/spelling-bee-data.js';
import { TOEFL_DICTIONARY } from '../../api/_lib/toefl-dictionary-data.js';

const easy = ['apple', 'banana'];
const medium = ['accommodation', 'indicate'];
const hard = ['accumulate', 'pervasive'];
const recordings = [...easy, ...medium, ...hard];
const members = ['free-member', 'plus-member'];
const newWordsByLevel = {
  A1: ['breakfast', 'daughter', 'elephant', 'hospital', 'restaurant'],
  A2: ['beautiful', 'bicycle', 'mountain', 'neighbor', 'vegetable'],
  B1: ['achievement', 'available', 'environment', 'necessary', 'recommend'],
  B2: ['exaggerate', 'independent', 'responsibility', 'suspicious', 'colleague'],
  C1: ['notion', 'outcome'],
};
const newHardDictionaryWords = [
  'adverse', 'deplete', 'equilibrium', 'expenditure', 'impart', 'intrinsic', 'predominant', 'ubiquitous',
];

async function fixture(t, { available = recordings, missing = [], getUser } = {}) {
  const calls = { lists: [], downloads: [] };
  const handler = createSpellingBeeHandler({
    secret: 'test-secret',
    supabase: {
      auth: {
        getUser: getUser ?? (async token => {
          if (members.includes(token)) return { data: { user: { id: token } } };
          if (token === 'anonymous') return { data: { user: { id: token, is_anonymous: true } } };
          return { error: { status: 401 } };
        }),
      },
      storage: {
        from(bucket) {
          assert.equal(bucket, 'word-audio');
          return {
            async list(folder) {
              calls.lists.push(folder);
              return { data: available.map(word => ({ id: word, name: word + '.mp3', metadata: { size: 200 } })) };
            },
            download(path) {
              calls.downloads.push(path);
              const word = path.slice('en-US/'.length, -'.mp3'.length);
              const metadata = Buffer.from('title=' + word);
              const v2 = Buffer.concat([Buffer.from([73, 68, 51, 3, 0, 0, 0, 0, 0, metadata.length]), metadata]);
              const v1 = Buffer.alloc(128);
              v1.write('TAG' + word);
              return {
                async asStream() {
                  if (missing.includes(word)) return { error: { statusCode: '404' } };
                  const bytes = Buffer.concat([v2, Buffer.from([255, 251, 1, 2]), v1]);
                  return { data: ReadableStream.from([bytes.subarray(0, 5), bytes.subarray(5, 25), bytes.subarray(25)]) };
                },
              };
            },
          };
        },
      },
    },
  });
  const server = createServer(async (req, res) => {
    let input = '';
    for await (const chunk of req) input += chunk;
    req.body = JSON.parse(input);
    res.status = code => { res.statusCode = code; return res; };
    res.json = body => {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(body));
    };
    await handler(req, res);
  });
  t.after(() => server.close());
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');

  async function call(action, body = {}, user = members[0]) {
    const headers = { 'Content-Type': 'application/json' };
    if (user) headers.Authorization = 'Bearer ' + user;
    return fetch(`http://127.0.0.1:${server.address().port}/api/spelling-bee`, {
      method: 'POST', headers, body: JSON.stringify({ action, ...body }),
    });
  }
  return { call, calls };
}

test('Bee vocabulary preserves explicit levels, merges dictionary terms and uses unique spellings', () => {
  const words = new Map(SPELLING_BEE_WORDS.map(entry => [entry.word, entry]));
  assert.equal(words.size, SPELLING_BEE_WORDS.length);
  assert.deepEqual(LEVELS_BY_DIFFICULTY, { easy: ['A1', 'A2'], medium: ['B1', 'B2'], hard: ['C1', 'C2'] });
  const additions = {
    A1: 'apple banana brother family garden kitchen morning picture teacher window',
    A2: 'appointment calendar customer furniture invitation journey luggage medicine passenger suitcase',
    B2: 'accommodation acknowledge conscious consequence guarantee maintenance perspective pronunciation sufficient thoroughly',
  };
  const explicitWords = new Set();
  for (const [level, newWords] of Object.entries(newWordsByLevel)) {
    const previousWords = additions[level]?.split(' ') ?? [];
    for (const word of [...previousWords, ...newWords]) {
      assert.deepEqual(words.get(word), { word, cefrLevel: level, audioPath: `en-US/${word}.mp3` });
      explicitWords.add(word);
    }
  }
  for (const entry of TOEFL_DICTIONARY) {
    const word = entry.word.toLowerCase();
    if (!explicitWords.has(word)) {
      assert.equal(words.get(word).cefrLevel, entry.cefrLevel);
    }
  }
});

test('route shell is public, exercise markup and every activity action require a registered account', async t => {
  const pools = {
    easy: [...easy, ...newWordsByLevel.A1, ...newWordsByLevel.A2],
    medium: [...medium, ...newWordsByLevel.B1, ...newWordsByLevel.B2],
    hard: [...hard, ...newWordsByLevel.C1, ...newHardDictionaryWords],
  };
  const { call, calls } = await fixture(t, { available: Object.values(pools).flat() });
  const shell = readFileSync(new URL('../../spelling-bee/index.html', import.meta.url), 'utf8');
  const index = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const vercel = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
  assert.doesNotMatch(shell, /Listen and spell|id="answer"/);
  assert.match(index, /id="new-practice-section"[^]*?class="ex-card spelling-bee-card"[^]*?🐝/);
  assert.match(index, /id="frame-spelling-bee" src="about:blank" title="Spelling Bee"/);
  assert.ok(vercel.rewrites.some(route => route.source === '/api/spelling-bee' &&
    route.destination === '/api/toefl-dictionary?exercise=spelling-bee'));

  for (const action of ['page', 'start', 'audio', 'check', 'reveal', 'next', 'skip', 'resume']) {
    for (const account of [null, 'anonymous', 'invalid']) {
      assert.equal((await call(action, {}, account)).status, 401);
    }
  }
  assert.deepEqual(calls, { lists: [], downloads: [] });

  for (const account of members) {
    const response = await call('page', {}, account);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('Cache-Control'), /no-store/);
    const { html } = await response.json();
    assert.match(html, /Listen and spell/);
    assert.match(html, /spellcheck="false"/);
    assert.equal([...html.matchAll(/data-level="(?:easy|medium|hard)" aria-pressed="true"/g)].length, 3);
    assert.match(html, /id="play" aria-label="Play pronunciation"[^]*?<span aria-hidden="true">▶<\/span>\s*<\/button>/);
    assert.doesNotMatch(html, /apple|indicate|pervasive|\.mp3/);

    for (const [difficulty, expected] of Object.entries(pools)) {
      let round = await (await call('start', { difficulties: [difficulty] }, account)).json();
      const words = [];
      while (round.state === 'question') {
        const { questionId } = round;
        assert.equal(round.difficulty, difficulty);
        const audio = await call('audio', { questionId }, account);
        assert.equal(audio.status, 200);
        assert.equal(audio.headers.get('Content-Type'), 'audio/mpeg');
        assert.equal(audio.headers.get('Content-Disposition'), null);
        assert.deepEqual(new Uint8Array(await audio.arrayBuffer()), new Uint8Array([255, 251, 1, 2]));
        const word = calls.downloads.at(-1).slice('en-US/'.length, -'.mp3'.length);
        words.push(word);

        const wrong = await (await call('check', { questionId, answer: 'wrong' }, account)).json();
        assert.equal(wrong.state, 'incorrect');
        assert.equal(wrong.word, undefined);
        const correct = await (await call('check', { questionId: wrong.questionId, answer: word }, account)).json();
        assert.equal(correct.state, 'correct');
        round = await (await call('next', { questionId: correct.questionId, difficulties: [difficulty] }, account)).json();
      }
      assert.equal(round.state, 'filtered');
      assert.deepEqual(words.sort(), [...expected].sort());
    }
  }
  assert.ok(calls.lists.every(folder => folder === 'en-US'));
});

test('question IDs hide the word, belong to one member and advance only after a valid action', async t => {
  const { call, calls } = await fixture(t, { available: easy });
  const initial = await (await call('start', { difficulty: 'easy' })).json();
  const id = initial.questionId;
  assert.deepEqual(Object.keys(initial), ['state', 'questionId', 'difficulty']);
  assert.doesNotMatch(Buffer.from(id, 'base64url').toString(), /apple|banana|\.mp3/);
  assert.equal((await call('audio', { questionId: id }, members[1])).status, 409);
  assert.equal((await call('audio', { questionId: (id[0] === 'A' ? 'B' : 'A') + id.slice(1) })).status, 409);
  assert.equal((await call('reveal', { questionId: id })).status, 400);
  assert.equal((await call('next', { questionId: id })).status, 400);

  for (let i = 0; i < 12; i++) {
    const result = await (await call('check', { questionId: id, answer: 'wrong' })).json();
    assert.equal(result.state, 'incorrect');
    assert.equal(result.word, undefined);
  }
  for (let i = 0; i < 3; i++) {
    assert.equal((await call('audio', { questionId: id })).status, 200);
  }
  const first = calls.downloads.at(-1).slice('en-US/'.length, -'.mp3'.length);
  const correct = await (await call('check', { questionId: id, answer: ' ' + first.toUpperCase() + '  ' })).json();
  assert.equal(correct.state, 'correct');
  assert.equal((await call('check', { questionId: correct.questionId, answer: first })).status, 400);

  const next = await (await call('next', { questionId: correct.questionId })).json();
  const miss = await (await call('check', { questionId: next.questionId, answer: first })).json();
  const revealed = await (await call('reveal', { questionId: miss.questionId })).json();
  assert.equal(revealed.state, 'revealed');
  assert.equal(revealed.word, easy.find(word => word !== first));
  assert.deepEqual(await (await call('next', { questionId: revealed.questionId })).json(), { state: 'complete' });
  assert.equal((await (await call('start', { difficulty: 'easy' })).json()).state, 'question');
});

test('opening prepares the first question in one request and answer checks reuse only recent verification', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: new Date('2026-11-19T12:00:00Z') });
  const expiry = Date.now() / 1000 + 45;
  const token = `header.${Buffer.from(JSON.stringify({ exp: expiry })).toString('base64url')}.signature`;
  const authCalls = [];
  const { call, calls } = await fixture(t, {
    available: ['apple'],
    async getUser(bearer) {
      authCalls.push(bearer);
      return bearer === token && Date.now() / 1000 < expiry
        ? { data: { user: { id: members[0] } } }
        : { error: { status: 401 } };
    },
  });

  assert.equal((await call('page', { includeRound: true }, null)).status, 401);
  const opened = await call('page', { includeRound: true }, token);
  assert.equal(opened.status, 200);
  const { html, round } = await opened.json();
  assert.match(html, /Listen and spell/);
  assert.equal(round.state, 'question');
  assert.equal(round.difficulty, 'easy');
  assert.deepEqual(calls.lists, ['en-US']);
  assert.deepEqual(authCalls, [token]);

  async function answer(answer, bearer = token, questionId = round.questionId) {
    return call('check', { questionId, answer }, bearer);
  }
  t.mock.timers.tick(20_000);
  const wrong = await (await answer('banana')).json();
  assert.equal(wrong.state, 'incorrect');
  assert.equal(wrong.word, undefined);
  assert.equal((await (await answer(' APPLE ', token, wrong.questionId)).json()).state, 'correct');
  assert.deepEqual(authCalls, [token]);
  const otherToken = token + 'changed';
  assert.equal((await answer('apple', otherToken)).status, 401);

  t.mock.timers.tick(11_000);
  assert.equal((await (await answer('apple')).json()).state, 'correct');
  assert.deepEqual(authCalls, [token, otherToken, token]);
  t.mock.timers.tick(15_000);
  assert.equal((await answer('apple')).status, 401);
  assert.deepEqual(authCalls, [token, otherToken, token, token]);
});

test('missing audio can be skipped and an unavailable difficulty does not borrow another pool', async t => {
  const { call } = await fixture(t, { available: ['apple'], missing: ['apple'] });
  const { questionId } = await (await call('start', { difficulty: 'easy' })).json();
  const audio = await call('audio', { questionId });
  assert.equal(audio.status, 404);
  assert.doesNotMatch(await audio.text(), /apple|\.mp3/);
  assert.deepEqual(await (await call('skip', { questionId })).json(), { state: 'complete' });
  assert.deepEqual(await (await call('start', { difficulty: 'hard' })).json(), { state: 'empty' });
  assert.equal((await call('start', { difficulty: '__proto__' })).status, 400);
});

test('combined rounds draw from enabled levels and preserve unseen words when filters change', async t => {
  const { call, calls } = await fixture(t);
  const all = ['easy', 'medium', 'hard'];
  const invalid = await call('start', { difficulties: [] });
  assert.equal(invalid.status, 400);
  assert.deepEqual(calls.lists, []);
  assert.equal((await call('start', { difficulties: ['easy', '__proto__'] })).status, 400);

  async function advance(round, difficulties) {
    const response = await call(round.state === 'filtered' ? 'resume' : 'skip', {
      questionId: round.questionId, difficulties,
    });
    assert.equal(response.status, 200);
    return response.json();
  }

  const { questionId } = await (await call('start', { difficulties: all })).json();
  const combined = [];
  let round = { state: 'question', questionId };
  while (round.state === 'question') {
    assert.equal((await call('audio', { questionId: round.questionId })).status, 200);
    combined.push(calls.downloads.at(-1));
    round = await advance(round, all);
  }
  assert.equal(round.state, 'complete');
  assert.deepEqual(combined.sort(), recordings.map(word => `en-US/${word}.mp3`).sort());

  round = await (await call('start', { difficulties: ['medium'] })).json();
  assert.equal(round.difficulty, 'medium');
  round = await advance(round, ['medium']);
  assert.equal(round.difficulty, 'medium');
  round = await advance(round, ['medium']);
  assert.equal(round.state, 'filtered');
  assert.equal((await call('audio', { questionId: round.questionId })).status, 400);
  assert.equal((await advance(round, ['medium'])).state, 'filtered');
  assert.equal(calls.lists.length, 2);

  round = await advance(round, ['easy', 'hard']);
  const remaining = [];
  while (round.state === 'question') {
    assert.ok(['easy', 'hard'].includes(round.difficulty));
    assert.equal((await call('audio', { questionId: round.questionId })).status, 200);
    remaining.push(calls.downloads.at(-1));
    round = await advance(round, all);
  }
  assert.equal(round.state, 'complete');
  assert.deepEqual(remaining.sort(), [...easy, ...hard].map(word => `en-US/${word}.mp3`).sort());
  assert.equal(calls.lists.length, 2);
});
