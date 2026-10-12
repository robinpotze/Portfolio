// Particle budget per quality tier: simulation texture size (particle count = size²).
export const TIERS = {
    low: { size: 128 },
    medium: { size: 256 },
    high: { size: 512 },
};

// Physics and look only — timing comes from @config/animation.config. Starting values, tuned by eye.
export const LOGO_PARTICLES = {
    SPRING: 0.06,
    CLOUD_RADIUS: 10,
    CURL_SCALE: 0.35,
    CURL_SPEED: 0.08,
    CURL_STRENGTH: 0.015,
    POINT_SIZE: 30,
};
