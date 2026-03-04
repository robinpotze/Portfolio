import { CAROUSEL_CONFIG } from '@config/carousel.config';

export function calculateScrollPages(itemCount) {
    if (itemCount === 0) return 1;
    return (itemCount * CAROUSEL_CONFIG.ANGLE_STEP) / (Math.PI * 2);
}

export function calculateCardPosition(index) {
    const angle = index * CAROUSEL_CONFIG.ANGLE_STEP;
    const yOffset = index * CAROUSEL_CONFIG.VERTICAL_STEP;

    return [
        Math.sin(angle) * CAROUSEL_CONFIG.RADIUS,
        yOffset,
        Math.cos(angle) * CAROUSEL_CONFIG.RADIUS
    ];
}

export function calculateCardRotation(index) {
    return [0, index * CAROUSEL_CONFIG.ANGLE_STEP, 0];
}

export function calculateCardCenteredness(rigRotation, cardIndex) {
    const currentRotation = Math.abs(rigRotation);
    const cardAngle = cardIndex * CAROUSEL_CONFIG.ANGLE_STEP;
    const diff = Math.abs(currentRotation - cardAngle);
    return Math.min(diff / Math.PI, 1);
}

export function calculateCardScale(normalizedDiff) {
    return 1 - (normalizedDiff * CAROUSEL_CONFIG.SCALE_RANGE);
}

export function applyPositionOffset(basePosition, offset) {
    return [
        basePosition[0] + offset.x,
        basePosition[1] + offset.y,
        basePosition[2] + offset.z,
    ];
}

export function calculateRigRotation(scrollOffset, itemCount) {
    const totalRotation = (itemCount - 1) * CAROUSEL_CONFIG.ANGLE_STEP;
    return -scrollOffset * totalRotation;
}

export function calculateCameraY(scrollOffset, itemCount) {
    return scrollOffset * (itemCount - 1) * CAROUSEL_CONFIG.VERTICAL_STEP;
}
