import { useQuality } from '@app/QualityContext';
import { LOGO_PARTICLES } from '@canvas/features/logoParticles/logoParticles.config';
import { STREAM } from '@config/animation.config';
import { useFrame, useThree } from '@react-three/fiber';
import { getCSSColorRGBA } from '@utils/cssUtils';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FIBER_TIERS, STREAM_FIBERS } from './streamFibers.config';
import fibersFrag from './streamFibers.frag.glsl';
import fibersVert from './streamFibers.vert.glsl';

const { POINTS_PER_FIBER: K } = STREAM_FIBERS;

/** Fibre geometry: `count` strands of K points (line segments between neighbours), plus per-vertex random and trail position. */
function createFibers(count) {
    const randoms = new Float32Array(count * K * 4);
    const trail = new Float32Array(count * K);
    const index = [];
    for (let f = 0; f < count; f++) {
        const r = [Math.random(), Math.random(), Math.random(), Math.random()];
        for (let k = 0; k < K; k++) {
            const v = f * K + k;
            randoms.set(r, v * 4);
            trail[v] = k / (K - 1);
            if (k > 0) {
                index.push(v - 1, v);
            }
        }
    }
    const geometry = new THREE.BufferGeometry()
        .setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * K * 3), 3))
        .setAttribute('random', new THREE.BufferAttribute(randoms, 4))
        .setAttribute('trail', new THREE.BufferAttribute(trail, 1));
    geometry.setIndex(index);
    return geometry;
}

/** Spark geometry: one point per SPARK_EVERY fibres, at the head (trail 0). */
function createSparks(count) {
    const sparks = Math.max(1, Math.round(count / STREAM_FIBERS.SPARK_EVERY));
    return new THREE.BufferGeometry()
        .setAttribute('position', new THREE.BufferAttribute(new Float32Array(sparks * 3), 3))
        .setAttribute('random', new THREE.BufferAttribute(Float32Array.from({ length: sparks * 4 }, Math.random), 4))
        .setAttribute('trail', new THREE.BufferAttribute(new Float32Array(sparks), 1));
}

function createMaterial(color, spark) {
    return new THREE.ShaderMaterial({
        vertexShader: fibersVert,
        fragmentShader: fibersFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
            uTrunkY: { value: 0 },
            uTrunkHalf: { value: 10 },
            uSpread: { value: STREAM_FIBERS.SPREAD },
            uFlow: { value: 0 },
            uTrail: { value: STREAM_FIBERS.TRAIL },
            uBranchY: { value: 0 },
            uBranchEnd: { value: new THREE.Vector3() },
            uBranchGrow: { value: 0 },
            uBranchShare: { value: LOGO_PARTICLES.BRANCH_SHARE },
            uSway: { value: new THREE.Vector4() },
            uSpark: { value: spark ? 1 : 0 },
            uPointSize: { value: STREAM_FIBERS.SPARK_SIZE },
            uDpr: { value: 1 },
            uColor: { value: color },
            uFade: { value: 0 },
        },
    });
}

/** The stream as fibre-optic light trails in carousel space; reads streamRef (written by WorkScene) every frame. */
export default function StreamFibers({ streamRef }) {
    const { quality } = useQuality();
    const dpr = useThree((state) => state.viewport.dpr);
    const groupRef = useRef(null);
    const count = FIBER_TIERS[quality];

    const color = useMemo(() => {
        const { r, g, b } = getCSSColorRGBA('--c-brnd_100');
        return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    }, []);
    const fibers = useMemo(() => createFibers(count), [count]);
    const sparks = useMemo(() => createSparks(count), [count]);
    const materials = useMemo(() => [createMaterial(color, false), createMaterial(color, true)], [color]);
    useEffect(() => () => fibers.dispose(), [fibers]);
    useEffect(() => () => sparks.dispose(), [sparks]);
    useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

    useFrame(({ clock }) => {
        const s = streamRef.current;
        const group = groupRef.current;
        if (!group) {
            return;
        }
        // Only drawn once the hand-off has started.
        group.visible = s.fade > 0;
        if (!group.visible) {
            return;
        }
        for (const material of materials) {
            const u = material.uniforms;
            u.uTrunkY.value = s.trunkY;
            u.uTrunkHalf.value = s.trunkHalf;
            u.uFlow.value = s.flow;
            u.uBranchY.value = s.branchY;
            u.uBranchEnd.value.copy(s.branchEnd);
            u.uBranchGrow.value = s.grow;
            u.uSway.value.set(
                STREAM_FIBERS.SWAY_AMPLITUDE,
                STREAM_FIBERS.SWAY_FREQUENCY,
                clock.elapsedTime * STREAM.SWAY_SPEED,
                STREAM_FIBERS.STRAND_AMPLITUDE
            );
            u.uDpr.value = dpr;
            u.uFade.value = s.fade;
        }
    });

    return (
        <group ref={groupRef} visible={false}>
            <lineSegments geometry={fibers} material={materials[0]} frustumCulled={false} />
            <points geometry={sparks} material={materials[1]} frustumCulled={false} />
        </group>
    );
}
