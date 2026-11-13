import assert from 'node:assert/strict';
import test from 'node:test';
import { createToeflDictionaryHandler } from './toefl-dictionary.js';
import { TOEFL_DICTIONARY } from './_lib/toefl-dictionary-data.js';

function fixture({ user = { id: 'verified-user' }, profile = { tier: 'premium', is_admin: false }, authError = null, profileError = null, throws = false } = {}) {
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
  };
  const res = { statusCode: 0, headers: {}, body: null, setHeader(name, value) { this.headers[name] = value; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } };
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
    assert.equal(res.body.entries, TOEFL_DICTIONARY);
    assert.equal(res.body.entries.length, 90);
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
