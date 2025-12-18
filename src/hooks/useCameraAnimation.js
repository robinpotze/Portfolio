import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAnimationState } from './useAnimationState.js';
import { easeCurve, entryEase } from './easingFunctions.js';

/**
 * Animates camera position and FOV with entry and scroll phases
 * Entry phase: Animates from start to end position/FOV
 * Scroll phase: Animates from end to scrollEnd position/FOV based on scroll progress
 * Handles perspective camera projection matrix updates
 * 
 * @param {object} cameraRef - React ref to camera (optional, uses default if null)
 * @param {string} routeName - Current route name for animation reset
 * @param {object} options - Animation configuration
 * @returns {void}
 */
export function useCameraAnimation(cameraRef, routeName, options = {}) {
    const {
        duration = 1.5,
        startPosition = [0, 0, 30],
        endPosition = [0, 0, 20],
        scrollEndPosition = null,
        startFov = 70,
        endFov = 50,
        scrollEndFov = null,
        enabled = true,
        scrollProgress = 0
    } = options;

    const finalEndPosition = scrollEndPosition || endPosition;
    const finalEndFov = scrollEndFov || endFov;
    const { animationStartTime, hasCompletedEntry } = useAnimationState(routeName);

    useFrame(({ clock, camera }) => {
        if (!enabled) return;

        const targetCamera = cameraRef?.current || camera;
        if (!targetCamera) return;

        if (!hasCompletedEntry.current) {
            if (animationStartTime.current === null) {
                animationStartTime.current = clock.getElapsedTime();
            }

            const elapsed = clock.getElapsedTime() - animationStartTime.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = entryEase(progress);

            if (progress >= 1) {
                hasCompletedEntry.current = true;
            }

            targetCamera.position.x = THREE.MathUtils.lerp(startPosition[0], endPosition[0], eased);
            targetCamera.position.y = THREE.MathUtils.lerp(startPosition[1], endPosition[1], eased);
            targetCamera.position.z = THREE.MathUtils.lerp(startPosition[2], endPosition[2], eased);

            if (targetCamera.isPerspectiveCamera) {
                targetCamera.fov = THREE.MathUtils.lerp(startFov, endFov, eased);
                targetCamera.updateProjectionMatrix();
            }
        } else {
            // After entry, apply scroll-based animation
            const scrollEased = easeCurve(scrollProgress);

            targetCamera.position.x = THREE.MathUtils.lerp(endPosition[0], finalEndPosition[0], scrollEased);
            targetCamera.position.y = THREE.MathUtils.lerp(endPosition[1], finalEndPosition[1], scrollEased);
            targetCamera.position.z = THREE.MathUtils.lerp(endPosition[2], finalEndPosition[2], scrollEased);

            if (targetCamera.isPerspectiveCamera) {
                targetCamera.fov = THREE.MathUtils.lerp(endFov, finalEndFov, scrollEased);
                targetCamera.updateProjectionMatrix();
            }
        }
    });
}
