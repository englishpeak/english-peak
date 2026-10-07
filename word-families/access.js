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

if (window.parent !== window) document.body.classList.add('embedded');

function denyAccess(status) {
  practice.hidden = true;
  practice.replaceChildren();
  activeUserId = null;
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

async function verifySession(session) {
  const requestGeneration = ++generation;
  pendingRequest?.abort();
  pendingRequest = new AbortController();
  practice.hidden = true;
  lock.hidden = true;
  loading.hidden = false;
  if (!session?.access_token) { denyAccess('login'); return; }
  try {
    const response = await fetch('/api/word-families', {
      headers: { Authorization: 'Bearer ' + session.access_token },
      cache: 'no-store', signal: pendingRequest.signal,
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
    loading.hidden = true;
    practice.hidden = false;
  } catch (error) {
    if (requestGeneration === generation && error.name !== 'AbortError') denyAccess('error');
  }
}

async function refreshAccess() {
  if (!client) { denyAccess('error'); return; }
  const sessionGeneration = ++generation;
  pendingRequest?.abort();
  practice.hidden = true;
  loading.hidden = false;
  lock.hidden = true;
  try {
    const { data, error } = await client.auth.getSession();
    if (sessionGeneration !== generation) return;
    if (error) { denyAccess('error'); return; }
    await verifySession(data?.session);
  } catch { if (sessionGeneration === generation) denyAccess('error'); }
}

action.addEventListener('click', event => {
  if (window.parent === window) return;
  event.preventDefault();
  window.parent.postMessage({ type: 'showAuthModal', tab: 'login' }, window.location.origin);
});
retry.addEventListener('click', refreshAccess);
client?.auth.onAuthStateChange((_event, session) => {
  // Avoid calling back into the auth SDK while its state-change lock is held.
  setTimeout(() => verifySession(session), 0);
});
window.addEventListener('pageshow', event => { if (event.persisted) refreshAccess(); });
window.addEventListener('pagehide', () => { practice.hidden = true; });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshAccess(); });
refreshAccess();
