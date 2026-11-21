import { useWorkItems } from '@app/WorkContext';
import { CAROUSEL_CONFIG } from '@canvas/features/carousel';
import ErrorBoundary from '@components/ErrorBoundary';
import LoadingScreen from '@components/navigation/LoadingScreen';
import { HOME_WORK, TIMEOUT } from '@config/animation.config';
import { usePageTransition } from '@hooks/usePageTransition';
import { useGLTF } from '@react-three/drei';
import { easeInOutSine } from '@utils/easingFunctions';
import Lenis from 'lenis';
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { decideUrl, getSegmentBounds, getSegments, pathForSegment, scrollForPath, snapTarget } from './homeWork';
import styles from './HomeWorkLayout.module.css';

const HomeWorkCanvas = lazy(() => import('@canvas/scenes/homeWork/HomeWorkCanvas'));

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/** Layout route for / and /work: one scroll timeline (home → morph → carousel), one canvas, URL kept in sync. */
export default function HomeWorkLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const items = useWorkItems();
    const { registerLocalNavigation } = usePageTransition();

    const rootRef = useRef(null);
    const scrollerRef = useRef(null);
    const spacerRef = useRef(null);
    const lenisRef = useRef(null);
    const boundsRef = useRef(null);
    const segmentsRef = useRef({ home: 0, morph: 0, carousel: 0, inCarousel: false, velocity: 0 });
    const pathnameRef = useRef(location.pathname);
    pathnameRef.current = location.pathname;
    const hasPushedRef = useRef(false);
    const seekingRef = useRef(false);

    const skipLoading = !!location.state?.fromNavigation;
    const [isLoading, setIsLoading] = useState(!skipLoading);
    const [sceneStarted, setSceneStarted] = useState(skipLoading);
    const [showContent, setShowContent] = useState(skipLoading);
    const loadingTimerRef = useRef(null);

    useEffect(() => {
        useGLTF.preload('/assets/3d/Logo.glb');
        useGLTF.preload('/assets/3d/Wall.glb');
    }, []);

    // Clear the curtain's navigation state after reading it.
    useEffect(() => {
        if (location.state?.fromNavigation) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state?.fromNavigation, location.pathname, navigate]);

    const syncUrl = useCallback(() => {
        const action = decideUrl(segmentsRef.current.inCarousel, pathnameRef.current, hasPushedRef.current);
        if (!action) {
            return;
        }
        if (!action.replace) {
            hasPushedRef.current = true;
        }
        navigate(action.path, { replace: action.replace });
    }, [navigate]);

    useLayoutEffect(() => {
        const root = rootRef.current;
        const scroller = scrollerRef.current;
        const spacer = spacerRef.current;
        const lenis = new Lenis({
            wrapper: scroller,
            content: spacer,
            lerp: CAROUSEL_CONFIG.LENIS.LERP,
            smoothWheel: true,
            wheelMultiplier: CAROUSEL_CONFIG.LENIS.WHEEL_MULTIPLIER,
            touchMultiplier: CAROUSEL_CONFIG.LENIS.TOUCH_MULTIPLIER,
        });
        lenisRef.current = lenis;

        const onScroll = ({ scroll, velocity }) => {
            const segments = getSegments(scroll, boundsRef.current);
            Object.assign(segmentsRef.current, segments, { velocity: velocity / window.innerHeight });
            // Overlay fades without React renders: Home's DOM leaves over the end of home, Work's border arrives at the end of the morph.
            const homeOut = clamp01((segments.home - 0.7) / 0.3);
            root.style.setProperty('--home-out', String(homeOut));
            // Fully faded Home overlay: not clickable or tabbable.
            root.toggleAttribute('data-home-hidden', homeOut >= 1);
            root.style.setProperty('--work-in', String(clamp01((segments.morph - 0.8) / 0.2)));
            if (!seekingRef.current) {
                syncUrl();
            }
        };

        let viewHeight = window.innerHeight;
        const measure = () => {
            boundsRef.current = getSegmentBounds(window.innerHeight, items.length, HOME_WORK);
            // Scroll range = content height − viewport height.
            spacer.style.height = `${boundsRef.current.total + window.innerHeight}px`;
            lenis.resize();
        };
        // All bounds are linear in viewport height, so the scroll position scales with it.
        const onResize = () => {
            const previous = viewHeight;
            viewHeight = window.innerHeight;
            measure();
            lenis.scrollTo((lenis.scroll * viewHeight) / previous, { immediate: true, force: true });
            onScroll({ scroll: lenis.scroll, velocity: 0 });
        };

        measure();
        lenis.on('scroll', onScroll);
        // User wheel/touch input interrupts a seek (Lenis replaces or stops the animation, so its onComplete never runs).
        lenis.on('virtual-scroll', ({ deltaX, deltaY }) => {
            if (seekingRef.current && (deltaX || deltaY)) {
                seekingRef.current = false;
                syncUrl();
            }
        });
        lenis.scrollTo(scrollForPath(pathnameRef.current, boundsRef.current), { immediate: true, force: true });
        onScroll({ scroll: lenis.scroll, velocity: 0 });
        window.addEventListener('resize', onResize);

        let rafId = 0;
        let idleFrames = 0;
        const raf = (time) => {
            lenis.raf(time);
            // Snap to the nearest card once the scroll settles, only inside the carousel.
            if (!lenis.isScrolling && !seekingRef.current) {
                idleFrames++;
                if (idleFrames === CAROUSEL_CONFIG.SNAP_IDLE_FRAMES) {
                    const target = snapTarget(lenis.scroll, boundsRef.current);
                    if (target !== null && Math.abs(lenis.scroll - target) > 1) {
                        lenis.scrollTo(target, { duration: CAROUSEL_CONFIG.SNAP_DURATION });
                    }
                }
            } else {
                idleFrames = 0;
            }
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', onResize);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, [items.length, syncUrl]);

    // Animated scroll to a route's segment; the morph plays on the way. URL syncs once it lands.
    const seek = useCallback(
        (pathname) => {
            const lenis = lenisRef.current;
            if (!lenis) {
                return;
            }
            seekingRef.current = true;
            lenis.scrollTo(scrollForPath(pathname, boundsRef.current), {
                duration: HOME_WORK.SEEK_DURATION,
                easing: easeInOutSine,
                force: true,
                onComplete: () => {
                    seekingRef.current = false;
                    syncUrl();
                },
            });
        },
        [syncUrl]
    );

    // Menu links between / and /work scroll instead of running the curtain.
    useEffect(
        () => registerLocalNavigation((path) => (path === '/' || path === '/work' ? (seek(path), true) : false)),
        [registerLocalNavigation, seek]
    );

    // Back/Forward: the URL moved but the scroll did not; follow it.
    useEffect(() => {
        if (!seekingRef.current && location.pathname !== pathForSegment(segmentsRef.current.inCarousel)) {
            // Back to '/' re-arms the push, so the next crossing into the carousel adds a /work entry again.
            hasPushedRef.current = location.pathname === '/work';
            seek(location.pathname);
        }
    }, [location.pathname, seek]);

    const onRevealStart = useCallback(() => setSceneStarted(true), []);
    const onLoadingComplete = () => {
        loadingTimerRef.current = setTimeout(() => {
            setIsLoading(false);
            setShowContent(true);
        }, TIMEOUT.COMPLETE_DELAY_MS);
    };
    useEffect(() => () => clearTimeout(loadingTimerRef.current), []);

    return (
        <div ref={rootRef}>
            {isLoading && (
                <LoadingScreen
                    onComplete={onLoadingComplete}
                    onRevealStart={onRevealStart}
                    minDisplayTime={TIMEOUT.LOADING_MIN_DISPLAY_MS}
                    logoSrc="/assets/img/logo/logo.svg"
                />
            )}
            <div ref={scrollerRef} id="home-work-scroller" className={styles.scroller}>
                <div ref={spacerRef} className={styles.spacer} />
                <Outlet context={{ showContent }} />
            </div>
            <ErrorBoundary>
                <Suspense fallback={null}>
                    <HomeWorkCanvas segmentsRef={segmentsRef} startAnimations={sceneStarted} />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
