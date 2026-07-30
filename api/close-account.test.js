import test from 'node:test';
import assert from 'node:assert/strict';
import { createCloseAccountHandler } from './close-account.js';

function response() {
  return { statusCode: 200, payload: null, status(code) { this.statusCode = code; return this; }, json(value) { this.payload = value; return this; } };
}

function services({ subscriptionId = null } = {}) {
  const calls = [];
  const chain = { select: () => chain, eq: () => chain, maybeSingle: async () => ({ data: { stripe_subscription_id: subscriptionId }, error: null }) };
  const supabase = {
    auth: { getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }), admin: { deleteUser: async (...args) => { calls.push(['deleteUser', ...args]); return { error: null }; } } },
    from: (table) => table === 'profiles' ? chain : ({ insert: async (value) => { calls.push(['insert', table, value]); return { error: null }; } }),
    rpc: async (...args) => { calls.push(['rpc', ...args]); return { error: null }; },
  };
  const stripe = { subscriptions: { cancel: async (id) => { calls.push(['cancel', id]); } } };
  return { supabase, stripe, calls };
}

test('requires an authenticated, explicit CLOSE confirmation', async () => {
  const deps = services();
  const handler = createCloseAccountHandler(deps);
  const missingAuth = response();
  await handler({ method: 'POST', headers: {}, body: { confirmation: 'CLOSE' } }, missingAuth);
  assert.equal(missingAuth.statusCode, 401);
  const missingConfirmation = response();
  await handler({ method: 'POST', headers: { authorization: 'Bearer token' }, body: {} }, missingConfirmation);
  assert.equal(missingConfirmation.statusCode, 400);
});

test('cancels billing, cleans profile data, and soft-deletes the auth identity', async () => {
  const deps = services({ subscriptionId: 'sub_123' });
  const handler = createCloseAccountHandler(deps);
  const res = response();
  await handler({ method: 'POST', headers: { authorization: 'Bearer token' }, body: { confirmation: 'CLOSE' } }, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(deps.calls.slice(0, 3), [
    ['cancel', 'sub_123'],
    ['rpc', 'prepare_account_closure', { p_user_id: 'user-1' }],
    ['deleteUser', 'user-1', true],
  ]);
});
