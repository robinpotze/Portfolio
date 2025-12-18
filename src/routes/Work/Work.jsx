import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ANIMATION_TIMING, SCROLL_THRESHOLDS } from '@config/animations';
import { NavigationMenu } from '@components/layout/NavigationMenu/NavigationMenu';
import { useWorkStore } from '@/stores/workStore';
import WorkCanvas from '@canvas/work/WorkCanvas';
import { CurtainTransition, ErrorBoundary, LaserFlow } from '@components';
import './Work.css';

export default function Work() {
    const navigate = useNavigate();
    const items = useWorkStore((state) => state.items);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [canvasScrollOffset, setCanvasScrollOffset] = useState(0);
    const [curtainOpen, setCurtainOpen] = useState(false);
    const hasNavigated = useRef(false);
    const hasEntryAnimated = useRef(false);

    // Entry animation: start with curtain covering, then reveal
    useEffect(() => {
        if (hasEntryAnimated.current) return;
        hasEntryAnimated.current = true;

        // Start covered, then reveal after a brief moment
        setCurtainOpen(true);
        setTimeout(() => {
            setCurtainOpen(false);
        }, ANIMATION_TIMING.CURTAIN_REVEAL_DELAY);
    }, []);

    const handleCardNavigate = useCallback((pageKey) => {
        navigate(`/work/${pageKey}`);
    }, [navigate]);

    const handleCanvasScrollChange = useCallback((offset) => {
        setCanvasScrollOffset(offset);
    }, []);

    // Track upward scroll for transition back to home (only when at top)
    useEffect(() => {
        let scrollAmount = 0;
        const maxScroll = SCROLL_THRESHOLDS.WORK_MAX_SCROLL;

        const handleWheel = (e) => {
            // Only track if canvas is at the top (offset near 0)
            if (canvasScrollOffset > 0.01) {
                setScrollProgress(0);
                scrollAmount = 0;
                return;
            }

            if (e.deltaY < 0) {
                // Scrolling up
                scrollAmount += Math.abs(e.deltaY);
            } else {
                // Scrolling down - reset
                scrollAmount = Math.max(0, scrollAmount - Math.abs(e.deltaY));
            }

            // Map 0-600px of upward scroll to 0-1 progress
            const progress = Math.min(scrollAmount, maxScroll) / maxScroll;
            setScrollProgress(progress);

            // Trigger curtain at threshold
            if (progress >= SCROLL_THRESHOLDS.WORK_RETURN && !hasNavigated.current) {
                setCurtainOpen(true);
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [canvasScrollOffset]);

    const handleRevealComplete = () => {
        // Entry animation finished, allow interactions
        // Curtain is already closed (isOpen=false)
    };

    const handleCoverComplete = () => {
        // Only navigate if this is an exit transition (not entry animation)
        if (hasNavigated.current || !hasEntryAnimated.current) return;
        hasNavigated.current = true;
        navigate('/', { state: { fromNavigation: true } });
    };

    return (
        <div className='work-page-container'>
            <CurtainTransition
                isOpen={curtainOpen}
                direction="up"
                onCoverComplete={handleCoverComplete}
                onRevealComplete={handleRevealComplete}
            />
            <NavigationMenu />
            <ErrorBoundary>
                <WorkCanvas
                    items={items}
                    onCardNavigate={handleCardNavigate}
                    onScrollChange={handleCanvasScrollChange}
                />
            </ErrorBoundary>
        </div>
    );
}