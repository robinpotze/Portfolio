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

    // Per-card sequence over its presence (0 at the frame edge → 1 near the centre): the branch grows from GROW_FROM and
    // reaches the card at GROW_BY, before the card dissolves in from DISSOLVE_FROM to 1. Leaving reverses it. GROW_FROM
    // sits above a resting neighbour's presence (≈ 0.352), so the side cards have no branch at rest.
    BRANCH: {
        GROW_FROM: 0.36,
        GROW_BY: 0.55,
        DISSOLVE_FROM: 0.6,
        // A pyramid from the trunk onto the card: faces land at INSET × the card's half-extents (inside the corners),
        // and mid-way each strand is pulled BOW of the way toward the pyramid axis, so the faces curve inward.
        INSET: 0.85,
        BOW: 0.35,
    },
    // Card dissolve: square cells across the card (dot-matrix look) and the width of the glowing edge band.
    DISSOLVE: {
        CELLS: [48, 27],
        EDGE: 0.08,
    },

    // On-screen presence: full within FULL_WITHIN of the centre, 0 at ENTER_FROM (about 1.5 card steps, just past the
    // frame edge). Centeredness units: |angle difference| / π. The first card arrives from MORPH_FROM of the morph.
    FRAME: {
        FULL_WITHIN: 0.2 / Math.PI,
        ENTER_FROM: 1.2 / Math.PI,
        MORPH_FROM: 0.6,
    },
};
