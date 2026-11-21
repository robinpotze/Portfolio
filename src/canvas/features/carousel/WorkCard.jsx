import { useQuality } from '@app/QualityContext';
import { FLOAT_CONFIG } from '@config/animation.config';
import { Float, Text, useCursor, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { getCSSColorRGBA, getCSSVariable } from '@utils/cssUtils';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CARD_HEIGHT, CARD_WIDTH } from './cardGeometry';
import { calculateCardPosition, calculateCardPresence, calculateCardRotation, calculateCardScale, cardDissolve } from './carousel';
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
    const cardMaterialRef = useRef();
    const overlayRef = useRef();
    const overlayMaterialRef = useRef();
    const textRefs = useRef([]);
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
    const edgeColor = useMemo(() => {
        const { r, g, b } = getCSSColorRGBA('--c-brnd_100');
        return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    }, []);

    useFrame(({ clock }, delta) => {
        const group = groupRef.current;
        if (!group) {
            return;
        }
        // A card hidden under the pointer gets no pointer-leave; drop the hover so the cursor resets.
        if (hovered && !isShown(group)) {
            setHovered(false);
        }
        // Presence drives the card: it forms by dissolve once its branch has arrived; nothing is drawn or hit-tested
        // while fully dissolved.
        const centeredness = centerednessRef.current[index] ?? 1;
        const dissolve = cardDissolve(calculateCardPresence(centeredness, segmentsRef.current.morph));
        group.scale.setScalar(calculateCardScale(centeredness));
        group.visible = visible && dissolve > 0.001;
        if (!group.visible) {
            return;
        }
        if (cardMaterialRef.current) {
            cardMaterialRef.current.uDissolve = dissolve;
        }
        for (const text of textRefs.current) {
            if (text) {
                text.fillOpacity = dissolve;
            }
        }
        if (overlayRef.current) {
            overlayRef.current.visible = dissolve >= 1;
        }

        hoverRef.current = damp(hoverRef.current, hovered ? 1 : 0, HOVER_DAMPING, delta);
        if (overlayMaterialRef.current) {
            overlayMaterialRef.current.uHover = hoverRef.current;
            overlayMaterialRef.current.uTime = clock.elapsedTime;
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
                        ref={cardMaterialRef}
                        uEdgeColor={edgeColor}
                        transparent={false}
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
                    <mesh ref={overlayRef} position={[0, 0, CARD_WIDTH * 0.011]}>
                        <planeGeometry args={[CARD_WIDTH, CARD_HEIGHT]} />
                        <pixelOverlayMaterial ref={overlayMaterialRef} transparent depthWrite={false} />
                    </mesh>
                )}

                {/* Text content */}
                <group position={[0, 0, CARD_WIDTH * 0.012]}>
                    <Text
                        {...LABEL}
                        font={MONO_FONT}
                        fontSize={CARD_HEIGHT * 0.045}
                        position={[0, CARD_HEIGHT * 0.1, 0.1]}
                        ref={(el) => (textRefs.current[0] = el)}
                    >
                        {data?.year?.toString() || ''}
                    </Text>
                    <Text {...LABEL} font={TITLE_FONT} fontSize={CARD_HEIGHT * 0.11} position={[0, 0, 0.12]} ref={(el) => (textRefs.current[1] = el)}>
                        {data?.title || pageKey}
                    </Text>
                    <Text
                        {...LABEL}
                        font={MONO_FONT}
                        fontSize={CARD_HEIGHT * 0.045}
                        position={[0, -CARD_HEIGHT * 0.1, 0.1]}
                        ref={(el) => (textRefs.current[2] = el)}
                    >
                        {data?.client || ''}
                    </Text>
                </group>
            </group>
        </Float>
    );
}
