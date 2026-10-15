// Particle budget per quality tier: simulation texture size (particle count = size²) and fluid pressure iterations (0 = fluid off).
export const TIERS = {
    low: { size: 128, fluidIterations: 0 },
    medium: { size: 256, fluidIterations: 10 },
    high: { size: 512, fluidIterations: 20 },
};

// Physics and look only — timing comes from @config/animation.config. Starting values, tuned by eye.
export const LOGO_PARTICLES = {
    // Dot-matrix panel: ~this many square cells across the viewport-filling panel (HomeScene sizes it); ≤ 16,384 keeps every dot filled on the low tier.
    GRID_CELLS: 14400,
    GRID_Z: -0.5,
    MORPH_STAGGER: 0.3,
    SPRING: 0.06,
    CURL_SCALE: 0.35,
    CURL_SPEED: 0.08,
    CURL_STRENGTH: 0.015,
    POINT_SIZE: 30,
    FLUID_STRENGTH: 0.0002,
};
