import BackgroundMesh from '@canvas/shared/meshes/BackgroundMesh';
import LogoMesh from '@canvas/shared/meshes/LogoMesh';
import { ANIMATION_TIMING } from '@config/animations';
import { Float, PerspectiveCamera, Text } from '@react-three/drei';
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing';
import { useEffect, useRef, useState } from 'react';
import Rig from '@canvas/shared/camera/Rig';
import { useObjectAnimation } from '@hooks/useObjectAnimation';
import { useCameraAnimation } from '@hooks/useCameraAnimation';

export default function HomeScene({ scrollProgress = 0, startAnimations = true }) {
    const logoRef = useRef();
    const backgroundRef = useRef();
    const subtitleRef = useRef();
    const lightRef = useRef();
    const cameraRef = useRef();
    // const roomRef = useRef();
    const [entryComplete, setEntryComplete] = useState(false);

    useEffect(() => {
        if (!startAnimations) return;
        const timer = setTimeout(() => {
            setEntryComplete(true);
        }, ANIMATION_TIMING.ENTRY_COMPLETE_TIMEOUT);
        return () => clearTimeout(timer);
    }, [startAnimations]);

    useObjectAnimation(logoRef, 'home', {
        duration: ANIMATION_TIMING.ENTRY_DURATION,
        startPosition: [0, 0, 20],
        endPosition: [0, 0, -5],
        scrollEndPosition: [0, 0, -15],
        startScale: [4, 4, 4],
        endScale: [2.5, 2.5, 2.5],
        scrollEndScale: [2, 2, 2],
        scrollProgress,
        enabled: startAnimations
    });

    useObjectAnimation(backgroundRef, 'home', {
        duration: ANIMATION_TIMING.ENTRY_DURATION,
        startPosition: [0, 0, -15],
        endPosition: [0, 0, -30],
        scrollEndPosition: [0, 0, -10],
        startScale: [8, 8, 8],
        endScale: [6, 6, 6],
        scrollEndScale: [5, 5, 5],
        scrollProgress,
        enabled: startAnimations
    });

    useObjectAnimation(subtitleRef, 'home', {
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
    });

    useCameraAnimation(cameraRef, 'home', {
        duration: ANIMATION_TIMING.CAMERA_DURATION,
        startPosition: [0, 0, 30],
        endPosition: [0, 0, 20],
        scrollEndPosition: [0, 0, 10],
        startFov: 70,
        endFov: 50,
        scrollEndFov: 100,
        scrollProgress,
        enabled: startAnimations
    });

    // Light intensity fade
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
                    PRJNo::000 | C://PRJ/PF/CUSTOM | V1 | GRONINGEN | NL
                </Text>
            </group>

            <Float
                floatIntensity={entryComplete ? 2 : 0}
                rotationIntensity={entryComplete ? 0.5 : 0}
                speed={0.5}
            >
                <group ref={logoRef} scale={0.5}>
                    <LogoMesh enableFBO={startAnimations && entryComplete} />
                </group>
            </Float>

            {/* <group ref={roomRef} rotation={[0, Math.PI, 0]}>
                <RoomMesh scrollProgress={scrollProgress} />
            </group> */}

            <EffectComposer multisampling={0}>
                <N8AO aoRadius={1} intensity={1.5} aoSamples={8} denoiseSamples={4} />
                <Bloom
                    mipmapBlur
                    luminanceThreshold={0.92}
                    intensity={0.55}
                    radius={0.4}
                    levels={6}  // Reduced from 8 for performance
                />
                {/* Disabled expensive effects for better performance */}
                {/* <TiltShift2 blur={0.05} /> */}
                {/* <ChromaticAberration distortion={0.02} /> */}
            </EffectComposer>

            <Rig intensity={0.3} />
        </>
    );
}
