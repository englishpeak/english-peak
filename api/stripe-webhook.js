// api/stripe-webhook.js
// Vercel Serverless Function — receives Stripe events and updates Supabase

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function setUserTier(userId, tier, extraData = {}) {
  const { error } = await sb.from('profiles').update({
    tier,
    tier_granted_by: 'stripe',
    tier_granted_at: new Date().toISOString(),
    subscription_status: extraData.subscription_status || 'active',
    ...extraData,
  }).eq('id', userId);

  if (error) console.error('Error updating tier:', error);
  else console.log(`✅ User ${userId} → tier: ${tier}`);
}

// Helper: find userId from Stripe customer ID as fallback
async function getUserIdFromCustomer(customerId) {
  const { data } = await sb
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  return data?.id || null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Read raw body for Stripe signature verification
  let rawBody = '';
  await new Promise((resolve, reject) => {
    req.on('data', chunk => { rawBody += chunk; });
    req.on('end', resolve);
    req.on('error', reject);
  });

  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log('📨 Stripe webhook:', event.type);

  try {
    switch (event.type) {

      // ── Payment intent succeeded (fires after card payment confirmed) ──────
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        // Get the invoice from the payment intent to find the subscription
        if (!paymentIntent.invoice) break;

        const invoice = await stripe.invoices.retrieve(paymentIntent.invoice);
        if (!invoice.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        let userId = subscription.metadata?.supabase_user_id;

        // Fallback: look up by customer ID in Supabase
        if (!userId && subscription.customer) {
          userId = await getUserIdFromCustomer(subscription.customer);
        }

        if (!userId) {
          console.error('No userId found for payment_intent.succeeded');
          break;
        }

        if (subscription.status === 'active' || subscription.status === 'trialing') {
          await setUserTier(userId, 'premium', {
            stripe_subscription_id: subscription.id,
            subscription_status: 'active',
          });
        }
        break;
      }

      // ── Subscription created or updated ───────────────────────────────────
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        let userId = subscription.metadata?.supabase_user_id;

        // Fallback: look up by customer ID
        if (!userId && subscription.customer) {
          userId = await getUserIdFromCustomer(subscription.customer);
        }

        if (!userId) {
          console.error('No userId for subscription event:', subscription.id);
          break;
        }

        if (subscription.status === 'active' || subscription.status === 'trialing') {
          await setUserTier(userId, 'premium', {
            stripe_subscription_id: subscription.id,
            subscription_status: 'active',
          });
        } else if (subscription.status === 'past_due') {
          await setUserTier(userId, 'free', { subscription_status: 'past_due' });
        } else if (['canceled', 'unpaid', 'incomplete_expired'].includes(subscription.status)) {
          await setUserTier(userId, 'free', {
            subscription_status: subscription.status,
            stripe_subscription_id: null,
          });
        }
        break;
      }

      // ── Subscription deleted (cancelled) ─────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        let userId = subscription.metadata?.supabase_user_id;

        if (!userId && subscription.customer) {
          userId = await getUserIdFromCustomer(subscription.customer);
        }

        if (!userId) break;

        await setUserTier(userId, 'free', {
          subscription_status: 'cancelled',
          stripe_subscription_id: null,
        });
        break;
      }

      // ── Invoice payment succeeded (renewals) ─────────────────────────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        let userId = subscription.metadata?.supabase_user_id;

        if (!userId && subscription.customer) {
          userId = await getUserIdFromCustomer(subscription.customer);
        }

        if (!userId) break;

        await setUserTier(userId, 'premium', {
          stripe_subscription_id: subscriptionId,
          subscription_status: 'active',
        });
        break;
      }

      // ── Invoice payment failed ────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        if (!subscriptionId) break;

        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        let userId = subscription.metadata?.supabase_user_id;

        if (!userId && subscription.customer) {
          userId = await getUserIdFromCustomer(subscription.customer);
        }

        if (!userId) break;

        await setUserTier(userId, 'free', { subscription_status: 'payment_failed' });
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}

export const config = {
  api: { bodyParser: false },
};
