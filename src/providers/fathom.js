export function isFathomUrl(url) {
  return /fathom\.video/.test(url);
}

export async function extractFathom(url, page) {
  return { title: 'Fathom Video', transcript: '', sourceUrl: url };
}
