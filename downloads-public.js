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
      + '    <div class="progress-text"><h3>Downloads</h3><p>Worksheets, PDFs and class resources. Sign in to see member resources.</p></div>'
      + '    <div class="progress-stats"><div class="prog-stat"><div class="prog-num" id="downloadsCount">0</div><div class="prog-label">Files</div></div></div>'
      + '  </div>'
      + '  <div class="section-header"><h2>Resource Library</h2><p id="downloadsSub">Loading files...</p></div>'
      + '  <div class="cards-grid" id="downloadsGrid"></div>'
      + '  <div class="download-preview-overlay" id="downloadPreviewModal" role="dialog" aria-modal="true" aria-labelledby="downloadPreviewTitle" aria-describedby="downloadPreviewDesc" hidden>'
      + '    <div class="download-preview-modal" role="document"><div class="download-preview-header">'
      + '      <div class="download-preview-heading"><div id="downloadPreviewTitle" class="download-preview-title">Vista previa del archivo</div><div id="downloadPreviewDesc" class="download-preview-desc">Vista previa sin salir de ePeak.</div></div>'
      + '      <div class="download-preview-actions"><a id="downloadFileBtn" class="upgrade-btn" href="#" download>⬇ Descargar archivo</a><button type="button" class="download-preview-close" aria-label="Cerrar vista previa" onclick="closeDownloadPreview()">×</button></div>'
      + '    </div><div class="download-preview-frame-wrap"><iframe id="downloadPreviewFrame" title="Download preview" loading="lazy"></iframe></div></div>'
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
    var auth = await epSb.auth.getSession();
    var user = auth.data && auth.data.session && auth.data.session.user;
    var profile = null;
    if (user) {
      var profileResult = await epSb.from('profiles').select('tier,is_admin').eq('id', user.id).single();
      profile = profileResult.data;
    }
    var results = await Promise.all([
      epSb.from('download_categories').select('*').eq('is_active', true).order('sort_order').order('created_at'),
      epSb.from('downloads').select('*').eq('is_active', true).order('sort_order').order('created_at', { ascending: false })
    ]);
    var categories = results[0].data || [];
    var result = results[1];
    if (results[0].error || result.error) {
      downloadFiles = [];
      grid.innerHTML = '<div class="ex-card"><div class="card-body" style="padding:24px"><div class="card-title">Downloads table not ready</div><div class="card-desc">Run supabase_downloads_setup.sql, then refresh this page.</div></div></div>';
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
    setCount(downloadFiles.length);
    sub.textContent = downloadFiles.length + ' published resource' + (downloadFiles.length === 1 ? '' : 's') + ' · preview files without leaving this page';
    grid.innerHTML = '';
    grid.style.display = 'block';
    var groups = categories.map(function(category){ return { id: category.id, name: category.name, accessTier: category.access_tier || 'premium', files: [] }; });
    var uncategorized = { id: null, name: 'General Downloads', accessTier: 'free', files: [] };
    downloadFiles.forEach(function(file, index){
      var group = groups.find(function(item){ return item.id === file.category_id; }) || uncategorized;
      file._downloadAccessTier = group.accessTier;
      group.files.push({ file: file, index: index });
    });
    if (uncategorized.files.length) groups.push(uncategorized);
    groups.filter(function(group){ return group.files.length; }).forEach(function(group, groupIndex){
      var cards = '';
      group.files.forEach(function(item){
      var file = item.file;
      var index = item.index;
      var accessTier = group.accessTier;
      var allowed = accessTier === 'public' || (accessTier === 'free' && !!user) || (accessTier === 'premium' && !!profile && (profile.is_admin || ['premium','teacher','courtesy'].indexOf(profile.tier) > -1));
      var label = accessTier === 'public' ? '✓ Public' : accessTier === 'free' ? 'Free Account' : 'ePeak+';
      var icon = (file.file_type || 'PDF').toUpperCase().slice(0, 3);
      cards += '<div class="ex-card">'
        + '<div class="card-header"><div class="card-icon gold">' + icon + '</div><div class="card-access access-premium">' + label + '</div></div>'
        + '<div class="card-body"><div class="card-title">' + escapeHtml(file.title || 'Untitled') + '</div><div class="card-desc">' + escapeHtml(file.description || 'Downloadable resource') + '</div>'
        + '<div class="card-meta"><span class="meta-item">☁️ Google Drive</span><span class="meta-item">' + escapeHtml(file.file_type || 'File') + '</span></div>'
        + (allowed ? '<button class="card-btn btn-open" onclick="openDownloadPreview(' + index + ', this)">Vista previa →</button><a class="card-btn btn-partial" style="margin-top:8px;text-decoration:none" href="' + escapeAttr(getDownloadUrl(file.drive_url)) + '" download>⬇ Descargar archivo</a>' : '<button class="card-btn btn-locked" onclick="' + (!user ? "showAuthModal(\'login\')" : 'showModal()') + '">🔐 Unlock access</button>')
        + '</div></div>';
      });
      var categoryId = 'downloadCategory' + groupIndex;
      var openClass = groupIndex === 0 ? ' is-open' : '';
      var expanded = groupIndex === 0 ? 'true' : 'false';
      grid.innerHTML += '<section class="download-category' + openClass + '"><button type="button" class="download-category-toggle" aria-expanded="' + expanded + '" aria-controls="' + categoryId + '" onclick="toggleDownloadCategory(this)"><span><span class="download-category-title">' + escapeHtml(group.name) + '</span><span class="download-category-count">· ' + group.files.length + ' recurso' + (group.files.length === 1 ? '' : 's') + '</span></span><span class="download-category-chevron" aria-hidden="true">⌄</span></button><div class="download-category-panel" id="' + categoryId + '"><div class="download-category-panel-inner"><div class="cards-grid">' + cards + '</div></div></div></section>';
    });
  }

  function setCount(value){
    var count = document.getElementById('downloadsCount');
    if (count) count.textContent = value;
  }

  function toggleDownloadCategory(button){
    var section = button && button.closest('.download-category');
    if (!section) return;
    var isOpen = section.classList.toggle('is-open');
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  function openDownloadPreview(index, trigger){
    var file = downloadFiles[index];
    if (!file) return;
    window.downloadPreviewTrigger = trigger || document.activeElement;
    var modal = document.getElementById('downloadPreviewModal');
    var frame = document.getElementById('downloadPreviewFrame');
    document.getElementById('downloadPreviewTitle').textContent = file.title || 'File preview';
    document.getElementById('downloadPreviewDesc').textContent = file.description || 'Vista previa sin salir de ePeak.';
    frame.src = getPreviewUrl(file.drive_url);
    document.getElementById('downloadFileBtn').href = getDownloadUrl(file.drive_url);
    modal.hidden = false;
    modal.classList.add('show');
    document.body.classList.add('download-preview-lock');
    document.addEventListener('keydown', handleDownloadPreviewKeydown);
    modal.addEventListener('click', handleDownloadPreviewBackdropClick);
    setTimeout(function(){ var close = modal.querySelector('.download-preview-close'); if (close) close.focus(); }, 0);
  }

  function closeDownloadPreview(){
    var modal = document.getElementById('downloadPreviewModal');
    var frame = document.getElementById('downloadPreviewFrame');
    if (modal) { modal.classList.remove('show'); modal.hidden = true; modal.removeEventListener('click', handleDownloadPreviewBackdropClick); }
    if (frame) frame.src = 'about:blank';
    document.body.classList.remove('download-preview-lock');
    document.removeEventListener('keydown', handleDownloadPreviewKeydown);
    if (window.downloadPreviewTrigger && typeof window.downloadPreviewTrigger.focus === 'function') window.downloadPreviewTrigger.focus();
    window.downloadPreviewTrigger = null;
  }

  function handleDownloadPreviewBackdropClick(event){
    if (event.target && event.target.id === 'downloadPreviewModal') closeDownloadPreview();
  }

  function handleDownloadPreviewKeydown(event){
    if (event.key === 'Escape') { closeDownloadPreview(); return; }
    if (event.key !== 'Tab') return;
    var modal = document.getElementById('downloadPreviewModal');
    if (!modal || modal.hidden) return;
    var focusable = Array.prototype.slice.call(modal.querySelectorAll('a[href],button:not([disabled]),iframe,[tabindex]:not([tabindex="-1"])')).filter(function(el){ return el.offsetParent !== null; });
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
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
  window.toggleDownloadCategory = toggleDownloadCategory;
  window.openDownloadPreview = openDownloadPreview;
  window.closeDownloadPreview = closeDownloadPreview;
})();
