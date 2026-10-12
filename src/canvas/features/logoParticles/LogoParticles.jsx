import { useQuality } from '@app/QualityContext';
import createMatcapTexture from '@canvas/core/textures/createMatcapTexture';
import { REVEAL, SCENE, SCROLL_THRESHOLDS } from '@config/animation.config';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { entryEase } from '@utils/easingFunctions';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
import { LOGO_PARTICLES, TIERS } from './logoParticles.config';
import particlesFrag from './particles.frag.glsl';
import particlesVert from './particles.vert.glsl';
import positionFrag from './position.frag.glsl';

const MAX_COUNT = TIERS.high.size ** 2;

// ponytail: samples the largest tier once on the main thread (~tens of ms); smaller tiers reuse the first N (random order).
function samplePoints(geometry) {
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry)).build();
    const origins = new Float32Array(MAX_COUNT * 4);
    const randoms = new Float32Array(MAX_COUNT * 4);
    const point = new THREE.Vector3();
    for (let i = 0; i < MAX_COUNT; i++) {
        sampler.sample(point);
        origins[i * 4] = point.x;
        origins[i * 4 + 1] = point.y;
        origins[i * 4 + 2] = point.z;
        origins[i * 4 + 3] = 1;
        for (let j = 0; j < 4; j++) {
            randoms[i * 4 + j] = Math.random();
        }
    }
    return { origins, randoms };
}

function createSimulation(gl, size, halfFloat, { origins, randoms }, disperse) {
    const count = size * size;
    const originTexture = new THREE.DataTexture(origins.subarray(0, count * 4), size, size, THREE.RGBAFormat, THREE.FloatType);
    originTexture.needsUpdate = true;
    const randomTexture = new THREE.DataTexture(randoms.subarray(0, count * 4), size, size, THREE.RGBAFormat, THREE.FloatType);
    randomTexture.needsUpdate = true;

    const gpu = new GPUComputationRenderer(size, size, gl);
    if (halfFloat) {
        gpu.setDataType(THREE.HalfFloatType);
    }
    const start = gpu.createTexture();
    // Seed where particles would rest for the current disperse (1 = cloud on first mount), so rebuilds don't jump.
    const seed = start.image.data;
    for (let i = 0; i < count * 4; i += 4) {
        for (let j = 0; j < 3; j++) {
            seed[i + j] = origins[i + j] + (randoms[i + j] - 0.5) * LOGO_PARTICLES.CLOUD_RADIUS * disperse;
        }
        seed[i + 3] = 1;
    }
    const variable = gpu.addVariable('texturePosition', positionFrag, start);
    gpu.setVariableDependencies(variable, [variable]);
    Object.assign(variable.material.uniforms, {
        tOrigin: { value: originTexture },
        tRandom: { value: randomTexture },
        uTime: { value: 0 },
        uDelta: { value: 1 },
        uDisperse: { value: 1 },
        uSpring: { value: LOGO_PARTICLES.SPRING },
        uCloudRadius: { value: LOGO_PARTICLES.CLOUD_RADIUS },
        uCurlScale: { value: LOGO_PARTICLES.CURL_SCALE },
        uCurlSpeed: { value: LOGO_PARTICLES.CURL_SPEED },
        uCurlStrength: { value: LOGO_PARTICLES.CURL_STRENGTH },
    });
    const error = gpu.init();

    // One point per texel: position holds the texel-centre UV the vertex shader reads from.
    const references = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        references[i * 3] = ((i % size) + 0.5) / size;
        references[i * 3 + 1] = (Math.floor(i / size) + 0.5) / size;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(references, 3));
    geometry.setAttribute('random', new THREE.BufferAttribute(randoms.subarray(0, count * 4), 4));

    return {
        gpu,
        variable,
        geometry,
        error,
        dispose() {
            gpu.dispose();
            geometry.dispose();
            originTexture.dispose();
            randomTexture.dispose();
        },
    };
}

export default function LogoParticles({ video, startAnimations, scrollProgress }) {
    const gl = useThree((state) => state.gl);
    const { quality } = useQuality();
    const { nodes } = useGLTF('/assets/3d/Logo.glb');
    const samples = useMemo(() => samplePoints(nodes.Logo.geometry), [nodes]);
    const [sim, setSim] = useState(null);
    const simRef = useRef(null);
    const introStart = useRef(null);
    const matcap = useMemo(() => createMatcapTexture(), []);
    const disperseRef = useRef(1);

    const { size } = TIERS[quality];
    // Low tier, or devices that can only render half floats, simulate at half precision.
    const halfFloat = quality === 'low' || !gl.extensions.has('EXT_color_buffer_float');

    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexShader: particlesVert,
                fragmentShader: particlesFrag,
                uniforms: {
                    tPosition: { value: null },
                    uPointSize: { value: LOGO_PARTICLES.POINT_SIZE },
                    uDpr: { value: 1 },
                    tVideo: { value: null },
                    uHasVideo: { value: 0 },
                    tMatcap: { value: matcap },
                    uResolution: { value: new THREE.Vector2() },
                    uTime: { value: 0 },
                },
            }),
        [matcap]
    );

    useEffect(
        () => () => {
            material.dispose();
            matcap.dispose();
        },
        [material, matcap]
    );

    useEffect(() => {
        const next = createSimulation(gl, size, halfFloat, samples, disperseRef.current);
        if (next.error) {
            console.error('LogoParticles:', next.error);
        }
        simRef.current = next;
        setSim(next);
        return () => {
            simRef.current = null;
            next.dispose();
        };
    }, [gl, size, halfFloat, samples]);

    useFrame((state, delta) => {
        const current = simRef.current;
        if (!current || current.error) {
            return;
        }

        // uDisperse: 1 = cloud, 0 = logo. The intro assembles the logo; scrolling scatters it again.
        if (startAnimations && introStart.current === null) {
            introStart.current = state.clock.elapsedTime;
        }
        let intro = 1;
        if (introStart.current !== null) {
            const t = (state.clock.elapsedTime - introStart.current - REVEAL.DURATION) / SCENE.CAMERA_DURATION;
            intro = 1 - entryEase(THREE.MathUtils.clamp(t, 0, 1));
        }
        const scatter = THREE.MathUtils.smoothstep(scrollProgress, 0, SCROLL_THRESHOLDS.HOME_TRANSITION);

        const u = current.variable.material.uniforms;
        u.uTime.value = state.clock.elapsedTime;
        u.uDelta.value = Math.min(delta * 60, 2);
        disperseRef.current = Math.max(intro, scatter);
        u.uDisperse.value = disperseRef.current;
        current.gpu.compute();

        const m = material.uniforms;
        m.tPosition.value = current.gpu.getCurrentRenderTarget(current.variable).texture;
        m.uDpr.value = state.viewport.dpr;
        m.tVideo.value = video;
        m.uHasVideo.value = video ? 1 : 0;
        m.uTime.value = state.clock.elapsedTime;
        state.gl.getDrawingBufferSize(m.uResolution.value);
    });

    if (!sim || sim.error) {
        return null;
    }
    return <points geometry={sim.geometry} material={material} frustumCulled={false} />;
}
