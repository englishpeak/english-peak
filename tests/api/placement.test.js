import assert from 'node:assert/strict';
import test from 'node:test';
import { createPlacementHandler } from '../../api/placement.js';

const html = '<!doctype html><html lang="en"><head><title>Placement</title></head><body><p>Private assessment</p></body></html>';
const expiresAt = '2026-11-19T18:00:00.000Z';

function fixture() {
  let timestamp = Date.parse('2026-11-19T17:00:00Z');
  const settings = new Map();
  const profiles = new Map([
    ['admin', { tier: 'free', is_admin: true }],
    ['premium', { tier: 'premium', is_admin: false }],
    ['student', { tier: 'student', is_admin: false }],
    ['member', { tier: 'free', is_admin: false }],
  ]);
  const supabase = {
    auth: {
      async getUser(token) {
        if (token === 'invalid') return { error: { status: 401 } };
        return { data: { user: { id: token, is_anonymous: token === 'anonymous' } } };
      },
    },
    from(table) {
      const filters = {};
      let deleting = false;
      let columns;
      return {
        select(value) { columns = value; return this; },
        eq(field, value) { filters[field] = value; return this; },
        delete() { deleting = true; return this; },
        async upsert(row) { settings.set(row.key, row); return {}; },
        async maybeSingle() {
          if (table === 'profiles') return { data: profiles.get(filters.id) };
          const row = settings.get(filters.key);
          if (!row || (deleting && row.value.id !== filters['value->>id'])) return { data: null };
          if (deleting) settings.delete(filters.key);
          return { data: columns === 'key' ? { key: row.key } : row };
        },
      };
    },
  };
  const handler = createPlacementHandler({ supabase, now: () => timestamp });
  async function call(token, action, fields = {}, method = 'POST') {
    const result = { headers: {} };
    await handler({ method, body: { action, ...fields }, headers: token ? { authorization: `Bearer ${token}` } : {} }, {
      setHeader(key, value) { result.headers[key] = value; },
      status(code) { result.status = code; return this; },
      json(body) { result.body = body; },
    });
    return result;
  }
  return { call, settings, expire: () => { timestamp = Date.parse(expiresAt); } };
}

test('the assessment is served only to verified members with placement access', async () => {
  const { call } = fixture();
  assert.equal((await call('premium', 'open')).status, 503);
  assert.equal((await call('admin', 'upload', { html })).status, 200);
  for (const token of [null, 'invalid', 'anonymous']) assert.equal((await call(token, 'open')).status, 401);
  assert.equal((await call('unknown', 'open')).status, 403);
  const denied = await call('member', 'open');
  assert.equal(denied.status, 403);
  assert.equal(denied.body.needsCode, true);
  assert.equal(denied.body.html, undefined);
  assert.equal((await call('premium', 'open', {}, 'GET')).status, 405);
  for (const token of ['premium', 'student', 'admin']) {
    const authorized = await call(token, 'open');
    assert.equal(authorized.status, 200);
    assert.match(authorized.body.html, /<head><meta http-equiv="Content-Security-Policy"/);
    assert.match(authorized.body.html, /Private assessment/);
    assert.match(authorized.headers['Cache-Control'], /no-store/);
    assert.equal(authorized.headers['X-Robots-Tag'], 'noindex, nofollow');
  }
});

test('only admins manage placement settings and code hashes stay private', async () => {
  const { call, settings } = fixture();
  for (const action of ['status', 'activate', 'revoke', 'upload']) {
    assert.equal((await call('premium', action, { expiresAt, html })).status, 403);
  }
  assert.equal((await call('admin', 'upload', { html: '<script></script>' })).status, 400);
  assert.equal((await call('admin', 'activate', { expiresAt: '2026-11-19T16:00:00Z' })).status, 400);
  await call('admin', 'upload', { html });
  const { body: activated } = await call('admin', 'activate', { expiresAt });
  assert.match(activated.code, /^[\dA-F]{8}(?:-[\dA-F]{8}){2}$/);
  assert.deepEqual(Object.keys(settings.get('placement_access').value).sort(), ['expiresAt', 'hash', 'id']);
  assert.match(settings.get('placement_access').value.hash, /^[0-9a-f]{64}$/);
  assert.deepEqual((await call('admin', 'status')).body, { assessmentReady: true, activeCode: activated.activeCode });
});

test('a code permits signed-in members until it is replaced, revoked or expired', async () => {
  const { call, expire } = fixture();
  await call('admin', 'upload', { html });
  const { body: first } = await call('admin', 'activate', { expiresAt });
  assert.equal((await call(null, 'open', { code: first.code })).status, 401);
  assert.equal((await call('unknown', 'open', { code: first.code })).status, 403);
  assert.equal((await call('member', 'open', { code: '00000000-00000000-00000000' })).status, 403);
  assert.equal((await call('member', 'open', { code: first.code.toLowerCase() })).status, 200);
  assert.deepEqual((await call('member', 'check', { code: first.code })).body, { userId: 'member', expiresInMs: 3_600_000 });

  const { body: second } = await call('admin', 'activate', { expiresAt });
  assert.equal((await call('member', 'check', { code: first.code })).status, 403);
  assert.equal((await call('admin', 'revoke', { codeId: first.activeCode.id })).status, 409);
  assert.equal((await call('member', 'check', { code: second.code })).status, 200);
  assert.equal((await call('admin', 'revoke', { codeId: second.activeCode.id })).status, 200);
  assert.equal((await call('member', 'check', { code: second.code })).status, 403);

  const { body: third } = await call('admin', 'activate', { expiresAt });
  expire();
  assert.equal((await call('member', 'open', { code: third.code })).status, 403);
  assert.equal((await call('admin', 'status')).body.activeCode, null);
  assert.equal((await call('premium', 'open')).status, 200);
});
