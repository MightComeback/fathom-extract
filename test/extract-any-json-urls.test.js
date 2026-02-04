import test from 'node:test';
import assert from 'node:assert/strict';
import { extractAnyJsonUrls } from '../src/extractor.js';

test('extractAnyJsonUrls extracts JSON-style URLs and unescapes \\/ + \\u002F', () => {
  const html = [
    '<script>',
    'window.__DATA__ = {',
    '  "downloadUrl": "https:\\/\\/cdn.example.com\\/file.mp4?x=1\\u0026y=2"',
    '};',
    '</script>',
  ].join('\n');

  assert.equal(
    extractAnyJsonUrls(html, ['downloadUrl']),
    'https://cdn.example.com/file.mp4?x=1&y=2'
  );
});

test('extractAnyJsonUrls extracts JS-style single-quoted URLs', () => {
  const html = "<script>var player = { mediaUrl: 'https://example.com/video.mp4?token=abc' };</script>";
  assert.equal(
    extractAnyJsonUrls(html, ['mediaUrl', 'videoUrl']),
    'https://example.com/video.mp4?token=abc'
  );
});

test('extractAnyJsonUrls extracts unquoted URL tokens (http/https and protocol-relative)', () => {
  const html = [
    '<script>',
    'window.__PLAYER__ = {',
    '  mediaUrl: https:\/\/cdn.example.com\/video.mp4?x=1\u0026y=2,',
    '  backupUrl: \/\/cdn2.example.com\/alt.mp4',
    '};',
    '</script>',
  ].join('\n');

  assert.equal(
    extractAnyJsonUrls(html, ['mediaUrl']),
    'https://cdn.example.com/video.mp4?x=1&y=2'
  );

  assert.equal(
    extractAnyJsonUrls(html, ['backupUrl']),
    'https://cdn2.example.com/alt.mp4'
  );
});
