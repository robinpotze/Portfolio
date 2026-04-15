import NineSliceBorder from '@components/decoration/NineSliceBorder';
import { SPRING_CONFIG } from '@config/animation.config';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import useBorderProjection from '@hooks/useBorderProjection';
import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import styles from '@routes/Work/Work.module.css';
import { useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';
import WorkScene from './WorkScene';

export default function WorkCanvas({ items, onCardNavigate, onScrollChange }) {
    const scrollVelocityRef = useRef(0);
    const containerRef = useRef(null);
    const cameraRef = useRef(null);
    const rigRef = useRef(null);

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

    // Capture wheel and touch velocity — damping is handled in WorkScene's useFrame
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

        const onWheel = (e) => {
            e.preventDefault();
            scrollVelocityRef.current += e.deltaY * CAROUSEL_CONFIG.SCROLL_SENSITIVITY;
        };

        let touchStartY = null;

        const onTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
        };

        const onTouchMove = (e) => {
            if (touchStartY === null) {
                return;
            }
            e.preventDefault();
            const deltaY = touchStartY - e.touches[0].clientY;
            touchStartY = e.touches[0].clientY;
            scrollVelocityRef.current += deltaY * CAROUSEL_CONFIG.SCROLL_SENSITIVITY * 2;
        };

        const onTouchEnd = () => {
            touchStartY = null;
        };

        container.addEventListener('wheel', onWheel, { passive: false });
        container.addEventListener('touchstart', onTouchStart, { passive: true });
        container.addEventListener('touchmove', onTouchMove, { passive: false });
        container.addEventListener('touchend', onTouchEnd, { passive: true });
        return () => {
            container.removeEventListener('wheel', onWheel);
            container.removeEventListener('touchstart', onTouchStart);
            container.removeEventListener('touchmove', onTouchMove);
            container.removeEventListener('touchend', onTouchEnd);
        };
    }, []);

    return (
        <div ref={containerRef} className={styles.canvasContainer}>
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
                    scrollVelocityRef={scrollVelocityRef}
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
