import test from 'node:test';
import assert from 'node:assert/strict';

import { parseLoomTranscript } from '../src/providers/loom.js';

test('parseLoomTranscript cleans lightweight markup + decodes common entities in JSON transcripts (provider parity)', () => {
  const input = JSON.stringify({
    paragraphs: [
      { startTime: 0, text: '<c>Hi &amp; welcome</c>' },
      { startTime: 2, text: 'We\u2019re testing &mdash; entities &nbsp;and "quotes"' },
      { startTime: 4, text: 'Numeric: &#x2019; and &#8217;.' },
    ],
  });

  const out = parseLoomTranscript(input);
  assert.ok(out.includes('0:00 Hi & welcome'));
  assert.ok(out.includes('0:02 We’re testing — entities and "quotes"'));
  assert.ok(out.includes("0:04 Numeric: ’ and ’."));
  assert.ok(!out.includes('<c>'));
  assert.ok(!out.includes('&amp;'));
});
