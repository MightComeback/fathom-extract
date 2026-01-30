import { test } from 'node:test';
import assert from 'node:assert';
import { renderBrief } from '../src/brief.js';

test('MIG-14: extractBugHints detects infinite spinner', (t) => {
  const transcript = "I clicked save and it just kept spinning forever.";
  const output = renderBrief({ transcript });
  // Should appear in "Actual:" section
  assert.match(output, /- Actual: .*spinning/);
});

test('MIG-14: extractBugHints detects infinite loading', (t) => {
  const transcript = "The page is stuck in infinite loading state.";
  const output = renderBrief({ transcript });
  assert.match(output, /- Actual: .*infinite loading/);
});
