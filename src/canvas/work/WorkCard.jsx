import { useQuality } from '@app/QualityContext';
import '@canvas/shared/materials/PixelOverlayMaterial';
import { FLOAT_CONFIG } from '@config/animation.config';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import useNoiseTexture from '@hooks/useNoiseTexture';
import { Float, Text, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { calculateCardPosition, calculateCardRotation, calculateCardScale } from '@utils/carousel';
import { getCSSVariable } from '@utils/cssUtils';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import './WorkCardMaterial';

// Derive card size from carousel geometry: slightly less than one polygon side
const chord = 2 * CAROUSEL_CONFIG.RADIUS * Math.sin(CAROUSEL_CONFIG.ANGLE_STEP / 2);
export const CARD_WIDTH = chord * CAROUSEL_CONFIG.CARD_GAP_FACTOR;
export const CARD_HEIGHT = CARD_WIDTH / CAROUSEL_CONFIG.CARD_ASPECT;

const LGHT_COLOR = getCSSVariable('--c-LGHT') || '#eee';

export default function WorkCard({ item, index, visible = true, onNavigate, centerednessRef }) {
    const groupRef = useRef();
    const cardRef = useRef();
    const materialRef = useRef();
    const { quality } = useQuality();
    const [hovered, setHovered] = useState(false);
    const hoverRef = useRef(0);

    const { data, key: pageKey } = item;

    const texture = useTexture(data.banner || '/img/work/ld58/Wallpaper.png');

    const textureSize = useMemo(() => {
        const img = texture.image;
        return img ? new THREE.Vector2(img.width, img.height) : new THREE.Vector2(1, 1);
    }, [texture]);

    const planeSize = useMemo(() => new THREE.Vector2(CARD_WIDTH, CARD_HEIGHT), []);

    const isLowQuality = quality === 'low';

    const noiseTexture = useNoiseTexture({
        size: isLowQuality ? 1 : 256,
        scale: 10,
        octaves: isLowQuality ? 1 : 3,
        persistence: 0.5,
    });

    // Per-quality shader uniforms
    const cardUniforms = useMemo(() => {
        switch (quality) {
            case 'low':
                return { uRoughness: 0, uRefractPower: 0, uChromaticAberration: 0 };
            case 'medium':
                return { uRoughness: 0.05, uRefractPower: 0.003, uChromaticAberration: 0.4 };
            default:
                return { uRoughness: 0.1, uRefractPower: 0.006, uChromaticAberration: 0.8 };
        }
    }, [quality]);

    const floatSpeed = useMemo(() => ((index * 0.1234567) % 1) * (FLOAT_CONFIG.SPEED_MAX - FLOAT_CONFIG.SPEED_MIN) + FLOAT_CONFIG.SPEED_MIN, [index]);

    const position = useMemo(() => calculateCardPosition(index), [index]);
    const rotation = useMemo(() => calculateCardRotation(index), [index]);

    const scaleRef = useRef(0);
    const wasVisibleRef = useRef(false);

    useFrame((state, delta) => {
        if (!groupRef.current) {
            return;
        }

        // Reset scale when becoming visible so it animates in
        if (visible && !wasVisibleRef.current) {
            scaleRef.current = 0;
        }
        wasVisibleRef.current = visible;

        if (!visible) {
            return;
        }

        const centeredness = centerednessRef.current[index] ?? 1;
        const targetScale = calculateCardScale(centeredness);
        const smoothing = 1 - Math.pow(0.001, delta);
        scaleRef.current += (targetScale - scaleRef.current) * smoothing;
        groupRef.current.scale.setScalar(scaleRef.current);

        // Animate hover uniform
        const target = hovered ? 1 : 0;
        hoverRef.current += (target - hoverRef.current) * Math.min(delta * 4, 1);

        if (materialRef.current) {
            materialRef.current.uHover = hoverRef.current;
            materialRef.current.uTime = state.clock.elapsedTime;
        }

        if (cardRef.current && !isLowQuality) {
            cardRef.current.uTime = state.clock.elapsedTime;
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
                visible={visible}
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
                {/* Glass card with banner refracted through it */}
                <mesh>
                    <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
                    <workCardMaterial
                        ref={cardRef}
                        uTexture={texture}
                        uNoiseTex={noiseTexture}
                        uTextureSize={textureSize}
                        uPlaneSize={planeSize}
                        uRoughness={cardUniforms.uRoughness}
                        uRefractPower={cardUniforms.uRefractPower}
                        uChromaticAberration={cardUniforms.uChromaticAberration}
                        toneMapped={false}
                    />
                </mesh>

                {/* Pixel hover overlay (shader) */}
                {!isLowQuality && (
                    <mesh position={[0, 0, CARD_WIDTH * 0.011]}>
                        <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
                        <pixelOverlayMaterial ref={materialRef} transparent depthWrite={false} />
                    </mesh>
                )}

                {/* Text content */}
                <group position={[0, 0, CARD_WIDTH * 0.012]}>
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
