import NineSliceBorder from '@components/decoration/NineSliceBorder';
import { SPRING_CONFIG } from '@config/animation.config';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { calculateCardPosition, calculateCardScale } from '@utils/carousel';
import { useMotionValue, useSpring } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CARD_HEIGHT, CARD_WIDTH } from './WorkCard';
import WorkScene from './WorkScene';

// Reusable vectors to avoid allocation per frame
const _cardLocal = new THREE.Vector3();
const _cardWorld = new THREE.Vector3();
const _cornerA = new THREE.Vector3();
const _cornerB = new THREE.Vector3();

export default function WorkCanvas({ items, onCardNavigate, onScrollChange }) {
    const initializedRef = useRef(false);
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

    const handleCenterednessChange = useCallback(
        (centeredness, bestIndex) => {
            const container = containerRef.current;
            const camera = cameraRef.current;
            const rig = rigRef.current;
            if (!container || !camera || !rig) {
                return;
            }

            const rect = container.getBoundingClientRect();

            // Ensure matrices reflect the rig rotation and camera position set this frame
            rig.updateWorldMatrix(true, false);
            camera.updateMatrixWorld();

            const localPos = calculateCardPosition(bestIndex);
            const angle = bestIndex * CAROUSEL_CONFIG.ANGLE_STEP;
            const cardScale = calculateCardScale(centeredness);
            const halfW = CARD_WIDTH * 0.5 * cardScale;
            const halfH = CARD_HEIGHT * 0.5 * cardScale;

            // Project card center — localToWorld already includes parent SCALE_FACTOR
            _cardLocal.set(localPos[0], localPos[1], localPos[2]);
            rig.localToWorld(_cardWorld.copy(_cardLocal));

            const projected = _cardWorld.clone().project(camera);
            const screenX = (projected.x * 0.5 + 0.5) * rect.width + rect.left;
            const screenY = (-projected.y * 0.5 + 0.5) * rect.height + rect.top;

            // Project corners accounting for card's Y-rotation on the carousel
            // Card local X-axis after Y-rotation: (cos(angle), 0, -sin(angle))
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            _cornerA.set(localPos[0] - cosA * halfW, localPos[1] - halfH, localPos[2] + sinA * halfW);
            rig.localToWorld(_cornerA);
            _cornerA.project(camera);

            _cornerB.set(localPos[0] + cosA * halfW, localPos[1] + halfH, localPos[2] - sinA * halfW);
            rig.localToWorld(_cornerB);
            _cornerB.project(camera);

            const cardScreenW = Math.abs(_cornerB.x - _cornerA.x) * 0.5 * rect.width;
            const cardScreenH = Math.abs(_cornerB.y - _cornerA.y) * 0.5 * rect.height;

            const t = centeredness;
            const vw = globalThis.innerWidth;
            const vh = globalThis.innerHeight;
            const overshoot = 1.5;

            const targetX = screenX + t * (vw / 2 - screenX);
            const targetY = screenY + t * (vh / 2 - screenY);
            const targetW = 100 + cardScreenW + t * (vw * overshoot - cardScreenW);
            const targetH = 100 + cardScreenH + t * (vh * overshoot - cardScreenH);

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
        },
        [rawX, rawY, rawW, rawH]
    );

    // Capture wheel velocity — damping is handled in WorkScene's useFrame
    useEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }

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
                dpr={[1, 1.5]}
                gl={{ antialias: false, powerPreference: 'high-performance' }}
                style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
                onCreated={({ camera }) => {
                    cameraRef.current = camera;
                }}
            >
                <PerspectiveCamera makeDefault position={CAROUSEL_CONFIG.CAMERA.POSITION} fov={CAROUSEL_CONFIG.CAMERA.FOV} />
                <WorkScene
                    items={items}
                    scrollVelocityRef={scrollVelocityRef}
                    onCardNavigate={onCardNavigate}
                    onScrollChange={onScrollChange}
                    onCenterednessChange={handleCenterednessChange}
                    rigRef={rigRef}
                />
            </Canvas>
            <NineSliceBorder x={x} y={y} w={w} h={h} />
        </div>
    );
}
