import { usePageTransition } from '@hooks/usePageTransition';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function useScrollNavigation(containerRef, { threshold, targetPath, targetName, direction = 'up' }) {
    const { navigateWithTransition } = usePageTransition();
    const hasNavigated = useRef(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    const resetNavigation = useCallback(() => {
        hasNavigated.current = false;
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const onScroll = () => {
            const scrollTop = Math.max(0, container.scrollTop);
            const scrollHeight = Math.max(1, container.scrollHeight - container.clientHeight);
            const progress = Math.max(0, Math.min(1, scrollTop / scrollHeight));

            setScrollProgress(progress);

            if (progress >= threshold && !hasNavigated.current) {
                hasNavigated.current = true;
                navigateWithTransition(targetPath, targetName, direction);
            }
        };

        container.addEventListener('scroll', onScroll);
        return () => container.removeEventListener('scroll', onScroll);
    }, [containerRef, threshold, targetPath, targetName, direction, navigateWithTransition]);

    return { scrollProgress, resetNavigation };
}
