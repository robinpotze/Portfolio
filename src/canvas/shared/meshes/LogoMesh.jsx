import { GlassLogoMaterial } from '@canvas/shared/materials/GlassLogoMaterial';
import useNoiseTexture from '@hooks/useNoiseTexture';
import { useFBO, useGLTF } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import React, { useRef } from 'react';
import * as THREE from 'three';

// Register the custom material with R3F
extend({ GlassLogoMaterial })

useGLTF.preload("/assets/3d/Logo.glb")

function LogoMesh({ enableFBO = true, ...props }) {
    const meshRef = useRef()
    const materialRef = useRef()
    const frameCount = useRef(0)

    // Reduce FBO resolution for better performance
    const fbo = useFBO(256, 256, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
    })

    // Reduce noise texture resolution
    const noiseTexture = useNoiseTexture({
        size: 256,
        scale: 10,
        octaves: 3,  // Reduced from 4
        persistence: 0.5
    })

    const { nodes } = useGLTF("/assets/3d/Logo.glb")

    useFrame((state, delta) => {
        if (meshRef.current && materialRef.current) {
            const targetRotationY = state.pointer.x * Math.PI * 0.1
            const targetRotationX = -state.pointer.y * Math.PI * 0.1

            const smoothing = 1 - Math.pow(0.001, delta)

            meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * smoothing
            meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * smoothing

            materialRef.current.uTime = state.clock.elapsedTime
            materialRef.current.uResolution.set(state.size.width, state.size.height)

            // Only render to FBO when enabled and every other frame for better performance
            frameCount.current++
            if (enableFBO && frameCount.current % 2 === 0) {
                const oldTarget = state.gl.getRenderTarget()
                meshRef.current.visible = false
                state.gl.setRenderTarget(fbo)
                state.gl.render(state.scene, state.camera)
                state.gl.setRenderTarget(oldTarget)
                meshRef.current.visible = true

                materialRef.current.uTrnsTex = fbo.texture
            }
        }
    })

    return (
        <mesh
            ref={meshRef}
            renderOrder={100}
            receiveShadow
            castShadow
            geometry={nodes.Logo.geometry}
            {...props}
        >
            <glassLogoMaterial
                ref={materialRef}
                uNoiseTex={noiseTexture}
                uRoughness={0.2}
                uNoiseScale={2.0}
                uRefractPower={0.1}
                uChromaticAberration={0.02}
                toneMapped={false}
            />
        </mesh>
    )
}

export default React.memo(LogoMesh);