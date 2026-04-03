/**
 * Custom easing curve with multiple segments for smooth scroll-based animations
 * Segments: 0-0.45 (fast start), 0.45-0.65 (slow mid), 0.65-0.85 (acceleration), 0.85-1 (final ease)
 *
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value between 0 and 1
 */
export const easeCurve = (t) => {
    if (t <= 0.45) {
        return Math.pow(t / 0.45, 1.4) * 0.6;
    }
    if (t <= 0.65) {
        const local = (t - 0.45) / 0.2;
        return 0.6 + Math.pow(local, 2.3) * 0.08;
    }
    if (t <= 0.85) {
        const local = (t - 0.65) / 0.2;
        return 0.68 + Math.pow(local, 1.1) * 0.22;
    }
    const local = (t - 0.85) / 0.15;
    return 0.9 + local * 0.1;
};

/**
 * Simple cubic ease-out function for entry animations
 * Creates smooth deceleration effect
 *
 * @param {number} t - Progress value between 0 and 1
 * @returns {number} Eased value between 0 and 1
 */
export const entryEase = (t) => 1 - Math.pow(1 - t, 3); // cubic ease out
