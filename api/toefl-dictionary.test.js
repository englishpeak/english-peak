import assert from 'node:assert/strict';
import test from 'node:test';
import { createToeflDictionaryHandler } from './toefl-dictionary.js';
import { TOEFL_DICTIONARY } from './_lib/toefl-dictionary-data.js';
import { vocabularyAudioPath } from './_lib/vocabulary-audio.js';

const audioBytes = Buffer.from([0xff, 0xfb, 0x90, 0x00]);

function fixture({ user = { id: 'verified-user' }, profile = { tier: 'premium', is_admin: false }, authError = null, profileError = null, storageError = null, audio = new Blob([audioBytes]), throws = false } = {}) {
  const calls = [];
  const supabase = {
    auth: { async getUser(token) { calls.push(['getUser', token]); if (throws) throw new Error('Private backend detail'); return { data: { user }, error: authError }; } },
    from(table) {
      calls.push(['from', table]);
      return {
        select(columns) { calls.push(['select', columns]); return this; },
        eq(column, value) { calls.push(['eq', column, value]); return this; },
        async maybeSingle() { return { data: profile, error: profileError }; },
      };
    },
    storage: { from(bucket) {
      calls.push(['bucket', bucket]);
      return { async download(path) { calls.push(['download', path]); return { data: audio, error: storageError }; } };
    } },
  };
  const res = { statusCode: 0, headers: {}, body: null, setHeader(name, value) { this.headers[name] = value; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; }, end(value) { this.body = value; } };
  return { handler: createToeflDictionaryHandler({ supabase }), calls, res };
}
const request = (authorization = 'Bearer valid-token', additions = {}) => ({ method: 'GET', headers: { authorization }, ...additions });

test('missing, malformed and invalid tokens never receive dictionary content', async () => {
  for (const authorization of [undefined, '', 'Bearer ', 'Basic valid-token', ['Bearer valid-token'], 'Bearer token extra']) {
    const { handler, calls, res } = fixture();
    await handler(request(authorization, { headers: { authorization } }), res);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.entries, undefined);
    assert.equal(calls.length, 0);
  }
  for (const options of [{ user: null }, { authError: { status: 401 } }]) {
    const { handler, res } = fixture(options);
    await handler(request('Bearer forged-token'), res);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.entries, undefined);
  }
});

test('free, missing and unrecognized profiles are denied despite forged browser claims', async () => {
  for (const profile of [null, { tier: 'free' }, { tier: 'visitor' }, { tier: 'unknown' }, { tier: 'free', is_admin: 'true' }]) {
    const { handler, calls, res } = fixture({ profile });
    await handler(request('Bearer valid-token', { query: { tier: 'premium', userId: 'admin-user' }, body: { is_admin: true, tier: 'premium' }, user: { id: 'admin-user', user_metadata: { tier: 'premium' } } }), res);
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.entries, undefined);
    assert.ok(calls.some((call) => JSON.stringify(call) === JSON.stringify(['eq', 'id', 'verified-user'])));
  }
});

test('all existing full-access tiers and the is_admin override retain access', async () => {
  for (const profile of ['premium', 'teacher', 'student', 'courtesy', 'admin'].map((tier) => ({ tier, is_admin: false })).concat({ tier: 'free', is_admin: true })) {
    const { handler, res } = fixture({ profile });
    await handler(request(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.userId, 'verified-user');
    assert.deepEqual(res.body.entries, TOEFL_DICTIONARY.map(({ audioPath, ...entry }) => entry));
    assert.equal(res.body.entries.length, 90);
  }
});

test('all 90 vocabulary entries resolve to distinct lowercase MP3 paths and can specify an override', () => {
  const paths = TOEFL_DICTIONARY.map(vocabularyAudioPath);
  assert.equal(new Set(paths).size, 90);
  for (const path of paths) assert.match(path, /^en-US\/[a-z]+\.mp3$/);
  assert.equal(vocabularyAudioPath({ word: 'Read', audioPath: 'en-US/read-past.mp3' }), 'en-US/read-past.mp3');
});

test('member audio requests serve the corresponding private MP3 without a redirect or filename', async () => {
  for (const [audio, filename] of [['set-1-analyze', 'analyze'], ['set-3-abundant', 'abundant'], ['set-4-accumulate', 'accumulate']]) {
    const { handler, calls, res } = fixture();
    await handler(request('Bearer valid-token', { query: { audio, path: 'ignored.mp3' } }), res);
    assert.deepEqual(calls.slice(-2), [['bucket', 'word-audio'], ['download', `en-US/${filename}.mp3`]]);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, audioBytes);
    assert.equal(res.headers['Content-Type'], 'audio/mpeg');
    assert.equal(res.headers['Content-Length'], audioBytes.length);
    assert.match(res.headers['Cache-Control'], /private, no-store/);
    assert.equal(res.headers['Vercel-CDN-Cache-Control'], 'no-store');
    assert.equal(res.headers.Location, undefined);
    assert.equal(res.headers['Content-Disposition'], undefined);
  }
});

test('audio checks authorization on every request and never passes a client-supplied path to Storage', async () => {
  const cases = [
    [{}, '', 'set-1-analyze', 401],
    [{ authError: { status: 401 } }, 'Bearer expired', 'set-1-analyze', 401],
    [{ profile: { tier: 'free' } }, 'Bearer valid', 'set-1-analyze', 403],
    [{ profileError: new Error('offline') }, 'Bearer valid', 'set-1-analyze', 503],
    [{}, 'Bearer valid', ['set-1-analyze'], 400],
    [{}, 'Bearer valid', '../en-US/analyze.mp3', 400],
    [{}, 'Bearer valid', 'unknown-entry', 404],
  ];
  for (const [options, token, audio, status] of cases) {
    const { handler, calls, res } = fixture(options);
    await handler(request(token, { query: { audio } }), res);
    assert.equal(res.statusCode, status);
    assert.equal(calls.some(([name]) => name === 'bucket'), false);
    assert.equal(res.headers['Content-Type'], undefined);
  }
});

test('missing, empty and inaccessible audio returns a safe error without backend paths', async () => {
  for (const [options, status] of [
    [{ storageError: { status: 400, statusCode: '404', message: 'en-US/analyze.mp3' } }, 404],
    [{ storageError: { status: 403, message: 'en-US/analyze.mp3' } }, 503],
    [{ audio: new Blob() }, 503],
  ]) {
    const { handler, res } = fixture(options);
    await handler(request('Bearer valid-token', { query: { audio: 'set-1-analyze' } }), res);
    assert.equal(res.statusCode, status);
    assert.doesNotMatch(res.body.error, /en-US|\bmp3\b/);
    assert.match(res.headers['Cache-Control'], /private, no-store/);
  }
});

test('profile errors, auth outages and exceptions fail closed without backend details', async () => {
  for (const options of [{ profileError: new Error('Private database detail') }, { authError: { status: 503 } }, { throws: true }]) {
    const { handler, res } = fixture(options);
    await handler(request(), res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.entries, undefined);
    assert.doesNotMatch(JSON.stringify(res.body), /Private|token|service.role/i);
  }
});

test('all responses disable shared caching and unsupported methods do not touch Supabase', async () => {
  for (const options of [{}, { profile: { tier: 'free' } }, { user: null }]) {
    const { handler, res } = fixture(options);
    await handler(request(), res);
    assert.match(res.headers['Cache-Control'], /private, no-store/);
    assert.equal(res.headers['CDN-Cache-Control'], 'no-store');
    assert.equal(res.headers['Vercel-CDN-Cache-Control'], 'no-store');
    assert.equal(res.headers.Vary, 'Authorization');
  }
  const { handler, calls, res } = fixture();
  await handler(request('Bearer valid-token', { method: 'POST' }), res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, 'GET');
  assert.equal(calls.length, 0);
});
