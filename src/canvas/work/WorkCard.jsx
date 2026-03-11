import { FLOAT_CONFIG } from '@config/animation.config';
import { Float, Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { calculateCardPosition, calculateCardRotation, calculateCardScale } from '@utils/carousel';
import { useMemo, useRef } from 'react';
import WorkCardContent from './WorkCardContent';

export default function WorkCard({ item, index, onNavigate, centerednessRef }) {
    const groupRef = useRef();

    const floatSpeed = useMemo(
        () => ((index * 0.1234567) % 1) * (FLOAT_CONFIG.SPEED_MAX - FLOAT_CONFIG.SPEED_MIN) + FLOAT_CONFIG.SPEED_MIN,
        [index]
    );

    const position = useMemo(() => calculateCardPosition(index), [index]);
    const rotation = useMemo(() => calculateCardRotation(index), [index]);

    useFrame(() => {
        if (!groupRef.current) { return; }
        const centeredness = centerednessRef.current[index] ?? 1;
        groupRef.current.scale.setScalar(calculateCardScale(centeredness));
    });

    return (
        <Float speed={floatSpeed} rotationIntensity={0.1} floatIntensity={0.2}>
            <group ref={groupRef} position={position} rotation={rotation}>
                <Html
                    transform
                    distanceFactor={1}
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
                        onNavigate={onNavigate}
                    />
                </Html>
            </group>
        </Float>
    );
}
