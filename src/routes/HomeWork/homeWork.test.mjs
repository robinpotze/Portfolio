import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decideUrl, getSegmentBounds, getSegments, scrollForPath, snapTarget } from './homeWork.js';

const LENGTHS = { HOME_VH: 0.5, MORPH_VH: 1, CARD_VH: 1 };
const bounds = getSegmentBounds(1000, 6, LENGTHS);

test('bounds: home 500, morph 1000, five card steps', () => {
    assert.deepEqual(bounds, { home: 500, morph: 1000, card: 1000, carouselStart: 1500, total: 6500 });
});

test('segments at the edges and in the middle', () => {
    assert.deepEqual(getSegments(0, bounds), { home: 0, morph: 0, carousel: 0, inCarousel: false });
    assert.deepEqual(getSegments(1000, bounds), { home: 1, morph: 0.5, carousel: 0, inCarousel: false });
    assert.deepEqual(getSegments(1500, bounds), { home: 1, morph: 1, carousel: 0, inCarousel: true });
    assert.deepEqual(getSegments(6500, bounds), { home: 1, morph: 1, carousel: 1, inCarousel: true });
});

test('one work item: carousel stays 0 instead of dividing by zero', () => {
    const single = getSegmentBounds(1000, 1, LENGTHS);
    assert.equal(getSegments(5000, single).carousel, 0);
});

test('scroll target per path', () => {
    assert.equal(scrollForPath('/', bounds), 0);
    assert.equal(scrollForPath('/work', bounds), 1500);
});

test('url: first entry into the carousel pushes, everything else replaces', () => {
    assert.deepEqual(decideUrl(true, '/', false), { path: '/work', replace: false });
    assert.deepEqual(decideUrl(true, '/', true), { path: '/work', replace: true });
    assert.deepEqual(decideUrl(false, '/work', false), { path: '/', replace: true });
    assert.equal(decideUrl(true, '/work', false), null);
    assert.equal(decideUrl(false, '/', true), null);
});

test('snap only inside the carousel, to the nearest card', () => {
    assert.equal(snapTarget(1200, bounds), null);
    assert.equal(snapTarget(2400, bounds), 2500);
    assert.equal(snapTarget(1900, bounds), 1500);
});
