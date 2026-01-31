
import { test } from 'node:test';
import assert from 'node:assert';
import { generateNextActions } from '../src/brief.js';

test('MIG-14: generateNextActions detects environment variable issues', () => {
  const t = "It seems like process.env.API_KEY is undefined in production.";
  const actions = generateNextActions(t);
  assert.ok(actions.some(a => a.includes('Check environment variables')), 'Should suggest checking env vars');
});

test('MIG-14: generateNextActions detects missing configuration', () => {
  const t = "The app is crashing because of missing config values.";
  const actions = generateNextActions(t);
  assert.ok(actions.some(a => a.includes('Check environment variables')), 'Should suggest checking env vars');
});
