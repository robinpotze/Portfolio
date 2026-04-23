import Rig from '@canvas/shared/camera/Rig';
import BackgroundMesh from '@canvas/shared/meshes/BackgroundMesh';
import LogoMesh from '@canvas/shared/meshes/LogoMesh';
import { FLOAT_CONFIG, REVEAL, SCENE, TIMEOUT, BREAKPOINTS } from '@config/animation.config';
import useAdaptiveQuality from '@hooks/useAdaptiveQuality';
import useCameraAnimation from '@hooks/useCameraAnimation';
import useObjectAnimation from '@hooks/useObjectAnimation';
import { Float, PerspectiveCamera, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef, useState } from 'react';
import LaserPlane from './LaserPlane';

export default function HomeScene({ scrollProgress = 0, startAnimations = true, laserParams = {} }) {
    const logoRef = useRef();
    const backgroundRef = useRef();
    const subtitleRef = useRef();
    const lightRef = useRef();
    const cameraRef = useRef();
    const [entryComplete, setEntryComplete] = useState(false);

    const { size } = useThree();

    const viewportScale = useMemo(() => Math.max(0.3, Math.min(1, size.width / BREAKPOINTS.REFERENCE_WIDTH)), [size.width]);

    // Smoothly interpolated float intensity to avoid jarring snaps on quality change
    const floatIntensityRef = useRef(0);
    const rotationIntensityRef = useRef(0);
    const [smoothFloat, setSmoothFloat] = useState({ float: 0, rotation: 0 });

    // Adaptive quality monitoring
    const { quality } = useAdaptiveQuality({
        targetFps: 55,
        enabled: startAnimations && entryComplete,
    });

    // Lerp float intensity toward quality target
    useFrame((_, delta) => {
        const targetFloat = entryComplete && quality !== 'low' ? FLOAT_CONFIG.INTENSITY : 0;
        const targetRotation = entryComplete && quality !== 'low' ? FLOAT_CONFIG.ROTATION_INTENSITY : 0;
        const lerpSpeed = 2; // units per second

        const prevFloat = floatIntensityRef.current;
        const prevRotation = rotationIntensityRef.current;

        floatIntensityRef.current += (targetFloat - prevFloat) * Math.min(1, lerpSpeed * delta);
        rotationIntensityRef.current += (targetRotation - prevRotation) * Math.min(1, lerpSpeed * delta);

        // Only trigger re-render when the change is visually significant
        if (Math.abs(floatIntensityRef.current - smoothFloat.float) > 0.01 || Math.abs(rotationIntensityRef.current - smoothFloat.rotation) > 0.01) {
            setSmoothFloat({ float: floatIntensityRef.current, rotation: rotationIntensityRef.current });
        }
    });

    // Memoize quality-based post-processing settings
    const postProcessingSettings = useMemo(() => {
        switch (quality) {
            case 'low':
                return {
                    enableAO: false,
                    bloomIntensity: 0.3,
                    bloomLevels: 2,
                    multisampling: 0,
                };
            case 'medium':
                return {
                    enableAO: true,
                    aoSamples: 4,
                    denoiseSamples: 2,
                    aoIntensity: 1.2,
                    bloomIntensity: 0.45,
                    bloomLevels: 4,
                    multisampling: 0,
                };
            case 'high':
            default:
                return {
                    enableAO: true,
                    aoSamples: 8,
                    denoiseSamples: 4,
                    aoIntensity: 1.5,
                    bloomIntensity: 0.55,
                    bloomLevels: 6,
                    multisampling: 0,
                };
        }
    }, [quality]);

    useEffect(() => {
        if (!startAnimations) {
            return;
        }
        const timer = setTimeout(() => {
            setEntryComplete(true);
        }, TIMEOUT.ENTRY_COMPLETE_MS);
        return () => clearTimeout(timer);
    }, [startAnimations]);

    // Memoize animation configs to prevent recreation
    const logoAnimConfig = useMemo(
        () => ({
            duration: REVEAL.DURATION,
            startPosition: [0, 0, 20],
            endPosition: [0, 0, -5],
            scrollEndPosition: [0, 0, -15],
            startScale: [4 * viewportScale, 4 * viewportScale, 4 * viewportScale],
            endScale: [2.5 * viewportScale, 2.5 * viewportScale, 2.5 * viewportScale],
            scrollEndScale: [2 * viewportScale, 2 * viewportScale, 2 * viewportScale],
            scrollProgress,
            enabled: startAnimations,
        }),
        [scrollProgress, startAnimations, viewportScale]
    );

    const backgroundAnimConfig = useMemo(
        () => ({
            duration: REVEAL.DURATION,
            startPosition: [0, 0, -15],
            endPosition: [0, 0, -30],
            scrollEndPosition: [0, 0, -10],
            startScale: [8 * viewportScale, 8 * viewportScale, 8 * viewportScale],
            endScale: [6 * viewportScale, 6 * viewportScale, 6 * viewportScale],
            scrollEndScale: [5 * viewportScale, 5 * viewportScale, 5 * viewportScale],
            scrollProgress,
            enabled: startAnimations,
        }),
        [scrollProgress, startAnimations, viewportScale]
    );

    const subtitleAnimConfig = useMemo(
        () => ({
            duration: REVEAL.DURATION,
            delay: REVEAL.DURATION,
            startPosition: [0, -10, 20],
            endPosition: [0, -9, -5],
            scrollEndPosition: [0, -7, -5],
            startScale: [viewportScale, viewportScale, viewportScale],
            endScale: [viewportScale, viewportScale, viewportScale],
            scrollEndScale: [0.9 * viewportScale, 0.9 * viewportScale, 0.9 * viewportScale],
            scrollProgress,
            enabled: startAnimations,
        }),
        [scrollProgress, startAnimations, viewportScale]
    );

    const cameraAnimConfig = useMemo(
        () => ({
            duration: SCENE.CAMERA_DURATION,
            startPosition: [0, 0, 30],
            endPosition: [0, 0, 20],
            scrollEndPosition: [0, 0, 10],
            startFov: 70,
            endFov: 50,
            scrollEndFov: 100,
            scrollProgress,
            enabled: startAnimations,
        }),
        [scrollProgress, startAnimations]
    );

    useObjectAnimation(logoRef, 'home', logoAnimConfig);
    useObjectAnimation(backgroundRef, 'home', backgroundAnimConfig);
    useObjectAnimation(subtitleRef, 'home', subtitleAnimConfig);
    useCameraAnimation(cameraRef, 'home', cameraAnimConfig);

    useEffect(() => {
        if (!startAnimations || !lightRef.current) {
            return;
        }
        lightRef.current.intensity = 0;
        const timer = setTimeout(() => {
            if (lightRef.current) {
                lightRef.current.intensity = 1;
            }
        }, SCENE.FADE_DURATION * 1000);
        return () => clearTimeout(timer);
    }, [startAnimations]);

    return (
        <>
            <LaserPlane {...laserParams} />
            <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 30]} fov={70} />
            <ambientLight ref={lightRef} intensity={0} />

            <group ref={backgroundRef} scale={8}>
                <BackgroundMesh paused={scrollProgress > 0.4} />
                <Text font="/assets/fonts/Orbitron/static/Orbitron-Medium.ttf" color="#EEE">
                    ROBIN POTZE
                </Text>
            </group>

            <group ref={subtitleRef}>
                <Text fontSize={0.6} font="/assets/fonts/Kode_Mono/static/KodeMono-Regular.ttf" color="#EEE">
                    PRJNo::000 | _CREATIVE_/DEVELOPER | /DIGITAL_/ARTIST | ~% /PRJ/PRT/V1
                </Text>
            </group>

            <Float floatIntensity={smoothFloat.float} rotationIntensity={smoothFloat.rotation} speed={FLOAT_CONFIG.SPEED}>
                <group ref={logoRef} scale={0.5}>
                    <LogoMesh enableFBO={startAnimations && entryComplete && quality !== 'low'} />
                </group>
            </Float>

            <EffectComposer multisampling={postProcessingSettings.multisampling}>
                {postProcessingSettings.enableAO && (
                    <N8AO
                        aoRadius={1}
                        intensity={postProcessingSettings.aoIntensity}
                        aoSamples={postProcessingSettings.aoSamples}
                        denoiseSamples={postProcessingSettings.denoiseSamples}
                    />
                )}
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
