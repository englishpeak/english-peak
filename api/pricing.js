import { createClient } from '@supabase/supabase-js';
import { buildPricingPayload, DEFAULT_PRICING_MODE } from './pricing-config.js';

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getSettings() {
  const { data, error } = await sb
    .from('site_settings')
    .select('value, updated_at')
    .eq('key', 'pricing')
    .maybeSingle();

  if (error) {
    console.error('pricing settings error:', error.message);
    return { mode: DEFAULT_PRICING_MODE, expires_at: null };
  }

  return data?.value || { mode: DEFAULT_PRICING_MODE, expires_at: null, updated_at: data?.updated_at || null };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const settings = await getSettings();
  return res.status(200).json(buildPricingPayload(settings));
}
