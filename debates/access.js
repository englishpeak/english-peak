const $ = id => document.getElementById(id);
const embedded = window.frameElement?.id === 'frame-debates';
const panels = ['auth-loading', 'member-lock', 'access-error', 'practice-content'];
let sessionToken = null;
let activeUserId = null;
let generation = 0;

function show(panel) {
  for (const id of panels) $(id).hidden = id !== panel;
}

async function connect() {
  if (embedded) return window.parent.sb;
  if (!window.supabase) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/teachers/vendor/supabase.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
  }
  return window.supabase.createClient(
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
}

async function verifyAccess(client, session, current) {
  if (current !== generation) return;
  try {
    const { data, error } = await client.auth.getUser(session.access_token);
    if (current !== generation) return;
    if (error?.name === 'AuthRetryableFetchError' || error?.status >= 500) throw error;
    if (error || data?.user?.id !== session.user.id) {
      activeUserId = null;
      show('member-lock');
      return;
    }
    if (activeUserId === data.user.id) return;
    const { resetActivity } = await import('./app.js');
    if (current !== generation) return;
    resetActivity();
    activeUserId = data.user.id;
    show('practice-content');
  } catch {
    if (current !== generation) return;
    sessionToken = null;
    if (!activeUserId) show('access-error');
  }
}

async function watchAccess() {
  const client = await connect();
  const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT' || !session?.access_token || !session.user?.id) {
      ++generation;
      sessionToken = null;
      activeUserId = null;
      show('member-lock');
      return;
    }
    // Supabase can emit SIGNED_IN again when a browser tab regains focus.
    if (session.access_token === sessionToken) return;
    sessionToken = session.access_token;
    const current = ++generation;
    if (activeUserId !== session.user.id) {
      activeUserId = null;
      show('auth-loading');
    }
    // Leave the auth state-change callback before checking the new token.
    setTimeout(() => verifyAccess(client, session, current), 0);
  });
  if (embedded) window.addEventListener('pagehide', event => {
    if (event.persisted) return;
    ++generation;
    subscription.unsubscribe();
  });
}

if (embedded) $('dashboard-link').hidden = true;
$('access-retry').addEventListener('click', () => window.location.reload());
watchAccess().catch(() => show('access-error'));
