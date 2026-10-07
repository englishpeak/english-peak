import test from 'node:test';
import assert from 'node:assert/strict';
import { levels, modules, moduleAreas } from './curriculum.js';
import { modulesForLevel, modulePath, resolveCourseRoute, moduleAccess, resolveModuleAccess } from './model.js';
import { FULL_ACCESS_TIERS } from '../businesscases/access.js';

test('the initial curriculum has all five levels and 52 uniquely addressable modules', () => {
  assert.deepEqual(levels.map(level => level.id), ['a1', 'a2', 'b1', 'b2', 'c1']);
  assert.deepEqual(levels.map(level => modulesForLevel(level.id).length), [13, 10, 11, 10, 8]);
  assert.equal(new Set(modules.map(module => module.id)).size, 52);
  assert.equal(new Set(modules.map(module => modulePath(module))).size, 52);
  for (const module of modules) {
    assert.ok(levels.some(level => level.id === module.level));
    assert.match(module.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  }
});

test('release metadata and eventual access match the initial rollout independently', () => {
  modulesForLevel('a1').forEach((module, index) => {
    assert.equal(module.access, index < 3 ? 'public' : 'account');
    assert.equal(module.status, 'coming-soon');
  });
  for (const module of modules.filter(module => module.level !== 'a1')) {
    assert.equal(module.access, 'epeak-plus');
    assert.equal(module.status, 'future');
  }
});

test('unreleased content stays closed for visitors, free accounts and every full-access tier', () => {
  for (const module of modules) {
    for (const tier of ['visitor', 'free', ...FULL_ACCESS_TIERS]) {
      assert.equal(moduleAccess(module, tier), 'unreleased');
    }
  }
});

test('released access uses the existing platform tier policy', () => {
  const available = access => ({ status: 'available', access });
  assert.equal(moduleAccess(available('public')), 'allowed');
  assert.equal(moduleAccess(available('account')), 'login');
  assert.equal(moduleAccess(available('account'), 'free'), 'allowed');
  assert.equal(moduleAccess(available('epeak-plus')), 'login');
  assert.equal(moduleAccess(available('epeak-plus'), 'free'), 'upgrade');
  for (const tier of FULL_ACCESS_TIERS) {
    assert.equal(moduleAccess(available('epeak-plus'), tier), 'allowed');
  }
  assert.equal(moduleAccess(available('unknown'), 'admin'), 'denied');
  assert.equal(moduleAccess({ status: 'unknown', access: 'public' }), 'unreleased');
  assert.equal(moduleAccess(null), 'not-found');
});

test('unreleased routes and public releases never depend on authentication availability', async () => {
  const unexpectedAuth = () => { assert.fail('Authentication should not be queried'); };
  for (const module of modules) {
    assert.equal(await resolveModuleAccess(module, unexpectedAuth), 'unreleased');
  }
  assert.equal(await resolveModuleAccess({ status: 'available', access: 'public' }, unexpectedAuth), 'allowed');
});

test('protected releases consume the shared resolver and stay closed on failure', async () => {
  const module = { status: 'available', access: 'epeak-plus' };
  assert.equal(await resolveModuleAccess(module, async () => 'visitor'), 'login');
  assert.equal(await resolveModuleAccess(module, async () => 'free'), 'upgrade');
  assert.equal(await resolveModuleAccess(module, async () => 'premium'), 'allowed');
  assert.equal(await resolveModuleAccess(module, async () => { throw new Error('offline'); }), 'error');
});

test('all modules support semantic base, Study, Review and Test routes without opening lessons', () => {
  assert.deepEqual(moduleAreas.map(area => area.id), ['study', 'review', 'test']);
  assert.equal(moduleAreas.find(area => area.id === 'test').questionCount, 20);
  for (const module of modules) {
    for (const area of [undefined, 'study', 'review', 'test']) {
      const route = resolveCourseRoute(modulePath(module, area));
      assert.equal(route.kind, 'module');
      assert.equal(route.module.id, module.id);
      assert.equal(route.area, area || 'study');
      assert.equal(moduleAccess(route.module, 'admin'), 'unreleased');
    }
  }
});

test('catalogue aliases, trailing slashes and invalid deep links resolve safely', () => {
  for (const path of ['/course', '/course/', '/course/index.html']) {
    assert.equal(resolveCourseRoute(path).kind, 'catalogue');
  }
  assert.equal(resolveCourseRoute('/course/a1/verb-to-be/').kind, 'module');
  for (const path of ['/course/a1', '/course/c2/verb-to-be', '/course/a1/missing', '/course/a1/verb-to-be/answers', '/course/a1/verb-to-be/study/extra', '/course//a1/verb-to-be']) {
    assert.equal(resolveCourseRoute(path).kind, 'not-found');
  }
});
