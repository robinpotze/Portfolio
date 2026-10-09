import { REVEAL } from '@config/animation.config';
import { useFrame } from '@react-three/fiber';
import { easeCurve, entryEase } from '@utils/easingFunctions.js';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function useObjectAnimation(ref, routeName, options = {}) {
    const {
        duration = REVEAL.DURATION,
        delay = REVEAL.DELAY,
        startPosition = [0, 0, 0],
        endPosition = [0, 0, 0],
        startScale = [1, 1, 1],
        endScale = [1, 1, 1],
        scrollEndPosition = null,
        scrollEndScale = null,
        enabled = true,
        scrollProgress = 0,
    } = options;

    const optionsRef = useRef(null);

    // Sync ref on every render — callers already memoize config objects,
    // so this is cheap and avoids a long dependency array in useEffect.
    optionsRef.current = {
        finalEndPosition: scrollEndPosition || endPosition,
        finalEndScale: scrollEndScale || endScale,
        duration,
        delay,
        startPosition,
        endPosition,
        startScale,
        endScale,
    };

    const startTime = useRef(null);
    const hasCompletedEntry = useRef(false);
    const initializedRoute = useRef(routeName);
    const scrollProgressRef = useRef(scrollProgress);
    const lastAppliedScroll = useRef(-1);

    useEffect(() => {
        scrollProgressRef.current = scrollProgress;
    }, [scrollProgress]);

    useEffect(() => {
        if (initializedRoute.current !== routeName) {
            hasCompletedEntry.current = false;
            startTime.current = null;
            initializedRoute.current = routeName;
        }
    }, [routeName]);

    useFrame(({ clock }) => {
        if (!ref.current || !enabled) {
            return;
        }

        const opts = optionsRef.current;

        if (!hasCompletedEntry.current) {
            if (startTime.current === null) {
                startTime.current = clock.getElapsedTime();
            }

            const elapsed = clock.getElapsedTime() - startTime.current - opts.delay;

            if (elapsed < 0) {
                return;
            }

            const entryProgress = Math.min(elapsed / opts.duration, 1);
            const eased = entryEase(entryProgress);

            if (entryProgress >= 1) {
                hasCompletedEntry.current = true;
            }

            ref.current.position.x = THREE.MathUtils.lerp(opts.startPosition[0], opts.endPosition[0], eased);
            ref.current.position.y = THREE.MathUtils.lerp(opts.startPosition[1], opts.endPosition[1], eased);
            ref.current.position.z = THREE.MathUtils.lerp(opts.startPosition[2], opts.endPosition[2], eased);

            ref.current.scale.x = THREE.MathUtils.lerp(opts.startScale[0], opts.endScale[0], eased);
            ref.current.scale.y = THREE.MathUtils.lerp(opts.startScale[1], opts.endScale[1], eased);
            ref.current.scale.z = THREE.MathUtils.lerp(opts.startScale[2], opts.endScale[2], eased);
        } else {
            // Skip if scroll hasn't changed since last application
            const sp = scrollProgressRef.current;
            if (Math.abs(sp - lastAppliedScroll.current) < 0.0001) {
                return;
            }
            lastAppliedScroll.current = sp;

            const scrollEased = easeCurve(sp);

            ref.current.position.x = THREE.MathUtils.lerp(opts.endPosition[0], opts.finalEndPosition[0], scrollEased);
            ref.current.position.y = THREE.MathUtils.lerp(opts.endPosition[1], opts.finalEndPosition[1], scrollEased);
            ref.current.position.z = THREE.MathUtils.lerp(opts.endPosition[2], opts.finalEndPosition[2], scrollEased);

            ref.current.scale.x = THREE.MathUtils.lerp(opts.endScale[0], opts.finalEndScale[0], scrollEased);
            ref.current.scale.y = THREE.MathUtils.lerp(opts.endScale[1], opts.finalEndScale[1], scrollEased);
            ref.current.scale.z = THREE.MathUtils.lerp(opts.endScale[2], opts.finalEndScale[2], scrollEased);
        }
    });
}
