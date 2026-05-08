import NineSliceBorder from '@components/ui/NineSliceBorder';
import { SPRING_CONFIG } from '@config/animation.config';
import { CANVAS_DPR, CANVAS_GL_DEFAULTS } from '@config/canvas.config';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import useAdaptiveQuality from '@hooks/useAdaptiveQuality';
import useBorderProjection from '@hooks/useBorderProjection';
import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import styles from '@routes/Work/Work.module.css';
import Lenis from 'lenis';
import { useMotionValue, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import WorkScene from './WorkScene';

function AdaptiveQualityMonitor({ enabled = true }) {
    useAdaptiveQuality({ enabled });
    return null;
}

export default function WorkCanvas({ items, onCardNavigate, onScrollChange, startAnimations = true }) {
    const scrollProgressRef = useRef(0);
    const containerRef = useRef(null);
    const cameraRef = useRef(null);
    const rigRef = useRef(null);
    const lenisRef = useRef(null);
    const [isMobile] = useState(() => window.innerWidth <= CAROUSEL_CONFIG.MOBILE.BREAKPOINT);

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
        springX: x,
        springY: y,
        springW: w,
        springH: h,
    });

    // Lenis smooth scrolling — replaces manual velocity/damping system
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const lenis = new Lenis({
            wrapper: container,
            orientation: isMobile ? 'horizontal' : 'vertical',
            lerp: CAROUSEL_CONFIG.LENIS.LERP,
            smoothWheel: true,
            wheelMultiplier: CAROUSEL_CONFIG.LENIS.WHEEL_MULTIPLIER,
            touchMultiplier: CAROUSEL_CONFIG.LENIS.TOUCH_MULTIPLIER,
        });

        lenisRef.current = lenis;

        const onScroll = ({ progress }) => {
            scrollProgressRef.current = progress;
        };
        lenis.on('scroll', onScroll);

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
            lenis.off('scroll', onScroll);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, [isMobile, items.length]);

    const canvasStyle = isMobile
        ? { position: 'sticky', left: 0, width: '100vw', height: '100dvh', touchAction: 'pan-x', flexShrink: 0 }
        : { position: 'sticky', top: 0, width: '100%', height: '100dvh', touchAction: 'pan-y' };

    const scrollStyle = isMobile
        ? { width: `${(items.length - 1) * 100}vw`, height: '100%', flexShrink: 0 }
        : { height: `${(items.length - 1) * 100}vh` };

    return (
        <div ref={containerRef} className={styles.canvasContainer}>
            <Canvas
                dpr={CANVAS_DPR}
                performance={{ min: 0.5 }}
                gl={{
                    ...CANVAS_GL_DEFAULTS,
                    antialias: false,
                }}
                style={canvasStyle}
            >
                <AdaptiveQualityMonitor enabled={startAnimations} />
                <PerspectiveCamera ref={cameraRef} makeDefault position={CAROUSEL_CONFIG.CAMERA.POSITION} fov={CAROUSEL_CONFIG.CAMERA.FOV} />
                <WorkScene
                    items={items}
                    scrollProgressRef={scrollProgressRef}
                    onCardNavigate={onCardNavigate}
                    onScrollChange={onScrollChange}
                    onCenterednessChange={onCenterednessChange}
                    rigRef={rigRef}
                    isMobile={isMobile}
                    startAnimations={startAnimations}
                />
            </Canvas>
            <div className={styles.scrollContent} style={scrollStyle} />
            <NineSliceBorder x={x} y={y} w={w} h={h} />
        </div>
    );
}
