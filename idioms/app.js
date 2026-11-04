import { IDIOM_LESSONS } from './catalog.js';
import { clearPractice, showPractice } from './practice.js';

const $ = id => document.getElementById(id);
// Same Supabase project, session key and storage fallback as the dashboard.
// The API verifies identity and entitlement; browser state grants no access.
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

let generation = 0;
let controller = null;
let session = null;
let verifiedUserId = null;
let plusAccess = false;
let checking = true;
let activeLessonId = null;
let modalTrigger = null;
let modalAction = null;
const initialId = new URLSearchParams(location.search).get('lesson');
let requestedLessonId = initialId === null ? null : Number(initialId);

function status(message, retry = false) {
  $('accessMessage').textContent = message;
  $('accessRetry').classList.toggle('hidden', !retry);
}

function buildGrid() {
  $('lessonGrid').replaceChildren();
  IDIOM_LESSONS.forEach(lesson => {
    const premium = lesson.access === 'premium';
    const button = document.createElement('button');
    button.className = `lesson-card${premium ? ' locked' : ''}`;
    button.disabled = checking;
    button.innerHTML = `<div class="card-line"><span class="card-kicker">${lesson.kicker}</span><span class="circle ${premium ? 'lock' : ''}" aria-hidden="true">${premium ? '♢' : '→'}</span></div><div><h3>${lesson.title}</h3><p>10 idioms · Multiple choice</p></div><div class="card-line" style="margin-top:17px"><span class="pill ${premium ? 'pro' : ''}">${premium ? '✧ ePeak+' : '✓ Members'}</span><span class="inline-check">${!lesson.published ? 'COMING SOON' : 'START LESSON →'}</span></div>`;
    button.setAttribute('aria-label', `${lesson.title}, ${premium ? 'ePeak+ required' : 'free account required'}${!lesson.published ? ', coming soon' : ''}`);
    button.addEventListener('click', () => openLesson(lesson.id));
    $('lessonGrid').appendChild(button);
  });
}

function closeModal() {
  $('modalBackdrop').classList.add('hidden');
  $('home').inert = false;
  $('lessonView').inert = false;
  modalTrigger?.focus();
}

function openModal(title, message, actionLabel, action) {
  modalTrigger = document.activeElement;
  modalAction = action;
  $('modalTitle').textContent = title;
  $('modalMessage').textContent = message;
  $('modalUpgrade').textContent = actionLabel || '';
  $('modalUpgrade').hidden = !action;
  $('modalBackdrop').classList.remove('hidden');
  $('home').inert = true;
  $('lessonView').inert = true;
  $('modalClose').focus();
}

function showHome({ updateUrl = true } = {}) {
  activeLessonId = null;
  requestedLessonId = null;
  clearPractice();
  $('home').classList.remove('hidden');
  closeModal();
  if (updateUrl) updateLocation(null);
}

function clearAccess() {
  verifiedUserId = null;
  plusAccess = false;
  activeLessonId = null;
  clearPractice();
  $('home').classList.remove('hidden');
  closeModal();
}

function updateLocation(lessonId) {
  const params = new URLSearchParams({ embedded: '1' });
  if (lessonId !== null) params.set('lesson', lessonId);
  history.replaceState(null, '', '/idioms/index.html?' + params.toString());
  window.parent.postMessage({ type: 'idiomsNavigation', lessonId }, location.origin);
}

function signIn() {
  window.parent.postMessage({ type: 'showAuthModal', tab: 'login' }, location.origin);
}

function upgrade() {
  window.parent.postMessage({ type: 'showModal' }, location.origin);
}

async function verifyAccess(nextSession, lessonId = activeLessonId, { preserve = false } = {}) {
  const currentGeneration = ++generation;
  controller?.abort();
  controller = new AbortController();
  const requestController = controller;
  const token = nextSession?.access_token;
  const sameAccount = nextSession?.user?.id && nextSession.user.id === verifiedUserId;
  session = nextSession;
  if (!sameAccount) clearAccess();
  if (!token) {
    checking = false;
    clearAccess();
    buildGrid();
    status('Sign in to explore Lesson 1. Lessons 2 and beyond require ePeak+.');
    if (lessonId !== null) signIn();
    return;
  }
  checking = true;
  buildGrid();
  status('Checking your account…');
  try {
    const response = await fetch('/api/idioms' + (lessonId === null ? '' : `?lesson=${encodeURIComponent(lessonId)}`), {
      headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: requestController.signal,
    });
    const payload = await response.json();
    if (currentGeneration !== generation) return;
    if (response.status === 401) {
      clearAccess();
      status('Please sign in again to access Idioms Lessons.');
      if (lessonId !== null) signIn();
      return;
    }
    if (response.ok || response.status === 403 || payload.code === 'COMING_SOON') {
      if (!payload.userId || payload.userId !== nextSession.user?.id) throw new Error('Invalid account response');
      verifiedUserId = payload.userId;
      plusAccess = payload.plusAccess === true;
    }
    if (response.status === 403) {
      showHome();
      status('Lesson 1 is included with your account.');
      upgrade();
      return;
    }
    if (payload.code === 'COMING_SOON' && response.status === 404) {
      showHome();
      status('More lessons are on their way.');
      openModal('Coming soon', 'This ePeak+ lesson is being prepared. You can explore Lesson 1 now.', null, null);
      return;
    }
    if (!response.ok) throw new Error('Access check failed');
    if (lessonId !== null) {
      if (!payload.lesson || !Array.isArray(payload.items) || payload.items.length !== 10) throw new Error('Invalid lesson response');
      const keepRound = preserve && sameAccount && activeLessonId === lessonId;
      activeLessonId = lessonId;
      showPractice(payload.lesson, payload.items, { preserve: keepRound });
      updateLocation(lessonId);
      closeModal();
    }
    status(plusAccess ? 'Your account includes ePeak+ lessons.' : 'Lesson 1 is included with your account.');
  } catch (error) {
    if (currentGeneration !== generation || error.name === 'AbortError') return;
    clearAccess();
    status('We could not check your access. Please try again.', true);
  } finally {
    if (currentGeneration === generation) {
      checking = false;
      controller = null;
      buildGrid();
    }
  }
}

async function refreshAccess() {
  if (!client) {
    clearAccess();
    checking = false;
    buildGrid();
    status('We could not check your access. Please try again.', true);
    return;
  }
  const currentGeneration = generation;
  try {
    const { data, error } = await client.auth.getSession();
    if (currentGeneration !== generation) return;
    if (error) throw error;
    await verifyAccess(data?.session, activeLessonId ?? requestedLessonId, { preserve: true });
  } catch {
    if (currentGeneration !== generation) return;
    clearAccess();
    checking = false;
    buildGrid();
    status('We could not check your access. Please try again.', true);
  }
}

function openLesson(id) {
  requestedLessonId = id;
  if (!session?.access_token) { signIn(); return; }
  verifyAccess(session, id);
  window.scrollTo(0, 0);
}

$('backHome').addEventListener('click', () => {
  ++generation;
  controller?.abort();
  checking = false;
  showHome();
  buildGrid();
});
$('accessRetry').addEventListener('click', refreshAccess);
$('modalClose').addEventListener('click', closeModal);
$('modalUpgrade').addEventListener('click', () => modalAction?.());
$('modalBackdrop').addEventListener('click', event => { if (event.target === $('modalBackdrop')) closeModal(); });
document.addEventListener('keydown', event => {
  if ($('modalBackdrop').classList.contains('hidden')) return;
  if (event.key === 'Escape') closeModal();
  if (event.key === 'Tab') {
    const first = $('modalUpgrade').hidden ? $('modalClose') : $('modalUpgrade');
    const last = $('modalClose');
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
client?.auth.onAuthStateChange((event, nextSession) => {
  // Avoid calling the SDK while its auth-state lock is held.
  setTimeout(() => {
    if (event === 'INITIAL_SESSION') return;
    if (event === 'SIGNED_IN' && nextSession?.access_token === session?.access_token) return;
    verifyAccess(nextSession, activeLessonId ?? requestedLessonId, { preserve: true });
  }, 0);
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refreshAccess(); });
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== window.parent) return;
  if (event.data?.type === 'idiomsResume') refreshAccess();
});
window.addEventListener('pagehide', () => {
  ++generation;
  controller?.abort();
  $('lessonView').classList.add('hidden');
});
window.addEventListener('pageshow', event => { if (event.persisted) refreshAccess(); });
if (window.parent === window) {
  // Direct links to the internal document also enter the shared app shell.
  const params = new URLSearchParams(location.search);
  params.delete('embedded');
  const query = params.toString();
  location.replace('/idioms' + (query ? '?' + query : ''));
} else {
  buildGrid();
  refreshAccess();
}
