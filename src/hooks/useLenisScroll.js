import { LENIS } from '@config/animation.config';
import Lenis from 'lenis';
import { useEffect } from 'react';

/** Smooth window scrolling while the calling page is mounted. */
export default function useLenisScroll() {
    useEffect(() => {
        const lenis = new Lenis({ lerp: LENIS.LERP, duration: LENIS.DURATION, smoothWheel: true, touchMultiplier: 2 });
        let rafId = requestAnimationFrame(function raf(time) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        });
        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);
}
