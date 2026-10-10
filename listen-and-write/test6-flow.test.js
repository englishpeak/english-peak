import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { LISTEN_WRITE_SETS, scorePercent } from './data.js';

const app = readFileSync(new URL('./app.js', import.meta.url), 'utf8');
const parent = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const tiers = parent.slice(parent.indexOf('function getEffectiveTier('), parent.indexOf('// Popup presentation only'));
const parentListener = parent.slice(parent.indexOf("window.addEventListener('message', async function(e)"), parent.indexOf('let _currentUser = null;'));
const logActivity = parent.slice(parent.indexOf('async function logActivity('), parent.indexOf('// ═══ MODAL'));

test('Test 6 uses existing parent entitlements and the selector keeps Tests 1–5 access rules', async () => {
  for (const profile of [null, { tier:'free' }, { tier:'premium' }, { tier:'teacher' }, { tier:'student' }, { tier:'courtesy' }, { tier:'free', is_admin:true }]) {
    let listener, access;
    const sandbox = {
      _currentUser:profile ? { id:'member' } : null, _currentProfile:profile,
      window:{ location:{ origin:'https://epeak.example' }, addEventListener(type, callback) { listener = callback; } },
      isTrustedExerciseMessage:event => event.origin === 'https://epeak.example'
    };
    vm.runInNewContext(tiers + parentListener, sandbox);
    await listener({ origin:'https://epeak.example', data:{ type:'listenWriteAccessRequest' }, source:{ postMessage(data) { access = data; } } });
    assert.equal(access.authenticated, Boolean(profile));
    assert.equal(access.plusAccess, Boolean(profile && (profile.tier !== 'free' || profile.is_admin)));
    const selected = LISTEN_WRITE_SETS.find(set => set.number === 6);
    const events = [];
    const choose = {
      ACCESS:{ REGISTERED:'registered', PLUS:'plus' }, LISTEN_WRITE_SETS,
      authenticated:access.authenticated, plusAccess:access.plusAccess,
      window:{ parent:{ postMessage(data) { events.push(data.type); } } },
      location:{ origin:'https://epeak.example' }, show:view => events.push(view)
    };
    vm.runInNewContext(app.slice(app.indexOf('function chooseSet('), app.indexOf('function start(')), choose);
    choose.chooseSet(selected.number);
    assert.deepEqual(events, access.plusAccess ? ['difficulty'] : ['showModal']);
  }
});

test('Test 6 completion reaches the existing My Progress exercise_log with all fields in each mode', async () => {
  const finish = app.slice(app.indexOf('function finish('), app.indexOf("$('play').onclick"));
  for (const mode of ['easy', 'medium', 'hard']) {
    let listener, pending;
    const inserts = [];
    const sandbox = {
      _currentUser:{ id:'member' }, window:{ addEventListener(type, callback) { listener = callback; } },
      isTrustedExerciseMessage:() => true,
      sb:{ from(table) { assert.equal(table, 'exercise_log'); return { async insert(row) { inserts.push(row); return { error:null }; } }; } },
      showToast() {}, document:{ getElementById:() => null }
    };
    vm.runInNewContext(logActivity + parentListener, sandbox);
    const elements = new Map();
    const frame = {
      set:LISTEN_WRITE_SETS.find(set => set.number === 6), mode, correct:9, missed:[], scorePercent,
      $:id => { if (!elements.has(id)) elements.set(id, {}); return elements.get(id); },
      show:view => assert.equal(view, 'results'), location:{ origin:'https://epeak.example' },
      window:{ parent:{ postMessage(data, origin) { pending = listener({ data, origin }); } } }
    };
    vm.runInNewContext(finish + '\nfinish();', frame);
    await pending;
    assert.equal(elements.get('score').textContent, 'Your score: 90%');
    assert.equal(inserts.length, 1);
    const row = JSON.parse(JSON.stringify(inserts[0]));
    assert.equal(row.user_id, 'member');
    assert.equal(row.exercise_type, 'Listen and Write');
    assert.equal(row.exercise_name, `Test 6 — ${mode[0].toUpperCase() + mode.slice(1)}`);
    assert.equal(row.score, 9);
    assert.equal(row.max_score, 10);
    assert.deepEqual({ ...row.details, completedAt:null }, { activity:'Listen and Write', test:'Test 6', set:6, difficulty:mode, percentage:90, correct:9, incorrect:1, status:'completed', completedAt:null });
    assert.ok(Number.isFinite(Date.parse(row.details.completedAt)));
    assert.ok(Number.isFinite(Date.parse(row.completed_at)));
  }
});
