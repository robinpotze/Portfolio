import Rig from '@canvas/shared/camera/Rig';
import BackgroundMesh from '@canvas/shared/meshes/BackgroundMesh';
import LogoMesh from '@canvas/shared/meshes/LogoMesh';
import { ANIMATION_TIMING } from '@config/animations';
import { useAdaptiveQuality } from '@hooks/useAdaptiveQuality';
import { useCameraAnimation } from '@hooks/useCameraAnimation';
import { useObjectAnimation } from '@hooks/useObjectAnimation';
import { Float, PerspectiveCamera, Text } from '@react-three/drei';
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function HomeScene({ scrollProgress = 0, startAnimations = true }) {
    const logoRef = useRef();
    const backgroundRef = useRef();
    const subtitleRef = useRef();
    const lightRef = useRef();
    const cameraRef = useRef();
    const [entryComplete, setEntryComplete] = useState(false);

    // Adaptive quality monitoring
    const { quality, fps } = useAdaptiveQuality({
        targetFps: 55,
        enabled: startAnimations && entryComplete
    });

    // Memoize quality-based post-processing settings
    const postProcessingSettings = useMemo(() => {
        switch (quality) {
            case 'low':
                return {
                    aoSamples: 4,
                    denoiseSamples: 2,
                    aoIntensity: 1.2,
                    bloomIntensity: 0.4,
                    bloomLevels: 4,
                    multisampling: 0
                };
            case 'medium':
                return {
                    aoSamples: 6,
                    denoiseSamples: 3,
                    aoIntensity: 1.35,
                    bloomIntensity: 0.5,
                    bloomLevels: 5,
                    multisampling: 0
                };
            case 'high':
            default:
                return {
                    aoSamples: 8,
                    denoiseSamples: 4,
                    aoIntensity: 1.5,
                    bloomIntensity: 0.55,
                    bloomLevels: 6,
                    multisampling: 0
                };
        }
    }, [quality]);

    useEffect(() => {
        if (!startAnimations) return;
        const timer = setTimeout(() => {
            setEntryComplete(true);
        }, ANIMATION_TIMING.ENTRY_COMPLETE_TIMEOUT);
        return () => clearTimeout(timer);
    }, [startAnimations]);

    // Memoize animation configs to prevent recreation
    const logoAnimConfig = useMemo(() => {
        const isMobile = window.innerWidth <= 768;
        const scaleFactor = isMobile ? 0.5 : 1;
        
        return {
            duration: ANIMATION_TIMING.ENTRY_DURATION,
            startPosition: [0, 0, 20],
            endPosition: [0, 0, -5],
            scrollEndPosition: [0, 0, -15],
            startScale: [4 * scaleFactor, 4 * scaleFactor, 4 * scaleFactor],
            endScale: [2.5 * scaleFactor, 2.5 * scaleFactor, 2.5 * scaleFactor],
            scrollEndScale: [2 * scaleFactor, 2 * scaleFactor, 2 * scaleFactor],
            scrollProgress,
            enabled: startAnimations
        };
    }, [scrollProgress, startAnimations]);

    const backgroundAnimConfig = useMemo(() => ({
        duration: ANIMATION_TIMING.ENTRY_DURATION,
        startPosition: [0, 0, -15],
        endPosition: [0, 0, -30],
        scrollEndPosition: [0, 0, -10],
        startScale: [8, 8, 8],
        endScale: [6, 6, 6],
        scrollEndScale: [5, 5, 5],
        scrollProgress,
        enabled: startAnimations
    }), [scrollProgress, startAnimations]);

    const subtitleAnimConfig = useMemo(() => ({
        duration: ANIMATION_TIMING.ENTRY_DURATION,
        delay: ANIMATION_TIMING.ENTRY_DELAY,
        startPosition: [0, -10, 20],
        endPosition: [0, -9, -5],
        scrollEndPosition: [0, -7, -5],
        startScale: [1, 1, 1],
        endScale: [1, 1, 1],
        scrollEndScale: [0.9, 0.9, 0.9],
        scrollProgress,
        enabled: startAnimations
    }), [scrollProgress, startAnimations]);

    const cameraAnimConfig = useMemo(() => ({
        duration: ANIMATION_TIMING.CAMERA_DURATION,
        startPosition: [0, 0, 30],
        endPosition: [0, 0, 20],
        scrollEndPosition: [0, 0, 10],
        startFov: 70,
        endFov: 50,
        scrollEndFov: 100,
        scrollProgress,
        enabled: startAnimations
    }), [scrollProgress, startAnimations]);

    useObjectAnimation(logoRef, 'home', logoAnimConfig);
    useObjectAnimation(backgroundRef, 'home', backgroundAnimConfig);
    useObjectAnimation(subtitleRef, 'home', subtitleAnimConfig);
    useCameraAnimation(cameraRef, 'home', cameraAnimConfig);

    useEffect(() => {
        if (!startAnimations || !lightRef.current) return;
        lightRef.current.intensity = 0;
        const timer = setTimeout(() => {
            if (lightRef.current) lightRef.current.intensity = 1;
        }, ANIMATION_TIMING.FADE_DURATION * 1000);
        return () => clearTimeout(timer);
    }, [startAnimations]);

    return (
        <>
            <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 30]} fov={70} />
            <ambientLight ref={lightRef} intensity={0} />

            <group ref={backgroundRef} scale={8}>
                <BackgroundMesh />
            </group>

            <group ref={subtitleRef}>
                <Text fontSize={0.6} font="/assets/fonts/Kode_Mono/static/KodeMono-Regular.ttf" color="#eee">
                    PRJNo::000 | ~ % /PRJ/PF/CUSTOM | V1 | GRONINGEN | NL
                </Text>
            </group>

            <Float
                floatIntensity={entryComplete ? 2 : 0}
                rotationIntensity={entryComplete ? 0.5 : 0}
                speed={0.5}
            >
                <group ref={logoRef} scale={0.5}>
                    <LogoMesh enableFBO={startAnimations && entryComplete && quality !== 'low'} />
                </group>
            </Float>

            {/* Adaptive post-processing based on FPS */}
            <EffectComposer multisampling={postProcessingSettings.multisampling}>
                <N8AO
                    aoRadius={1}
                    intensity={postProcessingSettings.aoIntensity}
                    aoSamples={postProcessingSettings.aoSamples}
                    denoiseSamples={postProcessingSettings.denoiseSamples}
                />
                <Bloom
                    mipmapBlur
                    luminanceThreshold={0.92}
                    intensity={postProcessingSettings.bloomIntensity}
                    radius={0.4}
                    levels={postProcessingSettings.bloomLevels}
                />
            </EffectComposer>

            <Rig intensity={0.3} />
        </>
    );
}
