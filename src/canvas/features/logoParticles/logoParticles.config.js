// Particle budget per quality tier: simulation texture size (particle count = size²) and fluid pressure iterations (0 = fluid off).
export const TIERS = {
    low: { size: 128, fluidIterations: 0 },
    medium: { size: 256, fluidIterations: 10 },
    high: { size: 512, fluidIterations: 20 },
};

// Physics and look only — timing comes from @config/animation.config. Starting values, tuned by eye.
export const LOGO_PARTICLES = {
    // Dot-matrix panel: ~this many square cells across the viewport-filling panel (HomeScene sizes it); ≤ 16,384 keeps every dot filled on the low tier.
    GRID_CELLS: 10000,
    GRID_Z: -0.5,
    MORPH_STAGGER: 0.3,
    SPRING: 0.06,
    // In transit (morph or stream moving): follow rate toward the path per second (~3 frames to settle), instead of SPRING.
    FOLLOW: 60,
    // In transit: curl swirl offset on the goal (logo-local units), peaking mid-transition.
    TRANSIT_AMPLITUDE: 0.25,
    CURL_SCALE: 0.35,
    CURL_SPEED: 0.08,
    CURL_STRENGTH: 0.015,
    POINT_SIZE: 20,
    FLUID_STRENGTH: 0.0002,
    // Stream: the share of fibre strands that form the card branches.
    BRANCH_SHARE: 0.2,
};
