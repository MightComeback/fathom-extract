import { test } from 'node:test';
import assert from 'node:assert';
import { normalizeFathomUrl, fathomNonVideoReason } from '../src/providers/fathom.js';

test('normalizeFathomUrl canonicalizes common Fathom URL shapes', () => {
  // www normalization
  assert.strictEqual(
    normalizeFathomUrl('https://www.fathom.video/share/abc123'),
    'https://fathom.video/share/abc123'
  );

  // recording path -> share path
  assert.strictEqual(
    normalizeFathomUrl('https://fathom.video/recording/abc123'),
    'https://fathom.video/share/abc123'
  );

  // app subdomain -> canonical
  assert.strictEqual(
    normalizeFathomUrl('https://app.fathom.video/share/abc123'),
    'https://fathom.video/share/abc123'
  );
});

test('normalizeFathomUrl preserves deep-link timestamps', () => {
  assert.strictEqual(
    normalizeFathomUrl('https://www.fathom.video/share/abc123?t=30s'),
    'https://fathom.video/share/abc123?t=30s'
  );

  assert.strictEqual(
    normalizeFathomUrl('https://fathom.video/share/abc123?start=45'),
    'https://fathom.video/share/abc123?t=45'
  );

  // Hash deep-links should also be preserved.
  assert.strictEqual(
    normalizeFathomUrl('https://fathom.video/share/abc123#t=60'),
    'https://fathom.video/share/abc123?t=60'
  );
});

test('normalizeFathomUrl tolerates chat wrappers and punctuation (provider parity)', () => {
  // Slack-style <url|label>
  assert.strictEqual(
    normalizeFathomUrl('<https://www.fathom.video/share/abc123|Fathom>'),
    'https://fathom.video/share/abc123'
  );

  // Angle brackets
  assert.strictEqual(
    normalizeFathomUrl('<https://fathom.video/share/abc123>'),
    'https://fathom.video/share/abc123'
  );

  // Quotes
  assert.strictEqual(
    normalizeFathomUrl('"https://fathom.video/share/abc123"'),
    'https://fathom.video/share/abc123'
  );

  assert.strictEqual(
    normalizeFathomUrl('"https://fathom.video/share/abc123"'),
    'https://fathom.video/share/abc123'
  );

  // Parentheses
  assert.strictEqual(
    normalizeFathomUrl('(https://fathom.video/share/abc123)'),
    'https://fathom.video/share/abc123'
  );

  // Trailing punctuation
  assert.strictEqual(
    normalizeFathomUrl('https://fathom.video/share/abc123.'),
    'https://fathom.video/share/abc123'
  );

  assert.strictEqual(
    normalizeFathomUrl('https://fathom.video/share/abc123,'),
    'https://fathom.video/share/abc123'
  );
});

test('normalizeFathomUrl tolerates protocol-relative URLs', () => {
  assert.strictEqual(
    normalizeFathomUrl('//fathom.video/share/abc123'),
    'https://fathom.video/share/abc123'
  );
});

test('normalizeFathomUrl passes through non-Fathom URLs unchanged', () => {
  assert.strictEqual(
    normalizeFathomUrl('https://example.com/video'),
    'https://example.com/video'
  );
});

test('fathomNonVideoReason returns actionable guidance for non-video pages', () => {
  // Common non-video paths
  assert.ok(
    fathomNonVideoReason('https://fathom.video/login').includes('does not appear to be a direct video link')
  );

  assert.ok(
    fathomNonVideoReason('https://fathom.video/pricing').includes('does not appear to be a direct video link')
  );

  assert.ok(
    fathomNonVideoReason('https://fathom.video/blog').includes('does not appear to be a direct video link')
  );

  assert.ok(
    fathomNonVideoReason('https://fathom.video/dashboard').includes('does not appear to be a direct video link')
  );
});

test('fathomNonVideoReason returns empty string for valid video URLs', () => {
  assert.strictEqual(fathomNonVideoReason('https://fathom.video/share/abc123'), '');
  assert.strictEqual(fathomNonVideoReason('https://fathom.video/recording/xyz789'), '');
  assert.strictEqual(fathomNonVideoReason('https://www.fathom.video/share/abc123'), '');
});

test('fathomNonVideoReason returns empty string for non-Fathom domains', () => {
  assert.strictEqual(fathomNonVideoReason('https://example.com/login'), '');
  assert.strictEqual(fathomNonVideoReason('https://loom.com/share/123'), '');
});
