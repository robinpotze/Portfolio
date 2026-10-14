import { useQuality } from '@app/QualityContext';
import { BackgroundMesh } from '@canvas/features/background';
import { LaserPlane } from '@canvas/features/laser';
import { LogoMesh } from '@canvas/features/logo';
import { LogoParticles } from '@canvas/features/logoParticles';
import { BREAKPOINTS, FLOAT_CONFIG, REVEAL, SCENE, SCROLL_THRESHOLDS } from '@config/animation.config';
import { Float, PerspectiveCamera, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing';
import { easeCurve, entryEase } from '@utils/easingFunctions';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const { clamp, damp, lerp, smoothstep } = THREE.MathUtils;

// Layout keyframes: [before the reveal, after the reveal, end of the home scroll]. Scales are multiplied by viewportScale.
const CAMERA_Z = [30, 20, 10];
const CAMERA_FOV = [70, 50, 100];
const LOGO_Z = [0, 0, -15];
const LOGO_SCALE = [1, 1, 4];
const BACKGROUND_Z = [-15, -30, -10];
const BACKGROUND_SCALE = [8, 6, 5];
const SUBTITLE_Y = [-10, -9, -7];
const SUBTITLE_Z = [20, -5, -5];
const SUBTITLE_SCALE = [1, 1, 0.9];

// Pointer parallax: camera orbit offset (world units) and logo tilt (radians) at the screen edge, with damping rates.
const CAMERA_PARALLAX = 1.5;
const LOGO_TILT = Math.PI * 0.1;
const CAMERA_DAMPING = 3.5;
const TILT_DAMPING = 7;

// How far the "ROBIN POTZE" title rises by the end of the home scroll, in background-group units at viewportScale 1.
const TITLE_RISE = 6;

/** Value of a keyframe track: before → after over the reveal, then after → end over the scroll. */
function keyframe([before, after, end], reveal, scroll) {
    return lerp(before, after, reveal) + (end - after) * scroll;
}

export default function HomeScene({ scrollProgress = 0, startAnimations = true }) {
    const logoRef = useRef();
    const backgroundRef = useRef();
    const subtitleRef = useRef();
    const lightRef = useRef();
    const introStart = useRef(null);
    const parallax = useMemo(() => new THREE.Vector3(), []);
    const { quality } = useQuality();

    const { gl, size } = useThree();

    // Particles need float or half-float render targets and vertex texture reads; otherwise show the metallic logo.
    const canSimulate = useMemo(
        () =>
            gl.capabilities.maxVertexTextures > 0 &&
            (gl.extensions.has('EXT_color_buffer_float') || gl.extensions.has('EXT_color_buffer_half_float')),
        [gl]
    );

    const viewportScale = useMemo(() => Math.max(0.3, Math.min(1, size.width / BREAKPOINTS.REFERENCE_WIDTH)), [size.width]);

    // The title rises out of frame on the same curve the particles assimilate on, so only the logo is left.
    const titleRise = smoothstep(scrollProgress, 0, SCROLL_THRESHOLDS.HOME_TRANSITION) * TITLE_RISE;

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

    // Scene timeline: every transform is a function of the reveal (time since startAnimations) and the scroll.
    useFrame(({ camera, clock, pointer }, delta) => {
        if (startAnimations && introStart.current === null) {
            introStart.current = clock.elapsedTime;
        }
        const since = introStart.current === null ? -Infinity : clock.elapsedTime - introStart.current;
        const reveal = (delay, duration) => entryEase(clamp((since - delay) / duration, 0, 1));
        const scroll = easeCurve(scrollProgress);

        // Camera: reveal and scroll on z and fov, plus a damped pointer orbit; always looks at the origin.
        parallax.x = damp(parallax.x, Math.sin(-pointer.x) * CAMERA_PARALLAX, CAMERA_DAMPING, delta);
        parallax.y = damp(parallax.y, pointer.y * CAMERA_PARALLAX, CAMERA_DAMPING, delta);
        parallax.z = damp(parallax.z, Math.cos(pointer.x) * CAMERA_PARALLAX, CAMERA_DAMPING, delta);
        const cameraReveal = reveal(0, SCENE.CAMERA_DURATION);
        camera.position.set(parallax.x, parallax.y, keyframe(CAMERA_Z, cameraReveal, scroll) + parallax.z);
        camera.lookAt(0, 0, 0);
        const fov = keyframe(CAMERA_FOV, cameraReveal, scroll);
        if (camera.fov !== fov) {
            camera.fov = fov;
            camera.updateProjectionMatrix();
        }

        const logo = logoRef.current;
        if (logo) {
            logo.position.z = keyframe(LOGO_Z, 1, scroll);
            logo.scale.setScalar(keyframe(LOGO_SCALE, 1, scroll) * viewportScale);
            logo.rotation.y = damp(logo.rotation.y, pointer.x * LOGO_TILT, TILT_DAMPING, delta);
            logo.rotation.x = damp(logo.rotation.x, -pointer.y * LOGO_TILT, TILT_DAMPING, delta);
        }

        const background = backgroundRef.current;
        if (background) {
            const backgroundReveal = reveal(REVEAL.DELAY, REVEAL.DURATION);
            background.position.z = keyframe(BACKGROUND_Z, backgroundReveal, scroll);
            background.scale.setScalar(keyframe(BACKGROUND_SCALE, backgroundReveal, scroll) * viewportScale);
        }

        const subtitle = subtitleRef.current;
        if (subtitle) {
            const subtitleReveal = reveal(REVEAL.DURATION, REVEAL.DURATION);
            subtitle.position.set(0, keyframe(SUBTITLE_Y, subtitleReveal, scroll), keyframe(SUBTITLE_Z, subtitleReveal, scroll));
            subtitle.scale.setScalar(keyframe(SUBTITLE_SCALE, subtitleReveal, scroll) * viewportScale);
        }
    });

    useEffect(() => {
        if (!startAnimations || !lightRef.current) {
            return;
        }
        lightRef.current.intensity = 0;
        const timer = setTimeout(
            () => {
                if (lightRef.current) {
                    lightRef.current.intensity = 1;
                }
            },
            SCENE.FADE_DURATION * 1000 + 200
        );
        return () => clearTimeout(timer);
    }, [startAnimations]);

    return (
        <>
            {startAnimations && <LaserPlane progress={scrollProgress} />}
            <PerspectiveCamera makeDefault position={[0, 0, CAMERA_Z[0]]} fov={CAMERA_FOV[0]} />
            <ambientLight ref={lightRef} intensity={0} />

            {startAnimations && (
                <group ref={backgroundRef}>
                    <BackgroundMesh paused={scrollProgress > 0.4} />
                    <group position-y={titleRise / viewportScale}>
                        <Text font="/assets/fonts/Orbitron/static/Orbitron-Medium.ttf" color="#EEE">
                            ROBIN POTZE
                        </Text>
                    </group>
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
                <group ref={logoRef}>
                    {canSimulate ? <LogoParticles startAnimations={startAnimations} scrollProgress={scrollProgress} /> : <LogoMesh />}
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
        </>
    );
}
