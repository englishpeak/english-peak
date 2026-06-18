(function(){
  var EP_SUPABASE_URL = 'https://jnqekougzmihjqffhuva.supabase.co';
  var EP_SUPABASE_KEY = 'sb_publishable_CbFnopBPwmFgfKfgQJGa8g_Qpbh6C5i';
  var epSb = window.supabase && window.supabase.createClient ? window.supabase.createClient(EP_SUPABASE_URL, EP_SUPABASE_KEY) : null;
  var downloadFiles = [];

  function onReady(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(function(){
    wireDownloadsNav();
    injectDownloadsScreen();
  });

  function wireDownloadsNav(){
    var buttons = Array.prototype.slice.call(document.querySelectorAll('.nav-item'));
    var btn = buttons.find(function(b){ return (b.textContent || '').trim().indexOf('Downloads') > -1; });
    if (!btn) return;
    btn.id = 'navDownloads';
    btn.onclick = showDownloads;
  }

  function injectDownloadsScreen(){
    if (document.getElementById('screen-downloads')) return;
    var progress = document.getElementById('screen-progress');
    if (!progress) return;
    var section = document.createElement('div');
    section.className = 'screen';
    section.id = 'screen-downloads';
    section.innerHTML = ''
      + '<div class="content" style="padding:32px;flex:1">'
      + '  <div class="progress-card">'
      + '    <div class="progress-text"><h3>Downloads</h3><p>Worksheets, PDFs and class resources . Sign in to see member resources.</p></div>'
      + '    <div class="progress-stats"><div class="prog-stat"><div class="prog-num" id="downloadsCount">0</div><div class="prog-label">Files</div></div></div>'
      + '  </div>'
      + '  <div class="section-header"><h2>Resource Library</h2><p id="downloadsSub">Loading files...</p></div>'
      + '  <div class="cards-grid" id="downloadsGrid"></div>'
      + '  <div id="downloadPreviewPanel" style="display:none;background:white;border:1.5px solid var(--border);border-radius:18px;overflow:hidden;box-shadow:0 12px 36px rgba(13,59,111,0.08);margin-top:8px">'
      + '    <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 20px;border-bottom:1px solid var(--border);flex-wrap:wrap">'
      + '      <div><div id="downloadPreviewTitle" style="font-family:\'Cormorant Garamond\',serif;font-size:1.25rem;font-weight:700;color:var(--navy)">Vista previa del archivo</div><div id="downloadPreviewDesc" style="font-size:0.82rem;color:#777;margin-top:2px"></div></div>'
      + '      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><a id="downloadFileBtn" class="upgrade-btn" href="#" download>⬇ Descargar archivo</a><button class="back-btn" onclick="closeDownloadPreview()">Cerrar vista previa</button></div>'
      + '    </div>'
      + '    <iframe id="downloadPreviewFrame" title="Download preview" style="width:100%;height:70vh;border:0;background:#f3f5f8" loading="lazy"></iframe>'
      + '  </div>'
      + '</div>';
    progress.parentNode.insertBefore(section, progress);
  }

  async function showDownloads(){
    injectDownloadsScreen();
    document.querySelectorAll('.screen,.exercise-screen').forEach(function(s){s.classList.remove('active');});
    document.getElementById('screen-downloads').classList.add('active');
    document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});
    var nav = document.getElementById('navDownloads');
    if (nav) nav.classList.add('active');
    var title = document.getElementById('topbarTitle');
    var sub = document.getElementById('topbarSub');
    if (title) title.textContent = 'Downloads';
    if (sub) sub.textContent = 'PDFs and class resources';
    if (typeof closeMobileSidebar === 'function') closeMobileSidebar();
    await loadDownloads();
  }

  async function loadDownloads(){
    var grid = document.getElementById('downloadsGrid');
    var sub = document.getElementById('downloadsSub');
    if (!grid || !epSb) return;
    closeDownloadPreview();
    grid.innerHTML = '<div class="ex-card"><div class="card-body" style="padding:24px"><div class="card-title">Loading...</div><div class="card-desc">Fetching the latest resources.</div></div></div>';
    var result = await epSb.from('downloads').select('*').eq('is_active', true).order('created_at', { ascending: false });
    if (result.error) {
      downloadFiles = [];
      grid.innerHTML = '<div class="ex-card"><div class="card-body" style="padding:24px"><div class="card-title">Downloads table not ready</div><div class="card-desc">Run ep_downloads_setup.sql, then refresh this page.</div></div></div>';
      sub.textContent = 'Setup required';
      setCount(0);
      return;
    }
    if (!result.data || !result.data.length) {
      downloadFiles = [];
      grid.innerHTML = '<div class="ex-card"><div class="card-body" style="padding:24px"><div class="card-title">No files yet</div><div class="card-desc">Uploads added in the admin panel will appear here.</div></div></div>';
      sub.textContent = 'No resources published yet';
      setCount(0);
      return;
    }
    downloadFiles = result.data;
    var viewerTier = await getViewerTier();
    setCount(downloadFiles.length);
    sub.textContent = downloadFiles.length + ' published resource' + (downloadFiles.length === 1 ? '' : 's') + ' · preview files without leaving this page';
    grid.innerHTML = '';
    downloadFiles.forEach(function(file, index){
      var accessTier = file.access_tier || 'premium';
      var allowed = canAccessDownload(accessTier, viewerTier);
      var label = accessTier === 'public' ? '✓ Public' : accessTier === 'free' ? 'Free Account' : 'ePeak+';
      var icon = (file.file_type || 'PDF').toUpperCase().slice(0, 3);
      grid.innerHTML += '<div class="ex-card">'
        + '<div class="card-header"><div class="card-icon gold">' + icon + '</div><div class="card-access ' + (allowed ? 'access-premium' : 'access-locked') + '">' + label + '</div></div>'
        + '<div class="card-body"><div class="card-title">' + escapeHtml(file.title || 'Untitled') + '</div><div class="card-desc">' + escapeHtml(file.description || 'Downloadable resource') + '</div>'
        + '<div class="card-meta"><span class="meta-item">☁️ Google Drive</span><span class="meta-item">' + escapeHtml(file.file_type || 'File') + '</span></div>'
        + (allowed
          ? '<button class="card-btn btn-open" onclick="openDownloadPreview(' + index + ')">Vista previa →</button><a class="card-btn btn-partial" style="margin-top:8px;text-decoration:none" href="' + escapeAttr(getDownloadUrl(file.drive_url)) + '" download>⬇ Descargar archivo</a>'
          : '<button class="card-btn btn-locked" onclick="requestDownloadAccess()">🔐 Unlock access</button>')
        + '</div></div>';
    });
  }


  async function getViewerTier(){
    if (!epSb) return 'visitor';
    var authResult = await epSb.auth.getUser();
    var user = authResult.data && authResult.data.user;
    if (!user) return 'visitor';
    var profileResult = await epSb.from('profiles').select('tier,is_admin').eq('id', user.id).single();
    if (profileResult.error || !profileResult.data) return 'free';
    if (profileResult.data.is_admin) return 'premium';
    return profileResult.data.tier || 'free';
  }

  function canAccessDownload(accessTier, viewerTier){
    if (accessTier === 'public') return true;
    if (viewerTier === 'visitor') return false;
    if (accessTier === 'free') return true;
    return viewerTier === 'premium' || viewerTier === 'teacher' || viewerTier === 'courtesy';
  }

  function requestDownloadAccess(){
    if (typeof showAuthModal === 'function' && epSb) {
      epSb.auth.getUser().then(function(result){
        if (result.data && result.data.user) {
          if (typeof showModal === 'function') showModal();
        } else {
          showAuthModal('login');
        }
      });
      return;
    }
    if (typeof showModal === 'function') showModal();
  }

  function setCount(value){
    var count = document.getElementById('downloadsCount');
    if (count) count.textContent = value;
  }

  function openDownloadPreview(index){
    var file = downloadFiles[index];
    if (!file) return;
    document.getElementById('downloadPreviewTitle').textContent = file.title || 'File preview';
    document.getElementById('downloadPreviewDesc').textContent = file.description || 'Vista previa sin salir de ePeak.';
    document.getElementById('downloadPreviewFrame').src = getPreviewUrl(file.drive_url);
    document.getElementById('downloadFileBtn').href = getDownloadUrl(file.drive_url);
    document.getElementById('downloadPreviewPanel').style.display = 'block';
    document.getElementById('downloadPreviewPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeDownloadPreview(){
    var panel = document.getElementById('downloadPreviewPanel');
    var frame = document.getElementById('downloadPreviewFrame');
    if (panel) panel.style.display = 'none';
    if (frame) frame.src = 'about:blank';
  }

  function getDriveFileId(url){
    var value = String(url || '');
    var match = value.match(/\/file\/d\/([^/]+)/) || value.match(/[?&]id=([^&]+)/) || value.match(/\/d\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : '';
  }

  function getPreviewUrl(url){
    var id = getDriveFileId(url);
    return id ? 'https://drive.google.com/file/d/' + encodeURIComponent(id) + '/preview' : url;
  }

  function getDownloadUrl(url){
    var id = getDriveFileId(url);
    return id ? 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(id) : url;
  }

  function escapeHtml(value){
    return String(value || '').replace(/[&<>"]/g, function(ch){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]); });
  }

  function escapeAttr(value){
    return escapeHtml(value).replace(/'/g, '&#39;');
  }

  window.showDownloads = showDownloads;
  window.openDownloadPreview = openDownloadPreview;
  window.closeDownloadPreview = closeDownloadPreview;
  window.requestDownloadAccess = requestDownloadAccess;
})();
(function(){
  var EP_SUPABASE_URL = 'https://jnqekougzmihjqffhuva.supabase.co';
  var EP_SUPABASE_KEY = 'sb_publishable_CbFnopBPwmFgfKfgQJGa8g_Qpbh6C5i';
  var epSb = window.supabase && window.supabase.createClient ? window.supabase.createClient(EP_SUPABASE_URL, EP_SUPABASE_KEY) : null;
  function onReady(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  onReady(function(){
    injectDownloadsAdmin();
    wrapAdminLifecycle();
  });

  function injectDownloadsAdmin(){
    if (document.getElementById('tab-downloads')) return;
    var tabs = document.querySelector('.admin-tabs');
    var logBtn = tabs && Array.prototype.slice.call(tabs.querySelectorAll('.tab-btn')).find(function(btn){ return (btn.textContent || '').indexOf('Audit Log') > -1; });
    if (tabs && logBtn) {
      var btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.innerHTML = '⬇ Downloads <span class="tab-badge" id="badge-downloads">—</span>';
      btn.onclick = function(){ switchTab('downloads', btn); };
      tabs.insertBefore(btn, logBtn);
    }

    var content = document.querySelector('.admin-content');
    var logPanel = document.getElementById('tab-log');
    if (content && logPanel) {
      var panel = document.createElement('div');
      panel.className = 'tab-panel';
      panel.id = 'tab-downloads';
      panel.innerHTML = ''
        + '<div class="section-hdr"><div><h2>Downloads</h2><p>Publish Google Drive links for PDFs, worksheets and class files</p></div><button class="btn btn-primary" onclick="showDownloadModal()">+ New Download</button></div>'
        + '<div class="table-wrap"><div id="downloadsLoading" class="loading"><span class="spinner"></span> Loading downloads...</div>'
        + '<table id="downloadsTable" style="display:none"><thead><tr><th>Title</th><th>Type</th><th>Access</th><th>Status</th><th>Google Drive Link</th><th>Actions</th></tr></thead><tbody id="downloadsBody"></tbody></table>'
        + '<div id="downloadsEmpty" class="empty-state" style="display:none"><div class="empty-icon">⬇</div><p>No downloads yet. Add a Google Drive share link to publish one.</p></div></div>';
      content.insertBefore(panel, logPanel);
    }

    if (!document.getElementById('downloadModal')) {
      var modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = 'downloadModal';
      modal.innerHTML = ''
        + '<div class="modal" style="position:relative"><button class="modal-close" onclick="closeModal(\'downloadModal\')">✕</button>'
        + '<h3>New Download</h3><p>Upload the file to Google Drive, set sharing to “Anyone with the link can view”, then paste the share link here.</p>'
        + '<div class="modal-form"><div class="form-group"><label>Title</label><input id="downloadTitle" placeholder="e.g. TOEFL ITP Structure Worksheet"></div>'
        + '<div class="form-group"><label>Description</label><textarea id="downloadDescription" rows="3" placeholder="What students will download..."></textarea></div>'
        + '<div class="form-group"><label>Google Drive URL</label><input id="downloadUrl" placeholder="https://drive.google.com/file/d/.../view"></div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px"><div class="form-group"><label>File Type</label><input id="downloadType" placeholder="PDF" value="PDF"></div>'
        + '<div class="form-group"><label>Access</label><select id="downloadAccess"><option value="premium">ePeak+</option><option value="free">Free account</option><option value="public">Public</option></select></div></div></div>'
        + '<div class="modal-actions"><button class="btn btn-ghost" onclick="closeModal(\'downloadModal\')">Cancel</button><button class="btn btn-primary" onclick="createDownload()">Publish</button></div></div>';
      document.body.appendChild(modal);
    }
  }

  function wrapAdminLifecycle(){
    var originalSwitchTab = window.switchTab;
    if (typeof originalSwitchTab === 'function' && !originalSwitchTab.__downloadsWrapped) {
      window.switchTab = function(name, btn){
        originalSwitchTab(name, btn);
        if (name === 'downloads') loadDownloadsAdmin();
      };
      window.switchTab.__downloadsWrapped = true;
    }

    var originalShowApp = window.showApp;
    if (typeof originalShowApp === 'function' && !originalShowApp.__downloadsWrapped) {
      window.showApp = function(){
        originalShowApp();
        injectDownloadsAdmin();
        loadDownloadsAdmin();
      };
      window.showApp.__downloadsWrapped = true;
    }
  }

  async function loadDownloadsAdmin(){
    injectDownloadsAdmin();
    var loading = document.getElementById('downloadsLoading');
    var table = document.getElementById('downloadsTable');
    var empty = document.getElementById('downloadsEmpty');
    var badge = document.getElementById('badge-downloads');
    if (!loading || !epSb) return;
    loading.style.display = 'block';
    table.style.display = 'none';
    empty.style.display = 'none';
    var result = await epSb.from('downloads').select('*').order('created_at', { ascending: false });
    loading.style.display = 'none';
    if (result.error || !result.data || result.data.length === 0) {
      empty.style.display = 'block';
      if (badge) badge.textContent = '0';
      return;
    }
    if (badge) badge.textContent = result.data.length;
    table.style.display = 'table';
    var tbody = document.getElementById('downloadsBody');
    tbody.innerHTML = '';
    result.data.forEach(function(d){
      var access = d.access_tier === 'public' ? 'Public' : d.access_tier === 'free' ? 'Free account' : 'ePeak+';
      tbody.innerHTML += '<tr>'
        + '<td><div style="font-weight:600;color:var(--navy)">' + escapeAdmin(d.title) + '</div><div style="font-size:0.75rem;color:var(--muted);max-width:260px">' + escapeAdmin(d.description || '') + '</div></td>'
        + '<td>' + escapeAdmin(d.file_type || 'File') + '</td>'
        + '<td><span class="tier-badge ' + (d.access_tier === 'premium' ? 'tier-premium' : d.access_tier === 'free' ? 'tier-free' : 'tier-teacher') + '">' + access + '</span></td>'
        + '<td>' + (d.is_active ? '<span class="ps-pass">Published</span>' : '<span class="tier-badge tier-free">Hidden</span>') + '</td>'
        + '<td><a href="' + escapeAdmin(d.drive_url) + '" target="_blank" rel="noopener" style="color:var(--navy);font-size:0.78rem">Open Drive ↗</a></td>'
        + '<td style="display:flex;gap:6px"><button class="btn btn-ghost btn-sm" onclick="toggleDownload(\'' + d.id + '\',' + (!d.is_active) + ')">' + (d.is_active ? 'Hide' : 'Publish') + '</button><button class="btn btn-danger btn-sm" onclick="deleteDownload(\'' + d.id + '\')">Delete</button></td>'
        + '</tr>';
    });
  }

  function showDownloadModal(){
    injectDownloadsAdmin();
    document.getElementById('downloadTitle').value = '';
    document.getElementById('downloadDescription').value = '';
    document.getElementById('downloadUrl').value = '';
    document.getElementById('downloadType').value = 'PDF';
    document.getElementById('downloadAccess').value = 'premium';
    document.getElementById('downloadModal').classList.add('show');
  }

  async function createDownload(){
    var authResult = epSb ? await epSb.auth.getUser() : { data: {} };
    var adminUser = authResult.data && authResult.data.user;
    var title = document.getElementById('downloadTitle').value.trim();
    var description = document.getElementById('downloadDescription').value.trim();
    var drive_url = document.getElementById('downloadUrl').value.trim();
    var file_type = document.getElementById('downloadType').value.trim() || 'File';
    var access_tier = document.getElementById('downloadAccess').value;
    if (!title || !drive_url) { showToast('Title and Google Drive URL are required.', 'error'); return; }
    var result = await epSb.from('downloads').insert({ title: title, description: description, drive_url: drive_url, file_type: file_type, access_tier: access_tier, is_active: true, created_by: adminUser && adminUser.id });
    if (result.error) { showToast('Error: ' + result.error.message, 'error'); return; }
    await epSb.from('admin_log').insert({ admin_id: adminUser && adminUser.id, action: 'download_created', details: { title: title, access_tier: access_tier } });
    closeModal('downloadModal');
    showToast('✅ Download published', 'success');
    loadDownloadsAdmin();
  }

  async function toggleDownload(id, is_active){
    var result = await epSb.from('downloads').update({ is_active: is_active }).eq('id', id);
    if (result.error) { showToast('Error: ' + result.error.message, 'error'); return; }
    showToast(is_active ? '✅ Download published' : '🙈 Download hidden', 'success');
    loadDownloadsAdmin();
  }

  async function deleteDownload(id){
    if (!confirm('Delete this download?')) return;
    var result = await epSb.from('downloads').delete().eq('id', id);
    if (result.error) { showToast('Error: ' + result.error.message, 'error'); return; }
    showToast('🗑 Download deleted', 'success');
    loadDownloadsAdmin();
  }

  function escapeAdmin(value){
    return String(value || '').replace(/[&<>"]/g, function(ch){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]); });
  }

  window.loadDownloadsAdmin = loadDownloadsAdmin;
  window.showDownloadModal = showDownloadModal;
  window.createDownload = createDownload;
  window.toggleDownload = toggleDownload;
  window.deleteDownload = deleteDownload;
})();
