import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

import { extractFromUrl } from '../src/extractor.js';

function loadFixture(name) {
  const p = path.join(process.cwd(), 'test', 'fixtures', name);
  return fs.readFileSync(p, 'utf8');
}

function mkResponse(body, { status = 200, headers = {} } = {}) {
  return new Response(body, { status, headers });
}

test('extractFromUrl prefers YouTube caption VTT over page body text when available', async (t) => {
  const youtubeHtml = loadFixture('youtube-watch.html');

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

    if (/timedtext/i.test(url) && /fmt=vtt/i.test(url)) {
      const vtt = `WEBVTT\n\n00:00.000 --> 00:01.000\nHello\n\n00:01.000 --> 00:02.000\nWorld\n`;
      return mkResponse(vtt, { status: 200, headers: { 'content-type': 'text/vtt' } });
    }

    return mkResponse('not found', { status: 404 });
  };

  const res = await extractFromUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', { noDownload: true, noSplit: true });
  assert.equal(res.ok, true);
  assert.equal(res.text, 'Hello World');
});

test('extractFromUrl uses Loom captions_source_url VTT when present in Apollo state', async (t) => {
  const loomHtml = loadFixture('loom-fake.html');

  const oldFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = oldFetch;
  });

  globalThis.fetch = async (input, init = {}) => {
    const url = String(typeof input === 'string' ? input : input?.url || '');
    const method = String(init?.method || 'GET').toUpperCase();

    if (method === 'HEAD') return mkResponse('', { status: 405 });

    if (/^https:\/\/(?:www\.)?loom\.com\/share\//i.test(url)) {
      return mkResponse(loomHtml, { status: 200, headers: { 'content-type': 'text/html' } });
    }

    if (/cdn\.loom\.com\/captions\.vtt/i.test(url)) {
      const vtt = `WEBVTT\n\n00:00.000 --> 00:01.000\nLoom\n\n00:01.000 --> 00:02.000\nTranscript\n`;
      return mkResponse(vtt, { status: 200, headers: { 'content-type': 'text/vtt' } });
    }

    return mkResponse('not found', { status: 404 });
  };

  const res = await extractFromUrl('https://www.loom.com/share/abc123', { noDownload: true, noSplit: true });
  assert.equal(res.ok, true);
  assert.equal(res.text, 'Loom Transcript');
});
