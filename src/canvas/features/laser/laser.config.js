// Scroll-driven laser uniforms: value = base + scrollProgress * scale.
export const LASER_PARAMS = {
    uHLenFactor: { base: 0, scale: 2 }, // horizontal beam length
    uVLenFactor: { base: 0, scale: 3 }, // vertical beam length
    uBeamYFrac: { base: -0.6, scale: 0.1 }, // vertical offset, as a fraction of screen height
    uFogIntensity: { base: 0.2, scale: 0.2 },
    uWSpeed: { base: 50, scale: -40 }, // wisp speed
    uWIntensity: { base: 5, scale: 5 }, // wisp brightness
    uDecay: { base: 1.5, scale: -0.5 }, // how far the beam arcs fade
};
