import { test } from 'node:test';
import assert from 'node:assert';
import { findTranscriptInObject } from '../src/extractor.js';

test('findTranscriptInObject parses Loom-style JSON transcript', (t) => {
  const json = {
    "transcript": [
      { "start": 0.5, "end": 2.5, "text": "Hello world" },
      { "start": 3.0, "end": 5.0, "text": "This is a test." }
    ]
  };
  
  const text = findTranscriptInObject(json);
  // The helper automatically prefixes timestamps if available.
  // 0.5s -> 0:00
  // 3.0s -> 0:03
  assert.ok(text.includes('0:00: Hello world'));
  assert.ok(text.includes('0:03: This is a test.'));
});

test('findTranscriptInObject parses flat array of objects', (t) => {
  const json = [
    { "startTime": 10, "text": "First segment" },
    { "startTime": 20, "text": "Second segment" }
  ];
  
  const text = findTranscriptInObject(json);
  assert.ok(text.includes('0:10: First segment'));
  assert.ok(text.includes('0:20: Second segment'));
});
