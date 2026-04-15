import NineSliceBorder from '@components/decoration/NineSliceBorder';
import { SPRING_CONFIG } from '@config/animation.config';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import useBorderProjection from '@hooks/useBorderProjection';
import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import styles from '@routes/Work/Work.module.css';
import { useMotionValue, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import { useEffect, useRef } from 'react';
import WorkScene from './WorkScene';

export default function WorkCanvas({ items, onCardNavigate, onScrollChange }) {
    const scrollProgressRef = useRef(0);
    const containerRef = useRef(null);
    const cameraRef = useRef(null);
    const rigRef = useRef(null);
    const lenisRef = useRef(null);

    // Border spring animation values
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const rawW = useMotionValue(0);
    const rawH = useMotionValue(0);
    const x = useSpring(rawX, SPRING_CONFIG.BORDER_ANIMATION);
    const y = useSpring(rawY, SPRING_CONFIG.BORDER_ANIMATION);
    const w = useSpring(rawW, SPRING_CONFIG.BORDER_ANIMATION);
    const h = useSpring(rawH, SPRING_CONFIG.BORDER_ANIMATION);

    const onCenterednessChange = useBorderProjection(containerRef, cameraRef, rigRef, {
        rawX,
        rawY,
        rawW,
        rawH,
    });

    // Lenis smooth scrolling — replaces manual velocity/damping system
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const lenis = new Lenis({
            wrapper: container,
            content: container.firstElementChild,
            lerp: CAROUSEL_CONFIG.LENIS.LERP,
            smoothWheel: true,
            wheelMultiplier: CAROUSEL_CONFIG.LENIS.WHEEL_MULTIPLIER,
            touchMultiplier: CAROUSEL_CONFIG.LENIS.TOUCH_MULTIPLIER,
        });

        lenisRef.current = lenis;

        lenis.on('scroll', ({ progress }) => {
            scrollProgressRef.current = progress;
        });

        let mounted = true;
        let idleFrames = 0;

        function raf(time) {
            if (!mounted) {
                return;
            }
            lenis.raf(time);

            // Snap to nearest item after scroll settles
            if (!lenis.isScrolling && items.length > 1) {
                idleFrames++;
                if (idleFrames === CAROUSEL_CONFIG.SNAP_IDLE_FRAMES) {
                    const itemHeight = lenis.limit / (items.length - 1);
                    const nearest = Math.round(lenis.scroll / itemHeight) * itemHeight;
                    if (Math.abs(lenis.scroll - nearest) > 1) {
                        lenis.scrollTo(nearest, { duration: CAROUSEL_CONFIG.SNAP_DURATION });
                    }
                }
            } else {
                idleFrames = 0;
            }

            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            mounted = false;
            lenis.destroy();
            lenisRef.current = null;
        };
    }, [items.length]);

    return (
        <div ref={containerRef} className={styles.canvasContainer}>
            <div className={styles.scrollContent} style={{ height: `${items.length * 100}vh` }} />
            <Canvas
                dpr={[1, 1.5]}
                gl={{ antialias: false, powerPreference: 'high-performance' }}
                style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
                onCreated={({ camera }) => {
                    cameraRef.current = camera;
                }}
            >
                <PerspectiveCamera
                    makeDefault
                    position={CAROUSEL_CONFIG.CAMERA.POSITION}
                    fov={window.innerWidth <= 768 ? CAROUSEL_CONFIG.CAMERA.FOV + 15 : CAROUSEL_CONFIG.CAMERA.FOV}
                />
                <WorkScene
                    items={items}
                    scrollProgressRef={scrollProgressRef}
                    onCardNavigate={onCardNavigate}
                    onScrollChange={onScrollChange}
                    onCenterednessChange={onCenterednessChange}
                    rigRef={rigRef}
                />
            </Canvas>
            <NineSliceBorder x={x} y={y} w={w} h={h} />
        </div>
    );
}
