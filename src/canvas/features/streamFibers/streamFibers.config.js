// Fibre stream geometry and look (timing lives in @config/animation.config STREAM).
export const FIBER_TIERS = { low: 300, medium: 700, high: 1200 };

export const STREAM_FIBERS = {
    POINTS_PER_FIBER: 24,
    // Trail length as a fraction of the trunk's flow cycle.
    TRAIL: 0.06,
    // Bundle radius in carousel units; the logo particles land on the same spread.
    SPREAD: 0.35,
    // Bundle sway: amplitude (units), frequency (per unit of height), per-strand amplitude.
    SWAY_AMPLITUDE: 0.25,
    SWAY_FREQUENCY: 0.6,
    STRAND_AMPLITUDE: 0.06,
    // One spark per this many fibres; sparks drift at SPARK_SPREAD × SPREAD.
    SPARK_EVERY: 10,
    SPARK_SPREAD: 3,
    SPARK_SIZE: 6,
    // Hand-off: fibres fade in (particles out) over this last part of the morph.
    HANDOFF_START: 0.85,
};
