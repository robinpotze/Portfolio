/**
 * Animation Configuration
 * Centralized timing values, easing functions, and animation configs for consistent animations across the app
 */

export const BREAKPOINTS = {
    MOBILE: 375,
    TABLET: 768,
    DESKTOP: 1024,
    REFERENCE_WIDTH: 1920,
};

export const EASING = {
    EMPHASIZED: [0.22, 1, 0.36, 1],
    EXIT: [0.55, 0.06, 0.68, 0.19],
    HERO: [0.2, 0.9, 0.2, 1],
};

export const REVEAL = {
    EXIT_DURATION: 0.2,
    QUICK_DURATION: 0.3,
    MEDIUM_DURATION: 0.4,
    DURATION: 0.6,
    SLOW_DURATION: 0.65,
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
    CHAR_SPEED: 12,
    ROW_PAUSE: 80,
    CURSOR: '▌',
};

export const SCENE = {
    CAMERA_DURATION: 1.5,
    FADE_DURATION: 1,
};

export const CAMERA_DEFAULTS = {
    START_POSITION: [0, 0, 30],
    END_POSITION: [0, 0, 20],
    START_FOV: 70,
    END_FOV: 50,
};

export const TIMEOUT = {
    COMPLETE_DELAY_MS: 50,
    CURTAIN_STAGGER_MS: 70,
    GLITCH_COLOR_MS: 180,
    NAV_CLOSE_MS: 300,
    CURTAIN_MS: 500,
    GLITCH_BUSY_MS: 500,
    LOADING_FADE_MS: 600,
    ENTRY_COMPLETE_MS: 800,
    GLITCH_DURATION_MS: 1200,
    LOADING_MIN_DISPLAY_MS: 2000,
    LOADING_FORCE_COMPLETE_MS: 6500,
    SCENE_READY_GRACE_MS: 1200,
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

export const LOGO_BOOTSTRAP = {
    DURATION_MS: 1800,
    GLASS_FADE_MS: 900,
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
