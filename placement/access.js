import { AUTH_STORAGE_KEY } from '/teachers/auth.js';

const client = window.supabase?.createClient(
  'https://jnqekougzmihjqffhuva.supabase.co',
  'sb_publishable_CbFnopBPwmFgfKfgQJGa8g_Qpbh6C5i',
  { auth: { storageKey: AUTH_STORAGE_KEY } },
);
const gate = document.getElementById('placement-gate');
const message = document.getElementById('access-message');
const signIn = document.getElementById('placement-sign-in');
const form = document.getElementById('placement-code-form');
const input = document.getElementById('placement-code');
const submit = form.querySelector('button');
const retry = document.getElementById('placement-retry');
const frame = document.getElementById('assessment');
let session;
let request;
let recheck;
let verifiedCode = '';

function savedCode(userId, value) {
  if (!userId) return '';
  const key = `placement-code:${userId}`;
  try {
    if (value === undefined) return sessionStorage.getItem(key) || '';
    if (value) sessionStorage.setItem(key, value);
    else sessionStorage.removeItem(key);
  } catch { /* Access still works if browser storage is disabled. */ }
  return '';
}

function showGate(text, action) {
  clearTimeout(recheck);
  if (!frame.hidden) frame.removeAttribute('srcdoc');
  frame.hidden = true;
  gate.hidden = false;
  message.textContent = text;
  signIn.hidden = action !== 'sign-in';
  form.hidden = action !== 'code';
  retry.hidden = action !== 'retry';
}

async function checkAccess(code = verifiedCode || savedCode(session?.user.id)) {
  if (!session || request) return;
  const current = session;
  const controller = new AbortController();
  request = controller;
  clearTimeout(recheck);
  submit.disabled = true;
  retry.disabled = true;
  try {
    const response = await fetch('/api/placement', {
      method: 'POST',
      headers: { Authorization: `Bearer ${current.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: frame.hidden ? 'open' : 'check', code }),
      cache: 'no-store',
      signal: controller.signal,
    });
    const result = await response.json();
    if (request !== controller) return;

    if (!response.ok) {
      if (response.status === 403) {
        verifiedCode = '';
        savedCode(current.user.id, '');
      }
      const action = response.status === 401 ? 'sign-in' : result.needsCode ? 'code' : 'retry';
      showGate(result.error, action);
      return;
    }

    if (result.userId !== current.user.id) throw new Error('The verified account changed.');
    if (frame.hidden) {
      if (typeof result.html !== 'string') throw new Error('Missing assessment.');
      const moveFocus = gate.contains(document.activeElement);
      frame.srcdoc = result.html;
      frame.hidden = false;
      gate.hidden = true;
      if (moveFocus) frame.focus();
    }
    verifiedCode = result.expiresInMs === null ? '' : code;
    savedCode(current.user.id, verifiedCode);
    input.value = '';
    recheck = setTimeout(checkAccess, Math.min(60_000, result.expiresInMs ?? 60_000));
  } catch {
    if (request === controller) showGate('Access could not be checked. Please try again.', 'retry');
  } finally {
    if (request === controller) {
      request = null;
      submit.disabled = false;
      retry.disabled = false;
    }
  }
}

function updateSession(next, event) {
  if (session !== undefined && session?.access_token === next?.access_token && event !== 'USER_UPDATED') return;
  request?.abort();
  request = null;
  if (session?.user.id !== next?.user.id) {
    if (session) savedCode(session.user.id, '');
    verifiedCode = '';
    input.value = '';
    showGate('Checking your access…');
  }
  session = next;
  if (session) checkAccess();
  else showGate('Sign in to use your ePeak+ membership or a temporary placement code.', 'sign-in');
}

form.addEventListener('submit', event => {
  event.preventDefault();
  checkAccess(input.value.trim());
});
retry.addEventListener('click', () => {
  if (client) checkAccess();
  else window.location.reload();
});
window.addEventListener('pageshow', event => { if (event.persisted) checkAccess(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && !frame.hidden) checkAccess();
});
if (client) client.auth.onAuthStateChange((event, next) => updateSession(next, event));
else showGate('Access could not be checked. Please try again.', 'retry');
