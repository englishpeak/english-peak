import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import { IDIOM_LESSON_CONTENT, createIdiomsHandler } from './idioms.js';
import { IDIOM_LESSONS } from '../idioms/catalog.js';

function fixture({ user = { id: 'verified-user' }, profile = { tier: 'free' }, authError = null, profileError = null, throws = false } = {}) {
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
  const res = { headers: {}, setHeader(name, value) { this.headers[name] = value; }, status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } };
  return { handler: createIdiomsHandler({ supabase }), calls, res };
}
const request = (lesson = '1', overrides = {}) => ({ method: 'GET', headers: { authorization: 'Bearer valid-token' }, query: lesson === null ? {} : { lesson }, ...overrides });

test('Lesson 1 preserves all approved content verbatim, with ten unique IDs and four choices/examples', () => {
  const items = IDIOM_LESSON_CONTENT[1];
  assert.equal(items.length, 10);
  assert.equal(new Set(items.map(item => item.id)).size, 10);
  for (const item of items) {
    assert.equal(item.options.length, 4);
    assert.equal(new Set(item.options).size, 4);
    assert.ok(Number.isInteger(item.correct) && item.correct >= 0 && item.correct < 4);
    assert.equal(item.examples.length, 4);
  }
  const original = items.map(({ id, ...item }) => item);
  assert.equal(createHash('sha256').update(JSON.stringify(original)).digest('hex'), 'b78230adb741fe790d50d494939eefe07c0846d41d516449d8cb9d137f830969');
  assert.deepEqual(Object.keys(IDIOM_LESSON_CONTENT), ['1', '2', '3', '4']);
});

test('visitors, malformed tokens and invalid sessions never receive any lesson content', async () => {
  for (const lesson of ['1', '2', '3', '4']) {
    for (const authorization of [undefined, '', 'Basic token', 'Bearer ', ['Bearer valid-token'], 'Bearer token extra']) {
      const { handler, res, calls } = fixture();
      await handler(request(lesson, { headers: { authorization } }), res);
      assert.equal(res.statusCode, 401);
      assert.equal(res.body.items, undefined);
      assert.equal(calls.length, 0);
    }
    for (const options of [{ user: null }, { authError: { status: 401 } }]) {
      const { handler, res } = fixture(options);
      await handler(request(lesson), res);
      assert.equal(res.statusCode, 401);
      assert.equal(res.body.items, undefined);
    }
  }
});

test('all authenticated accounts can load Lesson 1 and catalog metadata', async () => {
  for (const profile of [null, { tier: 'free' }, { tier: 'premium' }, { tier: 'free', subscription_status: 'cancelled' }]) {
    const { handler, res, calls } = fixture({ profile });
    await handler(request(), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.items, IDIOM_LESSON_CONTENT[1]);
    assert.equal(res.body.userId, 'verified-user');
    assert.ok(calls.some(call => JSON.stringify(call) === JSON.stringify(['eq', 'id', 'verified-user'])));
    await handler(request(null), res);
    assert.equal(res.body.items, undefined);
    assert.equal(res.body.lessons.length, 6);
  }
});

test('free accounts cannot load any premium lesson using forged URL/body/user claims', async () => {
  for (const profile of [null, { tier: 'free' }, { tier: 'unknown' }, { tier: 'free', is_admin: 'true' }]) {
    for (const lesson of ['2', '3', '4', '5', '6']) {
      const { handler, res } = fixture({ profile });
      await handler(request(lesson, { query: { lesson, tier: 'premium', userId: 'admin' }, body: { is_admin: true }, user: { user_metadata: { tier: 'premium' } } }), res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.items, undefined);
    }
  }
});

test('existing full-access tiers and admin override pass the premium gate without receiving unpublished quizzes', async () => {
  for (const profile of ['premium', 'teacher', 'student', 'courtesy', 'admin'].map(tier => ({ tier })).concat({ tier: 'free', is_admin: true })) {
    const { handler, res } = fixture({ profile });
    await handler(request(null), res);
    assert.equal(res.body.plusAccess, true);
    for (const id of ['2', '3', '4']) {
      await handler(request(id), res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.items, IDIOM_LESSON_CONTENT[id]);
    }
    for (const id of ['5', '6']) {
      await handler(request(id), res);
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.code, 'COMING_SOON');
      assert.equal(res.body.items, undefined);
    }
  }
});

test('publishing another lesson needs only catalog/content additions and retains server access checks', async () => {
  const lesson = IDIOM_LESSONS.find(item => item.id === 5);
  lesson.published = true;
  IDIOM_LESSON_CONTENT[5] = IDIOM_LESSON_CONTENT[1];
  try {
    for (const [tier, expected] of [['free', 403], ['premium', 200]]) {
      const { handler, res } = fixture({ profile: { tier } });
      await handler(request('5'), res);
      assert.equal(res.statusCode, expected);
      if (expected === 200) assert.equal(res.body.lesson.id, 5);
      else assert.equal(res.body.items, undefined);
    }
  } finally {
    lesson.published = false;
    delete IDIOM_LESSON_CONTENT[5];
  }
});

test('backend errors fail closed; invalid IDs and HTTP methods do not expose content', async () => {
  for (const options of [{ profileError: new Error('private') }, { authError: { status: 503 } }, { throws: true }]) {
    const { handler, res } = fixture(options);
    await handler(request(), res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.items, undefined);
    assert.doesNotMatch(JSON.stringify(res.body), /private|token|service.role/i);
  }
  for (const id of ['', '0', '-1', '1.0', '1x', ['1'], '999']) {
    const { handler, res } = fixture();
    await handler(request(id), res);
    assert.ok([400, 404].includes(res.statusCode));
    assert.equal(res.body.items, undefined);
  }
  const { handler, res, calls } = fixture();
  await handler(request('1', { method: 'POST' }), res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, 'GET');
  assert.equal(calls.length, 0);
});

test('all responses prevent browser and shared CDN caching', async () => {
  for (const options of [{}, { user: null }, { profileError: new Error() }]) {
    const { handler, res } = fixture(options);
    await handler(request(), res);
    assert.match(res.headers['Cache-Control'], /private, no-store/);
    assert.equal(res.headers['CDN-Cache-Control'], 'no-store');
    assert.equal(res.headers['Vercel-CDN-Cache-Control'], 'no-store');
    assert.equal(res.headers.Vary, 'Authorization');
  }
});
