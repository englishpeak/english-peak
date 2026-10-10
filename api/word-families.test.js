import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { WORD_FAMILIES, createWordFamiliesHandler } from './word-families.js';

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
  return { handler: createWordFamiliesHandler({ supabase }), calls, res };
}
const request = (authorization = 'Bearer valid-token', additions = {}) => ({ method: 'GET', headers: { authorization }, ...additions });

test('the canonical 300-family bank remains identical to the supplied audited JSON', () => {
  const serialized = JSON.stringify(WORD_FAMILIES.slice(0, 300), null, 2);
  assert.equal(createHash('sha256').update(serialized).digest('hex'), '961511019e50e21c127c2f0237238ffe37a04c0215dadfca50c106a3e9073c27');
  assert.equal(WORD_FAMILIES.length, 500);
  assert.equal(new Set(WORD_FAMILIES.map((family) => family.id)).size, 500);
  WORD_FAMILIES.forEach((family) => assert.equal(family.forms.length, 5));
});

test('the 200 additions have unique IDs, distinct families and valid target groups', () => {
  const words = new Map();
  for (const [index, family] of WORD_FAMILIES.entries()) {
    assert.equal(family.id, index + 1);
    assert.equal(family.forms.length, 5);
    assert.ok(family.forms.filter(Boolean).length >= 2, `Family ${family.id} needs a clue and an answer`);
    for (const group of family.forms) {
      if (group === null) continue;
      assert.ok(Array.isArray(group) && group.length > 0);
      assert.equal(new Set(group).size, group.length);
      for (const word of group) {
        assert.match(word, /^[a-z]+(?:[ -][a-z]+)*$/);
        const previousFamily = words.get(word);
        if (family.id > 300 && previousFamily) {
          assert.equal(previousFamily, family.id, `Duplicate family word: ${word}`);
        }
        words.set(word, family.id);
      }
    }
    assert.ok(!family.forms[2]?.some(word => family.forms[3]?.includes(word)), `Overlapping adjective groups: ${family.id}`);
  }
});

test('missing, malformed and invalid tokens never receive the bank', async () => {
  for (const authorization of [undefined, '', 'Bearer ', 'Basic valid-token', ['Bearer valid-token'], 'Bearer token extra']) {
    const { handler, calls, res } = fixture();
    await handler(request(authorization, { headers: { authorization } }), res);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.families, undefined);
    assert.equal(calls.length, 0);
  }
  for (const options of [{ user: null }, { authError: { status: 401 } }]) {
    const { handler, res } = fixture(options);
    await handler(request('Bearer forged-token'), res);
    assert.equal(res.statusCode, 401);
    assert.equal(res.body.families, undefined);
  }
});

test('free, missing and unrecognized profiles are denied despite forged browser claims', async () => {
  for (const profile of [null, { tier: 'free' }, { tier: 'visitor' }, { tier: 'unknown' }, { tier: 'free', is_admin: 'true' }]) {
    const { handler, calls, res } = fixture({ profile });
    await handler(request('Bearer valid-token', { query: { tier: 'premium', userId: 'admin-user' }, body: { is_admin: true, tier: 'premium' }, user: { id: 'admin-user', user_metadata: { tier: 'premium' } } }), res);
    assert.equal(res.statusCode, 403);
    assert.equal(res.body.families, undefined);
    assert.ok(calls.some((call) => JSON.stringify(call) === JSON.stringify(['eq', 'id', 'verified-user'])));
  }
});

test('all existing full-access tiers and the is_admin override retain access', async () => {
  for (const profile of ['premium', 'teacher', 'student', 'courtesy', 'admin'].map((tier) => ({ tier, is_admin: false })).concat({ tier: 'free', is_admin: true })) {
    const { handler, res } = fixture({ profile });
    await handler(request(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.userId, 'verified-user');
    assert.equal(res.body.families, WORD_FAMILIES);
  }
});

test('profile errors, auth outages and exceptions fail closed without backend details', async () => {
  for (const options of [{ profileError: new Error('Private database detail') }, { authError: { status: 503 } }, { throws: true }]) {
    const { handler, res } = fixture(options);
    await handler(request(), res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.families, undefined);
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
