import NineSliceBorder from '@components/decoration/NineSliceBorder';
import { SPRING_CONFIG } from '@config/animation.config';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import { PerspectiveCamera, ScrollControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { calculateScrollPages } from '@utils/carousel';
import { useMotionValue, useSpring } from 'framer-motion';
import { useCallback, useRef } from 'react';
import WorkScene from './WorkScene';

export default function WorkCanvas({ items, onCardNavigate, onScrollChange }) {
    const pages = calculateScrollPages(items.length) * CAROUSEL_CONFIG.SCROLL_PAGES_MULTIPLIER;
    const initializedRef = useRef(false);

    // Raw motion values written every frame from useFrame callback
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const rawW = useMotionValue(0);
    const rawH = useMotionValue(0);

    // Springs that smooth out the raw values
    const x = useSpring(rawX, SPRING_CONFIG.BORDER_ANIMATION);
    const y = useSpring(rawY, SPRING_CONFIG.BORDER_ANIMATION);
    const w = useSpring(rawW, SPRING_CONFIG.BORDER_ANIMATION);
    const h = useSpring(rawH, SPRING_CONFIG.BORDER_ANIMATION);

    const handleCenterednessChange = useCallback((centeredness, bestIndex) => {
        // Query the actual rendered DOM element of the most-centered card
        const cardEl = document.querySelector(`.work-card-${bestIndex}`);
        if (!cardEl) return;

        const rect = cardEl.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const t = centeredness;
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Overshoot: at t=1 the border extends well past the viewport corners
        const overshoot = 1.5;
        const maxW = vw * overshoot;
        const maxH = vh * overshoot;

        // Interpolate size: card rect → oversized viewport
        const targetW = 100 + rect.width + t * (maxW - rect.width);
        const targetH = 100 + rect.height + t * (maxH - rect.height);

        // Interpolate center: card center → viewport center
        const cardCx = rect.left + rect.width / 2;
        const cardCy = rect.top + rect.height / 2;
        const targetX = cardCx + t * (vw / 2 - cardCx);
        const targetY = cardCy + t * (vh / 2 - cardCy);

        // On first frame, jump to position (no spring from 0,0)
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

    return (
        <div className="work-canvas-container" style={{ position: 'relative' }}>
            <Canvas
                shadows
                gl={{
                    antialias: true,
                    powerPreference: 'high-performance',
                    preserveDrawingBuffer: false
                }}
            >
                <PerspectiveCamera
                    makeDefault
                    position={CAROUSEL_CONFIG.CAMERA.POSITION}
                    fov={CAROUSEL_CONFIG.CAMERA.FOV}
                />
                <ScrollControls pages={pages} damping={CAROUSEL_CONFIG.SCROLL_DAMPING}>
                    <WorkScene
                        items={items}
                        progress={1}
                        onCardNavigate={onCardNavigate}
                        onScrollChange={onScrollChange}
                        onCenterednessChange={handleCenterednessChange}
                    />
                </ScrollControls>
            </Canvas>
            <NineSliceBorder x={x} y={y} w={w} h={h} />
        </div>
    );
}
