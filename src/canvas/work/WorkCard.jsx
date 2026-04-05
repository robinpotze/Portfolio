import { useQuality } from '@app/QualityContext';
import '@canvas/shared/materials/PixelOverlayMaterial';
import { FLOAT_CONFIG } from '@config/animation.config';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import { Float, Text, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { calculateCardPosition, calculateCardRotation, calculateCardScale } from '@utils/carousel';
import { getCSSVariable } from '@utils/cssUtils';
import { useMemo, useRef, useState } from 'react';

// Derive card size from carousel geometry: slightly less than one polygon side
const chord = 2 * CAROUSEL_CONFIG.RADIUS * Math.sin(CAROUSEL_CONFIG.ANGLE_STEP / 2);
export const CARD_WIDTH = chord * CAROUSEL_CONFIG.CARD_GAP_FACTOR;
export const CARD_HEIGHT = CARD_WIDTH / CAROUSEL_CONFIG.CARD_ASPECT;

const LGHT_COLOR = getCSSVariable('--c-LGHT') || '#eee';

export default function WorkCard({ item, index, onNavigate, centerednessRef }) {
    const groupRef = useRef();
    const materialRef = useRef();
    const { quality } = useQuality();
    const [hovered, setHovered] = useState(false);
    const hoverRef = useRef(0);

    const { data, key: pageKey } = item;

    const texture = useTexture(data.banner || '/img/work/ld58/Wallpaper.png');

    const floatSpeed = useMemo(() => ((index * 0.1234567) % 1) * (FLOAT_CONFIG.SPEED_MAX - FLOAT_CONFIG.SPEED_MIN) + FLOAT_CONFIG.SPEED_MIN, [index]);

    const position = useMemo(() => calculateCardPosition(index), [index]);
    const rotation = useMemo(() => calculateCardRotation(index), [index]);

    const isLowQuality = quality === 'low';

    useFrame((state, delta) => {
        if (!groupRef.current) {
            return;
        }

        const centeredness = centerednessRef.current[index] ?? 1;
        groupRef.current.scale.setScalar(calculateCardScale(centeredness));

        // Animate hover uniform
        const target = hovered ? 1 : 0;
        hoverRef.current += (target - hoverRef.current) * Math.min(delta * 4, 1);

        if (materialRef.current) {
            materialRef.current.uHover = hoverRef.current;
            materialRef.current.uTime = state.clock.elapsedTime;
        }
    });

    const onClick = (e) => {
        e.stopPropagation();
        if (onNavigate) {
            onNavigate(pageKey);
        }
    };

    return (
        <Float speed={floatSpeed} rotationIntensity={isLowQuality ? 0 : 0.1} floatIntensity={isLowQuality ? 0 : 0.2}>
            <group
                ref={groupRef}
                position={position}
                rotation={rotation}
                onClick={onClick}
                onPointerEnter={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerLeave={() => {
                    setHovered(false);
                    document.body.style.cursor = 'auto';
                }}
            >
                {/* Banner background */}
                <mesh>
                    <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
                    <meshBasicMaterial map={texture} toneMapped={false} />
                </mesh>

                {/* Vignette darkening overlay */}
                <mesh position={[0, 0, 0.001]}>
                    <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
                    <meshBasicMaterial color="black" transparent opacity={0.35} />
                </mesh>

                {/* Pixel hover overlay (shader) */}
                {!isLowQuality && (
                    <mesh position={[0, 0, 0.002]}>
                        <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
                        <pixelOverlayMaterial ref={materialRef} transparent depthWrite={false} />
                    </mesh>
                )}

                {/* Text content */}
                <group position={[0, 0, 0.003]}>
                    <Text
                        fontSize={CARD_HEIGHT * 0.045}
                        font="/assets/fonts/Kode_Mono/static/KodeMono-Regular.ttf"
                        color={LGHT_COLOR}
                        anchorX="center"
                        anchorY="middle"
                        position={[0, CARD_HEIGHT * 0.1, 0.1]}
                    >
                        {data?.year?.toString() || ''}
                    </Text>
                    <Text
                        fontSize={CARD_HEIGHT * 0.11}
                        font="/assets/fonts/Orbitron/static/Orbitron-Medium.ttf"
                        color={LGHT_COLOR}
                        anchorX="center"
                        anchorY="middle"
                        position={[0, 0, 0.12]}
                    >
                        {data?.title || pageKey}
                    </Text>
                    <Text
                        fontSize={CARD_HEIGHT * 0.045}
                        font="/assets/fonts/Kode_Mono/static/KodeMono-Regular.ttf"
                        color={LGHT_COLOR}
                        anchorX="center"
                        anchorY="middle"
                        position={[0, -CARD_HEIGHT * 0.1, 0.1]}
                    >
                        {data?.client || ''}
                    </Text>
                </group>
            </group>
        </Float>
    );
}
