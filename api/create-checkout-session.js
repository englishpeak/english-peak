// api/create-checkout-session.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe('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');
const sb = createClient(
  'https://jnqekougzmihjqffhuva.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpucWVrb3Vnem1paGpxZmZodXZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjc3MzU2NywiZXhwIjoyMDg4MzQ5NTY3fQ.G8J46Un4ORa7xG_pM3K1witBYyTj9MELvxI4NVsl2BY'
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
