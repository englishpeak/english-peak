const embedded = window.self !== window.top;
const client = embedded ? window.parent.sb : window.supabase.createClient(
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
const practice = document.getElementById('practice-content');
const lock = document.getElementById('member-lock');
let generation = 0;
if (embedded) document.getElementById('dashboard-link').hidden = true;

async function checkAccess() {
  const current = ++generation;
  practice.hidden = true;
  lock.hidden = true;
  try {
    const { data, error } = await client.auth.getUser();
    if (current !== generation) return;
    if (error || !data?.user) { lock.hidden = false; return; }
    await import('./app.js');
    if (current !== generation) return;
    practice.hidden = false;
  } catch {
    if (current === generation) lock.hidden = false;
  }
}

client.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    ++generation;
    practice.hidden = true;
    lock.hidden = false;
  } else {
    setTimeout(checkAccess, 0);
  }
});
checkAccess();
