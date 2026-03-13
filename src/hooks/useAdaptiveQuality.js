import { useQuality } from '@app/QualityContext';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

/**
 * R3F FPS monitor that writes to the unified QualityContext.
 * Must be used inside both a QualityProvider and an R3F Canvas.
 */
export function useAdaptiveQuality(options = {}) {
    const {
        targetFps = 55,
        checkInterval = 1000,
        enabled = true
    } = options;

    const { quality, setQuality } = useQuality();
    const currentFpsRef = useRef(60);

    const frameTimesRef = useRef([]);
    const lastCheckRef = useRef(0);

    useFrame((_, delta) => {
        if (!enabled) { return; }

        const now = performance.now();
        const fps = 1 / delta;

        frameTimesRef.current.push(fps);

        if (now - lastCheckRef.current < checkInterval) { return; }

        const samples = frameTimesRef.current;
        if (samples.length === 0) { return; }

        const avgFps = samples.reduce((a, b) => a + b, 0) / samples.length;
        currentFpsRef.current = Math.round(avgFps);

        let newQuality = quality;

        if (avgFps < targetFps - 10) {
            newQuality = quality === 'high' ? 'medium' : 'low';
        } else if (avgFps < targetFps - 5) {
            if (quality === 'high') newQuality = 'medium';
        } else if (avgFps > targetFps + 5 && quality !== 'high') {
            newQuality = quality === 'low' ? 'medium' : 'high';
        }

        if (newQuality !== quality) {
            setQuality(newQuality);
        }

        frameTimesRef.current = [];
        lastCheckRef.current = now;
    });

    return { quality, fps: currentFpsRef.current };
}
