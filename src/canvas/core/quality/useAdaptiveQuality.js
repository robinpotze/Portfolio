import { useQuality } from '@app/QualityContext';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

const QUALITIES = ['low', 'medium', 'high'];

// Average frame time is checked once per interval (ms).
const CHECK_INTERVAL = 1000;
// Below 42 fps: drop a tier at once. Below 50 fps for 3 checks in a row: drop a tier. Above 59 fps for 5 checks: raise a tier.
const HARD_DROP_FRAME_TIME = 1000 / 42;
const SOFT_DROP_FRAME_TIME = 1000 / 50;
const UPGRADE_FRAME_TIME = 1000 / 59;
const BAD_CHECKS_BEFORE_SOFT_DROP = 3;
const GOOD_CHECKS_BEFORE_UPGRADE = 5;
// No further change for this long after a switch, so the tiers don't oscillate (ms).
const QUALITY_CHANGE_COOLDOWN = 5000;

/**
 * Lowers or raises the shared quality tier from the measured frame rate.
 * Must be used inside both a QualityProvider and an R3F Canvas.
 */
export default function useAdaptiveQuality({ enabled = true } = {}) {
    const { quality, setQuality } = useQuality();
    const state = useRef({ lastCheck: 0, cooldownUntil: 0, totalDeltaMs: 0, frames: 0, goodChecks: 0, badChecks: 0 });

    useFrame((_, delta) => {
        if (!enabled) {
            return;
        }
        const s = state.current;
        const now = performance.now();
        if (s.lastCheck === 0) {
            s.lastCheck = now;
        }
        s.totalDeltaMs += delta * 1000;
        s.frames += 1;
        if (now - s.lastCheck < CHECK_INTERVAL) {
            return;
        }

        const avgFrameTime = s.totalDeltaMs / s.frames;
        s.totalDeltaMs = 0;
        s.frames = 0;
        s.lastCheck = now;
        if (now < s.cooldownUntil) {
            return;
        }

        const rank = QUALITIES.indexOf(quality);
        let nextRank = rank;
        if (avgFrameTime >= HARD_DROP_FRAME_TIME) {
            s.goodChecks = 0;
            s.badChecks = 0;
            nextRank = Math.max(0, rank - 1);
        } else if (avgFrameTime >= SOFT_DROP_FRAME_TIME && rank > 0) {
            s.goodChecks = 0;
            s.badChecks += 1;
            if (s.badChecks >= BAD_CHECKS_BEFORE_SOFT_DROP) {
                nextRank = rank - 1;
                s.badChecks = 0;
            }
        } else if (avgFrameTime <= UPGRADE_FRAME_TIME) {
            s.badChecks = 0;
            s.goodChecks += 1;
            if (s.goodChecks >= GOOD_CHECKS_BEFORE_UPGRADE) {
                nextRank = Math.min(QUALITIES.length - 1, rank + 1);
                s.goodChecks = 0;
            }
        } else {
            s.goodChecks = 0;
            s.badChecks = 0;
        }

        if (nextRank !== rank) {
            setQuality(QUALITIES[nextRank]);
            s.cooldownUntil = now + QUALITY_CHANGE_COOLDOWN;
            s.goodChecks = 0;
        }
    });
}
