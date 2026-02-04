import { test } from 'node:test';
import assert from 'node:assert/strict';

import { extractFromUrl } from '../src/extractor.js';

test('MIG-14: Vimeo on-demand pages fail with a clear actionable error', async (t) => {
  // Ensure we never hit the network: this should fail before any fetch.
  const oldFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = oldFetch;
  });
  globalThis.fetch = async () => {
    throw new Error('unexpected fetch');
  };

  const res = await extractFromUrl('https://vimeo.com/ondemand/somefilm');
  assert.equal(res.ok, false);
  assert.match(res.fetchError, /Vimeo on-demand pages are not supported/i);
  assert.match(res.text, /Vimeo notes:/i);
});
