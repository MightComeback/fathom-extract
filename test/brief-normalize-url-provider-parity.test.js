import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeUrlLike } from '../src/brief.js';

describe('normalizeUrlLike - provider parity', () => {
  test('canonicalizes Vimeo player embed URLs (drops embed params, keeps time)', () => {
    assert.equal(
      normalizeUrlLike(
        'https://player.vimeo.com/video/12345?badge=0&autopause=0&player_id=0&app_id=58479#t=1m2s'
      ),
      'https://vimeo.com/12345#t=1m2s'
    );
  });

  test('canonicalizes Vimeo player embed URLs (preserves unlisted hash + time)', () => {
    assert.equal(
      normalizeUrlLike(
        'https://player.vimeo.com/video/12345?h=abcdef&badge=0#t=90s'
      ),
      'https://vimeo.com/12345?h=abcdef#t=90s'
    );
  });

  test('canonicalizes Loom embed URLs (preserves sid + timestamp deep-link)', () => {
    assert.equal(
      normalizeUrlLike(
        'https://www.loom.com/embed/abcdEFGHijk?sid=deadbeef#t=30s'
      ),
      'https://loom.com/share/abcdEFGHijk?sid=deadbeef&t=30s'
    );
  });

  test('does not canonicalize Vimeo review URLs (must preserve token)', () => {
    assert.equal(
      normalizeUrlLike(
        'https://vimeo.com/123456789/review/abcdef123456/abcdef1234?utm_source=x#t=10s'
      ),
      'https://vimeo.com/123456789/review/abcdef123456/abcdef1234#t=10s'
    );
  });
});
