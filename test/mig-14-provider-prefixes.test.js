import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeUrlLike } from '../src/brief.js';

test('normalizeUrlLike strips YouTube prefixes beyond "link" (video/recording/share)', () => {
  const input = 'YouTube video: https://youtu.be/dQw4w9WgXcQ?t=62';
  assert.equal(normalizeUrlLike(input), 'https://youtube.com/watch?v=dQw4w9WgXcQ&t=62');

  const input2 = 'YouTube recording - https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  assert.equal(normalizeUrlLike(input2), 'https://youtube.com/watch?v=dQw4w9WgXcQ');

  const input3 = 'YouTube share: https://www.youtube.com/shorts/dQw4w9WgXcQ';
  assert.equal(normalizeUrlLike(input3), 'https://youtube.com/watch?v=dQw4w9WgXcQ');
});

test('normalizeUrlLike strips Vimeo/Loom prefixes beyond "link" (video/recording/share)', () => {
  const vimeo = 'Vimeo recording: https://vimeo.com/123456789';
  assert.equal(normalizeUrlLike(vimeo), 'https://vimeo.com/123456789');

  const loom = 'Loom share: https://www.loom.com/share/abcDEF123';
  assert.equal(normalizeUrlLike(loom), 'https://loom.com/share/abcDEF123');
});
