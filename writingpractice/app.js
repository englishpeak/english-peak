const client = window.supabase?.createClient(
  'https://jnqekougzmihjqffhuva.supabase.co',
  'sb_publishable_CbFnopBPwmFgfKfgQJGa8g_Qpbh6C5i',
  { auth: {
    storageKey: 'ep-auth-token',
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem(key) { try { return localStorage.getItem(key); } catch { try { return sessionStorage.getItem(key); } catch { return null; } } },
      setItem(key, value) { try { localStorage.setItem(key, value); } catch { try { sessionStorage.setItem(key, value); } catch {} } },
      removeItem(key) { try { localStorage.removeItem(key); } catch { try { sessionStorage.removeItem(key); } catch {} } },
    },
  } },
);

const accessPanel = document.getElementById('access-panel');
const accessStatus = document.getElementById('access-status');
const signIn = document.getElementById('sign-in');
const retry = document.getElementById('retry-access');
const editor = document.getElementById('editor');
const accessMessages = {
  checking: 'Checking your ePeak+ access…',
  login: 'Sign in with your ePeak+ account, then return to this tab.',
  upgrade: 'Writing Practice is included with ePeak+.',
  error: 'We couldn’t check your access. Please try again.',
};

let currentCheck = 0;
let editorUserId;

function showAccessStatus(status) {
  editor.hidden = true;
  accessPanel.hidden = false;
  accessStatus.textContent = accessMessages[status];
  signIn.hidden = status !== 'login';
  retry.hidden = status !== 'error';
}

function clearEditor() {
  editor.replaceChildren();
  editorUserId = undefined;
}

async function verifyAccess(session) {
  const check = ++currentCheck;
  const userId = session?.user?.id;
  if (userId !== editorUserId) clearEditor();
  if (!userId || !session.access_token) {
    clearEditor();
    showAccessStatus('login');
    return;
  }
  if (!editorUserId) showAccessStatus('checking');

  try {
    const response = await fetch('/api/writingpractice', {
      headers: { Authorization: `Bearer ${session.access_token}` },
      cache: 'no-store',
    });
    if (check !== currentCheck) return;
    if (response.status === 401 || response.status === 403) {
      clearEditor();
      showAccessStatus(response.status === 401 ? 'login' : 'upgrade');
      return;
    }
    if (!response.ok) throw new Error('Access check failed');

    const payload = await response.json();
    if (check !== currentCheck) return;
    if (payload.userId !== userId || typeof payload.editor !== 'string') {
      throw new Error('Invalid access response');
    }
    if (!editorUserId) {
      editor.innerHTML = payload.editor;
      editorUserId = userId;
    }
    accessPanel.hidden = true;
    editor.hidden = false;
  } catch {
    if (check === currentCheck) showAccessStatus('error');
  }
}

async function refreshAccess() {
  const check = currentCheck;
  try {
    const { data, error } = await client.auth.getSession();
    if (check !== currentCheck) return;
    if (error) throw error;
    await verifyAccess(data.session);
  } catch {
    if (check === currentCheck) showAccessStatus('error');
  }
}

editor.addEventListener('input', event => {
  if (event.target.id !== 'writing-draft') return;
  const words = event.target.value.match(/[\p{L}\p{N}\p{M}]+(?:['’-][\p{L}\p{N}\p{M}]+)*/gu);
  const count = words?.length ?? 0;
  editor.querySelector('#word-count').value = `${count} ${count === 1 ? 'word' : 'words'}`;
});

client?.auth.onAuthStateChange((event, session) => {
  if (event !== 'INITIAL_SESSION') void verifyAccess(session);
});
retry.addEventListener('click', refreshAccess);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') void refreshAccess();
});
window.addEventListener('pageshow', event => {
  if (event.persisted) void refreshAccess();
});
window.addEventListener('pagehide', () => { editor.hidden = true; });
void refreshAccess();
