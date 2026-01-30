import { test } from 'node:test';
import assert from 'node:assert';
import { renderBrief } from '../src/brief.js';

test('MIG-14: generateNextActions detects 404/Not Found', (t) => {
  const transcript = `
    I clicked the link and got a 404 Not Found error.
    It says the page doesn't exist.
  `;
  const output = renderBrief({ transcript });

  assert.ok(output.includes('## Next actions'), 'Output should contain Next actions section');
  assert.ok(output.includes('- [ ] Check broken links / routing'), 'Should suggest checking broken links for 404');
});
