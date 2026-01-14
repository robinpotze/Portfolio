import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { easeCurve, entryEase } from './easingFunctions.js';

export function useObjectAnimation(ref, routeName, options = {}) {
    const {
        duration = 1.5,
        delay = 0,
        startPosition = [0, 0, 0],
        endPosition = [0, 0, 0],
        startScale = [1, 1, 1],
        endScale = [1, 1, 1],
        scrollEndPosition = null,
        scrollEndScale = null,
        enabled = true,
        scrollProgress = 0
    } = options;

    const finalEndPosition = scrollEndPosition || endPosition;
    const finalEndScale = scrollEndScale || endScale;

    const startTime = useRef(null);
    const hasCompletedEntry = useRef(false);
    const initializedRoute = useRef(routeName);

    useEffect(() => {
        if (initializedRoute.current !== routeName) {
            hasCompletedEntry.current = false;
            startTime.current = null;
            initializedRoute.current = routeName;
        }
    }, [routeName]);

    useFrame(({ clock }) => {
        if (!ref.current || !enabled) return;

        if (!hasCompletedEntry.current) {
            if (startTime.current === null) {
                startTime.current = clock.getElapsedTime();
            }

            const elapsed = clock.getElapsedTime() - startTime.current - delay;

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
