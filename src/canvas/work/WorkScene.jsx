import { useQuality } from '@app/QualityContext';
import { BREAKPOINTS } from '@config/animation.config';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { calculateCardCenteredness } from '@utils/carousel';
import { entryEase } from '@utils/easingFunctions';
import { useEffect, useMemo, useRef, useState } from 'react';
import WorkCard from './WorkCard';

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

    // Memoize post-processing settings per quality tier
    const postProcessingSettings = useMemo(() => {
        switch (quality) {
            case 'low':
                return { bloomIntensity: 0.2, bloomLevels: 2, multisampling: 0 };
            case 'medium':
                return { bloomIntensity: 0.3, bloomLevels: 3, multisampling: 0 };
            case 'high':
            default:
                return { bloomIntensity: 0.4, bloomLevels: 4, multisampling: 0 };
        }
    }, [quality]);

    // Reactive FOV based on viewport width
    useEffect(() => {
        const fov = size.width <= BREAKPOINTS.TABLET ? CAROUSEL_CONFIG.CAMERA.FOV + 15 : CAROUSEL_CONFIG.CAMERA.FOV;
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

        // Camera follows the descending spiral (compensate for SCALE_FACTOR)
        camera.position.y = offset * (items.length - 1) * CAROUSEL_CONFIG.VERTICAL_STEP * CAROUSEL_CONFIG.SCALE_FACTOR;

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
            <group scale={isMobile ? CAROUSEL_CONFIG.MOBILE.SCALE_FACTOR : CAROUSEL_CONFIG.SCALE_FACTOR}>
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
                                centerednessRef={centerednessRef}
                                entryComplete={entryComplete}
                                entryDelay={i * CAROUSEL_CONFIG.ENTRY.CARD_STAGGER}
                            />
                        );
                    })}
                </group>
            </group>
            <ambientLight intensity={1} />
            <EffectComposer multisampling={postProcessingSettings.multisampling}>
                <Bloom
                    mipmapBlur
                    luminanceThreshold={0.92}
                    intensity={postProcessingSettings.bloomIntensity}
                    radius={0.4}
                    levels={postProcessingSettings.bloomLevels}
                />
            </EffectComposer>
        </>
    );
}
