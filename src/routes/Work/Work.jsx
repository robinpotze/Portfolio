import { useWorkItems } from '@app/WorkContext';
import ErrorBoundary from '@components/ErrorBoundary';
import { SCROLL_THRESHOLDS } from '@config/animation.config';
import { usePageTransition } from '@hooks/usePageTransition';
import { prefetchEntryPages } from '@routes/Entry/pages/autogen';
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import styles from './Work.module.css';

const WorkCanvas = lazy(() => import('@canvas/work/WorkCanvas'));

export default function Work() {
    const { navigateWithTransition } = usePageTransition();
    const items = useWorkItems();
    const hasNavigated = useRef(false);
    const [isTouchDevice] = useState(() => 'ontouchstart' in window);

    // Prefetch entry page bundles so navigation is instant
    useEffect(() => {
        prefetchEntryPages();
    }, []);

    const onCardNavigate = useCallback(
        (pageKey) => {
            if (hasNavigated.current) {
                return;
            }
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

    const onCanvasScrollChange = useCallback((offset) => {
        isAtTop.current = offset < SCROLL_THRESHOLDS.WORK_TOP_THRESHOLD;

        // Reset accumulator if not at top
        if (!isAtTop.current) {
            scrollAccumulator.current = 0;
        }
    }, []);

    useEffect(() => {
        const handleScrollDelta = (deltaY) => {
            const now = Date.now();
            const timeSinceLastScroll = now - lastScrollTime.current;
            lastScrollTime.current = now;

            // Reset accumulator if too much time has passed
            if (timeSinceLastScroll > SCROLL_THRESHOLDS.WORK_SCROLL_TIMEOUT) {
                scrollAccumulator.current = 0;
            }

            // Only accumulate upward scroll when at the very top
            if (isAtTop.current && deltaY < 0) {
                scrollAccumulator.current += Math.abs(deltaY);

                // Trigger exit after persistent upward scrolling
                if (scrollAccumulator.current > SCROLL_THRESHOLDS.WORK_MAX_SCROLL && !hasNavigated.current) {
                    hasNavigated.current = true;
                    navigateWithTransition('/', 'Home', 'down');
                }
            } else {
                // Any downward scroll resets the accumulator
                scrollAccumulator.current = 0;
            }
        };

        const onWheel = (e) => {
            handleScrollDelta(e.deltaY);
        };

        let touchStartY = null;

        const onTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
        };

        const onTouchMove = (e) => {
            if (touchStartY === null) {
                return;
            }
            const currentY = e.touches[0].clientY;
            // Positive deltaY = finger moved up = scroll down; negative = finger moved down = scroll up
            const deltaY = touchStartY - currentY;
            touchStartY = currentY;
            handleScrollDelta(deltaY);
        };

        const onTouchEnd = () => {
            touchStartY = null;
        };

        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', onTouchEnd);
        };
    }, [navigateWithTransition]);

    return (
        <ErrorBoundary>
            <div className={styles.pageContainer}>
                <ErrorBoundary>
                    <Suspense fallback={null}>
                        <WorkCanvas items={items} onCardNavigate={onCardNavigate} onScrollChange={onCanvasScrollChange} startAnimations />
                    </Suspense>
                </ErrorBoundary>
                {isTouchDevice && <p className={styles.touchHint}>Swipe to browse</p>}
            </div>
        </ErrorBoundary>
    );
}
