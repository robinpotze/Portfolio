import { useQuality } from '@app/QualityContext';
import useNoiseTexture from '@canvas/core/textures/useNoiseTexture';
import { FLOAT_CONFIG } from '@config/animation.config';
import { Float, Text, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { getCSSVariable } from '@utils/cssUtils';
import { entryEase } from '@utils/easingFunctions';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CARD_HEIGHT, CARD_WIDTH } from './cardGeometry';
import { calculateCardPosition, calculateCardRotation, calculateCardScale } from './carousel';
import { CAROUSEL_CONFIG } from './carousel.config';
import './PixelOverlayMaterial';
import './WorkCardMaterial';

const { clamp, damp } = THREE.MathUtils;

// Glass refraction per quality tier (off on low).
const CARD_QUALITY = {
    low: { uRoughness: 0, uRefractPower: 0, uChromaticAberration: 0 },
    medium: { uRoughness: 0.05, uRefractPower: 0.003, uChromaticAberration: 0.4 },
    high: { uRoughness: 0.1, uRefractPower: 0.006, uChromaticAberration: 0.8 },
};
// Smoothing rates: scale toward its centeredness target (ln 1000: closes 99.9% of the gap per second), hover overlay in/out.
const SCALE_DAMPING = Math.log(1000);
const HOVER_DAMPING = 4;

const PLANE_SIZE = new THREE.Vector2(CARD_WIDTH, CARD_HEIGHT);
const LABEL = { color: getCSSVariable('--c-LGHT') || '#eee', anchorX: 'center', anchorY: 'middle' };
const MONO_FONT = '/assets/fonts/Kode_Mono/static/KodeMono-Regular.ttf';
const TITLE_FONT = '/assets/fonts/Orbitron/static/Orbitron-Medium.ttf';

export default function WorkCard({ item, index, visible = true, onNavigate, centerednessRef, entryComplete = false, entryDelay = 0 }) {
    const groupRef = useRef();
    const overlayRef = useRef();
    const scaleRef = useRef(0);
    const hoverRef = useRef(0);
    const entryTimeRef = useRef(null);
    const wasVisibleRef = useRef(false);
    const [hovered, setHovered] = useState(false);
    const { quality } = useQuality();
    const isLowQuality = quality === 'low';

    const { data, key: pageKey } = item;
    const texture = useTexture(data.banner || '/assets/img/logo/logo.png');
    const textureSize = useMemo(() => new THREE.Vector2(texture.image?.width ?? 1, texture.image?.height ?? 1), [texture]);
    const noiseTexture = useNoiseTexture({ size: isLowQuality ? 64 : 256, scale: 10, octaves: isLowQuality ? 2 : 3, persistence: 0.5 });
    const position = useMemo(() => calculateCardPosition(index), [index]);
    const rotation = useMemo(() => calculateCardRotation(index), [index]);

    useFrame(({ clock }, delta) => {
        const group = groupRef.current;
        if (!group) {
            return;
        }
        // Stay hidden until the camera entry completes, then grow in with a per-card stagger.
        if (!entryComplete) {
            group.scale.setScalar(0);
            scaleRef.current = 0;
            return;
        }
        if (entryTimeRef.current === null) {
            entryTimeRef.current = clock.elapsedTime + entryDelay;
        }
        const entryT = clamp((clock.elapsedTime - entryTimeRef.current) / CAROUSEL_CONFIG.ENTRY.CARD_DURATION, 0, 1);

        // Re-grow from 0 whenever the card becomes visible again.
        if (visible && !wasVisibleRef.current) {
            scaleRef.current = 0;
        }
        wasVisibleRef.current = visible;
        if (!visible) {
            return;
        }

        const targetScale = calculateCardScale(centerednessRef.current[index] ?? 1);
        scaleRef.current = damp(scaleRef.current, targetScale, SCALE_DAMPING, delta);
        group.scale.setScalar(entryT < 1 ? scaleRef.current * entryEase(entryT) : scaleRef.current);

        hoverRef.current = damp(hoverRef.current, hovered ? 1 : 0, HOVER_DAMPING, delta);
        if (overlayRef.current) {
            overlayRef.current.uHover = hoverRef.current;
            overlayRef.current.uTime = clock.elapsedTime;
        }
    });

    return (
        <Float speed={FLOAT_CONFIG.SPEED} rotationIntensity={FLOAT_CONFIG.ROTATION_INTENSITY} floatIntensity={FLOAT_CONFIG.INTENSITY}>
            <group
                ref={groupRef}
                position={position}
                rotation={rotation}
                visible={visible}
                onClick={(e) => {
                    e.stopPropagation();
                    onNavigate?.(pageKey);
                }}
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
                        uTexture={texture}
                        uNoiseTex={noiseTexture}
                        uTextureSize={textureSize}
                        uPlaneSize={PLANE_SIZE}
                        {...CARD_QUALITY[quality]}
                        toneMapped={false}
                    />
                </mesh>

                {/* Pixel hover overlay */}
                {!isLowQuality && (
                    <mesh position={[0, 0, CARD_WIDTH * 0.011]}>
                        <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
                        <pixelOverlayMaterial ref={overlayRef} transparent depthWrite={false} />
                    </mesh>
                )}

                {/* Text content */}
                <group position={[0, 0, CARD_WIDTH * 0.012]}>
                    <Text {...LABEL} font={MONO_FONT} fontSize={CARD_HEIGHT * 0.045} position={[0, CARD_HEIGHT * 0.1, 0.1]}>
                        {data?.year?.toString() || ''}
                    </Text>
                    <Text {...LABEL} font={TITLE_FONT} fontSize={CARD_HEIGHT * 0.11} position={[0, 0, 0.12]}>
                        {data?.title || pageKey}
                    </Text>
                    <Text {...LABEL} font={MONO_FONT} fontSize={CARD_HEIGHT * 0.045} position={[0, -CARD_HEIGHT * 0.1, 0.1]}>
                        {data?.client || ''}
                    </Text>
                </group>
            </group>
        </Float>
    );
}
