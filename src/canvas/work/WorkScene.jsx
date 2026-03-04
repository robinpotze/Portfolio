import { CAROUSEL_CONFIG } from '@config/carousel.config';
import { useFrame, useThree } from '@react-three/fiber';
import { calculateCardCenteredness } from '@utils/carousel';
import { useRef } from "react";
import WorkCard from './WorkCard';
import './WorkScene.css';

export default function WorkScene({ items = [], scrollVelocityRef, onCardNavigate, onScrollChange, onCenterednessChange }) {
    const rigRef = useRef();
    const scrollOffsetRef = useRef(0);
    const centerednessRef = useRef([]);
    const { camera } = useThree();

    useFrame(() => {
        if (!rigRef.current || items.length === 0) return;

        // 1. Apply scroll velocity with damping (owns the scroll state)
        if (Math.abs(scrollVelocityRef.current) > CAROUSEL_CONFIG.SCROLL_DEADZONE) {
            scrollOffsetRef.current = Math.max(0, Math.min(1, scrollOffsetRef.current + scrollVelocityRef.current));
            scrollVelocityRef.current *= 1 - CAROUSEL_CONFIG.SCROLL_DAMPING;
        }

        const offset = scrollOffsetRef.current;

        // 2. Lerp rig rotation toward target
        const targetRotation = -offset * (items.length - 1) * CAROUSEL_CONFIG.ANGLE_STEP;
        rigRef.current.rotation.y += (targetRotation - rigRef.current.rotation.y) * CAROUSEL_CONFIG.LERP_SPEED;

        // 3. Camera follows the descending spiral (compensate for SCALE_FACTOR)
        camera.position.y = offset * (items.length - 1) * CAROUSEL_CONFIG.VERTICAL_STEP * CAROUSEL_CONFIG.SCALE_FACTOR;

        // 4. Compute centeredness for every card once — cards read from this ref
        let minCenteredness = 1;
        let bestIndex = 0;
        for (let i = 0; i < items.length; i++) {
            const c = calculateCardCenteredness(rigRef.current.rotation.y, i);
            centerednessRef.current[i] = c;
            if (c < minCenteredness) {
                minCenteredness = c;
                bestIndex = i;
            }
        }

        // 5. Notify parent (border tracking + scroll-to-exit)
        if (onCenterednessChange) onCenterednessChange(minCenteredness, bestIndex);
        if (onScrollChange) onScrollChange(offset);
    });

    if (!items?.length) return null;

    return (
        <>
            <group scale={CAROUSEL_CONFIG.SCALE_FACTOR}>
                <group ref={rigRef}>
                    {items.map((item, i) => (
                        <WorkCard
                            key={item.key}
                            item={item}
                            index={i}
                            onNavigate={onCardNavigate}
                            centerednessRef={centerednessRef}
                        />
                    ))}
                </group>
            </group>
            <ambientLight intensity={1} />
        </>
    );
}
