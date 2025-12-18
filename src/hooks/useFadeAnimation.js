import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnimationState } from './useAnimationState.js';
import { entryEase } from './easingFunctions.js';

/**
 * Fades a property (typically intensity) during entry phase only
 * Single-phase animation without scroll interaction
 * 
 * @param {object} ref - React ref to the object with property to fade
 * @param {string} routeName - Current route name for animation reset
 * @param {object} options - Animation configuration
 * @returns {void}
 */
export function useFadeAnimation(ref, routeName, options = {}) {
    const {
        duration = 1.0,
        delay = 0,
        startValue = 0,
        endValue = 1,
        property = 'intensity',
        enabled = true,
        scrollProgress = 0
    } = options;

    const { animationStartTime, hasCompletedEntry } = useAnimationState(routeName);

    useFrame(({ clock }) => {
        if (!ref.current || !enabled) return;

        let value = endValue;

        if (!hasCompletedEntry.current) {
            if (animationStartTime.current === null) {
                animationStartTime.current = clock.getElapsedTime();
            }

            const elapsed = clock.getElapsedTime() - animationStartTime.current - delay;

            if (elapsed < 0) return;

            const entryProgress = Math.min(elapsed / duration, 1);
            const eased = entryEase(entryProgress);

            value = THREE.MathUtils.lerp(startValue, endValue, eased);

            if (entryProgress >= 1) {
                hasCompletedEntry.current = true;
            }
        } else {
            value = endValue;
        }

        if (ref.current[property] !== undefined) {
            ref.current[property] = value;
        }
    });
}
