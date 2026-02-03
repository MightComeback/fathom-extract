import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import ytdl from 'ytdl-core';
import { extractFromUrl } from '../src/extractor.js';

function loadFixture(name) {
  const p = path.join(process.cwd(), 'test', 'fixtures', name);
  return fs.readFileSync(p, 'utf8');
}

function mkResponse(body, { status = 200, headers = {} } = {}) {
  return new Response(body, { status, headers });
}

test('extractFromUrl preserves a helpful reason when YouTube mediaUrl cannot be resolved', async (t) => {
  const youtubeHtml = loadFixture('youtube-watch.html');

  // Force ytdl-core to fail so mediaUrl resolution returns null.
  mock.method(ytdl, 'getInfo', async () => {
    throw new Error('blocked');
  });

  const oldFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = oldFetch;
  });

  globalThis.fetch = async (input, init = {}) => {
    const url = String(typeof input === 'string' ? input : input?.url || '');
    const method = String(init?.method || 'GET').toUpperCase();

    if (method === 'HEAD') return mkResponse('', { status: 405 });

    if (/^https:\/\/(?:www\.)?youtube\.com\/watch\b/i.test(url)) {
      return mkResponse(youtubeHtml, { status: 200, headers: { 'content-type': 'text/html' } });
    }

    // No captions for this test.
    return mkResponse('not found', { status: 404 });
  };

  const res = await extractFromUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { noSplit: true });
  assert.equal(res.ok, true);
  assert.equal(res.mediaUrl, '');
  assert.match(String(res.mediaDownloadError || ''), /Unable to resolve a downloadable YouTube media URL/i);
});
