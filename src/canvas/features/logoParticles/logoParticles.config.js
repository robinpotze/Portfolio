// Particle budget per quality tier: simulation texture size (particle count = size²) and fluid pressure iterations (0 = fluid off).
export const TIERS = {
    low: { size: 128, fluidIterations: 0 },
    medium: { size: 256, fluidIterations: 10 },
    high: { size: 512, fluidIterations: 20 },
};

// Physics and look only — timing comes from @config/animation.config. Starting values, tuned by eye.
export const LOGO_PARTICLES = {
    // Dot-matrix panel in the logo's local space (the logo is about 6.8 × 4.4 units); 160 × 90 keeps 16:9 square cells.
    GRID_COLUMNS: 160,
    GRID_ROWS: 90,
    GRID_WIDTH: 17,
    GRID_Z: -0.5,
    MORPH_STAGGER: 0.3,
    SPRING: 0.06,
    CURL_SCALE: 0.35,
    CURL_SPEED: 0.08,
    CURL_STRENGTH: 0.015,
    POINT_SIZE: 30,
    FLUID_STRENGTH: 0.0002,
};
