import { useQuality } from '@app/QualityContext';
import { CAROUSEL_CONFIG, calculateCardCenteredness, WorkCard } from '@canvas/features/carousel';
import { BREAKPOINTS } from '@config/animation.config';
import useNoiseTexture from '@canvas/core/textures/useNoiseTexture';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { entryEase } from '@utils/easingFunctions';
import { useEffect, useRef, useState } from 'react';

// Bloom per quality tier.
const POST_PROCESSING = {
    low: { intensity: 0.2, levels: 2 },
    medium: { intensity: 0.3, levels: 3 },
    high: { intensity: 0.4, levels: 4 },
};

export default function WorkScene({
    items = [],
    scrollProgressRef,
    onCardNavigate,
    onScrollChange,
    onCenterednessChange,
    rigRef: externalRigRef,
    isMobile,
    startAnimations = true,
}) {
    const rigRef = useRef();
    const centerednessRef = useRef([]);
    const bestIndexRef = useRef(0);
    const [visibleCenter, setVisibleCenter] = useState(0);
    const [entryComplete, setEntryComplete] = useState(false);
    const entryStartTime = useRef(null);
    const { camera, size } = useThree();
    const { quality } = useQuality();

    const post = POST_PROCESSING[quality];
    const scale = isMobile ? CAROUSEL_CONFIG.MOBILE.SCALE_FACTOR : CAROUSEL_CONFIG.SCALE_FACTOR;
    // One shared noise texture for every card (same inputs, so one CPU build instead of one per card).
    const noiseTexture = useNoiseTexture({ size: quality === 'low' ? 64 : 256, scale: 10, octaves: quality === 'low' ? 2 : 3, persistence: 0.5 });

    // Reactive FOV based on viewport width
    useEffect(() => {
        const fov = window.matchMedia(BREAKPOINTS.TABLET).matches ? CAROUSEL_CONFIG.CAMERA.FOV + 15 : CAROUSEL_CONFIG.CAMERA.FOV;
        if (camera.isPerspectiveCamera && camera.fov !== fov) {
            camera.fov = fov;
            camera.updateProjectionMatrix();
        }
    }, [size.width, camera]);

    // Sync external ref for border projection
    const setRigRef = (node) => {
        rigRef.current = node;
        if (externalRigRef) {
            externalRigRef.current = node;
        }
    };

    useFrame((state) => {
        if (!rigRef.current || items.length === 0) {
            return;
        }

        // Entry animation: camera flies in from ENTRY.CAMERA_START_Z to target Z
        if (startAnimations && !entryComplete) {
            if (entryStartTime.current === null) {
                entryStartTime.current = state.clock.getElapsedTime();
                camera.position.z = CAROUSEL_CONFIG.ENTRY.CAMERA_START_Z;
            }

            const elapsed = state.clock.getElapsedTime() - entryStartTime.current;
            const t = Math.min(1, elapsed / CAROUSEL_CONFIG.ENTRY.CAMERA_DURATION);
            const eased = entryEase(t);

            const targetZ = CAROUSEL_CONFIG.CAMERA.POSITION[2];
            camera.position.z = CAROUSEL_CONFIG.ENTRY.CAMERA_START_Z + (targetZ - CAROUSEL_CONFIG.ENTRY.CAMERA_START_Z) * eased;

            if (t >= 1) {
                setEntryComplete(true);
            }
            return;
        }

        // Read smooth scroll progress directly from Lenis (already interpolated)
        const offset = scrollProgressRef.current;

        // Lerp rig rotation toward target
        const targetRotation = -offset * (items.length - 1) * CAROUSEL_CONFIG.ANGLE_STEP;
        rigRef.current.rotation.y += (targetRotation - rigRef.current.rotation.y) * CAROUSEL_CONFIG.LERP_SPEED;

        // Camera follows the descending spiral, scaled like the card group (smaller on mobile)
        camera.position.y = offset * (items.length - 1) * CAROUSEL_CONFIG.VERTICAL_STEP * scale;

        // Compute centeredness for every card once — cards read from this ref
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

        // Update visible center only when it changes (avoids per-frame re-renders)
        if (bestIndex !== bestIndexRef.current) {
            bestIndexRef.current = bestIndex;
            setVisibleCenter(bestIndex);
        }

        // Notify parent (border tracking + scroll-to-exit)
        if (onCenterednessChange) {
            onCenterednessChange(minCenteredness, bestIndex);
        }
        if (onScrollChange) {
            onScrollChange(offset);
        }
    });

    if (!items?.length) {
        return null;
    }

    return (
        <>
            <group scale={scale}>
                <group ref={setRigRef}>
                    {items.map((item, i) => {
                        const distance = Math.abs(i - visibleCenter);
                        return (
                            <WorkCard
                                key={item.key}
                                item={item}
                                index={i}
                                visible={distance <= 1}
                                onNavigate={onCardNavigate}
                                noiseTexture={noiseTexture}
                                centerednessRef={centerednessRef}
                                entryComplete={entryComplete}
                                entryDelay={i * CAROUSEL_CONFIG.ENTRY.CARD_STAGGER}
                            />
                        );
                    })}
                </group>
            </group>
            <ambientLight intensity={1} />
            <EffectComposer multisampling={0}>
                <Bloom mipmapBlur luminanceThreshold={0.92} radius={0.4} {...post} />
            </EffectComposer>
        </>
    );
}
