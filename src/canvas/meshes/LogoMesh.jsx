import { useQuality } from '@app/QualityContext';
import '@canvas/materials/GlassLogoMaterial';
import '@canvas/materials/PulseLogoMaterial';
import { LOGO_BOOTSTRAP } from '@config/animation.config';
import useNoiseTexture from '@hooks/useNoiseTexture';
import { useFBO, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { memo, useRef, useEffect } from 'react';
import * as THREE from 'three';

function LogoMesh({ enableFBO = true, ...props }) {
    const groupRef = useRef();
    const glassMaterialRef = useRef();
    const pulseMaterialRef = useRef();
    const frameCount = useRef(0);
    const fboWarmupFramesRef = useRef(0);
    const fboReadyRef = useRef(false);
    const bootstrapStartRef = useRef(0);
    const glassOpacityRef = useRef(0);
    const pulseOpacityRef = useRef(1);
    const { quality } = useQuality();

    // Reduce FBO resolution for better performance
    const fbo = useFBO(256, 256, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
    });

    // Reduce noise texture resolution
    const noiseTexture = useNoiseTexture({
        size: 256,
        scale: 10,
        octaves: 3, // Reduced from 4
        persistence: 0.5,
    });

    // Initialize with placeholder texture to avoid null sampling
    useEffect(() => {
        if (glassMaterialRef.current && !glassMaterialRef.current.uTrnsTex) {
            const placeholder = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1, THREE.RGBAFormat);
            placeholder.needsUpdate = true;
            glassMaterialRef.current.uTrnsTex = placeholder;
        }
    }, []);

    const { nodes } = useGLTF('/assets/3d/Logo.glb');

    useEffect(() => {
        const logoGeometry = nodes?.Logo?.geometry;
        if (!logoGeometry || !pulseMaterialRef.current) {
            return;
        }

        if (!logoGeometry.boundingBox) {
            logoGeometry.computeBoundingBox();
        }

        const bounds = logoGeometry.boundingBox;
        if (!bounds) {
            return;
        }

        pulseMaterialRef.current.uBoundsMin.set(bounds.min.x, bounds.min.y);
        pulseMaterialRef.current.uBoundsMax.set(bounds.max.x, bounds.max.y);
    }, [nodes]);

    useFrame((state, delta) => {
        if (groupRef.current && glassMaterialRef.current && pulseMaterialRef.current) {
            if (bootstrapStartRef.current === 0) {
                bootstrapStartRef.current = state.clock.elapsedTime;
            }

            const targetRotationY = state.pointer.x * Math.PI * 0.1;
            const targetRotationX = -state.pointer.y * Math.PI * 0.1;

            const smoothing = Math.min(1, 1 - Math.pow(0.001, delta));

            groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * smoothing;
            groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * smoothing;

            glassMaterialRef.current.uTime = state.clock.elapsedTime;
            const dpr = state.viewport.dpr;
            glassMaterialRef.current.uResolution.set(state.size.width * dpr, state.size.height * dpr);
            pulseMaterialRef.current.uTime = state.clock.elapsedTime;

            const bootstrapElapsedMs = (state.clock.elapsedTime - bootstrapStartRef.current) * 1000;
            const bootstrapProgress = Math.min(1, bootstrapElapsedMs / LOGO_BOOTSTRAP.DURATION_MS);
            pulseMaterialRef.current.uProgress = bootstrapProgress;
            glassMaterialRef.current.uHasTransmission = fboReadyRef.current ? 1 : 0;

            const canRevealGlass = quality === 'low' ? bootstrapProgress >= 0.55 : fboReadyRef.current;
            const glassTarget = canRevealGlass ? 1 : 0;
            const pulseTarget = canRevealGlass ? 0 : 1;
            const fadeLerp = Math.min(1, (delta * 400) / LOGO_BOOTSTRAP.GLASS_FADE_MS);
            glassOpacityRef.current += (glassTarget - glassOpacityRef.current) * fadeLerp;
            pulseOpacityRef.current += (pulseTarget - pulseOpacityRef.current) * fadeLerp;

            glassMaterialRef.current.uOpacity = glassOpacityRef.current;
            pulseMaterialRef.current.uOpacity = pulseOpacityRef.current;

            // Warmup phase: render FBO for first 1-2 frames when enabled
            if (enableFBO && !fboReadyRef.current && fboWarmupFramesRef.current < 2) {
                const oldTarget = state.gl.getRenderTarget();
                try {
                    groupRef.current.visible = false;
                    state.gl.setRenderTarget(fbo);
                    state.gl.render(state.scene, state.camera);
                    glassMaterialRef.current.uTrnsTex = fbo.texture;
                    fboWarmupFramesRef.current++;
                } finally {
                    state.gl.setRenderTarget(oldTarget);
                    groupRef.current.visible = true;
                }

                if (fboWarmupFramesRef.current >= 2) {
                    fboReadyRef.current = true;
                }
                return;
            }

            const skipInterval = quality === 'low' ? 3 : quality === 'medium' ? 2 : 1;
            frameCount.current++;
            if (enableFBO && fboReadyRef.current && frameCount.current % skipInterval === 0) {
                const oldTarget = state.gl.getRenderTarget();
                try {
                    groupRef.current.visible = false;
                    state.gl.setRenderTarget(fbo);
                    state.gl.render(state.scene, state.camera);
                    glassMaterialRef.current.uTrnsTex = fbo.texture;
                } finally {
                    state.gl.setRenderTarget(oldTarget);
                    groupRef.current.visible = true;
                }
            }
        }
    });

    return (
        <group ref={groupRef} {...props}>
            <mesh renderOrder={99} receiveShadow castShadow geometry={nodes.Logo.geometry}>
                <pulseLogoMaterial ref={pulseMaterialRef} transparent depthWrite={false} toneMapped={false} />
            </mesh>
            <mesh renderOrder={100} receiveShadow castShadow geometry={nodes.Logo.geometry}>
                <glassLogoMaterial
                    ref={glassMaterialRef}
                    transparent
                    depthWrite={false}
                    uNoiseTex={noiseTexture}
                    uRoughness={0.2}
                    uNoiseScale={2.0}
                    uRefractPower={0.1}
                    uChromaticAberration={0.02}
                    toneMapped={false}
                />
            </mesh>
        </group>
    );
}

export default memo(LogoMesh);
