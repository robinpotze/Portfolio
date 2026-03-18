import { ENTRY } from '@config/animation.config';
import { useFrame } from '@react-three/fiber';
import { easeCurve, entryEase } from '@utils/easingFunctions.js';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

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
        duration = ENTRY.CAMERA_DURATION,
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

    const startTime = useRef(null);
    const hasCompletedEntry = useRef(false);
    const initializedRoute = useRef(routeName);
    const lastFov = useRef(startFov);
    const lastAppliedScroll = useRef(-1);

    useEffect(() => {
        if (initializedRoute.current !== routeName) {
            hasCompletedEntry.current = false;
            startTime.current = null;
            initializedRoute.current = routeName;
            lastFov.current = startFov;
        }
    }, [routeName, startFov]);

    useFrame(({ clock, camera }) => {
        if (!enabled) { return; }

        const targetCamera = cameraRef?.current || camera;
        if (!targetCamera) { return; }

        if (!hasCompletedEntry.current) {
            if (startTime.current === null) {
                startTime.current = clock.getElapsedTime();
            }

            const elapsed = clock.getElapsedTime() - startTime.current;
            const progress = Math.min(elapsed / duration, 1);
            const eased = entryEase(progress);

            if (progress >= 1) {
                hasCompletedEntry.current = true;
            }

            targetCamera.position.x = THREE.MathUtils.lerp(startPosition[0], endPosition[0], eased);
            targetCamera.position.y = THREE.MathUtils.lerp(startPosition[1], endPosition[1], eased);
            targetCamera.position.z = THREE.MathUtils.lerp(startPosition[2], endPosition[2], eased);

            if (targetCamera.isPerspectiveCamera) {
                const newFov = THREE.MathUtils.lerp(startFov, endFov, eased);
                if (Math.abs(newFov - lastFov.current) > 0.01) {
                    targetCamera.fov = newFov;
                    targetCamera.updateProjectionMatrix();
                    lastFov.current = newFov;
                }
            }
        } else {
            // Skip if scroll hasn't changed since last application
            if (Math.abs(scrollProgress - lastAppliedScroll.current) < 0.0001) { return; }
            lastAppliedScroll.current = scrollProgress;

            const scrollEased = easeCurve(scrollProgress);

            targetCamera.position.x = THREE.MathUtils.lerp(endPosition[0], finalEndPosition[0], scrollEased);
            targetCamera.position.y = THREE.MathUtils.lerp(endPosition[1], finalEndPosition[1], scrollEased);
            targetCamera.position.z = THREE.MathUtils.lerp(endPosition[2], finalEndPosition[2], scrollEased);

            if (targetCamera.isPerspectiveCamera) {
                const newFov = THREE.MathUtils.lerp(endFov, finalEndFov, scrollEased);
                if (Math.abs(newFov - lastFov.current) > 0.01) {
                    targetCamera.fov = newFov;
                    targetCamera.updateProjectionMatrix();
                    lastFov.current = newFov;
                }
            }
        }
    });
}
