import { FLOAT_CONFIG } from '@config/animation.config';

export function calculateFloatOffset(time, index, speedMultiplier, config = FLOAT_CONFIG) {
    const t = time * speedMultiplier;
    const seed = index * config.PHASE_SEED;

    return {
        x: Math.sin(t * config.X_FREQUENCY + seed) * config.X_AMPLITUDE,
        y: Math.cos(t * config.Y_FREQUENCY + seed * 1.3) * config.Y_AMPLITUDE,
        z: Math.sin(t * config.Z_FREQUENCY + seed * 0.7) * config.Z_AMPLITUDE,
    };
}
