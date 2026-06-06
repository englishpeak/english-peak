// api/cancel-subscription.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

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

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  if (userId !== auth.user.id) {
    return res.status(403).json({ error: 'User mismatch' });
  }

  try {
    // Get the user's subscription ID from Supabase
    const { data: profile, error: profileError } = await sb
      .from('profiles')
      .select('stripe_subscription_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    if (!profile.stripe_subscription_id) {
      return res.status(400).json({ error: 'No active subscription found' });
    }

    // Cancel at period end (user keeps access until billing period ends)
    const subscription = await stripe.subscriptions.update(
      profile.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    // Update Supabase to reflect cancellation pending
    await sb
      .from('profiles')
      .update({ subscription_status: 'canceling' })
      .eq('id', userId);

    return res.status(200).json({
      success: true,
      cancel_at: subscription.cancel_at,
      current_period_end: subscription.current_period_end,
    });

  } catch (err) {
    console.error('cancel-subscription error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
