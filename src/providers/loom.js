export function isLoomUrl(url) {
  return /loom\.com\/(share|v)/.test(url);
}

export function extractLoomMetadataFromHtml(html) {
  return {}; // detailed implementation later
}

export function parseLoomTranscript(text) {
  return text; // placeholder
}

export async function fetchLoomOembed(url) {
  return null;
}
