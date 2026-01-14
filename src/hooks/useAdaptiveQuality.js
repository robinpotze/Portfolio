import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';

/**
 * Adaptive quality hook that monitors FPS and adjusts quality settings
 * @param {Object} options - Configuration options
 * @param {number} options.targetFps - Target FPS (default: 55)
 * @param {number} options.checkInterval - How often to check FPS in ms (default: 1000)
 * @param {boolean} options.enabled - Whether monitoring is enabled (default: true)
 * @returns {Object} { quality: 'high' | 'medium' | 'low', fps: number }
 */
export function useAdaptiveQuality(options = {}) {
    const {
        targetFps = 55,
        checkInterval = 1000,
        enabled = true
    } = options;

    const [quality, setQuality] = useState('high');
    const [currentFps, setCurrentFps] = useState(60);
    
    const frameTimesRef = useRef([]);
    const lastCheckRef = useRef(0);
    const lastQualityChangeRef = useRef(0);

    useFrame((_, delta) => {
        if (!enabled) return;

        const now = performance.now();
        const fps = 1 / delta;
        
        // Collect frame samples
        frameTimesRef.current.push(fps);
        
        // Check quality every checkInterval ms
        if (now - lastCheckRef.current < checkInterval) return;
        
        const samples = frameTimesRef.current;
        if (samples.length === 0) return;
        
        // Calculate average FPS
        const avgFps = samples.reduce((a, b) => a + b, 0) / samples.length;
        setCurrentFps(Math.round(avgFps));
        
        // Prevent rapid quality changes (minimum 2 seconds between changes)
        if (now - lastQualityChangeRef.current < 2000) {
            frameTimesRef.current = [];
            lastCheckRef.current = now;
            return;
        }
        
        // Adjust quality based on FPS
        let newQuality = quality;
        
        if (avgFps < targetFps - 10) {
            // Significantly below target - downgrade
            newQuality = quality === 'high' ? 'medium' : 'low';
        } else if (avgFps < targetFps - 5) {
            // Slightly below target - downgrade if high
            if (quality === 'high') newQuality = 'medium';
        } else if (avgFps > targetFps + 5 && quality !== 'high') {
            // Above target - upgrade one level
            newQuality = quality === 'low' ? 'medium' : 'high';
        }
        
        if (newQuality !== quality) {
            setQuality(newQuality);
            lastQualityChangeRef.current = now;
        }
        
        // Clear samples for next check
        frameTimesRef.current = [];
        lastCheckRef.current = now;
    });

    return { quality, fps: currentFps };
}
