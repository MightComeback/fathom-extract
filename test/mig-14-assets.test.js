import { test } from 'node:test';
import assert from 'node:assert';
import { generateNextActions } from '../src/brief.js';

test('MIG-14: generateNextActions detects CDN / Asset issues', (t) => {
  const inputs = [
    'The logo is a broken image',
    'image missing on the landing page',
    'The SVG failed to load',
    'The png is not showing up',
    'It seems the CDN is blocked',
    'Asset not found 404',
  ];

  for (const input of inputs) {
    const actions = generateNextActions(input); // pass input as transcript
    const actionList = actions.join('\n');
    assert.match(actionList, /Check CDN \/ Assets/, `Failed to detect asset issue in: "${input}"`);
  }
});
