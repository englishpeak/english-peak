// api/create-checkout-session.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const PRICE_IDS = {
  mxn_monthly: 'price_1TCw7hF2ctV3Sh1lQXJDWYTl',
  mxn_yearly:  'price_1TCw8LF2ctV3Sh1lqShYQgcq',
  usd_monthly: 'price_1TCw8lF2ctV3Sh1lgO4R0oDj',
  usd_yearly:  'price_1TCw90F2ctV3Sh1lUccMCWW3',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, userId, userEmail } = req.body;

  if (!plan || !userId || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const priceId = PRICE_IDS[plan];
  if (!priceId) {
    return res.status(400).json({ error: 'Invalid plan' });
  }

  try {
    // Get or create Stripe customer
    let customerId;
    const { data: profile } = await sb
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profile && profile.stripe_customer_id) {
      customerId = profile.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
      await sb.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { supabase_user_id: userId },
    });

    const clientSecret = subscription.latest_invoice.payment_intent.client_secret;

    await sb.from('profiles').update({
      stripe_subscription_id: subscription.id,
      subscription_status: 'pending',
    }).eq('id', userId);

    return res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: clientSecret,
    });

  } catch (err) {
    console.error('create-checkout-session error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
