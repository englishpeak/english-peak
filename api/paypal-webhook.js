// api/paypal-webhook.js
// Vercel Serverless Function — recibe eventos de PayPal y actualiza Supabase

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const SUPABASE_URL   = process.env.SUPABASE_URL;
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAYPAL_CLIENT_ID     = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_WEBHOOK_ID    = process.env.PAYPAL_WEBHOOK_ID;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Verifica la firma del webhook de PayPal ──────────────────────────────────
async function verifyWebhookSignature(req, rawBody) {
  const transmissionId   = req.headers['paypal-transmission-id'];
  const transmissionTime = req.headers['paypal-transmission-time'];
  const certUrl          = req.headers['paypal-cert-url'];
  const authAlgo         = req.headers['paypal-auth-algo'];
  const transmissionSig  = req.headers['paypal-transmission-sig'];

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return false;
  }

  try {
    // Obtiene token de acceso PayPal
    const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Verifica con la API de PayPal
    const verifyRes = await fetch('https://api-m.paypal.com/v1/notifications/verify-webhook-signature', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo:          authAlgo,
        cert_url:           certUrl,
        transmission_id:    transmissionId,
        transmission_sig:   transmissionSig,
        transmission_time:  transmissionTime,
        webhook_id:         PAYPAL_WEBHOOK_ID,
        webhook_event:      JSON.parse(rawBody),
      }),
    });
    const verifyData = await verifyRes.json();
    return verifyData.verification_status === 'SUCCESS';
  } catch (err) {
    console.error('Webhook verification error:', err);
    return false;
  }
}

// ── Actualiza el tier del usuario en Supabase ────────────────────────────────
async function setUserTier(paypalSubscriptionId, tier, extraData = {}) {
  // Busca el usuario por paypal_subscription_id
  const { data: profile, error } = await sb
    .from('profiles')
    .select('id, email')
    .eq('paypal_subscription_id', paypalSubscriptionId)
    .single();

  if (error || !profile) {
    console.error('User not found for subscription:', paypalSubscriptionId);
    return false;
  }

  const updateData = {
    tier,
    tier_granted_by: 'paypal',
    tier_granted_at: new Date().toISOString(),
    ...extraData,
  };

  const { error: updateError } = await sb
    .from('profiles')
    .update(updateData)
    .eq('id', profile.id);

  if (updateError) {
    console.error('Error updating tier:', updateError);
    return false;
  }

  console.log(`✅ User ${profile.email} → tier: ${tier}`);
  return true;
}

// ── Handler principal ────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Lee el body raw para verificación de firma
  let rawBody = '';
  await new Promise((resolve, reject) => {
    req.on('data', chunk => { rawBody += chunk; });
    req.on('end', resolve);
    req.on('error', reject);
  });

  // Verifica autenticidad del webhook
  const isValid = await verifyWebhookSignature(req, rawBody);
  if (!isValid) {
    console.warn('⚠️ Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const eventType = event.event_type;
  const resource  = event.resource || {};

  console.log('📨 PayPal webhook:', eventType);

  try {
    switch (eventType) {

      // ── Suscripción activada (pago exitoso al contratar) ──────────────────
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        const subscriptionId = resource.id;
        const planId         = resource.plan_id;
        const payerEmail     = resource?.subscriber?.email_address;

        // Si el usuario aún no tiene subscription_id, búscalo por email
        if (payerEmail) {
          const { data: profileByEmail } = await sb
            .from('profiles')
            .select('id')
            .eq('email', payerEmail)
            .single();

          if (profileByEmail) {
            await sb.from('profiles').update({
              tier: 'premium',
              paypal_subscription_id: subscriptionId,
              paypal_plan_id: planId,
              tier_granted_by: 'paypal',
              tier_granted_at: new Date().toISOString(),
              subscription_status: 'active',
            }).eq('id', profileByEmail.id);
          }
        }
        break;
      }

      // ── Pago completado (renovación mensual/anual) ────────────────────────
      case 'PAYMENT.SALE.COMPLETED': {
        const subscriptionId = resource.billing_agreement_id;
        if (subscriptionId) {
          await setUserTier(subscriptionId, 'premium', { subscription_status: 'active' });
        }
        break;
      }

      // ── Suscripción cancelada por el usuario ──────────────────────────────
      case 'BILLING.SUBSCRIPTION.CANCELLED': {
        const subscriptionId = resource.id;
        await setUserTier(subscriptionId, 'free', {
          subscription_status: 'cancelled',
          paypal_subscription_id: null,
        });
        break;
      }

      // ── Suscripción expirada ──────────────────────────────────────────────
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        const subscriptionId = resource.id;
        await setUserTier(subscriptionId, 'free', {
          subscription_status: 'expired',
          paypal_subscription_id: null,
        });
        break;
      }

      // ── Suscripción suspendida (fallo de pago) ────────────────────────────
      case 'BILLING.SUBSCRIPTION.SUSPENDED': {
        const subscriptionId = resource.id;
        await setUserTier(subscriptionId, 'free', { subscription_status: 'suspended' });
        break;
      }

      // ── Pago denegado ─────────────────────────────────────────────────────
      case 'PAYMENT.SALE.DENIED': {
        const subscriptionId = resource.billing_agreement_id;
        if (subscriptionId) {
          await setUserTier(subscriptionId, 'free', { subscription_status: 'payment_failed' });
        }
        break;
      }

      default:
        console.log('Unhandled event type:', eventType);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}

// Necesario para leer el raw body en Vercel
export const config = {
  api: {
    bodyParser: false,
  },
};
