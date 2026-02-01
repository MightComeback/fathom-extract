import { test } from 'node:test';
import assert from 'node:assert';
import { isLoomUrl, extractLoomId, parseLoomTranscript } from '../src/providers/loom.js';

test('Loom Provider: isLoomUrl', () => {
  assert.strictEqual(isLoomUrl('https://www.loom.com/share/abc12345'), true);
  assert.strictEqual(isLoomUrl('https://loom.com/v/xyz98765'), true);
  assert.strictEqual(isLoomUrl('https://loom.com/embed/12345678'), true);
  
  assert.strictEqual(isLoomUrl('https://google.com'), false);
  assert.strictEqual(isLoomUrl('https://loom.com/other/stuff'), false);
});

test('Loom Provider: extractLoomId', () => {
  assert.strictEqual(extractLoomId('https://www.loom.com/share/abc-123'), 'abc-123');
  assert.strictEqual(extractLoomId('https://loom.com/v/xyz_987'), 'xyz_987');
  assert.strictEqual(extractLoomId('https://loom.com/embed/123-456'), '123-456');
});

test('Loom Provider: parseLoomTranscript json', () => {
  const json = JSON.stringify({
    paragraphs: [
      { startTime: 10, text: "Hello there" },
      { startTime: 65, text: "General Kenobi" }
    ]
  });
  
  const res = parseLoomTranscript(json);
  // Expect formatSeconds to format 10 -> 0:10 and 65 -> 1:05
  // We check for content inclusion primarily
  assert.match(res, /0:10\s+Hello there/);
  assert.match(res, /1:05\s+General Kenobi/);
});
