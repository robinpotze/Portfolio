import { BackgroundMesh } from '@canvas/features/background';
import { CAROUSEL_CONFIG, getCarouselFov } from '@canvas/features/carousel';
import { LogoMesh } from '@canvas/features/logo';
import { LogoParticles } from '@canvas/features/logoParticles';
import { FibreBeam } from '@canvas/features/streamFibers';
import { BREAKPOINTS, FLOAT_CONFIG, HOME_WORK, REVEAL, SCENE, SCROLL_THRESHOLDS } from '@config/animation.config';
import { Float, Text } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { easeCurve, entryEase } from '@utils/easingFunctions';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const { clamp, damp, lerp, smoothstep } = THREE.MathUtils;

// Layout keyframes: [before the reveal, after the reveal, end of the home scroll]. Scales are multiplied by viewportScale.
export const CAMERA_Z = [30, 20, 10];
export const CAMERA_FOV = [70, 50, 75];
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

// The dot panel covers the view where the camera settles after the reveal, with overscan for the tilt and parallax.
const GRID_OVERSCAN = 1.15;

// How far the "ROBIN POTZE" title rises by the end of the home scroll, in background-group units at viewportScale 1.
const TITLE_RISE = 6;

/** Value of a keyframe track: before → after over the reveal, then after → end over the scroll. */
function keyframe([before, after, end], reveal, scroll) {
    return lerp(before, after, reveal) + (end - after) * scroll;
}

// Video wall pauses once the scroll passes this, to save decoding while it is out of view.
const BACKGROUND_PAUSE_AT = 0.4;

export default function HomeScene({ segmentsRef, streamRef, startAnimations = true }) {
    const logoRef = useRef();
    const extrasRef = useRef();
    const titleRef = useRef();
    const [backgroundPaused, setBackgroundPaused] = useState(false);
    const backgroundRef = useRef();
    const subtitleRef = useRef();
    const lightRef = useRef();
    const introStart = useRef(null);
    // Read by LogoParticles each frame: morph 0 = dot panel → 1 = logo, intro 0 → 1 = panel powered on,
    // stream 0 → 1 = logo → trunk.
    const timeline = useRef({ morph: 0, intro: 0, stream: 0 });
    const parallax = useMemo(() => new THREE.Vector3(), []);

    const { gl, size } = useThree();

    // Particles need float or half-float render targets and vertex texture reads; otherwise show the metallic logo.
    const canSimulate = useMemo(
        () =>
            gl.capabilities.maxVertexTextures > 0 &&
            (gl.extensions.has('EXT_color_buffer_float') || gl.extensions.has('EXT_color_buffer_half_float')),
        [gl]
    );

    const viewportScale = useMemo(() => Math.max(0.3, Math.min(1, size.width / BREAKPOINTS.REFERENCE_WIDTH)), [size.width]);

    // Panel size in the logo group's local units at rest (camera at CAMERA_Z[1] + parallax, fov CAMERA_FOV[1]).
    const gridSize = useMemo(() => {
        const distance = CAMERA_Z[1] - LOGO_Z[1] + CAMERA_PARALLAX;
        const height = 3 * distance * Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV[1]) / 2) * GRID_OVERSCAN;
        const restScale = LOGO_SCALE[1] * viewportScale;
        return [(height * size.width) / size.height / restScale, height / restScale];
    }, [size.width, size.height, viewportScale]);

    // Scene timeline: every transform is a function of the reveal (time since startAnimations) and the scroll.
    // Priority -1 runs it before the children's frames, so LogoParticles sees this frame's camera, logo and timeline.
    useFrame(({ camera, clock, pointer }, delta) => {
        if (startAnimations && introStart.current === null) {
            introStart.current = clock.elapsedTime;
        }
        const since = introStart.current === null ? -Infinity : clock.elapsedTime - introStart.current;
        const reveal = (delay, duration) => entryEase(clamp((since - delay) / duration, 0, 1));
        const { home: scrollProgress, morph: streamProgress } = segmentsRef.current;
        // Morph segment: blend from Home's end pose to the carousel's start pose.
        const blend = easeCurve(streamProgress);
        const scroll = easeCurve(scrollProgress);
        // The particles form the logo by the time the page moves to Work; the title rises out of frame on the same curve.
        const morph = smoothstep(scrollProgress, 0, SCROLL_THRESHOLDS.HOME_TRANSITION);
        // Re-render only when the pause flips, not on every scroll.
        const paused = scrollProgress > BACKGROUND_PAUSE_AT;
        if (paused !== backgroundPaused) {
            setBackgroundPaused(paused);
        }

        // Camera: reveal and scroll on z and fov, plus a damped pointer orbit; always looks at the origin.
        parallax.x = damp(parallax.x, Math.sin(-pointer.x) * CAMERA_PARALLAX, CAMERA_DAMPING, delta);
        parallax.y = damp(parallax.y, pointer.y * CAMERA_PARALLAX, CAMERA_DAMPING, delta);
        parallax.z = damp(parallax.z, Math.cos(pointer.x) * CAMERA_PARALLAX, CAMERA_DAMPING, delta);
        const cameraReveal = reveal(0, SCENE.CAMERA_DURATION);
        timeline.current.morph = morph;
        timeline.current.intro = cameraReveal;
        timeline.current.stream = blend;
        // WorkScene owns the camera once the morph completes.
        if (streamProgress < 1) {
            camera.position.set(
                lerp(parallax.x, 0, blend),
                lerp(parallax.y, 0, blend),
                lerp(keyframe(CAMERA_Z, cameraReveal, scroll) + parallax.z, CAROUSEL_CONFIG.CAMERA.POSITION[2], blend)
            );
            camera.lookAt(0, 0, 0);
            const fov = lerp(keyframe(CAMERA_FOV, cameraReveal, scroll), getCarouselFov(), blend);
            if (camera.fov !== fov) {
                camera.fov = fov;
                camera.updateProjectionMatrix();
            }
        }
        // Home's extras fade and recede over the first part of the morph; they stop rendering once fully gone.
        const exit = smoothstep(streamProgress, 0, HOME_WORK.EXIT_END);
        const extras = extrasRef.current;
        if (extras) {
            extras.visible = exit < 1;
            extras.position.z = -exit * HOME_WORK.EXIT_RECEDE;
            if (extras.visible) {
                // Every frame: the video wall swaps its placeholder material, so new materials are caught before they first render.
                extras.traverse((object) => {
                    const material = object.material;
                    if (material && !Array.isArray(material)) {
                        // An opaque material ignores opacity until recompiled; transparent at opacity 1 looks the same as opaque.
                        if (!material.transparent) {
                            material.transparent = true;
                            material.needsUpdate = true;
                        }
                        material.opacity = 1 - exit;
                    }
                });
            }
        }

        const logo = logoRef.current;
        if (logo) {
            // Particles unravel into the stream; the metallic fallback shrinks onto the axis instead.
            const shrink = canSimulate ? 1 : 1 - blend;
            // The shrunk fallback is out of view after the morph; the particles stay as the trunk.
            logo.visible = canSimulate || blend < 1;
            logo.position.z = canSimulate ? keyframe(LOGO_Z, 1, scroll) : lerp(keyframe(LOGO_Z, 1, scroll), 0, blend);
            logo.scale.setScalar(keyframe(LOGO_SCALE, 1, scroll) * viewportScale * shrink);
            logo.rotation.y = damp(logo.rotation.y, pointer.x * LOGO_TILT, TILT_DAMPING, delta);
            logo.rotation.x = damp(logo.rotation.x, -pointer.y * LOGO_TILT, TILT_DAMPING, delta);
        }

        const background = backgroundRef.current;
        if (background) {
            const backgroundReveal = reveal(REVEAL.DELAY, REVEAL.DURATION);
            background.position.z = keyframe(BACKGROUND_Z, backgroundReveal, scroll);
            background.scale.setScalar(keyframe(BACKGROUND_SCALE, backgroundReveal, scroll) * viewportScale);
        }
        if (titleRef.current) {
            titleRef.current.position.y = (morph * TITLE_RISE) / viewportScale;
        }

        const subtitle = subtitleRef.current;
        if (subtitle) {
            const subtitleReveal = reveal(REVEAL.DURATION, REVEAL.DURATION);
            subtitle.position.set(0, keyframe(SUBTITLE_Y, subtitleReveal, scroll), keyframe(SUBTITLE_Z, subtitleReveal, scroll));
            subtitle.scale.setScalar(keyframe(SUBTITLE_SCALE, subtitleReveal, scroll) * viewportScale);
        }
    }, -1);

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
            <ambientLight ref={lightRef} intensity={0} />

            <group ref={extrasRef}>
                {startAnimations && (
                    <group ref={backgroundRef}>
                        <BackgroundMesh paused={backgroundPaused} />
                        <FibreBeam segmentsRef={segmentsRef} streamRef={streamRef} logoRef={logoRef} />
                        <group ref={titleRef}>
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
            </group>

            <Float floatIntensity={FLOAT_CONFIG.INTENSITY} rotationIntensity={FLOAT_CONFIG.ROTATION_INTENSITY} speed={FLOAT_CONFIG.SPEED}>
                <group ref={logoRef}>
                    {canSimulate ? <LogoParticles timeline={timeline} gridSize={gridSize} streamRef={streamRef} /> : <LogoMesh />}
                </group>
            </Float>
        </>
    );
}
