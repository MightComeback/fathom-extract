import { test } from 'node:test';
import assert from 'node:assert';
import { extractLoomMetadataFromSession } from '../src/loom.js';

test('extractLoomMetadataFromSession extracts fields from standard session shape', () => {
  const session = {
    name: 'My Video',
    description: 'Desc',
    duration: 123,
    streams: {
      m3u8: 'https://example.com/video.m3u8',
      mp4: 'https://example.com/video.mp4'
    }
  };

  const meta = extractLoomMetadataFromSession(session);
  assert.strictEqual(meta.title, 'My Video');
  assert.strictEqual(meta.description, 'Desc');
  assert.strictEqual(meta.duration, 123);
  assert.strictEqual(meta.mediaUrl, 'https://example.com/video.m3u8');
});

test('extractLoomMetadataFromSession prioritizes m3u8 over mp4', () => {
  const session = {
    streams: {
      m3u8: 'https://example.com/video.m3u8',
      mp4: 'https://example.com/video.mp4'
    }
  };
  const meta = extractLoomMetadataFromSession(session);
  assert.strictEqual(meta.mediaUrl, 'https://example.com/video.m3u8');
});

test('extractLoomMetadataFromSession falls back to mp4', () => {
  const session = {
    streams: {
      mp4: 'https://example.com/video.mp4'
    }
  };
  const meta = extractLoomMetadataFromSession(session);
  assert.strictEqual(meta.mediaUrl, 'https://example.com/video.mp4');
});

test('extractLoomMetadataFromSession handles missing streams', () => {
  const session = { name: 'Foo' };
  const meta = extractLoomMetadataFromSession(session);
  assert.strictEqual(meta.title, 'Foo');
  assert.strictEqual(meta.mediaUrl, null);
});

test('extractLoomMetadataFromSession handles null/invalid input', () => {
  assert.strictEqual(extractLoomMetadataFromSession(null), null);
  assert.strictEqual(extractLoomMetadataFromSession('foo'), null);
});
