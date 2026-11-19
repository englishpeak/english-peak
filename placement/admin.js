(() => {
  const refresh = document.getElementById('placement-refresh');
  const uploadForm = document.getElementById('placement-upload-form');
  const file = document.getElementById('placement-file');
  const fileStatus = document.getElementById('placement-file-status');
  const activateForm = document.getElementById('placement-activate-form');
  const expires = document.getElementById('placement-expires');
  const codeStatus = document.getElementById('placement-code-status');
  const revoke = document.getElementById('placement-revoke');
  const generated = document.getElementById('placement-generated-code');
  const share = document.getElementById('placement-share-code');
  const copy = document.getElementById('placement-copy');
  const message = document.getElementById('placement-admin-message');
  let activeCode;
  let pending;

  function renderCode(code) {
    if (code?.id !== activeCode?.id) {
      generated.hidden = true;
      share.value = '';
    }
    activeCode = code;
    codeStatus.textContent = code
      ? `Code expires ${new Date(code.expiresAt).toLocaleString()}.`
      : 'No temporary code is active.';
  }

  function updateButtons(busy) {
    refresh.disabled = busy;
    uploadForm.querySelector('button').disabled = busy;
    activateForm.querySelector('[type=submit]').disabled = busy;
    revoke.disabled = busy || !activeCode;
  }

  async function send(action, fields = {}) {
    if (pending) return;
    const controller = new AbortController();
    pending = controller;
    updateButtons(true);
    message.textContent = '';
    try {
      const { data, error } = await sb.auth.getSession();
      if (error || !data?.session?.access_token) throw new Error('Sign in to the admin panel again.');
      const response = await fetch('/api/placement', {
        method: 'POST',
        headers: { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...fields }),
        cache: 'no-store',
        signal: controller.signal,
      });
      const result = await response.json();
      if (pending !== controller) return;
      if (!response.ok) throw new Error(result.error);
      if ('assessmentReady' in result) {
        fileStatus.textContent = result.assessmentReady ? 'Assessment file saved.' : 'Upload placement.txt to make the assessment available.';
      }
      if ('activeCode' in result) renderCode(result.activeCode);
      if (action === 'upload') {
        uploadForm.reset();
        message.textContent = 'Assessment saved.';
      }
      if (action === 'activate') {
        share.value = result.code;
        generated.hidden = false;
        message.textContent = 'Temporary access is active.';
      }
      if (action === 'revoke') message.textContent = 'Temporary code revoked.';
    } catch (error) {
      if (pending === controller) message.textContent = error.message || 'Placement settings could not be saved.';
    } finally {
      if (pending === controller) {
        pending = null;
        updateButtons(false);
      }
    }
  }

  window.loadPlacementSettings = () => {
    if (!expires.value) {
      const tomorrow = new Date(Date.now() + 86_400_000);
      tomorrow.setMinutes(tomorrow.getMinutes() - tomorrow.getTimezoneOffset());
      expires.value = tomorrow.toISOString().slice(0, 16);
    }
    return send('status');
  };

  refresh.addEventListener('click', window.loadPlacementSettings);
  uploadForm.addEventListener('submit', async event => {
    event.preventDefault();
    const selected = file.files[0];
    if (!selected) return;
    if (selected.size > 512 * 1024) {
      message.textContent = 'Choose an assessment file under 512 KB.';
      return;
    }
    try {
      await send('upload', { html: await selected.text() });
    } catch {
      message.textContent = 'The assessment file could not be read.';
    }
  });
  activateForm.addEventListener('submit', event => {
    event.preventDefault();
    const deadline = new Date(expires.value);
    if (!(deadline.getTime() > Date.now())) {
      message.textContent = 'Choose a future expiration date and time.';
      return;
    }
    send('activate', { expiresAt: deadline.toISOString() });
  });
  revoke.addEventListener('click', () => send('revoke', { codeId: activeCode?.id }));
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(share.value);
      message.textContent = 'Code copied.';
    } catch {
      share.select();
      message.textContent = 'Select and copy the code.';
    }
  });
  sb.auth.onAuthStateChange(event => {
    if (event !== 'SIGNED_OUT') return;
    pending?.abort();
    pending = null;
    renderCode(null);
    uploadForm.reset();
    message.textContent = '';
    fileStatus.textContent = '';
    updateButtons(false);
  });
})();
