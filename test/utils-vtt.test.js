import { test } from 'node:test';
import assert from 'node:assert';
import { parseSimpleVtt } from '../src/utils.js';

test('parseSimpleVtt extracts text from basic VTT', (t) => {
  const vtt = `WEBVTT

00:00:01.000 --> 00:00:04.000
Hello world

00:00:04.000 --> 00:00:08.000
This is a test.
`;
  const text = parseSimpleVtt(vtt);
  assert.equal(text, 'Hello world This is a test.');
});

test('parseSimpleVtt handles cues with identifiers', (t) => {
  const vtt = `WEBVTT

1
00:00:01.000 --> 00:00:04.000
Hello

2
00:00:04.000 --> 00:00:08.000
World
`;
  const text = parseSimpleVtt(vtt);
  assert.equal(text, 'Hello World');
});

test('parseSimpleVtt ignores NOTE/STYLE blocks', (t) => {
  const vtt = `WEBVTT
X-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:0

NOTE
This is a note that should be ignored.
Even across multiple lines.

STYLE
::cue { color: lime; }

00:00.000 --> 00:01.000
Hello

00:01.000 --> 00:02.000
World
`;
  const text = parseSimpleVtt(vtt);
  assert.equal(text, 'Hello World');
});

test('parseSimpleVtt returns empty string for empty input', (t) => {
  assert.equal(parseSimpleVtt(''), '');
  assert.equal(parseSimpleVtt(null), '');
});
