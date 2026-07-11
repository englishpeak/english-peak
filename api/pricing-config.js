export const PRICING_MODES = {
  normal: {
    label: 'Normal price',
    badge: '',
    discountPercent: 0,
    prices: {
      mxn: { monthly: '$199 MXN', monthly_full: '', yearly: '$1,910 MXN', yearly_full: '', yearly_sub: 'Ahorra vs mensual · equivale a $159.17/mes' },
      usd: { monthly: '$12 USD', monthly_full: '', yearly: '$116 USD', yearly_full: '', yearly_sub: 'Save vs monthly · equals $9.67/mo' },
    },
    stripePriceIds: {
      mxn_monthly: 'price_1TrpPxF2ctV3Sh1lHFFv96li',
      mxn_yearly: 'price_1TrpQdF2ctV3Sh1lMlctPkPp',
      usd_monthly: 'price_1TrpROF2ctV3Sh1lVuhggSRl',
      usd_yearly: 'price_1TrpSAF2ctV3Sh1lf7oJTgcG',
    },
  },
  half_off: {
    label: '50% off',
    badge: '50% OFF',
    discountPercent: 50,
    prices: {
      mxn: { monthly: '$99 MXN', monthly_full: '$199 MXN', yearly: '$955 MXN', yearly_full: '$1,910 MXN', yearly_sub: 'Ahorra vs mensual · equivale a $79.58/mes' },
      usd: { monthly: '$6 USD', monthly_full: '$12 USD', yearly: '$58 USD', yearly_full: '$116 USD', yearly_sub: 'Save vs monthly · equals $4.83/mo' },
    },
    stripePriceIds: {
      mxn_monthly: 'price_1TCw7hF2ctV3Sh1lQXJDWYTl',
      mxn_yearly: 'price_1TCw8LF2ctV3Sh1lqShYQgcq',
      usd_monthly: 'price_1TCw8lF2ctV3Sh1lgO4R0oDj',
      usd_yearly: 'price_1TCw90F2ctV3Sh1lUccMCWW3',
    },
  },
  eighty_off: {
    label: '80% off',
    badge: '80% OFF',
    discountPercent: 80,
    prices: {
      mxn: { monthly: '$39 MXN', monthly_full: '$199 MXN', yearly: '$382 MXN', yearly_full: '$1,910 MXN', yearly_sub: 'Ahorra vs mensual · equivale a $31.83/mes' },
      usd: { monthly: '$2.40 USD', monthly_full: '$12 USD', yearly: '$23.20 USD', yearly_full: '$116 USD', yearly_sub: 'Save vs monthly · equals $1.93/mo' },
    },
    stripePriceIds: {
      mxn_monthly: 'price_1TbYiiF2ctV3Sh1lNf3LXDMb',
      mxn_yearly: 'price_1TbYqIF2ctV3Sh1lBkp8ICiM',
      usd_monthly: 'price_1TbYowF2ctV3Sh1lmsClO9vG',
      usd_yearly: 'price_1TbYpxF2ctV3Sh1lQ5A461by',
    },
  },
};

export const DEFAULT_PRICING_MODE = 'half_off';

export function normalizePricingMode(mode) {
  return Object.prototype.hasOwnProperty.call(PRICING_MODES, mode) ? mode : DEFAULT_PRICING_MODE;
}

export function buildPricingPayload(settings = {}) {
  const now = new Date();
  const rawMode = settings.mode || DEFAULT_PRICING_MODE;
  const expiresAt = settings.expires_at || null;
  const mode = expiresAt && new Date(expiresAt) <= now ? 'normal' : normalizePricingMode(rawMode);
  const config = PRICING_MODES[mode];
  return {
    mode,
    label: config.label,
    badge: config.badge,
    discountPercent: config.discountPercent,
    expiresAt: mode === 'normal' ? null : expiresAt,
    updatedAt: settings.updated_at || null,
    prices: config.prices,
  };
}
