// api/stripe-webhook.js

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function setUserTier(userId, tier, extraData = {}) {
  console.log(`Setting tier for userId=${userId} to tier=${tier}`);
  const { error } = await sb.from('profiles').update({
    tier,
    tier_granted_by: 'stripe',
    tier_granted_at: new Date().toISOString(),
    subscription_status: extraData.subscription_status || 'active',
    ...extraData,
  }).eq('id', userId);
  if (error) console.error('Supabase update error:', JSON.stringify(error));
  else console.log(`✅ User ${userId} → tier: ${tier}`);
}

async function getUserIdFromCustomer(customerId) {
  console.log(`Looking up userId from customer=${customerId}`);
  const { data, error } = await sb
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  if (error) console.error('getUserIdFromCustomer error:', JSON.stringify(error));
  return data?.id || null;
}

// Extract userId from all possible locations in the event data
function extractUserId(obj) {
  if (!obj) return null;
  // Direct metadata
  if (obj.metadata?.supabase_user_id) return obj.metadata.supabase_user_id;
  // Parent subscription_details metadata (new Stripe API format)
  if (obj.parent?.subscription_details?.metadata?.supabase_user_id)
    return obj.parent.subscription_details.metadata.supabase_user_id;
  // Line items metadata
  if (obj.lines?.data?.length > 0) {
    for (const line of obj.lines.data) {
      if (line.metadata?.supabase_user_id) return line.metadata.supabase_user_id;
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('invoice.payment_succeeded — invoice.id:', invoice.id);
        console.log('invoice status:', invoice.status);
        console.log('invoice.subscription:', invoice.subscription);
        console.log('invoice.parent:', JSON.stringify(invoice.parent));
        console.log('invoice.metadata:', JSON.stringify(invoice.metadata));

        // Try to get userId directly from invoice data (various locations)
        let userId = extractUserId(invoice);
        console.log('userId from extractUserId:', userId);

        // Try via subscription
        const subscriptionId = invoice.subscription 
          || invoice.parent?.subscription_details?.subscription;
        console.log('subscriptionId:', subscriptionId);

        if (!userId && subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            console.log('subscription.metadata:', JSON.stringify(sub.metadata));
            userId = sub.metadata?.supabase_user_id;
            if (!userId && sub.customer) {
              userId = await getUserIdFromCustomer(sub.customer);
            }
          } catch (e) {
            console.error('Error retrieving subscription:', e.message);
          }
        }

        // Last resort: look up by customer email or customer ID
        if (!userId && invoice.customer) {
          userId = await getUserIdFromCustomer(invoice.customer);
        }

        console.log('Final userId:', userId);

        if (!userId) {
          console.error('❌ Could not find userId for invoice:', invoice.id);
          break;
        }

        await setUserTier(userId, 'premium', {
          stripe_subscription_id: subscriptionId || null,
          subscription_status: 'active',
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('subscription event — id:', subscription.id, 'status:', subscription.status);
        console.log('subscription.metadata:', JSON.stringify(subscription.metadata));

        let userId = subscription.metadata?.supabase_user_id;
        if (!userId && subscription.customer) {
          userId = await getUserIdFromCustomer(subscription.customer);
        }
        console.log('userId:', userId);

        if (!userId) { console.error('No userId for subscription:', subscription.id); break; }

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

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('payment_intent.succeeded — id:', paymentIntent.id);
        if (!paymentIntent.invoice) { console.log('No invoice on payment_intent'); break; }
        try {
          const invoice = await stripe.invoices.retrieve(paymentIntent.invoice);
          const subscriptionId = invoice.subscription
            || invoice.parent?.subscription_details?.subscription;
          if (!subscriptionId) { console.log('No subscription on invoice'); break; }
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          let userId = sub.metadata?.supabase_user_id;
          if (!userId && sub.customer) userId = await getUserIdFromCustomer(sub.customer);
          if (!userId) { console.error('No userId for payment_intent'); break; }
          if (sub.status === 'active' || sub.status === 'trialing') {
            await setUserTier(userId, 'premium', {
              stripe_subscription_id: sub.id,
              subscription_status: 'active',
            });
          }
        } catch(e) {
          console.error('payment_intent.succeeded error:', e.message);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription
          || invoice.parent?.subscription_details?.subscription;
        let userId = extractUserId(invoice);
        if (!userId && subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            userId = sub.metadata?.supabase_user_id;
            if (!userId && sub.customer) userId = await getUserIdFromCustomer(sub.customer);
          } catch(e) { console.error('Error retrieving subscription:', e.message); }
        }
        if (!userId && invoice.customer) userId = await getUserIdFromCustomer(invoice.customer);
        if (!userId) break;
        await setUserTier(userId, 'free', { subscription_status: 'payment_failed' });
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('Webhook handler error:', err.message, err.stack);
    return res.status(500).json({ error: 'Internal error' });
  }
}

export const config = {
  api: { bodyParser: false },
};
