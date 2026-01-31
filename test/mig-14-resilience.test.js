import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderBrief } from '../src/brief.js';

test('MIG-14: renderBrief is resilient to missing optional fields', () => {
  // Call with empty object
  const result = renderBrief({});
  
  assert.ok(typeof result === 'string', 'Should return a string');
  assert.ok(result.includes('# Bug report brief'), 'Should contain header');
  assert.ok(result.includes('Source: (unknown)'), 'Should handle missing source');
  assert.ok(result.includes('Title: (unknown)'), 'Should handle missing title');
  assert.ok(result.includes('## Repro steps'), 'Should contain repro steps section');
  assert.ok(result.includes('1. \n2. \n3. '), 'Should contain default repro placeholders');
  assert.ok(result.includes('## Expected vs actual'), 'Should contain expected/actual section');
  
  // Call with null inputs where optional
  const result2 = renderBrief({
    source: null,
    title: undefined,
    description: null,
    transcript: null
  });
  
  assert.ok(result2.includes('Source: (unknown)'), 'Should handle explicit null source');
});

test('MIG-14: renderBrief handles empty transcript gracefully', () => {
  const result = renderBrief({ transcript: '' });
  assert.ok(result.includes('## Expected vs actual'), 'Should render sections even without transcript hints');
  assert.ok(!result.includes('Severity:'), 'Should not invent severity');
});
