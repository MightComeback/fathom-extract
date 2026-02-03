import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { extractFromUrl } from '../src/extractor.js';

function mkResponse(body, { status = 200, headers = {} } = {}) {
  return new Response(body, { status, headers });
}

test('extractFromUrl keeps a helpful error when a resolved mediaUrl is not a video', async (t) => {
  const oldFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = oldFetch;
  });

  const sourceUrl = 'https://example.com/page';
  const badMediaUrl = 'https://example.com/not-a-video';

  const html = `
    <html>
      <head>
        <meta property="og:video" content="${badMediaUrl}">
      </head>
      <body>hello</body>
    </html>
  `;

  globalThis.fetch = async (input, init = {}) => {
    const url = String(typeof input === 'string' ? input : input?.url || '');
    const method = String(init?.method || 'GET').toUpperCase();

    if (url === sourceUrl && method === 'GET') {
      return mkResponse(html, { status: 200, headers: { 'content-type': 'text/html' } });
    }

    // probeContentType() tries HEAD first.
    if (url === badMediaUrl && method === 'HEAD') {
      return mkResponse('', { status: 200, headers: { 'content-type': 'text/html' } });
    }

    // Fallback GET (some servers don't support HEAD)
    if (url === badMediaUrl && method === 'GET') {
      return mkResponse('<html>nope</html>', { status: 200, headers: { 'content-type': 'text/html' } });
    }

    return mkResponse('not found', { status: 404 });
  };

  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'video-extract-test-'));

  const res = await extractFromUrl(sourceUrl, { outDir, noSplit: true });
  assert.equal(res.ok, true);
  assert.equal(res.mediaUrl, '');
  assert.match(res.mediaDownloadError, /does not look like a video/i);
  assert.match(res.mediaDownloadError, /content-type: text\/html/i);
});
