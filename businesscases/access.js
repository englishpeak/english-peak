export const FULL_ACCESS_TIERS = ['admin', 'premium', 'teacher', 'student', 'courtesy'];
export const hasFullAccessTier = tier => FULL_ACCESS_TIERS.includes(tier);
export function canAccessBusinessCase(caseItem, userTier = 'visitor') {
  if (caseItem.accessTier === 'visitor') return true;
  if (caseItem.accessTier === 'free') return userTier !== 'visitor';
  return hasFullAccessTier(userTier);
}
export function accessLabel(caseItem, userTier = 'visitor') {
  if (caseItem.accessTier === 'visitor') return 'Open to everyone';
  if (canAccessBusinessCase(caseItem, userTier)) return caseItem.accessTier === 'premium' ? 'Included with ePeak+' : 'Included with your account';
  return caseItem.accessTier === 'free' ? 'Free account required' : 'ePeak+ required';
}

export async function resolveExistingUserTier() {
  if (!window.supabase?.createClient) return 'visitor';
  const client = window.supabase.createClient('https://jnqekougzmihjqffhuva.supabase.co', 'sb_publishable_CbFnopBPwmFgfKfgQJGa8g_Qpbh6C5i', { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true, storageKey:'ep-auth-token' } });
  const { data:{ session } } = await client.auth.getSession();
  if (!session?.user) return 'visitor';
  const { data:profile } = await client.from('profiles').select('tier,is_admin').eq('id', session.user.id).single();
  if (profile?.is_admin) return 'admin';
  return profile?.tier || 'free';
}
