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

async function fixture(t, { available = recordings, missing = [] } = {}) {
  const calls = { lists: [], downloads: [] };
  const handler = createSpellingBeeHandler({
    secret: 'test-secret',
    supabase: {
      auth: {
        async getUser(token) {
          if (members.includes(token)) return { data: { user: { id: token } } };
          if (token === 'anonymous') return { data: { user: { id: token, is_anonymous: true } } };
          return { error: { status: 401 } };
        },
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
  for (const [level, entries] of Object.entries(additions)) {
    for (const word of entries.split(' ')) {
      assert.deepEqual(words.get(word), { word, cefrLevel: level, audioPath: `en-US/${word}.mp3` });
    }
  }
  for (const entry of TOEFL_DICTIONARY) {
    const word = entry.word.toLowerCase();
    if (!Object.values(additions).some(entries => entries.split(' ').includes(word))) {
      assert.equal(words.get(word).cefrLevel, entry.cefrLevel);
    }
  }
});

test('route shell is public, exercise markup and every activity action require a registered account', async t => {
  const { call, calls } = await fixture(t);
  const shell = readFileSync(new URL('../../spelling-bee/index.html', import.meta.url), 'utf8');
  const index = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const vercel = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
  assert.doesNotMatch(shell, /Listen and spell|id="answer"/);
  assert.match(index, /id="new-practice-section"[^]*?href="\/spelling-bee"/);
  assert.ok(vercel.rewrites.some(route => route.source === '/api/spelling-bee' &&
    route.destination === '/api/toefl-dictionary?exercise=spelling-bee'));

  for (const action of ['page', 'start', 'audio', 'check', 'reveal', 'next', 'skip']) {
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
    assert.doesNotMatch(html, /apple|indicate|pervasive|\.mp3/);

    for (const [difficulty, expected] of Object.entries({ easy, medium, hard })) {
      let { questionId } = await (await call('start', { difficulty }, account)).json();
      const words = [];
      while (questionId) {
        const audio = await call('audio', { questionId }, account);
        assert.equal(audio.status, 200);
        assert.equal(audio.headers.get('Content-Type'), 'audio/mpeg');
        assert.equal(audio.headers.get('Content-Disposition'), null);
        assert.deepEqual(new Uint8Array(await audio.arrayBuffer()), new Uint8Array([255, 251, 1, 2]));
        words.push(calls.downloads.at(-1).slice('en-US/'.length, -'.mp3'.length));
        ({ questionId } = await (await call('skip', { questionId }, account)).json());
      }
      assert.deepEqual(words.sort(), [...expected].sort());
    }
  }
  assert.ok(calls.lists.every(folder => folder === 'en-US'));
});

test('question IDs hide the word, belong to one member and advance only after a valid action', async t => {
  const { call, calls } = await fixture(t, { available: easy });
  const initial = await (await call('start', { difficulty: 'easy' })).json();
  const id = initial.questionId;
  assert.deepEqual(Object.keys(initial), ['state', 'questionId']);
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
