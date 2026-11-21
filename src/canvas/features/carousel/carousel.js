import { BREAKPOINTS } from '@config/animation.config';
import { CAROUSEL_CONFIG } from './carousel.config';

export function calculateCardPosition(index) {
    const angle = index * CAROUSEL_CONFIG.ANGLE_STEP;
    return [Math.sin(angle) * CAROUSEL_CONFIG.RADIUS, index * CAROUSEL_CONFIG.VERTICAL_STEP, Math.cos(angle) * CAROUSEL_CONFIG.RADIUS];
}

export function calculateCardRotation(index) {
    return [0, index * CAROUSEL_CONFIG.ANGLE_STEP, 0];
}

export function calculateCardCenteredness(rigRotation, cardIndex) {
    const diff = Math.abs(Math.abs(rigRotation) - cardIndex * CAROUSEL_CONFIG.ANGLE_STEP);
    return Math.min(diff / Math.PI, 1);
}

export function calculateCardScale(centeredness) {
    return 1 - centeredness * CAROUSEL_CONFIG.SCALE_RANGE;
}

// One MediaQueryList, so the per-frame camera code reads a cached boolean.
const tabletQuery = window.matchMedia(BREAKPOINTS.TABLET);

/** Carousel camera FOV: wider below the tablet breakpoint. */
export function getCarouselFov() {
    return tabletQuery.matches ? CAROUSEL_CONFIG.CAMERA.FOV + 15 : CAROUSEL_CONFIG.CAMERA.FOV;
}

const smooth01 = (t) => {
    const x = Math.min(1, Math.max(0, t));
    return x * x * (3 - 2 * x);
};

/** How present a card is (0–1): 0 past the frame edge, 1 near the centre, and only once the morph has arrived. */
export function calculateCardPresence(centeredness, morph) {
    const { FULL_WITHIN, ENTER_FROM, MORPH_FROM } = CAROUSEL_CONFIG.FRAME;
    const onScreen = 1 - smooth01((centeredness - FULL_WITHIN) / (ENTER_FROM - FULL_WITHIN));
    return onScreen * smooth01((morph - MORPH_FROM) / (1 - MORPH_FROM));
}

/** Branch length for a card's presence: reaches the card first. */
export const branchGrow = (presence) => smooth01(presence / CAROUSEL_CONFIG.BRANCH.GROW_BY);

/** Card dissolve for a card's presence: forms once the branch has arrived. */
export const cardDissolve = (presence) => smooth01((presence - CAROUSEL_CONFIG.BRANCH.DISSOLVE_FROM) / (1 - CAROUSEL_CONFIG.BRANCH.DISSOLVE_FROM));
