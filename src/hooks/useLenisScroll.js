import Lenis from 'lenis';
import { useEffect, useRef } from 'react';

export default function useLenisScroll({
    lerp = 0.1,
    duration = 1.2,
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

        function raf(time) {
            if (!mounted) return;
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            mounted = false;
            lenis.destroy();
            lenisRef.current = null;
            if (typeof globalThis !== 'undefined') {
                globalThis.lenis = null;
            }
        };
    }, [lerp, duration, orientation, gestureOrientation, smoothWheel, wheelMultiplier, touchMultiplier, infinite, autoResize]);

    return lenisRef.current;
}