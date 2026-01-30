import { test } from 'node:test';
import assert from 'node:assert';
import { renderBrief } from '../src/brief.js';

test('renderBrief extracts Staging environment', () => {
  const brief = renderBrief({
    transcript: 'I was testing on Staging and it broke.',
  });
  assert.match(brief, /Browser \/ OS:.*Staging/);
});

test('renderBrief extracts Production environment', () => {
  const brief = renderBrief({
    transcript: 'The bug is live on Production.',
  });
  assert.match(brief, /Browser \/ OS:.*Production/);
});

test('renderBrief extracts Prod (normalized) environment', () => {
  const brief = renderBrief({
    transcript: 'The bug is live on prod right now.',
  });
  assert.match(brief, /Browser \/ OS:.*Production/);
});

test('renderBrief extracts Localhost environment', () => {
  const brief = renderBrief({
    transcript: 'It works on localhost:3000 but fails elsewhere.',
  });
  assert.match(brief, /Browser \/ OS:.*Localhost/);
});

test('renderBrief ignores "prod" inside other words', () => {
    const brief = renderBrief({
      transcript: 'The product is great.',
    });
    // Should NOT match Production
    // But might match nothing, so we check it DOES NOT contain Production
    assert.doesNotMatch(brief, /Browser \/ OS:.*Production/);
  });
