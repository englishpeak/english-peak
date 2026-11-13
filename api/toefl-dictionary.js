import { createClient } from '@supabase/supabase-js';
import { hasFullAccessTier } from '../businesscases/access.js';
import { TOEFL_DICTIONARY } from './_lib/toefl-dictionary-data.js';

export function createToeflDictionaryHandler({ supabase }) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    res.setHeader('Vary', 'Authorization');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return res.status(405).json({ error: 'Method not allowed' });
    }
    const authorization = req.headers?.authorization;
    const token = typeof authorization === 'string' ? authorization.match(/^Bearer ([^\s]+)$/i)?.[1] : null;
    if (!token) return res.status(401).json({ error: 'Please sign in to access TOEFL Dictionary.' });

    try {
      // Same bearer-token verification used by the existing payment/account APIs.
      // User identity and tier come only from Supabase, never request parameters.
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user?.id) {
        return res.status(error?.status >= 500 ? 503 : 401).json({ error: 'Your account could not be verified. Please sign in again.' });
      }
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('tier,is_admin')
        .eq('id', data.user.id)
        .maybeSingle();
      if (profileError) return res.status(503).json({ error: 'Access could not be checked. Please try again.' });
      // Existing Stripe webhook/confirm-payment handlers maintain profiles.tier.
      // Preserve the same ePeak+ staff/student/courtesy grants as Word Families.
      const tier = profile?.is_admin === true ? 'admin' : profile?.tier;
      if (!hasFullAccessTier(tier)) {
        return res.status(403).json({ error: 'TOEFL Dictionary is included with ePeak+.' });
      }
      return res.status(200).json({ userId: data.user.id, entries: TOEFL_DICTIONARY });
    } catch {
      return res.status(503).json({ error: 'Access could not be checked. Please try again.' });
    }
  };
}

const configuredHandler = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createToeflDictionaryHandler({
      supabase: createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
      }),
    })
  : null;

export default async function handler(req, res) {
  if (!configuredHandler) {
    res.setHeader('Cache-Control', 'private, no-store, max-age=0');
    res.setHeader('CDN-Cache-Control', 'no-store');
    res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    return res.status(503).json({ error: 'TOEFL Dictionary access is not configured. Please try again later.' });
  }
  return configuredHandler(req, res);
}
