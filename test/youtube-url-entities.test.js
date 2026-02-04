import { test } from 'node:test';
import assert from 'node:assert';
import { extractYoutubeId, isYoutubeDomain, isYoutubeClipUrl, normalizeYoutubeUrl } from '../src/providers/youtube.js';

test('YouTube provider helpers tolerate HTML-entity encoded query separators', () => {
  const raw = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&amp;t=43s';

  assert.strictEqual(extractYoutubeId(raw), 'dQw4w9WgXcQ');
  assert.strictEqual(isYoutubeDomain(raw), true);

  // normalizeYoutubeUrl should preserve the timestamp and remove the hash.
  assert.strictEqual(
    normalizeYoutubeUrl(raw),
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=43s'
  );
});

test('YouTube provider helpers tolerate angle-wrapped and Slack-style links', () => {
  const angle = '<https://youtube.com/watch?v=dQw4w9WgXcQ&t=1m2s>';
  assert.strictEqual(extractYoutubeId(angle), 'dQw4w9WgXcQ');

  const slack = '<https://www.youtube.com/clip/Ugkxabc123xyz|watch this clip>';
  assert.strictEqual(isYoutubeClipUrl(slack), true);
});
