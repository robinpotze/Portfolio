import { CAROUSEL_CONFIG } from '@config/carousel.config';

export function calculateCardPosition(index) {
    const angle = index * CAROUSEL_CONFIG.ANGLE_STEP;
    return [
        Math.sin(angle) * CAROUSEL_CONFIG.RADIUS,
        index * CAROUSEL_CONFIG.VERTICAL_STEP,
        Math.cos(angle) * CAROUSEL_CONFIG.RADIUS
    ];
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
