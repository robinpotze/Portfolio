import assert from 'node:assert/strict';
import { test } from 'node:test';
import { branchGrow, cardDissolve } from './presence.js';

test('the branch reaches the card before any cell forms (and retracts only after the last one is gone)', () => {
    for (let i = 0; i <= 100; i++) {
        const p = i / 100;
        if (cardDissolve(p) > 0) {
            assert.equal(branchGrow(p), 1, `presence ${p}`);
        }
    }
});

test('neighbours at rest have no branch', () => {
    assert.equal(branchGrow(0.352), 0);
    assert.equal(cardDissolve(0.352), 0);
});
