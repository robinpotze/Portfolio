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

export { branchGrow, calculateCardPresence, cardDissolve } from './presence.js';
