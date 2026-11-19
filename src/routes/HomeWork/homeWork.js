// Pure scroll math for the Home → Work layout. No imports, so node:test can load it directly.

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/** Segment lengths in px for one viewport height. lengths: { HOME_VH, MORPH_VH, CARD_VH } from HOME_WORK. */
export function getSegmentBounds(viewportHeight, itemCount, { HOME_VH, MORPH_VH, CARD_VH }) {
    const home = HOME_VH * viewportHeight;
    const morph = MORPH_VH * viewportHeight;
    const card = CARD_VH * viewportHeight;
    const carouselStart = home + morph;
    return { home, morph, card, carouselStart, total: carouselStart + Math.max(0, itemCount - 1) * card };
}

/** Each segment's 0–1 progress for a scroll position. inCarousel allows 1 px for fractional scroll targets. */
export function getSegments(scroll, bounds) {
    const carouselLength = bounds.total - bounds.carouselStart;
    return {
        home: clamp01(scroll / bounds.home),
        morph: clamp01((scroll - bounds.home) / bounds.morph),
        carousel: carouselLength > 0 ? clamp01((scroll - bounds.carouselStart) / carouselLength) : 0,
        inCarousel: scroll >= bounds.carouselStart - 1,
    };
}

export const pathForSegment = (inCarousel) => (inCarousel ? '/work' : '/');

export const scrollForPath = (pathname, bounds) => (pathname === '/work' ? bounds.carouselStart : 0);

/** URL change for the current segment: push only on the first entry into the carousel, replace otherwise. */
export function decideUrl(inCarousel, pathname, hasPushed) {
    const path = pathForSegment(inCarousel);
    if (pathname === path) {
        return null;
    }
    return { path, replace: !inCarousel || hasPushed };
}

/** Nearest card position inside the carousel; null before it, so snapping never pulls the user out of the morph. */
export function snapTarget(scroll, bounds) {
    if (scroll < bounds.carouselStart) {
        return null;
    }
    return bounds.carouselStart + Math.round((scroll - bounds.carouselStart) / bounds.card) * bounds.card;
}
