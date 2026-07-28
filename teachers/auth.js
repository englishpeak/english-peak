export const AUTH_STORAGE_KEY = 'ep-auth-token';
export const LEGACY_ADMIN_AUTH_STORAGE_KEY = 'sb-jnqekougzmihjqffhuva-auth-token';

export function migrateLegacyAdminSession(storage) {
  const sharedSession = storage.getItem(AUTH_STORAGE_KEY);
  const legacySession = storage.getItem(LEGACY_ADMIN_AUTH_STORAGE_KEY);

  if (!sharedSession && legacySession) {
    storage.setItem(AUTH_STORAGE_KEY, legacySession);
    return true;
  }

  return false;
}

export function canUseAcademicManagement(profile) {
  return Boolean(profile?.is_admin) || String(profile?.tier).toLowerCase() === 'teacher';
}
