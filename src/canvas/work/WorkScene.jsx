import { CAROUSEL_CONFIG } from '@config/carousel.config';
import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { calculateCardCenteredness } from '@utils/carousel';
import { useRef } from "react";
import WorkCard from './WorkCard';
import './WorkScene.css';

export default function WorkScene({ items = [], progress = 1, onCardNavigate, onScrollChange, onCenterednessChange }) {
    const eased = Math.min(1, Math.max(0, progress));
    const scroll = useScroll();
    const rigRef = useRef();
    const targetRotationRef = useRef(0);

    useFrame(() => {
        if (onScrollChange && scroll) {
            onScrollChange(scroll.offset);
        }

        if (rigRef.current && items.length > 0) {
            const totalRotation = (items.length - 1) * CAROUSEL_CONFIG.ANGLE_STEP;
            const targetRotation = -scroll.offset * totalRotation;

            // Update target
            targetRotationRef.current = targetRotation;

            // Smooth lerp towards target
            const delta = targetRotation - rigRef.current.rotation.y;
            rigRef.current.rotation.y += delta * CAROUSEL_CONFIG.LERP_SPEED;

            // Find the most-centered card (lowest centeredness value)
            if (onCenterednessChange) {
                let minCenteredness = 1;
                let bestIndex = 0;
                for (let i = 0; i < items.length; i++) {
                    const c = calculateCardCenteredness(rigRef.current.rotation.y, i);
                    if (c < minCenteredness) {
                        minCenteredness = c;
                        bestIndex = i;
                    }
                }
                onCenterednessChange(minCenteredness, bestIndex);
            }
        }
    });

    if (!items?.length) return null;

    return (
        <>
            <group
                scale={CAROUSEL_CONFIG.SCALE_FACTOR}
                position={[0, (1 - eased) * 1, 0]}
            >
                <group ref={rigRef}>
                    {items.map((item, i) => (
                        <WorkCard
                            key={item.key}
                            item={item}
                            index={i}
                            progress={eased}
                            onNavigate={onCardNavigate}
                            rigRef={rigRef}
                        />
                    ))}
                </group>
            </group>
            <ambientLight intensity={0.4 + eased * 0.6} />
        </>
    );
}
