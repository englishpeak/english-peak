export function googleDriveImageUrl(sharingUrl) {
  if (!sharingUrl) return '';
  try {
    const url = new URL(sharingUrl);
    if (!/(^|\.)drive\.google\.com$/.test(url.hostname)) return sharingUrl;
    const fileId = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get('id');
    return fileId ? `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}` : '';
  } catch { return ''; }
}

export function dropboxAudioUrl(sharingUrl) {
  if (!sharingUrl) return '';
  try {
    const url = new URL(sharingUrl);
    if (!/(^|\.)dropbox\.com$/.test(url.hostname)) return sharingUrl;
    url.searchParams.delete('dl');
    url.searchParams.set('raw', '1');
    return url.toString();
  } catch { return ''; }
}
