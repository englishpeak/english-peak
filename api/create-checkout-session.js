
// api/create-checkout-session.js
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { PRICING_MODES, buildPricingPayload, DEFAULT_PRICING_MODE } from './pricing-config.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getActivePricingMode() {
  const { data, error } = await sb
    .from('site_settings')
    .select('value')
    .eq('key', 'pricing')
    .maybeSingle();

  if (error) {
    console.error('pricing settings error:', error.message);
    return DEFAULT_PRICING_MODE;
  }

  return buildPricingPayload(data?.value || { mode: DEFAULT_PRICING_MODE }).mode;
}

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

  const { plan, userId, userEmail } = req.body;

  if (!plan || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (userId !== auth.user.id) {
    return res.status(403).json({ error: 'User mismatch' });
  }

  try {
    const activePricingMode = await getActivePricingMode();
    const priceId = PRICING_MODES[activePricingMode]?.stripePriceIds?.[plan];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

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
        email: auth.user.email || userEmail,
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
      metadata: { supabase_user_id: userId, pricing_mode: activePricingMode },
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
