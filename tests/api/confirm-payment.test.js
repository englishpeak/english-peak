import assert from 'node:assert/strict';
import test from 'node:test';

import {
  APPROVED_SUBSCRIPTION_PRICE_IDS,
  createConfirmPaymentHandler,
} from '../../api/confirm-payment.js';

const USER_A = 'user-a';
const USER_B = 'user-b';
const CUSTOMER_A = 'cus_a';
const APPROVED_PRICE = [...APPROVED_SUBSCRIPTION_PRICE_IDS][0];

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function createSupabase({ authenticatedUserId = USER_A, customerId = CUSTOMER_A } = {}) {
  const state = { updates: [] };
  const supabase = {
    auth: {
      getUser: async () => ({ data: { user: { id: authenticatedUserId } }, error: null }),
    },
    from(table) {
      assert.equal(table, 'profiles');
      return {
        select() {
          return {
            eq() {
              return {
                single: async () => ({
                  data: customerId === null ? { stripe_customer_id: null } : { stripe_customer_id: customerId },
                  error: null,
                }),
              };
            },
          };
        },
        update(values) {
          return {
            async eq(column, value) {
              state.updates.push({ values, column, value });
              return { error: null };
            },
          };
        },
      };
    },
  };
  return { supabase, state };
}

function subscription(overrides = {}) {
  return {
    id: 'sub_valid',
    status: 'active',
    customer: CUSTOMER_A,
    metadata: { supabase_user_id: USER_A },
    items: { data: [{ price: { id: APPROVED_PRICE } }] },
    ...overrides,
  };
}

async function invoke({ subscription: stripeSubscription, userId = USER_A, supabaseOptions } = {}) {
  const { supabase, state } = createSupabase(supabaseOptions);
  const stripe = {
    subscriptions: {
      retrieve: async () => stripeSubscription || subscription(),
    },
  };
  const handler = createConfirmPaymentHandler({ supabase, stripe });
  const req = {
    method: 'POST',
    headers: { authorization: 'Bearer valid-token' },
    body: { subscriptionId: 'sub_valid', userId },
  };
  const res = createResponse();
  await handler(req, res);
  return { res, state };
}

function assertRejectedWithoutUpgrade(result, expectedStatus) {
  assert.equal(result.res.statusCode, expectedStatus);
  assert.equal(result.state.updates.length, 0, 'profile must not be upgraded');
}

test('confirms an entitled subscription with matching owner, customer, and approved price', async () => {
  const result = await invoke();
  assert.equal(result.res.statusCode, 200);
  assert.deepEqual(result.res.body, { success: true, tier: 'premium' });
  assert.equal(result.state.updates.length, 1);
  assert.equal(result.state.updates[0].values.tier, 'premium');
});

test('rejects a subscription owned by a different Supabase user', async () => {
  const result = await invoke({ subscription: subscription({ metadata: { supabase_user_id: USER_B } }) });
  assertRejectedWithoutUpgrade(result, 403);
});

test('fails closed when subscription ownership metadata is missing', async () => {
  const result = await invoke({ subscription: subscription({ metadata: {} }) });
  assertRejectedWithoutUpgrade(result, 403);
});

test('fails closed when subscription ownership metadata is empty or invalid', async () => {
  for (const value of ['', null, 42]) {
    const result = await invoke({
      subscription: subscription({ metadata: { supabase_user_id: value } }),
    });
    assertRejectedWithoutUpgrade(result, 403);
  }
});

test('rejects a subscription for a different Stripe customer', async () => {
  const result = await invoke({ subscription: subscription({ customer: 'cus_other' }) });
  assertRejectedWithoutUpgrade(result, 403);
});

test('rejects a subscription using an unauthorized Stripe price', async () => {
  const result = await invoke({
    subscription: subscription({ items: { data: [{ price: { id: 'price_not_epeak' } }] } }),
  });
  assertRejectedWithoutUpgrade(result, 400);
});

test('rejects a subscription with a non-entitled status', async () => {
  const result = await invoke({ subscription: subscription({ status: 'past_due' }) });
  assertRejectedWithoutUpgrade(result, 400);
});

test('rejects request-body impersonation before retrieving or updating payment data', async () => {
  const result = await invoke({ userId: USER_B });
  assertRejectedWithoutUpgrade(result, 403);
});

test('accepts trialing subscriptions and Stripe IDs represented as strings', async () => {
  const result = await invoke({
    subscription: subscription({
      status: 'trialing',
      customer: { id: CUSTOMER_A },
      items: { data: [{ price: APPROVED_PRICE }] },
    }),
  });
  assert.equal(result.res.statusCode, 200);
  assert.equal(result.state.updates.length, 1);
});

test('fails closed when the trusted profile has no Stripe customer', async () => {
  const result = await invoke({ supabaseOptions: { customerId: null } });
  assertRejectedWithoutUpgrade(result, 403);
});
