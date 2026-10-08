import { initializeWordFamilies } from './practice.js';

// Use the same Supabase project, publishable key, session and storage fallback as
// the dashboard. This only supplies a bearer token; the server decides access.
const client = window.supabase?.createClient(
  'https://jnqekougzmihjqffhuva.supabase.co',
  'sb_publishable_CbFnopBPwmFgfKfgQJGa8g_Qpbh6C5i',
  { auth: {
    persistSession: true, autoRefreshToken: true, detectSessionInUrl: true,
    storageKey: 'ep-auth-token',
    storage: {
      getItem(key) { try { return localStorage.getItem(key); } catch { try { return sessionStorage.getItem(key); } catch { return null; } } },
      setItem(key, value) { try { localStorage.setItem(key, value); } catch { try { sessionStorage.setItem(key, value); } catch {} } },
      removeItem(key) { try { localStorage.removeItem(key); } catch { try { sessionStorage.removeItem(key); } catch {} } },
    },
  } },
);
const loading = document.getElementById('auth-loading');
const lock = document.getElementById('member-lock');
const practice = document.getElementById('practice-content');
const message = document.getElementById('access-message');
const action = document.getElementById('access-action');
const retry = document.getElementById('access-retry');
let generation = 0;
let activeUserId = null;
let pendingRequest = null;
let pendingToken = null;
let pendingPromise = null;
let verifiedToken = null;
let activeSessionUserId = null;
let verifiedAt = 0;

if (window.parent !== window) document.body.classList.add('embedded');

function denyAccess(status) {
  ++generation;
  pendingRequest?.abort();
  pendingRequest = null;
  pendingToken = null;
  pendingPromise = null;
  practice.hidden = true;
  practice.replaceChildren();
  activeUserId = null;
  activeSessionUserId = null;
  verifiedToken = null;
  verifiedAt = 0;
  loading.hidden = true;
  lock.hidden = false;
  retry.hidden = status !== 'error';
  action.hidden = status === 'error';
  action.textContent = status === 'upgrade' ? '⭐ Get ePeak+' : 'Sign in';
  action.href = status === 'upgrade' ? '/?upgrade=word-families' : '/?auth=login';
  action.dataset.authAction = status === 'upgrade' ? 'upgrade' : 'login';
  message.textContent = status === 'upgrade'
    ? 'Word Families is included with ePeak+. Upgrade to start practicing.'
    : status === 'error'
      ? 'We could not check your access. Please try again.'
      : 'Sign in to access ePeak+ practice.';
}

function verifySession(session, { force = false } = {}) {
  const token = session?.access_token;
  // INITIAL_SESSION, getSession and repeated SIGNED_IN events can all describe
  // the same session. Share its pending check and reuse its verified result.
  if (token && pendingToken === token) return pendingPromise;
  if (token && verifiedToken === token && activeUserId && !force && Date.now() - verifiedAt < 60_000) {
    loading.hidden = true;
    lock.hidden = true;
    practice.hidden = false;
    return Promise.resolve();
  }
  const requestGeneration = ++generation;
  pendingRequest?.abort();
  pendingToken = null;
  pendingPromise = null;
  if (!token) { denyAccess('login'); return Promise.resolve(); }
  pendingRequest = new AbortController();
  const controller = pendingRequest;
  // Keep a verified account's current round visible during revalidation, but
  // never display one account's practice while checking a different account.
  const sameUser = activeUserId && session.user?.id && session.user.id === activeSessionUserId;
  practice.hidden = !sameUser;
  if (!sameUser) {
    practice.replaceChildren();
    activeUserId = null;
    activeSessionUserId = null;
    verifiedToken = null;
  }
  lock.hidden = true;
  loading.hidden = Boolean(sameUser);
  pendingToken = token;
  pendingPromise = (async () => {
    try {
      const response = await fetch('/api/word-families', {
        headers: { Authorization: 'Bearer ' + token },
        cache: 'no-store', signal: controller.signal,
      });
      if (requestGeneration !== generation) return;
      if (response.status === 401) { denyAccess('login'); return; }
      if (response.status === 403) { denyAccess('upgrade'); return; }
      if (!response.ok) { denyAccess('error'); return; }
      const payload = await response.json();
      if (requestGeneration !== generation) return;
      if (!payload.userId || !Array.isArray(payload.families)) throw new Error('Invalid practice response');
      if (activeUserId !== payload.userId || !practice.children.length) {
        practice.replaceChildren(document.getElementById('practice-template').content.cloneNode(true));
        initializeWordFamilies(payload.families);
        activeUserId = payload.userId;
      }
      activeSessionUserId = session.user?.id || null;
      verifiedToken = token;
      verifiedAt = Date.now();
      loading.hidden = true;
      practice.hidden = false;
    } catch (error) {
      if (requestGeneration === generation && error.name !== 'AbortError') denyAccess('error');
    } finally {
      if (requestGeneration === generation) {
        pendingRequest = null;
        pendingToken = null;
        pendingPromise = null;
      }
    }
  })();
  return pendingPromise;
}

async function refreshAccess({ force = false } = {}) {
  if (!client) { denyAccess('error'); return; }
  const sessionGeneration = generation;
  try {
    const { data, error } = await client.auth.getSession();
    if (sessionGeneration !== generation) return;
    if (error) { denyAccess('error'); return; }
    await verifySession(data?.session, { force });
  } catch { if (sessionGeneration === generation) denyAccess('error'); }
}

action.addEventListener('click', event => {
  if (window.parent === window) return;
  event.preventDefault();
  window.parent.postMessage({ type: 'showAuthModal', tab: 'login' }, window.location.origin);
});
retry.addEventListener('click', () => refreshAccess({ force: true }));
client?.auth.onAuthStateChange((event, session) => {
  // Avoid calling back into the auth SDK while its state-change lock is held.
  setTimeout(() => verifySession(session, { force: event === 'USER_UPDATED' }), 0);
});
window.addEventListener('pageshow', event => { if (event.persisted) refreshAccess({ force: true }); });
window.addEventListener('pagehide', () => { practice.hidden = true; });
window.addEventListener('message', event => {
  if (event.origin !== window.location.origin || event.source !== window.parent) return;
  if (event.data?.type === 'wordFamiliesResume' && Date.now() - verifiedAt >= 60_000) {
    refreshAccess({ force: true });
  }
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshAccess({ force: true }); });
refreshAccess();
