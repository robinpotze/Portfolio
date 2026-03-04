import NineSliceBorder from '@components/decoration/NineSliceBorder';
import { SPRING_CONFIG } from '@config/animation.config';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMotionValue, useSpring } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';
import WorkScene from './WorkScene';

export default function WorkCanvas({ items, onCardNavigate, onScrollChange }) {
    const initializedRef = useRef(false);
    const scrollVelocityRef = useRef(0);
    const containerRef = useRef(null);

    // Border spring animation values
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const rawW = useMotionValue(0);
    const rawH = useMotionValue(0);
    const x = useSpring(rawX, SPRING_CONFIG.BORDER_ANIMATION);
    const y = useSpring(rawY, SPRING_CONFIG.BORDER_ANIMATION);
    const w = useSpring(rawW, SPRING_CONFIG.BORDER_ANIMATION);
    const h = useSpring(rawH, SPRING_CONFIG.BORDER_ANIMATION);

    const handleCenterednessChange = useCallback((centeredness, bestIndex) => {
        const cardEl = document.querySelector(`.work-card-${bestIndex}`);
        if (!cardEl) return;

        const rect = cardEl.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const t = centeredness;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const overshoot = 1.5;

        const targetX = rect.left + rect.width / 2 + t * (vw / 2 - rect.left - rect.width / 2);
        const targetY = rect.top + rect.height / 2 + t * (vh / 2 - rect.top - rect.height / 2);
        const targetW = 100 + rect.width + t * (vw * overshoot - rect.width);
        const targetH = 100 + rect.height + t * (vh * overshoot - rect.height);

        if (!initializedRef.current) {
            initializedRef.current = true;
            rawX.jump(targetX);
            rawY.jump(targetY);
            rawW.jump(targetW);
            rawH.jump(targetH);
        } else {
            rawX.set(targetX);
            rawY.set(targetY);
            rawW.set(targetW);
            rawH.set(targetH);
        }
    }, [rawX, rawY, rawW, rawH]);

    // Capture wheel velocity — damping is handled in WorkScene's useFrame
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            e.preventDefault();
            scrollVelocityRef.current += e.deltaY * CAROUSEL_CONFIG.SCROLL_SENSITIVITY;
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, []);

    return (
        <div ref={containerRef} className="work-canvas-container">
            <Canvas
                shadows
                gl={{ antialias: true, powerPreference: 'high-performance' }}
                style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
            >
                <PerspectiveCamera
                    makeDefault
                    position={CAROUSEL_CONFIG.CAMERA.POSITION}
                    fov={CAROUSEL_CONFIG.CAMERA.FOV}
                />
                <WorkScene
                    items={items}
                    scrollVelocityRef={scrollVelocityRef}
                    onCardNavigate={onCardNavigate}
                    onScrollChange={onScrollChange}
                    onCenterednessChange={handleCenterednessChange}
                />
            </Canvas>
            <NineSliceBorder x={x} y={y} w={w} h={h} />
        </div>
    );
}
