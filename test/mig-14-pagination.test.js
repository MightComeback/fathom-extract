import assert from 'node:assert';
import test from 'node:test';
import { generateNextActions } from '../src/brief.js';

test('generateNextActions detects pagination issues', () => {
    const transcript = "When I click load more, nothing happens. Also page 2 is empty.";
    const actions = generateNextActions(transcript);
    const list = actions.map(a => a.replace('- [ ] ', ''));
    
    assert.ok(list.includes('Check pagination logic / offset'), 'Should suggest checking pagination');
});

test('generateNextActions detects infinite scroll issues', () => {
    const transcript = "The infinite scroll is broken, it just keeps spinning.";
    const actions = generateNextActions(transcript);
    const list = actions.map(a => a.replace('- [ ] ', ''));
    
    assert.ok(list.includes('Check pagination logic / offset'), 'Should suggest checking pagination for infinite scroll');
});
