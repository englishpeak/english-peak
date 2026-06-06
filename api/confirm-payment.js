// api/confirm-payment.js
// Called by the frontend AFTER stripe.confirmCardPayment() succeeds.
// Updates the user's tier to 'premium' immediately without waiting for webhook.

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return { error: 'Missing authorization token' };

  const { data, error } = await sb.auth.getUser(token);
  if (error || !data?.user) return { error: 'Invalid authorization token' };
  return { user: data.user };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await getAuthenticatedUser(req);
  if (auth.error) {
    return res.status(401).json({ error: auth.error });
  }

  const { subscriptionId, userId } = req.body;

  if (!subscriptionId || !userId) {
    return res.status(400).json({ error: 'Missing subscriptionId or userId' });
  }

  if (userId !== auth.user.id) {
    return res.status(403).json({ error: 'User mismatch' });
  }

  try {
    // Verify with Stripe that the subscription is actually active
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Accept 'active' or 'trialing' as valid paid states
    const validStatuses = ['active', 'trialing'];
    if (!validStatuses.includes(subscription.status)) {
      return res.status(400).json({
        error: `Subscription not active. Status: ${subscription.status}`
      });
    }

    // Verify the subscription belongs to this user (security check)
    const storedUserId = subscription.metadata?.supabase_user_id;
    if (storedUserId && storedUserId !== userId) {
      return res.status(403).json({ error: 'Subscription does not belong to this user' });
    }

    // Update user to premium immediately
    const { error } = await sb.from('profiles').update({
      tier: 'premium',
      tier_granted_by: 'stripe',
      tier_granted_at: new Date().toISOString(),
      subscription_status: 'active',
      stripe_subscription_id: subscriptionId,
    }).eq('id', userId);

    if (error) {
      console.error('Supabase update error:', error);
      return res.status(500).json({ error: 'Failed to update user tier' });
    }

    console.log(`✅ User ${userId} upgraded to premium via confirm-payment`);
    return res.status(200).json({ success: true, tier: 'premium' });

  } catch (err) {
    console.error('confirm-payment error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
