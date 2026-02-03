import test from 'node:test';
import assert from 'node:assert/strict';

import { extractFromUrl } from '../src/extractor.js';

test('extractFromUrl falls back to YouTube oEmbed for title when ytInitialPlayerResponse is missing', async () => {
  const origFetch = globalThis.fetch;

  // Note: extractor normalizes www.youtube.com → youtube.com
  const videoUrl = 'https://youtube.com/watch?v=aaaaaaaaaaa';
  const oembedBase = 'https://www.youtube.com/oembed';

  globalThis.fetch = async (input, init = {}) => {
    const url = String(input);

    // Primary fetch: pretend the YouTube page is a minimal shell without ytInitialPlayerResponse.
    if (url === videoUrl && (!init.method || init.method === 'GET')) {
      const html = `<!doctype html><html><head>
        <meta property="og:video" content="https://cdn.example.com/video.mp4" />
      </head><body></body></html>`;
      return new Response(html, {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }

    // oEmbed fallback
    if (url.startsWith(oembedBase)) {
      const u = new URL(url);
      assert.equal(u.searchParams.get('format'), 'json');
      assert.equal(u.searchParams.get('url'), videoUrl);

      return new Response(
        JSON.stringify({ title: 'oEmbed Title', author_name: 'Channel Name' }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      );
    }

    throw new Error(`Unexpected fetch: ${url} (${init.method || 'GET'})`);
  };

  try {
    const res = await extractFromUrl(videoUrl, { noDownload: true });
    assert.equal(res.ok, true);
    assert.equal(res.title, 'oEmbed Title');
    assert.equal(res.mediaUrl, 'https://cdn.example.com/video.mp4');
  } finally {
    globalThis.fetch = origFetch;
  }
});
