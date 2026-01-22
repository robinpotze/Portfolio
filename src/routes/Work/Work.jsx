import { useWorkItems } from '@/app/App';
import WorkCanvas from '@canvas/work/WorkCanvas';
import CurtainTransition from '@components/effects/CurtainTransition';
import ErrorBoundary from '@components/ErrorBoundary';
import { NavigationMenu } from '@components/layout/NavigationMenu/NavigationMenu';
import { ANIMATION_TIMING } from '@config/animations';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Work.css';

export default function Work() {
    const navigate = useNavigate();
    const items = useWorkItems();
    const [curtainOpen, setCurtainOpen] = useState(false);
    const hasNavigated = useRef(false);
    const hasEntryAnimated = useRef(false);

    // Entry animation: start with curtain covering, then reveal
    useEffect(() => {
        if (hasEntryAnimated.current) return;
        hasEntryAnimated.current = true;

        setCurtainOpen(true);
        setTimeout(() => {
            setCurtainOpen(false);
        }, ANIMATION_TIMING.CURTAIN_REVEAL_DELAY);
    }, []);

    const handleCardNavigate = useCallback((pageKey) => {
        if (hasNavigated.current) return;
        hasNavigated.current = true;
        setCurtainOpen(true);
        
        setTimeout(() => {
            navigate(`/work/${pageKey}`);
        }, ANIMATION_TIMING.CURTAIN_DURATION + ANIMATION_TIMING.LAYER_STAGGER_DELAY * 3);
    }, [navigate]);

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
                    setCurtainOpen(true);
                    setTimeout(() => {
                        navigate('/', { state: { fromNavigation: true } });
                    }, ANIMATION_TIMING.CURTAIN_DURATION + ANIMATION_TIMING.LAYER_STAGGER_DELAY * 3);
                }
            } else {
                // Any downward scroll resets the accumulator
                scrollAccumulator.current = 0;
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [navigate]);

    const handleRevealComplete = () => {
        // Entry animation finished
    };

    const handleCoverComplete = () => {
        // Curtain cover animation finished
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