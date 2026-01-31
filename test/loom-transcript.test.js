import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { parseLoomTranscript } from '../src/providers/loom.js';

test('parseLoomTranscript formats long timestamps correctly', () => {
  const json = JSON.stringify({
    segments: [
      { start: 3665, text: "Over an hour in" } // 1h 1m 5s = 3600 + 60 + 5
    ]
  });

  const result = parseLoomTranscript(json);
  // Current behavior is likely "61:05 Over an hour in"
  // We want "1:01:05 Over an hour in"
  
  assert.match(result, /^1:01:05/, `Expected timestamp 1:01:05, got "${result}"`);
});
