import { useQuality } from '@app/QualityContext';
import Rig from '@canvas/camera/Rig';
import LaserPlane from '@canvas/effects/LaserPlane';
import BackgroundMesh from '@canvas/meshes/BackgroundMesh';
import LogoMesh from '@canvas/meshes/LogoMesh';
import { BREAKPOINTS, FLOAT_CONFIG, REVEAL, SCENE, TIMEOUT } from '@config/animation.config';
import useCameraAnimation from '@hooks/useCameraAnimation';
import useObjectAnimation from '@hooks/useObjectAnimation';
import { Float, PerspectiveCamera, Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function HomeScene({ scrollProgress = 0, startAnimations = true, laserParams = {}, onSceneReady = null }) {
    const logoRef = useRef();
    const backgroundRef = useRef();
    const subtitleRef = useRef();
    const lightRef = useRef();
    const cameraRef = useRef();
    const [entryComplete, setEntryComplete] = useState(false);
    const sceneReadyRef = useRef(false);
    const { quality } = useQuality();

    const { size } = useThree();

    const viewportScale = useMemo(() => Math.max(0.3, Math.min(1, size.width / BREAKPOINTS.REFERENCE_WIDTH)), [size.width]);

    useEffect(() => {
        if (entryComplete && !sceneReadyRef.current) {
            sceneReadyRef.current = true;
            if (onSceneReady) {
                onSceneReady();
            }
        }
    }, [entryComplete, onSceneReady]);

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
            delay: REVEAL.DURATION,
            scrollEndPosition: [0, 0, -15],
            startScale: [2 * viewportScale, 2 * viewportScale, 2 * viewportScale],
            endScale: [2.5 * viewportScale, 2.5 * viewportScale, 2.5 * viewportScale],
            scrollEndScale: [4 * viewportScale, 4 * viewportScale, 4 * viewportScale],
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
            delay: REVEAL.DURATION,
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
        }, SCENE.FADE_DURATION * 1000 + 200);
        return () => clearTimeout(timer);
    }, [startAnimations]);

    return (
        <>
            {startAnimations && <LaserPlane {...laserParams} />}
            <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, 30]} fov={70} />
            <ambientLight ref={lightRef} intensity={0} />

            {startAnimations && (
                <group ref={backgroundRef} scale={8}>
                    <BackgroundMesh paused={scrollProgress > 0.4} />
                    <Text font="/assets/fonts/Orbitron/static/Orbitron-Medium.ttf" color="#EEE">
                        ROBIN POTZE
                    </Text>
                </group>
            )}

            {startAnimations && (
                <group ref={subtitleRef}>
                    <Text fontSize={0.6} font="/assets/fonts/Kode_Mono/static/KodeMono-Regular.ttf" color="#EEE">
                        PRJNo::000 | _CREATIVE_/DEVELOPER | /DIGITAL_/ARTIST | ~% /PRJ/PRT/V1
                    </Text>
                </group>
            )}

            <Float floatIntensity={FLOAT_CONFIG.INTENSITY} rotationIntensity={FLOAT_CONFIG.ROTATION_INTENSITY} speed={FLOAT_CONFIG.SPEED}>
                <group ref={logoRef} scale={2 * viewportScale}>
                    <LogoMesh enableFBO={entryComplete && quality !== 'low'} />
                </group>
            </Float>

            {startAnimations && (
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
            )}

            <Rig intensity={0.3} />
        </>
    );
}
