import { useQuality } from '@app/QualityContext';
import '@canvas/materials/GlassLogoMaterial';
import useNoiseTexture from '@hooks/useNoiseTexture';
import { useFBO, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { memo, useEffect, useRef } from 'react';
import * as THREE from 'three';

function LogoMesh({ enableFBO = true, ...props }) {
    const groupRef = useRef();
    const glassMaterialRef = useRef();
    const frameCount = useRef(0);
    const fboReadyRef = useRef(false);
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
        octaves: 3,
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

    useFrame((state, delta) => {
        if (groupRef.current && glassMaterialRef.current) {
            const targetRotationY = state.pointer.x * Math.PI * 0.1;
            const targetRotationX = -state.pointer.y * Math.PI * 0.1;

            const smoothing = Math.min(1, 1 - Math.pow(0.001, delta));

            groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * smoothing;
            groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * smoothing;

            glassMaterialRef.current.uTime = state.clock.elapsedTime;
            const dpr = state.viewport.dpr;
            glassMaterialRef.current.uResolution.set(state.size.width * dpr, state.size.height * dpr);
            glassMaterialRef.current.uHasTransmission = fboReadyRef.current ? 1 : 0;
            glassMaterialRef.current.uOpacity = 1;

            // FBO warmup: runs immediately on mount (during loading screen)
            // so texture is cached and ready before reveal
            if (!fboReadyRef.current) {
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
                fboReadyRef.current = true;
                return;
            }

            // Ongoing FBO updates — frame-skipped based on quality
            const skipInterval = quality === 'low' ? 3 : quality === 'medium' ? 2 : 1;
            frameCount.current++;
            if (enableFBO && frameCount.current % skipInterval === 0) {
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
