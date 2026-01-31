import { test } from 'node:test';
import assert from 'node:assert';
import { renderBrief, normalizeUrlLike } from '../src/brief.js';
import { extractFromStdin } from '../src/extractor.js';

test('MIG-14: Resilience - renderBrief handles null/undefined input object', () => {
  const result = renderBrief(undefined);
  assert.ok(result.includes('# Bug report brief'));
  assert.ok(result.includes('Source: (unknown)'));
});

test('MIG-14: Resilience - renderBrief handles partial input object', () => {
  const result = renderBrief({ title: 'Just a title' });
  assert.ok(result.includes('Title: Just a title'));
  assert.ok(result.includes('Source: (unknown)'));
});

test('MIG-14: Resilience - renderBrief handles null values in fields', () => {
  const result = renderBrief({
    source: null,
    title: null,
    date: null,
    description: null,
    author: null,
    transcript: null
  });
  assert.ok(result.includes('Source: (unknown)'));
});

test('MIG-14: Resilience - normalizeUrlLike handles garbage types gracefully', () => {
  assert.strictEqual(normalizeUrlLike(null), '');
  assert.strictEqual(normalizeUrlLike(undefined), '');
  assert.strictEqual(normalizeUrlLike(123), '123'); // Stringified
  assert.strictEqual(normalizeUrlLike({}), '[object Object]');
});

test('MIG-14: Resilience - extractFromStdin handles empty content', () => {
  assert.throws(() => extractFromStdin({ content: '' }), {
    message: 'stdin is empty'
  });
});

test('MIG-14: Resilience - extractFromStdin handles garbage content without crashing', () => {
  const result = extractFromStdin({ content: 'Just some random text without headers' });
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.text, 'Just some random text without headers');
  assert.strictEqual(result.title, '');
});
