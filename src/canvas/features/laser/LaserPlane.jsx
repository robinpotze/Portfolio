import { useQuality } from '@app/QualityContext';
import { useFrame } from '@react-three/fiber';
import { getCSSColorRGBA } from '@utils/cssUtils';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { LASER_PARAMS } from './laser.config';
import './LaserFlowMaterial';

const { clamp, damp } = THREE.MathUtils;

// Fog detail per quality tier (0 = off).
const FOG_QUALITY = { low: 0, medium: 0.3, high: 1 };

// One triangle that covers the screen (positions are already clip space).
const geometry = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));

/** Fullscreen laser overlay on the home scene; each LASER_PARAMS uniform is base + progress * scale (progressRef.current: 0…1). */
export default function LaserPlane({ progressRef, fadeOutRef }) {
    const materialRef = useRef();
    const fadeInRef = useRef(0);
    const frameCount = useRef(0);
    const { quality } = useQuality();
    // Brand color as sRGB 0–1, used as-is (the shader tone-maps intensity, not colour).
    const color = useMemo(() => {
        const { r, g, b } = getCSSColorRGBA('--c-brnd_100');
        return new THREE.Vector3(r / 255, g / 255, b / 255);
    }, []);

    useFrame(({ pointer, size, viewport }, delta) => {
        const u = materialRef.current?.uniforms;
        if (!u) {
            return;
        }
        const width = size.width * viewport.dpr;
        const height = size.height * viewport.dpr;
        u.iResolution.value.set(width, height, viewport.dpr);
        // ponytail: low quality updates the other uniforms every other frame (the beam still draws every frame).
        frameCount.current++;
        if (quality === 'low' && frameCount.current % 2 !== 0) {
            return;
        }

        const dt = clamp(delta, 0.001, 0.033);
        // Pointer [-1, 1] → pixels.
        u.iMouse.value.set(((pointer.x + 1) / 2) * width, ((pointer.y + 1) / 2) * height, 0, 0);
        u.uFlowTime.value += dt;
        u.uFogTime.value += dt;
        fadeInRef.current = Math.min(1, fadeInRef.current + dt); // fades in over ~1 s (~2 s on low quality)
        u.uFade.value = fadeInRef.current * (1 - (fadeOutRef?.current ?? 0));
        u.uFogQuality.value = damp(u.uFogQuality.value, FOG_QUALITY[quality], 2, dt);
        u.uWispDensity.value = damp(u.uWispDensity.value, quality === 'low' ? 0.3 : 1, 2, dt);
        const progress = progressRef.current;
        for (const name in LASER_PARAMS) {
            u[name].value = LASER_PARAMS[name].base + progress * LASER_PARAMS[name].scale;
        }
    });

    return (
        <mesh geometry={geometry} renderOrder={1000} frustumCulled={false}>
            <laserFlowMaterial ref={materialRef} uniforms-uColor-value={color} />
        </mesh>
    );
}
