import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { extractLoomMetadataFromHtml } from '../src/loom.js';

test('Loom: extract metadata from Apollo state', () => {
  const fixturePath = path.join(process.cwd(), 'test/fixtures/loom-fake.html');
  const html = fs.readFileSync(fixturePath, 'utf8');
  
  const meta = extractLoomMetadataFromHtml(html);
  
  assert.ok(meta, 'Should return metadata object');
  assert.equal(meta.title, 'Test Loom Video');
  assert.equal(meta.description, 'This is a test description');
  assert.equal(meta.duration, 120);
  assert.equal(meta.thumbnailUrl, 'https://cdn.loom.com/poster.jpg');
  assert.equal(meta.author, 'Alice Bob');
  assert.equal(meta.mediaUrl, 'https://cdn.loom.com/video.m3u8');
  assert.equal(meta.transcriptUrl, 'https://cdn.loom.com/captions.vtt');
});
