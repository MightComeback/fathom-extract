import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { normalizeUrlLike } from '../src/brief.js';

// MIG-14: provider parity — Vimeo dashboard "manage" links should normalize
// to the canonical clip URL so downstream extraction behaves like Fathom.

describe('MIG-14: Vimeo manage URL normalization', () => {
  test('normalizeUrlLike canonicalizes vimeo.com/manage/videos/<id> to https://vimeo.com/<id>', () => {
    assert.equal(
      normalizeUrlLike('https://vimeo.com/manage/videos/123456789?share=copy'),
      'https://vimeo.com/123456789',
    );
  });

  test('normalizeUrlLike canonicalizes vimeo.com/manage/video/<id> to https://vimeo.com/<id>', () => {
    assert.equal(normalizeUrlLike('https://vimeo.com/manage/video/123456789'), 'https://vimeo.com/123456789');
  });
});
