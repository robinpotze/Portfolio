import { CAROUSEL_CONFIG } from './carousel.config';

// Derive card size from carousel geometry: slightly less than one polygon side
const chord = 2 * CAROUSEL_CONFIG.RADIUS * Math.sin(CAROUSEL_CONFIG.ANGLE_STEP / 2);
export const CARD_WIDTH = chord * CAROUSEL_CONFIG.CARD_GAP_FACTOR;
export const CARD_HEIGHT = CARD_WIDTH / CAROUSEL_CONFIG.CARD_ASPECT;
