import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { easeCurve, entryEase } from './easingFunctions.js';
import { useAnimationState } from './useAnimationState.js';

/**
 * Animates 3D object position and scale with entry and scroll phases
 * Entry phase: Animates from start to end position/scale
 * Scroll phase: Animates from end to scrollEnd position/scale based on scroll progress
 * 
 * @param {object} ref - React ref to the 3D object to animate
 * @param {string} routeName - Current route name for animation reset
 * @param {object} options - Animation configuration
 * @returns {void}
 */
export function useEntryAnimation(ref, routeName, options = {}) {
    const {
        duration = 1.5,
        delay = 0,
        startPosition = [0, -15, -5],
        endPosition = [0, 0, -5],
        startScale = [0.5, 0.5, 0.5],
        endScale = [2.8, 2.8, 2.8],
        scrollEndPosition = null,
        scrollEndScale = null,
        enabled = true,
        scrollProgress = 0
    } = options;

    const finalEndPosition = scrollEndPosition || endPosition;
    const finalEndScale = scrollEndScale || endScale;
    const { animationStartTime, hasCompletedEntry } = useAnimationState(routeName);

    useFrame(({ clock }) => {
        if (!ref.current || !enabled) return;

        if (!hasCompletedEntry.current) {
            if (animationStartTime.current === null) {
                animationStartTime.current = clock.getElapsedTime();
            }

            const elapsed = clock.getElapsedTime() - animationStartTime.current - delay;

            if (elapsed < 0) return;

            const entryProgress = Math.min(elapsed / duration, 1);
            const eased = entryEase(entryProgress);

            if (entryProgress >= 1) {
                hasCompletedEntry.current = true;
            }

            ref.current.position.x = THREE.MathUtils.lerp(startPosition[0], endPosition[0], eased);
            ref.current.position.y = THREE.MathUtils.lerp(startPosition[1], endPosition[1], eased);
            ref.current.position.z = THREE.MathUtils.lerp(startPosition[2], endPosition[2], eased);

            ref.current.scale.x = THREE.MathUtils.lerp(startScale[0], endScale[0], eased);
            ref.current.scale.y = THREE.MathUtils.lerp(startScale[1], endScale[1], eased);
            ref.current.scale.z = THREE.MathUtils.lerp(startScale[2], endScale[2], eased);
        } else {
            // After entry, apply scroll-based animation
            const scrollEased = easeCurve(scrollProgress);

            ref.current.position.x = THREE.MathUtils.lerp(endPosition[0], finalEndPosition[0], scrollEased);
            ref.current.position.y = THREE.MathUtils.lerp(endPosition[1], finalEndPosition[1], scrollEased);
            ref.current.position.z = THREE.MathUtils.lerp(endPosition[2], finalEndPosition[2], scrollEased);

            ref.current.scale.x = THREE.MathUtils.lerp(endScale[0], finalEndScale[0], scrollEased);
            ref.current.scale.y = THREE.MathUtils.lerp(endScale[1], finalEndScale[1], scrollEased);
            ref.current.scale.z = THREE.MathUtils.lerp(endScale[2], finalEndScale[2], scrollEased);
        }
    });
}
