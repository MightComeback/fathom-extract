import { test } from 'node:test';
import assert from 'node:assert';
import { renderBrief } from '../src/brief.js';

test('MIG-14: extractEnvironment detects Arc browser', (t) => {
  const transcript = "I'm seeing this issue on Arc browser.";
  const output = renderBrief({ transcript });
  assert.ok(output.includes('Browser / OS: Arc'));
});
