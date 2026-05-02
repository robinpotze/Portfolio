import { LENIS } from '@config/animation.config';
import Lenis from 'lenis';
import { useEffect, useRef } from 'react';

export default function useLenisScroll({
    lerp = LENIS.LERP,
    duration = LENIS.DURATION,
    orientation = 'vertical',
    gestureOrientation = 'vertical',
    smoothWheel = true,
    wheelMultiplier = 1,
    touchMultiplier = 2,
    infinite = false,
    autoResize = true,
} = {}) {
    const lenisRef = useRef(null);

    useEffect(() => {
        const lenis = new Lenis({
            lerp,
            duration,
            orientation,
            gestureOrientation,
            smoothWheel,
            wheelMultiplier,
            touchMultiplier,
            infinite,
            autoResize,
        });

        lenisRef.current = lenis;

        if (typeof globalThis !== 'undefined') {
            globalThis.lenis = lenis;
        }

        let mounted = true;
        let rafId = 0;

        function raf(time) {
            if (!mounted) {
                return;
            }
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        return () => {
            mounted = false;
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
            if (typeof globalThis !== 'undefined') {
                globalThis.lenis = null;
            }
        };
    }, [lerp, duration, orientation, gestureOrientation, smoothWheel, wheelMultiplier, touchMultiplier, infinite, autoResize]);

    return lenisRef.current;
}
