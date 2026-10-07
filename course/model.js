import { levels, modules, moduleAreas } from './curriculum.js';
import { hasFullAccessTier, resolveExistingUserTier } from '../businesscases/access.js';

export function modulesForLevel(levelId) {
  return modules.filter(module => module.level === levelId);
}

export function modulePath(module, area) {
  const base = `/course/${module.level}/${module.slug}`;
  return area ? `${base}/${area}` : base;
}

export function resolveCourseRoute(pathname) {
  const path = pathname.replace(/\/+$/, '');
  if (path === '/course' || path === '/course/index.html') return { kind: 'catalogue' };
  const match = /^\/course\/([^/]+)\/([^/]+)(?:\/([^/]+))?$/.exec(path);
  if (!match) return { kind: 'not-found' };
  const [, levelId, slug, area = 'study'] = match;
  const level = levels.find(item => item.id === levelId);
  const module = modules.find(item => item.level === levelId && item.slug === slug);
  if (!level || !module || !moduleAreas.some(item => item.id === area)) return { kind: 'not-found' };
  return { kind: 'module', level, module, area };
}

// Presentation policy only. Future content endpoints must verify the bearer token
// and profiles.tier/is_admin server-side, following api/word-families.js.
export function moduleAccess(module, userTier = 'visitor') {
  if (!module) return 'not-found';
  if (module.status !== 'available') return 'unreleased';
  if (module.access === 'public') return 'allowed';
  if (module.access !== 'account' && module.access !== 'epeak-plus') return 'denied';
  if (!userTier || userTier === 'visitor') return 'login';
  if (module.access === 'account') return 'allowed';
  return hasFullAccessTier(userTier) ? 'allowed' : 'upgrade';
}

// Reuse the existing Supabase session/profile resolver. There is no course user
// store, subscription interpretation, or authentication system of its own.
export async function resolveModuleAccess(module, resolveTier = resolveExistingUserTier) {
  const initial = moduleAccess(module);
  if (initial !== 'login') return initial;
  try {
    return moduleAccess(module, await resolveTier());
  } catch {
    return 'error';
  }
}
