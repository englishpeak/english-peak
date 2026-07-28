import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AUTH_STORAGE_KEY,
  LEGACY_ADMIN_AUTH_STORAGE_KEY,
  canUseAcademicManagement,
  migrateLegacyAdminSession
} from './auth.js';

function memoryStorage(entries = {}) {
  const values = new Map(Object.entries(entries));
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
}

test('migrates a legacy admin session on a direct teachers visit', () => {
  const storage = memoryStorage({ [LEGACY_ADMIN_AUTH_STORAGE_KEY]: 'legacy-session' });
  assert.equal(migrateLegacyAdminSession(storage), true);
  assert.equal(storage.getItem(AUTH_STORAGE_KEY), 'legacy-session');
});

test('does not overwrite the current shared session', () => {
  const storage = memoryStorage({
    [AUTH_STORAGE_KEY]: 'current-session',
    [LEGACY_ADMIN_AUTH_STORAGE_KEY]: 'legacy-session'
  });
  assert.equal(migrateLegacyAdminSession(storage), false);
  assert.equal(storage.getItem(AUTH_STORAGE_KEY), 'current-session');
});

test('academic access accepts admins and teacher tiers only', () => {
  assert.equal(canUseAcademicManagement({ is_admin: true, tier: 'free' }), true);
  assert.equal(canUseAcademicManagement({ is_admin: false, tier: 'Teacher' }), true);
  assert.equal(canUseAcademicManagement({ is_admin: false, tier: 'premium' }), false);
  assert.equal(canUseAcademicManagement(null), false);
});
