// api/create-subscription.js
// Vercel Serverless Function — inicia una suscripción PayPal y guarda el ID en Supabase

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL          = process.env.SUPABASE_URL;
const SUPABASE_KEY          = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PAYPAL_CLIENT_ID      = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET  = process.env.PAYPAL_CLIENT_SECRET;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// Plan IDs de PayPal — 50% de descuento de lanzamiento hasta el 23 de junio de 2026
const PLAN_IDS = {
  mxn_monthly: 'P-4EW57030EK663731NNG6NUJI',
  mxn_yearly:  'P-1F785907HY745615HNG6NUZI',
  usd_monthly: 'P-72X67946PA061682BNG6NVEQ',
  usd_yearly:  'P-8SF707964V258384LNG6NVTI',
};

async function getPayPalAccessToken() {
  const res = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { plan, userId, userEmail, returnUrl, cancelUrl } = req.body;

  if (!plan || !userId || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields: plan, userId, userEmail' });
  }

  const planId = PLAN_IDS[plan];
  if (!planId) {
    return res.status(400).json({ error: 'Invalid plan. Use: mxn_monthly, mxn_yearly, usd_monthly, usd_yearly' });
  }

  try {
    const accessToken = await getPayPalAccessToken();

    // Crea la suscripción en PayPal
    const subRes = await fetch('https://api-m.paypal.com/v1/billing/subscriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `${userId}-${Date.now()}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {
          email_address: userEmail,
        },
        application_context: {
          brand_name: 'ePeak',
          locale: 'es-MX',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          payment_method: {
            payer_selected: 'PAYPAL',
            payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
          },
          return_url: returnUrl || 'https://epeak.app/?payment=success',
          cancel_url: cancelUrl || 'https://epeak.app/?payment=cancelled',
        },
      }),
    });

    const subData = await subRes.json();

    if (!subRes.ok) {
      console.error('PayPal create subscription error:', subData);
      return res.status(500).json({ error: 'Failed to create subscription', details: subData });
    }

    // Guarda el subscription ID en Supabase (estado pending hasta que PayPal confirme)
    await sb.from('profiles').update({
      paypal_subscription_id: subData.id,
      paypal_plan_id: planId,
      subscription_status: 'pending',
    }).eq('id', userId);

    // Devuelve el link de aprobación de PayPal
    const approvalLink = subData.links?.find(l => l.rel === 'approve')?.href;

    return res.status(200).json({
      subscriptionId: subData.id,
      approvalUrl: approvalLink,
      status: subData.status,
    });

  } catch (err) {
    console.error('create-subscription error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
