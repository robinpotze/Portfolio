/**
 * Animation Timing Constants
 * Centralized timing values for consistent animations across the app
 */

export const ANIMATION_TIMING = {
    // Curtain transition
    CURTAIN_REVEAL_DELAY: 100,
    CURTAIN_COVER_DELAY: 300,
    CURTAIN_DURATION: 200,
    LAYER_STAGGER_DELAY: 70,

    // Loading screen
    LOADING_MIN_DISPLAY: 2000,
    LOADING_FADE_OUT: 600,
    LOADING_COMPLETE_DELAY: 50,

    // Navigation
    NAVIGATION_DELAY: 200,
    MENU_CLOSE_DELAY: 300,

    // Entry animations - durations in seconds for Three.js animations
    ENTRY_DURATION: 0.6,
    ENTRY_DELAY: 0.6,
    ENTRY_COMPLETE_TIMEOUT: 800,
    CAMERA_DURATION: 1.5,
    FADE_DURATION: 1.0,

    // Route transitions
    ROUTE_TRANSITION_DURATION: 1500,

    // Scroll
    SCROLL_DEBOUNCE: 16,

    // Lenis smooth scroll
    LENIS_LERP: 0.1,
    LENIS_DURATION: 1.2,
};

export const ANIMATION_EASING = {
    CURTAIN: [0.22, 1, 0.36, 1], // Custom ease-out
    MENU_OPEN: [0.22, 1, 0.36, 1],
    MENU_CLOSE: [0.55, 0.06, 0.68, 0.19],
    SMOOTH: [0.25, 0.1, 0.25, 1],
};

export const SCROLL_THRESHOLDS = {
    HOME_TRANSITION: 0.95,
    WORK_RETURN: 0.5,
    WORK_MAX_SCROLL: 600,
};

export const FLOAT_CONFIG = {
    X_FREQUENCY: 0.3,
    X_AMPLITUDE: 0.03,
    Y_FREQUENCY: 0.4,
    Y_AMPLITUDE: 0.04,
    Z_FREQUENCY: 0.35,
    Z_AMPLITUDE: 0.02,
    SPEED_MIN: 0.5,
    SPEED_MAX: 1.0,
    PHASE_SEED: 13.7,
};
