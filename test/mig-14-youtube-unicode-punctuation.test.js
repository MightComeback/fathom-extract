import test from 'node:test';
import assert from 'node:assert/strict';

import { extractYoutubeId, normalizeYoutubeUrl } from '../src/providers/youtube.js';

test('MIG-14: YouTube URL helpers tolerate unicode trailing punctuation and wrappers', () => {
  const id = 'dQw4w9WgXcQ';

  // Common chat copy/paste variants
  assert.equal(extractYoutubeId(`“https://youtu.be/${id}?t=43”`), id);
  assert.equal(extractYoutubeId(`«https://www.youtube.com/watch?v=${id}&t=43»`), id);
  assert.equal(extractYoutubeId(`https://youtu.be/${id}?t=43…。`), id);
  assert.equal(extractYoutubeId(`(https://youtu.be/${id}?t=43)）`), id);

  // Also ensure normalization keeps the timestamp.
  assert.equal(normalizeYoutubeUrl(`«https://youtu.be/${id}#t=1m2s»`), `https://youtube.com/watch?v=${id}&t=1m2s`);
});
