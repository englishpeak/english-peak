export function googleDriveImageUrl(sharingUrl) {
  if (!sharingUrl) return '';
  try {
    const url = new URL(sharingUrl);
    if (!/(^|\.)drive\.google\.com$/.test(url.hostname)) return sharingUrl;
    const fileId = url.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || url.searchParams.get('id');
    return fileId ? `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}` : '';
  } catch { return ''; }
}

export function getDropboxDirectUrl(url) {
  if (!url) return '';
  try {
    const parsedUrl = new URL(url);
    const isDropboxHost = parsedUrl.hostname === 'www.dropbox.com' || parsedUrl.hostname === 'dropbox.com';
    if (!isDropboxHost) return url;
    parsedUrl.searchParams.delete('dl');
    parsedUrl.searchParams.set('raw', '1');
    return parsedUrl.toString();
  } catch { return url; }
}

export const dropboxAudioUrl = getDropboxDirectUrl;
