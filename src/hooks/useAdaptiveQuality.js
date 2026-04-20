import { useQuality } from '@app/QualityContext';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';

function qualityRank(value) {
    if (value === 'low') return 0;
    if (value === 'medium') return 1;
    return 2;
}

function rankToQuality(rank) {
    if (rank <= 0) return 'low';
    if (rank === 1) return 'medium';
    return 'high';
}

/**
 * Adaptive quality monitor for R3F scenes.
 *
 * - Measures average frame time over a fixed interval
 * - Drops quality quickly when performance degrades
 * - Raises quality cautiously after sustained good performance
 * - Applies a cooldown after every quality switch to avoid oscillation
 *
 * Must be used inside both a QualityProvider and an R3F Canvas.
 */
export default function useAdaptiveQuality(options = {}) {
    const {
        enabled = true,
        checkInterval = 1000,

        // Performance thresholds in milliseconds
        // 55 fps = 18.18ms
        // 50 fps = 20.00ms
        // 42 fps = 23.81ms
        // 59 fps = 16.95ms
        targetFrameTime = 1000 / 55,
        softDropFrameTime = 1000 / 50,
        hardDropFrameTime = 1000 / 42,
        upgradeFrameTime = 1000 / 59,

        // Require consecutive bad/good intervals before changing quality
        badChecksBeforeSoftDrop = 3,
        goodChecksBeforeUpgrade = 5,

        // Longer cooldown prevents oscillation feedback loops
        qualityChangeCooldown = 5000,
    } = options;

    const { quality, setQuality } = useQuality();
    const [fps, setFps] = useState(60);

    const lastCheckRef = useRef(0);
    const cooldownUntilRef = useRef(0);
    const totalDeltaMsRef = useRef(0);
    const frameCountRef = useRef(0);
    const goodChecksRef = useRef(0);
    const badChecksRef = useRef(0);

    useFrame((_, delta) => {
        if (!enabled) return;

        const now = performance.now();

        if (lastCheckRef.current === 0) {
            lastCheckRef.current = now;
        }

        const deltaMs = delta * 1000;
        totalDeltaMsRef.current += deltaMs;
        frameCountRef.current += 1;

        if (now - lastCheckRef.current < checkInterval) {
            return;
        }

        const frameCount = frameCountRef.current;
        if (frameCount === 0) {
            lastCheckRef.current = now;
            return;
        }

        const avgFrameTime = totalDeltaMsRef.current / frameCount;
        const avgFps = 1000 / avgFrameTime;

        setFps(Math.round(avgFps));

        // Reset sampling window before any early return
        totalDeltaMsRef.current = 0;
        frameCountRef.current = 0;
        lastCheckRef.current = now;

        // During cooldown, keep measuring fps but do not change quality
        if (now < cooldownUntilRef.current) {
            return;
        }

        const currentRank = qualityRank(quality);
        let nextRank = currentRank;

        if (avgFrameTime >= hardDropFrameTime) {
            // Hard drop: immediate for severe performance issues
            goodChecksRef.current = 0;
            badChecksRef.current = 0;
            nextRank = Math.max(0, currentRank - 1);
        } else if (avgFrameTime >= softDropFrameTime && avgFrameTime > targetFrameTime && currentRank > 0) {
            // Soft drop: require consecutive bad intervals to avoid reacting to transient dips
            goodChecksRef.current = 0;
            badChecksRef.current += 1;

            if (badChecksRef.current >= badChecksBeforeSoftDrop) {
                nextRank = currentRank - 1;
                badChecksRef.current = 0;
            }
        } else if (avgFrameTime <= upgradeFrameTime) {
            badChecksRef.current = 0;
            goodChecksRef.current += 1;

            if (goodChecksRef.current >= goodChecksBeforeUpgrade) {
                nextRank = Math.min(2, currentRank + 1);
                goodChecksRef.current = 0;
            }
        } else {
            // Neutral zone: reset both counters
            goodChecksRef.current = 0;
            badChecksRef.current = 0;
        }

        const nextQuality = rankToQuality(nextRank);

        if (nextQuality !== quality) {
            setQuality(nextQuality);
            cooldownUntilRef.current = now + qualityChangeCooldown;
            goodChecksRef.current = 0;
        }
    });

    return {
        quality,
        fps,
    };
}