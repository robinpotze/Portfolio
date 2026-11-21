import { useQuality } from '@app/QualityContext';
import { CAROUSEL_CONFIG } from '@canvas/features/carousel';
import { LOGO_PARTICLES, TIERS } from '@canvas/features/logoParticles/logoParticles.config';
import { STREAM } from '@config/animation.config';
import { useFrame, useThree } from '@react-three/fiber';
import { getCSSColorRGBA } from '@utils/cssUtils';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FIBER_TIERS, STREAM_FIBERS } from './streamFibers.config';
import fibersFrag from './streamFibers.frag.glsl';
import fibersVert from './streamFibers.vert.glsl';

const { POINTS_PER_FIBER: K } = STREAM_FIBERS;
const { smoothstep } = THREE.MathUtils;

/** Texel-centre UVs of `count` sim particles spread evenly over the size² texture, starting at `offset`. */
function simUvs(count, size, offset = 0) {
    const stride = Math.max(1, Math.floor((size * size) / count));
    const uvs = new Float32Array(count * 2);
    for (let f = 0; f < count; f++) {
        const i = (f * stride + offset) % (size * size);
        uvs[f * 2] = ((i % size) + 0.5) / size;
        uvs[f * 2 + 1] = (Math.floor(i / size) + 0.5) / size;
    }
    return { uvs, stride };
}

/** Fibre geometry: `count` strands of K points (line segments between neighbours), each tied to one sim particle. */
function createFibers(count, size) {
    const { uvs } = simUvs(count, size);
    const vertexUvs = new Float32Array(count * K * 2);
    const trail = new Float32Array(count * K);
    const index = [];
    for (let f = 0; f < count; f++) {
        for (let k = 0; k < K; k++) {
            const v = f * K + k;
            vertexUvs.set(uvs.subarray(f * 2, f * 2 + 2), v * 2);
            trail[v] = k / (K - 1);
            if (k > 0) {
                index.push(v - 1, v);
            }
        }
    }
    const geometry = new THREE.BufferGeometry()
        .setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * K * 3), 3))
        .setAttribute('simUv', new THREE.BufferAttribute(vertexUvs, 2))
        .setAttribute('trail', new THREE.BufferAttribute(trail, 1));
    geometry.setIndex(index);
    return geometry;
}

/** One point per sim particle at the strand head (trail 0): the fibres' heads, or sparks on other particles (offset). */
function createPoints(count, size, offset) {
    return new THREE.BufferGeometry()
        .setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
        .setAttribute('simUv', new THREE.BufferAttribute(simUvs(count, size, offset).uvs, 2))
        .setAttribute('trail', new THREE.BufferAttribute(new Float32Array(count), 1));
}

function createSparks(count, size) {
    const sparks = Math.max(1, Math.round(count / STREAM_FIBERS.SPARK_EVERY));
    // Half a stride off, so sparks sit on particles between the fibres' ones.
    return createPoints(sparks, size, Math.floor(simUvs(sparks, size).stride / 2));
}

function createMaterial(color, { spark = 0, head = 0 }) {
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
            uCardCenter: { value: [new THREE.Vector3(), new THREE.Vector3()] },
            uCardRight: { value: [new THREE.Vector3(), new THREE.Vector3()] },
            uCardUp: { value: [new THREE.Vector3(), new THREE.Vector3()] },
            uBranchInset: { value: CAROUSEL_CONFIG.BRANCH.INSET },
            uBranchBow: { value: CAROUSEL_CONFIG.BRANCH.BOW },
            uBranchGrow: { value: [0, 0] },
            uBranchShare: { value: LOGO_PARTICLES.BRANCH_SHARE },
            uSway: { value: new THREE.Vector4() },
            uSpark: { value: spark },
            uHead: { value: head },
            uSparkSpread: { value: STREAM_FIBERS.SPARK_SPREAD },
            uSparkFlow: { value: STREAM.SPARK_FLOW },
            tSimPosition: { value: null },
            tSimRandom: { value: null },
            uLocalToStream: { value: new THREE.Matrix4() },
            uStream: { value: 0 },
            uMorphStagger: { value: LOGO_PARTICLES.MORPH_STAGGER },
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
    const headsRef = useRef(null);
    const count = FIBER_TIERS[quality];
    // Same tier as LogoParticles, so the UVs address its simulation texture.
    const { size } = TIERS[quality];

    const color = useMemo(() => {
        const { r, g, b } = getCSSColorRGBA('--c-brnd_100');
        return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    }, []);
    const fibers = useMemo(() => createFibers(count, size), [count, size]);
    const heads = useMemo(() => createPoints(count, size, 0), [count, size]);
    const sparks = useMemo(() => createSparks(count, size), [count, size]);
    const materials = useMemo(() => [createMaterial(color, {}), createMaterial(color, { spark: 1 }), createMaterial(color, { head: 1 })], [color]);
    useEffect(() => () => fibers.dispose(), [fibers]);
    useEffect(() => () => heads.dispose(), [heads]);
    useEffect(() => () => sparks.dispose(), [sparks]);
    useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

    useFrame(({ clock }) => {
        const s = streamRef.current;
        const group = groupRef.current;
        if (!group) {
            return;
        }
        // Drawn from the start of the morph; needs the logo sim (no fibres on the metallic-logo fallback).
        // ponytail: devices without the particle sim show no stream; add an analytic-only fibre mode if that matters.
        group.visible = s.blend > 0 && s.simRandom !== null;
        if (!group.visible) {
            return;
        }
        headsRef.current.visible = s.blend < 1;
        for (const material of materials) {
            const u = material.uniforms;
            u.uTrunkY.value = s.trunkY;
            u.uTrunkHalf.value = s.trunkHalf;
            u.uFlow.value = s.flow;
            s.cards.forEach((card, slot) => {
                u.uCardCenter.value[slot].copy(card.center);
                u.uCardRight.value[slot].copy(card.right);
                u.uCardUp.value[slot].copy(card.up);
                u.uBranchGrow.value[slot] = card.grow;
            });
            u.uSway.value.set(
                STREAM_FIBERS.SWAY_AMPLITUDE,
                STREAM_FIBERS.SWAY_FREQUENCY,
                clock.elapsedTime * STREAM.SWAY_SPEED,
                STREAM_FIBERS.STRAND_AMPLITUDE
            );
            u.uDpr.value = dpr;
            u.uStream.value = s.blend;
            u.tSimPosition.value = s.simPosition;
            u.tSimRandom.value = s.simRandom;
            u.uLocalToStream.value.copy(s.localToStream);
            u.uFade.value = smoothstep(s.blend, 0, STREAM_FIBERS.FADE_IN_END);
        }
    });

    return (
        <group ref={groupRef} visible={false}>
            <lineSegments geometry={fibers} material={materials[0]} frustumCulled={false} />
            <points geometry={sparks} material={materials[1]} frustumCulled={false} />
            <points ref={headsRef} geometry={heads} material={materials[2]} frustumCulled={false} />
        </group>
    );
}
