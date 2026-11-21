export const CAROUSEL_CONFIG = {
    RADIUS: 4.5,
    ANGLE_STEP: 0.8,
    VERTICAL_STEP: -0.4,
    SCALE_FACTOR: 1,

    LERP_SPEED: 0.12,

    LENIS: {
        LERP: 0.08,
        WHEEL_MULTIPLIER: 2,
        TOUCH_MULTIPLIER: 3,
    },

    SNAP_DURATION: 0.6,
    SNAP_IDLE_FRAMES: 10,

    SCALE_RANGE: 0.3,

    CARD_GAP_FACTOR: 0.99,
    CARD_ASPECT: 16 / 9,

    CAMERA: {
        POSITION: [0, 0, 8],
        FOV: 50,
    },

    MOBILE: {
        BREAKPOINT: 768,
        SCALE_FACTOR: 0.7,
    },

    // The branch to the centred card: full length at centeredness 0, gone at RANGE (half a card step).
    BRANCH: {
        RANGE: 0.4 / Math.PI,
        REACH: 0.85,
    },

    // On-screen growth: full size within FULL_WITHIN of the centre, 0 at ENTER_FROM (about 1.5 card steps, just past the
    // frame edge). Centeredness units: |angle difference| / π. The first card grows in from MORPH_FROM of the morph.
    FRAME: {
        FULL_WITHIN: 0.2 / Math.PI,
        ENTER_FROM: 1.2 / Math.PI,
        MORPH_FROM: 0.6,
    },
};
