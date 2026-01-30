import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { renderBrief } from '../src/brief.js';

test('MIG-14: detects UI/UX issues and suggests CSS checks', (t) => {
  const transcript = `
    00:01 User: The button is cut off on my screen.
    00:05 User: And the text overlaps with the image when I resize.
    00:10 User: It looks completely broken on mobile portrait.
  `;
  
  const brief = renderBrief({ transcript });
  
  // Should suggest checking CSS/styles
  assert.match(brief, /Check responsive styles \/ CSS/i, 'Should suggest checking CSS for layout issues');
});
