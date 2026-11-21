import { useQuality } from '@app/QualityContext';
import { FLOAT_CONFIG } from '@config/animation.config';
import { Float, Text, useCursor, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { getCSSVariable } from '@utils/cssUtils';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CARD_HEIGHT, CARD_WIDTH } from './cardGeometry';
import { calculateCardPosition, calculateCardFrameScale, calculateCardRotation } from './carousel';
import './PixelOverlayMaterial';
import './WorkCardMaterial';

const { damp } = THREE.MathUtils;

// Glass refraction per quality tier (off on low).
const CARD_QUALITY = {
    low: { uRoughness: 0, uRefractPower: 0, uChromaticAberration: 0 },
    medium: { uRoughness: 0.05, uRefractPower: 0.003, uChromaticAberration: 0.4 },
    high: { uRoughness: 0.1, uRefractPower: 0.006, uChromaticAberration: 0.8 },
};
// Smoothing rate of the hover overlay in/out.
const HOVER_DAMPING = 4;

const PLANE_SIZE = new THREE.Vector2(CARD_WIDTH, CARD_HEIGHT);
const LABEL = { color: getCSSVariable('--c-LGHT') || '#eee', anchorX: 'center', anchorY: 'middle' };
const MONO_FONT = '/assets/fonts/Kode_Mono/static/KodeMono-Regular.ttf';
const TITLE_FONT = '/assets/fonts/Orbitron/static/Orbitron-Medium.ttf';

// Raycasting ignores `visible`, so a hidden card (or one inside the hidden rig) must not take pointer events.
function isShown(object) {
    for (let o = object; o; o = o.parent) {
        if (!o.visible) {
            return false;
        }
    }
    return true;
}

export default function WorkCard({ item, index, visible = true, onNavigate, noiseTexture, centerednessRef, segmentsRef }) {
    const groupRef = useRef();
    const overlayRef = useRef();
    const hoverRef = useRef(0);
    const [hovered, setHovered] = useState(false);
    // Resets the cursor on unmount too: clicking a card navigates away before onPointerLeave can fire.
    useCursor(hovered);
    const { quality } = useQuality();
    const isLowQuality = quality === 'low';

    const { data, key: pageKey } = item;
    const texture = useTexture(data.banner || '/assets/img/logo/logo.png');
    const textureSize = useMemo(() => new THREE.Vector2(texture.image?.width ?? 1, texture.image?.height ?? 1), [texture]);
    const position = useMemo(() => calculateCardPosition(index), [index]);
    const rotation = useMemo(() => calculateCardRotation(index), [index]);

    useFrame(({ clock }, delta) => {
        const group = groupRef.current;
        if (!group) {
            return;
        }
        // A card hidden under the pointer gets no pointer-leave; drop the hover so the cursor resets.
        if (hovered && !isShown(group)) {
            setHovered(false);
        }
        // Size follows the card's place on screen; nothing is drawn or hit-tested at scale 0.
        const scale = calculateCardFrameScale(centerednessRef.current[index] ?? 1, segmentsRef.current.morph);
        group.scale.setScalar(scale);
        group.visible = visible && scale > 0.001;
        if (!group.visible) {
            return;
        }

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
                onClick={(e) => {
                    if (!isShown(e.eventObject)) {
                        return;
                    }
                    e.stopPropagation();
                    onNavigate?.(pageKey);
                }}
                onPointerEnter={(e) => {
                    if (!isShown(e.eventObject)) {
                        return;
                    }
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerLeave={() => setHovered(false)}
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
