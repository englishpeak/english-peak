// api/confirm-payment.js
// Called by the frontend AFTER stripe.confirmCardPayment() succeeds.
// Updates the user's tier to 'premium' immediately without waiting for webhook.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { PRICING_MODES } from './pricing-config.js';

const ENTITLED_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing']);

// Every server-configured price remains valid even if the public pricing mode changes
// between subscription creation and confirmation.
export const APPROVED_SUBSCRIPTION_PRICE_IDS = new Set(
  Object.values(PRICING_MODES).flatMap(({ stripePriceIds }) => Object.values(stripePriceIds))
);

function stripeResourceId(resource) {
  if (typeof resource === 'string') return resource;
  if (resource && typeof resource === 'object' && typeof resource.id === 'string') {
    return resource.id;
  }
  return null;
}

function hasOnlyApprovedPrices(subscription) {
  const items = subscription.items?.data;
  if (!Array.isArray(items) || items.length === 0) return false;

  return items.every((item) => {
    const priceId = stripeResourceId(item?.price);
    return priceId !== null && APPROVED_SUBSCRIPTION_PRICE_IDS.has(priceId);
  });
}

async function getAuthenticatedUser(req, supabase) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return { error: 'Missing authorization token' };

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return { error: 'Invalid authorization token' };
  return { user: data.user };
}

export function createConfirmPaymentHandler({ supabase, stripe }) {
  return async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const auth = await getAuthenticatedUser(req, supabase);
    if (auth.error) {
      return res.status(401).json({ error: auth.error });
    }

    const { subscriptionId, userId } = req.body || {};
    if (!subscriptionId || !userId) {
      return res.status(400).json({ error: 'Missing subscriptionId or userId' });
    }

    if (userId !== auth.user.id) {
      return res.status(403).json({ error: 'User mismatch' });
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (!ENTITLED_SUBSCRIPTION_STATUSES.has(subscription.status)) {
        return res.status(400).json({ error: 'Subscription is not currently entitled' });
      }

      // Fail closed: Stripe subscription metadata is the trusted ownership link.
      // Missing, empty, non-string, and mismatched values are all rejected.
      const storedUserId = subscription.metadata?.supabase_user_id;
      if (typeof storedUserId !== 'string' || !storedUserId || storedUserId !== auth.user.id) {
        return res.status(403).json({ error: 'Subscription ownership could not be verified' });
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', auth.user.id)
        .single();

      if (profileError || !profile?.stripe_customer_id) {
        console.error('confirm-payment customer verification failed');
        return res.status(403).json({ error: 'Subscription ownership could not be verified' });
      }

      const subscriptionCustomerId = stripeResourceId(subscription.customer);
      if (!subscriptionCustomerId || subscriptionCustomerId !== profile.stripe_customer_id) {
        return res.status(403).json({ error: 'Subscription ownership could not be verified' });
      }

      if (!hasOnlyApprovedPrices(subscription)) {
        return res.status(400).json({ error: 'Subscription is not an approved ePeak plan' });
      }

      // Grant Premium only after authentication, status, owner, customer, and price checks pass.
      const { error } = await supabase.from('profiles').update({
        tier: 'premium',
        tier_granted_by: 'stripe',
        tier_granted_at: new Date().toISOString(),
        subscription_status: 'active',
        stripe_subscription_id: subscriptionId,
      }).eq('id', auth.user.id);

      if (error) {
        console.error('Supabase update error:', error);
        return res.status(500).json({ error: 'Failed to update user tier' });
      }

      console.log(`User ${auth.user.id} upgraded to premium via confirm-payment`);
      return res.status(200).json({ success: true, tier: 'premium' });
    } catch (err) {
      console.error('confirm-payment error:', err.message);
      return res.status(500).json({ error: 'Unable to confirm subscription' });
    }
  };
}

const configuredHandler = process.env.SUPABASE_URL
  && process.env.SUPABASE_SERVICE_ROLE_KEY
  && process.env.STRIPE_SECRET_KEY
  ? createConfirmPaymentHandler({
      supabase: createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY),
      stripe: new Stripe(process.env.STRIPE_SECRET_KEY),
    })
  : null;

export default async function handler(req, res) {
  if (!configuredHandler) {
    return res.status(500).json({ error: 'Payment confirmation is not configured' });
  }
  return configuredHandler(req, res);
}
