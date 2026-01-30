import { test } from 'node:test';
import assert from 'node:assert';
import { renderBrief } from '../src/brief.js';

test('MIG-14: extractBugHints detects frozen/stuck states', () => {
  const transcript = `
The screen freezes when I scroll.
It just gets stuck on the loading spinner.
The app hangs indefinitely.
  `.trim();

  const output = renderBrief({ transcript });
  const match = output.match(/- Actual: (.*)/);
  assert.ok(match, 'Output should contain an Actual line');
  
  const actuals = match[1];
  assert.ok(actuals.includes('screen freezes'), 'Should detect "freezes"');
  assert.ok(actuals.includes('gets stuck'), 'Should detect "stuck"');
  assert.ok(actuals.includes('app hangs'), 'Should detect "hangs"');
});
