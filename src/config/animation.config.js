/**
 * Animation Configuration
 * Centralized timing values, easing functions, and animation configs for consistent animations across the app
 */

export const EASING = {
    EMPHASIZED: [0.22, 1, 0.36, 1],
    EXIT: [0.55, 0.06, 0.68, 0.19],
    SMOOTH: [0.25, 0.1, 0.25, 1],
    HERO: [0.2, 0.9, 0.2, 1],
};

export const REVEAL = {
    DURATION: 0.6,
    QUICK_DURATION: 0.3,
    EXIT_DURATION: 0.2,
    DELAY: 0.1,
    X_OFFSET: 8,
    Y_OFFSET: 25,
};

export const STAGGER = {
    FAST: 0.05,
    DEFAULT: 0.08,
    SLOW: 0.1,
    MICRO: 0.06,
};

export const TYPEWRITER = {
    CHAR_SPEED: 12,
    ROW_PAUSE: 80,
    CURSOR: '▌',
};

export const MENU_TIMING = {
    TOGGLE_OPEN_DURATION: 0.6,
    TOGGLE_CLOSE_DURATION: 0.35,
    ITEM_DURATION: 0.9,
    ITEM_STAGGER: 0.1,
    ITEM_DELAY_BASE: 0.15,
    ICON_SWAP_OUT_DURATION: 0.28,
    ICON_SWAP_IN_DURATION: 0.32,
    PANEL_OPEN_DURATION: 0.3,
    PANEL_CLOSE_DURATION: 0.2,
    CLOSE_NAV_DELAY_MS: 300,
    PANEL_OPEN_DELAY: 0.22,
    LAYER_DURATION: 0.2,
    LAYER_STAGGER: 0.07,
    SOCIAL_ITEM_DURATION: 0.3,
};

export const CONTACT_TIMING = {
    FORM_DURATION: 0.65,
    FORM_CONTENT_DELAY: 0.42,
    CORNER_DELAY: 0.58,
};

export const CURTAIN = {
    DURATION_MS: 500,
    LAYER_STAGGER_MS: 70,
};

export const LOADING = {
    MIN_DISPLAY_MS: 2000,
    FADE_OUT_MS: 600,
    COMPLETE_DELAY_MS: 50,
    EXIT_DURATION: REVEAL.DURATION,
};

export const GLITCH = {
    DURATION: REVEAL.EXIT_DURATION,
    COLOR_DELAY_MS: 180,
    BUSY_TIMEOUT_MS: 500,
};

export const ENTRY = {
    DURATION: REVEAL.DURATION,
    DELAY: REVEAL.DURATION,
    COMPLETE_TIMEOUT_MS: 800,
    CAMERA_DURATION: 1.5,
    FADE_DURATION: 1,
};

export const LENIS = {
    LERP: 0.1,
    DURATION: 1.2,
};

export const SCROLL_THRESHOLDS = {
    HOME_TRANSITION: 0.95,
    WORK_TOP_THRESHOLD: 0.02,
    WORK_SCROLL_TIMEOUT: 500,
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
    SPEED_MAX: 1,
    PHASE_SEED: 13.7,
    INTENSITY: 2,
    ROTATION_INTENSITY: 0.5,
    SPEED: 0.5,
};

export const SPRING_CONFIG = {
    CURSOR_TRACKING: {
        stiffness: 120,
        damping: 20,
    },
    SMOOTH_PROGRESS: {
        stiffness: 100,
        damping: 20,
    },
    SNAPPY_LAYOUT: {
        stiffness: 500,
        damping: 35,
    },
    BORDER_ANIMATION: {
        stiffness: 900,
        damping: 50,
        mass: 0.1,
    },
};
