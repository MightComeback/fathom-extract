export function isYoutubeUrl(url) {
  return /youtube\.com|youtu\.be/.test(url);
}

export function extractYoutubeMetadataFromHtml(html) {
  return {};
}

export async function fetchYoutubeOembed(url) {
  return null;
}

export async function fetchYoutubeMediaUrl(url) {
  return null;
}
