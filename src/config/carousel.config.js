export const CAROUSEL_CONFIG = {
    RADIUS: 3.1,
    ANGLE_STEP: 0.7,
    VERTICAL_STEP: -0.2,
    SCALE_FACTOR: 1.5,

    LERP_SPEED: 0.12,
    SCROLL_DAMPING: 0.15,

    SCALE_RANGE: 0.3,

    // Scroll sensitivity multiplier for canvas-internal scrolling
    // Increase for slower/more deliberate scrolling (requires more movement)
    // Decrease for faster/more sensitive scrolling (requires less movement)
    SCROLL_PAGES_MULTIPLIER: 2,

    CAMERA: {
        POSITION: [0, 0, 8],
        FOV: 50,
    }
};
