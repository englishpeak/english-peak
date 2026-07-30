import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export function createCloseAccountHandler({ supabase, stripe }) {
  return async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) return res.status(401).json({ error: 'Missing authorization token' });
    if (req.body?.confirmation !== 'CLOSE') {
      return res.status(400).json({ error: 'Type CLOSE to confirm account closure' });
    }

    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    const user = authData?.user;
    if (authError || !user) return res.status(401).json({ error: 'Invalid authorization token' });

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_subscription_id')
        .eq('id', user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      let subscriptionCancelled = false;
      if (profile?.stripe_subscription_id) {
        await stripe.subscriptions.cancel(profile.stripe_subscription_id);
        subscriptionCancelled = true;
      }

      // Remove customer-facing profile data first. Related rows should use ON DELETE
      // CASCADE; the migration adds a service-only RPC for this operation.
      const { error: cleanupError } = await supabase.rpc('prepare_account_closure', {
        p_user_id: user.id,
      });
      if (cleanupError) throw cleanupError;

      // A soft deletion makes login impossible and anonymizes the Supabase Auth
      // identity while preserving required academic/audit foreign-key history.
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id, true);
      if (deleteError) throw deleteError;

      const { error: eventError } = await supabase.from('account_closure_events').insert({
        subscription_cancelled: subscriptionCancelled,
      });
      if (eventError) console.error('account closure event error:', eventError.message);

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('close-account error:', error.message);
      return res.status(500).json({ error: 'We could not close your account. Please contact support.' });
    }
  };
}

const configuredHandler = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.STRIPE_SECRET_KEY
  ? createCloseAccountHandler({
      supabase: createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY),
      stripe: new Stripe(process.env.STRIPE_SECRET_KEY),
    })
  : null;

export default async function handler(req, res) {
  if (!configuredHandler) return res.status(500).json({ error: 'Account closure is not configured' });
  return configuredHandler(req, res);
}
