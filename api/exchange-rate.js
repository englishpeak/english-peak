const GOOGLE_FINANCE_URL = 'https://www.google.com/finance/quote/USD-MXN?hl=en';

export function parseGoogleFinanceRate(html) {
  const match = String(html).match(/data-last-price="([0-9]+(?:\.[0-9]+)?)"/);
  const rate = Number(match?.[1]);
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if ((req.query?.from || 'USD') !== 'USD' || (req.query?.to || 'MXN') !== 'MXN') {
    return res.status(400).json({ error: 'Only USD to MXN is supported' });
  }
  try {
    const response = await fetch(GOOGLE_FINANCE_URL, { headers: { 'User-Agent': 'Mozilla/5.0 EnglishPeak/1.0' } });
    if (!response.ok) throw new Error(`Google Finance returned ${response.status}`);
    const rate = parseGoogleFinanceRate(await response.text());
    if (!rate) throw new Error('The Google Finance rate could not be read');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ base: 'USD', quote: 'MXN', rate, source: 'Google Finance', fetched_at: new Date().toISOString() });
  } catch (error) {
    return res.status(502).json({ error: 'Exchange rate is temporarily unavailable', detail: error.message });
  }
}
