import { CAROUSEL_CONFIG } from '@config/carousel';
import { Float, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { calculateCardCenteredness, calculateCardScale } from '@utils/carousel';
import { useRef } from "react";
import WorkCardContent from './WorkCardContent';

export default function WorkCard({ item, index, progress, onNavigate, rigRef }) {
    const groupRef = useRef();

    const floatSpeed = useRef(
        ((index * 0.1234567) % 1) * 0.5 + 0.5
    ).current;

    const angle = index * CAROUSEL_CONFIG.ANGLE_STEP;
    const yOffset = index * CAROUSEL_CONFIG.VERTICAL_STEP;
    const basePosition = [
        Math.sin(angle) * CAROUSEL_CONFIG.RADIUS,
        yOffset,
        Math.cos(angle) * CAROUSEL_CONFIG.RADIUS
    ];
    const rotation = [0, angle, 0];

    useFrame(() => {
        if (!groupRef.current || !rigRef.current) return;

        const centeredness = calculateCardCenteredness(rigRef.current.rotation.y, index);
        const scale = calculateCardScale(centeredness);
        groupRef.current.scale.setScalar(scale);
    });

    return (
        <Float
            speed={floatSpeed}
            rotationIntensity={0.2}
            floatIntensity={0.2}
        >
            <group ref={groupRef} position={basePosition} rotation={rotation}>
                <Html
                    transform
                    distanceFactor={1}
                    position={[0, 0, 0]}
                    style={{
                        width: 'min(50vw, 88.89vh)',
                        aspectRatio: '16 / 9',
                        pointerEvents: 'auto'
                    }}
                    className={`work-card-html work-card-${index}`}
                >
                    <WorkCardContent
                        item={item}
                        index={index}
                        progress={progress}
                        onNavigate={onNavigate}
                    />
                </Html>
            </group>
        </Float>
    );
}
