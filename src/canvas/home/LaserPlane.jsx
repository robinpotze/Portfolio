import { useQuality } from '@app/QualityContext';
import '@canvas/shared/materials/LaserFlowMaterial';
import { useFrame, useThree } from '@react-three/fiber';
import { getCSSColorRGBA } from '@utils/cssUtils';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

const FOG_QUALITY_BY_QUALITY = { low: 0, medium: 0.3, high: 1 };

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));

export default function LaserPlane({
    horizontalSizing = 0.5,
    verticalSizing = 2.0,
    horizontalBeamOffset = 0.0,
    verticalBeamOffset = 0.0,
    flowSpeed = 0.35,
    fogIntensity = 0.45,
    fogScale = 0.1,
    wispSpeed = 15.0,
    wispIntensity = 5.0,
    wispDensity = 1.0,
    flowStrength = 0.25,
    decay = 1.5,
    falloffStart = 1.2,
    fogFallSpeed = 0.6,
    mouseSmoothTime = 0.0,
    mouseTiltStrength = 0.01,
    color = '--c-brnd_100',
}) {
    const matRef = useRef();
    const frameCount = useRef(0);
    const hasFaded = useRef(false);
    const fadeValue = useRef(0);
    const mouseSmooth = useRef(new THREE.Vector2(0, 0));

    const { quality } = useQuality();
    const { size, viewport } = useThree();

    const targetFogQualityRef = useRef(FOG_QUALITY_BY_QUALITY[quality] ?? 1);

    const colorVec = useMemo(() => {
        const { r, g, b } = getCSSColorRGBA(color || '--c-brnd_100');
        return new THREE.Vector3(r / 255, g / 255, b / 255);
    }, [color]);

    // Update resolution when viewport changes
    useEffect(() => {
        const mat = matRef.current;
        if (!mat) return;
        const dpr = viewport.dpr;
        mat.uniforms.iResolution.value.set(size.width * dpr, size.height * dpr, dpr);
    }, [size.width, size.height, viewport.dpr]);

    // Track quality target (lerped in useFrame)
    useEffect(() => {
        targetFogQualityRef.current = FOG_QUALITY_BY_QUALITY[quality] ?? 1;
    }, [quality]);

    useFrame((state, delta) => {
        const mat = matRef.current;
        if (!mat) return;

        // Frame skipping on low quality
        frameCount.current++;
        if (quality === 'low' && frameCount.current % 2 !== 0) return;

        const u = mat.uniforms;
        const t = state.clock.getElapsedTime();
        const cdt = Math.min(0.033, Math.max(0.001, delta));

        u.iTime.value = t;
        u.uFlowTime.value += cdt;
        u.uFogTime.value += cdt;

        // Fade in
        if (!hasFaded.current) {
            fadeValue.current = Math.min(1, fadeValue.current + cdt);
            u.uFade.value = fadeValue.current;
            if (fadeValue.current >= 1) hasFaded.current = true;
        }

        // Smoothly interpolate fog quality toward target
        const fogTarget = targetFogQualityRef.current;
        u.uFogQuality.value += (fogTarget - u.uFogQuality.value) * Math.min(1, 2 * cdt);

        // Smoothly interpolate wisp density (capped on low quality)
        const wispTarget = quality === 'low' ? Math.min(wispDensity, 0.3) : wispDensity;
        u.uWispDensity.value += (wispTarget - u.uWispDensity.value) * Math.min(1, 2 * cdt);

        // Mouse: convert R3F pointer [-1,1] to pixel coords
        const dpr = state.viewport.dpr;
        const pw = size.width * dpr;
        const ph = size.height * dpr;
        const mx = ((state.pointer.x + 1) / 2) * pw;
        const my = ((state.pointer.y + 1) / 2) * ph;

        const tau = Math.max(1e-3, mouseSmoothTime);
        const alpha = 1 - Math.exp(-cdt / tau);
        mouseSmooth.current.lerp(new THREE.Vector2(mx, my), alpha);
        u.iMouse.value.set(mouseSmooth.current.x, mouseSmooth.current.y, 0, 0);

        // Sync prop-driven uniforms every frame (they change with scroll)
        u.uHLenFactor.value = horizontalSizing;
        u.uVLenFactor.value = verticalSizing;
        u.uBeamXFrac.value = horizontalBeamOffset;
        u.uBeamYFrac.value = verticalBeamOffset;
        u.uFlowSpeed.value = flowSpeed;
        u.uFogIntensity.value = fogIntensity;
        u.uFogScale.value = fogScale;
        u.uWSpeed.value = wispSpeed;
        u.uWIntensity.value = wispIntensity;
        u.uFlowStrength.value = flowStrength;
        u.uDecay.value = decay;
        u.uFalloffStart.value = falloffStart;
        u.uFogFallSpeed.value = fogFallSpeed;
        u.uTiltScale.value = mouseTiltStrength;
        u.uColor.value.copy(colorVec);
    });

    return (
        <mesh geometry={geometry} renderOrder={1000} frustumCulled={false}>
            <laserFlowMaterial ref={matRef} />
        </mesh>
    );
}
