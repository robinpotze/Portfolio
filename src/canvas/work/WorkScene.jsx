import { useRef } from "react";
import { Html, useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CAROUSEL_CONFIG } from '@config/carousel';
import { FLOAT_CONFIG } from '@config/animations';
import { calculateFloatOffset } from '@utils/animation';
import { calculateCardCenteredness, calculateCardScale } from '@utils/carousel';
import WorkCardContent from './WorkCardContent';
import './WorkScene.css';

export default function WorkScene({ items = [], progress = 1, onCardNavigate, onScrollChange }) {
    const eased = Math.min(1, Math.max(0, progress));
    const scroll = useScroll();
    const rigRef = useRef();

    useFrame(({ clock }) => {
        if (onScrollChange && scroll) {
            onScrollChange(scroll.offset);
        }

        if (rigRef.current) {
            const totalRotation = (items.length - 1) * CAROUSEL_CONFIG.ANGLE_STEP;
            const targetRotation = -scroll.offset * totalRotation;
            rigRef.current.rotation.y += (targetRotation - rigRef.current.rotation.y) * CAROUSEL_CONFIG.LERP_SPEED;
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

function WorkCard({ item, index, progress, onNavigate, rigRef }) {
    const groupRef = useRef();
    const floatSpeed = useRef(
        ((index * 0.1234567) % 1) * (FLOAT_CONFIG.SPEED_MAX - FLOAT_CONFIG.SPEED_MIN) + FLOAT_CONFIG.SPEED_MIN
    );

    const angle = index * CAROUSEL_CONFIG.ANGLE_STEP;
    const yOffset = index * CAROUSEL_CONFIG.VERTICAL_STEP;
    const basePosition = [
        Math.sin(angle) * CAROUSEL_CONFIG.RADIUS,
        yOffset,
        Math.cos(angle) * CAROUSEL_CONFIG.RADIUS
    ];
    const rotation = [0, angle, 0];

    useFrame(({ clock }) => {
        if (!groupRef.current) return;

        const floatOffset = calculateFloatOffset(
            clock.getElapsedTime(),
            index,
            floatSpeed.current
        );

        groupRef.current.position.x = basePosition[0] + floatOffset.x;
        groupRef.current.position.y = basePosition[1] + floatOffset.y;
        groupRef.current.position.z = basePosition[2] + floatOffset.z;

        if (rigRef.current) {
            const centeredness = calculateCardCenteredness(rigRef.current.rotation.y, index);
            const scale = calculateCardScale(centeredness);
            groupRef.current.scale.setScalar(scale);
        }
    });

    return (
        <group ref={groupRef} position={basePosition} rotation={rotation}>
            <Html
                transform
                distanceFactor={1}
                position={[0, 0, 0]}
                style={{
                    width: '50vw',
                    height: '50vh',
                    pointerEvents: 'auto'
                }}
            >
                <WorkCardContent
                    item={item}
                    index={index}
                    progress={progress}
                    onNavigate={onNavigate}
                />
            </Html>
        </group>
    );
}
