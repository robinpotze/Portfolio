/**
 * Animation Configuration
 * Centralized timing values, easing functions, and animation configs for consistent animations across the app
 */

export const BREAKPOINTS = {
    // Same query as the CSS tablet breakpoint, so canvas and layout switch together at any root font size
    TABLET: '(max-width: 48em)',
    REFERENCE_WIDTH: 1920,
};

export const EASING = {
    EMPHASIZED: [0.22, 1, 0.36, 1],
    EXIT: [0.55, 0.06, 0.68, 0.19],
};

export const REVEAL = {
    EXIT_DURATION: 0.2,
    QUICK_DURATION: 0.3,
    MEDIUM_DURATION: 0.4,
    DURATION: 0.6,
    LONG_DURATION: 0.9,
    DELAY: 0.1,
    X_OFFSET: 8,
    Y_OFFSET: 25,
};

export const STAGGER = {
    FAST: 0.05,
    MICRO: 0.06,
    DEFAULT: 0.08,
    SLOW: 0.1,
    PAGE: 0.12,
};

export const TYPEWRITER = {
    CHAR_SPEED: 6,
    ROW_PAUSE: 40,
    CURSOR: '▌',
};

export const SCENE = {
    CAMERA_DURATION: 1.5,
    FADE_DURATION: 1,
};

export const TIMEOUT = {
    COMPLETE_DELAY_MS: 50,
    CURTAIN_STAGGER_MS: 70,
    GLITCH_COLOR_MS: 180,
    NAV_CLOSE_MS: 300,
    CURTAIN_MS: 500,
    GLITCH_BUSY_MS: 500,
    GLITCH_DURATION_MS: 1200,
    LOADING_MIN_DISPLAY_MS: 2000,
    LOADING_FORCE_COMPLETE_MS: 6500,
};

export const LENIS = {
    LERP: 0.1,
    DURATION: 1.2,
};

export const SCROLL_THRESHOLDS = {
    HOME_TRANSITION: 0.95,
};

// Home → Work layout: segment lengths in viewport heights (one card step per CARD_VH).
export const HOME_WORK = {
    HOME_VH: 0.5,
    MORPH_VH: 1,
    CARD_VH: 1,
    // Home's video wall, title, subtitle and laser fade and recede over the first EXIT_END of the morph, by EXIT_RECEDE units.
    EXIT_END: 0.5,
    EXIT_RECEDE: 20,
    // Menu/Back seek between Home and Work, seconds.
    SEEK_DURATION: 3,
};

// Particle trunk flow: cycles per second at rest, plus extra cycles per second per viewport height per second of scroll.
export const STREAM = {
    FLOW_BASE: 0.05,
    FLOW_SCROLL_GAIN: 0.5,
    // Bundle sway: radians of phase per second.
    SWAY_SPEED: 0.4,
    // Sparks drift at this fraction of the fibres' flow speed.
    SPARK_FLOW: 0.5,
};

export const FLOAT_CONFIG = {
    INTENSITY: 0.2,
    ROTATION_INTENSITY: 0.2,
    SPEED: 0.5,
};

export const LOADING_REVEAL = {
    BG_FADE_MS: 600,
    TEXT_FADE_MS: 300,
    LOGO_GROW_MS: 400,
    LOGO_GROW_SCALE: 1.25,
    LOGO_FADE_MS: 400,
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
