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
      + '    <div class="progress-text"><h3>Downloads</h3><p>Worksheets, PDFs and class resources hosted in Google Drive. Sign in to see member resources.</p></div>'
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
    downloadFiles.forEach(function(file, index){
      var accessTier = file.access_tier || 'premium';
      var label = accessTier === 'public' ? '✓ Public' : accessTier === 'free' ? 'Free Account' : 'ePeak+';
      var icon = (file.file_type || 'PDF').toUpperCase().slice(0, 3);
      grid.innerHTML += '<div class="ex-card">'
        + '<div class="card-header"><div class="card-icon gold">' + icon + '</div><div class="card-access access-premium">' + label + '</div></div>'
        + '<div class="card-body"><div class="card-title">' + escapeHtml(file.title || 'Untitled') + '</div><div class="card-desc">' + escapeHtml(file.description || 'Downloadable resource') + '</div>'
        + '<div class="card-meta"><span class="meta-item">☁️ Google Drive</span><span class="meta-item">' + escapeHtml(file.file_type || 'File') + '</span></div>'
        + '<button class="card-btn btn-open" onclick="openDownloadPreview(' + index + ')">Vista previa →</button>'
        + '<a class="card-btn btn-partial" style="margin-top:8px;text-decoration:none" href="' + escapeAttr(getDownloadUrl(file.drive_url)) + '" download>⬇ Descargar archivo</a>'
        + '</div></div>';
    });
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
})();
