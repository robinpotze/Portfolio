import { useWorkItems } from '@/app/App';
import WorkCanvas from '@canvas/work/WorkCanvas';
import ErrorBoundary from '@components/ErrorBoundary';
import { usePageTransition } from '@hooks/usePageTransition';
import { useCallback, useEffect, useRef } from 'react';
import './Work.css';

export default function Work() {
    const { navigateWithTransition } = usePageTransition();
    const items = useWorkItems();
    const hasNavigated = useRef(false);

    const handleCardNavigate = useCallback(
        (pageKey) => {
            if (hasNavigated.current) return;
            hasNavigated.current = true;
            const item = items.find((i) => i.key === pageKey);
            navigateWithTransition(`/work/${pageKey}`, item?.data?.title || pageKey, 'up');
        },
        [items, navigateWithTransition]
    );

    // Handle scroll-to-exit only when at very top and scrolling up persistently
    const scrollAccumulator = useRef(0);
    const lastScrollTime = useRef(Date.now());
    const isAtTop = useRef(true);

    const handleCanvasScrollChange = useCallback((offset) => {
        isAtTop.current = offset < 0.02; // Consider "at top" if within 2% of start

        // Reset accumulator if not at top
        if (!isAtTop.current) {
            scrollAccumulator.current = 0;
        }
    }, []);

    useEffect(() => {
        const handleWheel = (e) => {
            const now = Date.now();
            const timeSinceLastScroll = now - lastScrollTime.current;
            lastScrollTime.current = now;

            // Reset accumulator if too much time has passed
            if (timeSinceLastScroll > 500) {
                scrollAccumulator.current = 0;
            }

            // Only accumulate upward scroll when at the very top
            if (isAtTop.current && e.deltaY < 0) {
                scrollAccumulator.current += Math.abs(e.deltaY);

                // Trigger exit after persistent upward scrolling (600px equivalent)
                if (scrollAccumulator.current > 600 && !hasNavigated.current) {
                    hasNavigated.current = true;
                    navigateWithTransition('/', 'Home', 'down');
                }
            } else {
                // Any downward scroll resets the accumulator
                scrollAccumulator.current = 0;
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [navigateWithTransition]);

    return (
        <ErrorBoundary>
            <div className="work-page-container">
                <ErrorBoundary>
                    <WorkCanvas items={items} onCardNavigate={handleCardNavigate} onScrollChange={handleCanvasScrollChange} />
                </ErrorBoundary>
            </div>
        </ErrorBoundary>
    );
}
