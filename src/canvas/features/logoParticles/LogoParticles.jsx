import { useQuality } from '@app/QualityContext';
import useFluidSim from '@canvas/core/fluid/useFluidSim';
import createMatcapTexture from '@canvas/core/textures/createMatcapTexture';
import { REVEAL, SCENE, SCROLL_THRESHOLDS } from '@config/animation.config';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { getCSSColorRGBA } from '@utils/cssUtils';
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

// ponytail: builds the largest tier once on the main thread (~tens of ms); smaller tiers reuse the first N entries.
function buildTargets(geometry) {
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry)).build();
    const origins = new Float32Array(MAX_COUNT * 4);
    const grids = new Float32Array(MAX_COUNT * 4);
    const randoms = new Float32Array(MAX_COUNT * 4);
    const { GRID_COLUMNS: columns, GRID_ROWS: rows, GRID_WIDTH: width, GRID_Z: z } = LOGO_PARTICLES;
    const spacing = width / columns;
    const point = new THREE.Vector3();
    for (let i = 0; i < MAX_COUNT; i++) {
        sampler.sample(point);
        origins[i * 4] = point.x;
        origins[i * 4 + 1] = point.y;
        origins[i * 4 + 2] = point.z;
        origins[i * 4 + 3] = 1;

        // Dot-matrix cell, row 0 at the top. Samples come out in random order, so the grid ↔ logo pairing is random.
        const cell = i % (columns * rows);
        grids[i * 4] = ((cell % columns) - (columns - 1) / 2) * spacing;
        grids[i * 4 + 1] = ((rows - 1) / 2 - Math.floor(cell / columns)) * spacing;
        grids[i * 4 + 2] = z;
        grids[i * 4 + 3] = 1;

        for (let j = 0; j < 4; j++) {
            randoms[i * 4 + j] = Math.random();
        }
    }
    return { origins, grids, randoms };
}

function createDataTexture(data, size) {
    const texture = new THREE.DataTexture(data.subarray(0, size * size * 4), size, size, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;
    return texture;
}

function createSimulation(gl, size, halfFloat, { origins, grids, randoms }, morph) {
    const count = size * size;
    const originTexture = createDataTexture(origins, size);
    const gridTexture = createDataTexture(grids, size);
    const randomTexture = createDataTexture(randoms, size);

    const gpu = new GPUComputationRenderer(size, size, gl);
    if (halfFloat) {
        gpu.setDataType(THREE.HalfFloatType);
    }
    const start = gpu.createTexture();
    // Seed where particles would rest for the current morph (0 = grid on first mount), so rebuilds don't jump.
    const seed = start.image.data;
    for (let i = 0; i < count * 4; i += 4) {
        for (let j = 0; j < 3; j++) {
            seed[i + j] = grids[i + j] + (origins[i + j] - grids[i + j]) * morph;
        }
        seed[i + 3] = 1;
    }
    const variable = gpu.addVariable('texturePosition', positionFrag, start);
    gpu.setVariableDependencies(variable, [variable]);
    Object.assign(variable.material.uniforms, {
        tOrigin: { value: originTexture },
        tGrid: { value: gridTexture },
        tRandom: { value: randomTexture },
        tFluid: { value: null },
        uTime: { value: 0 },
        uDelta: { value: 1 },
        uMorph: { value: morph },
        uMorphStagger: { value: LOGO_PARTICLES.MORPH_STAGGER },
        uSpring: { value: LOGO_PARTICLES.SPRING },
        uCurlScale: { value: LOGO_PARTICLES.CURL_SCALE },
        uCurlSpeed: { value: LOGO_PARTICLES.CURL_SPEED },
        uCurlStrength: { value: LOGO_PARTICLES.CURL_STRENGTH },
        uFluidStrength: { value: 0 },
        uModelViewProjection: { value: new THREE.Matrix4() },
        uScreenToLocal: { value: new THREE.Matrix3() },
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
            gridTexture.dispose();
            randomTexture.dispose();
        },
    };
}

export default function LogoParticles({ startAnimations, scrollProgress }) {
    const gl = useThree((state) => state.gl);
    const { quality } = useQuality();
    const { nodes } = useGLTF('/assets/3d/Logo.glb');
    const targets = useMemo(() => buildTargets(nodes.Logo.geometry), [nodes]);
    const [sim, setSim] = useState(null);
    const simRef = useRef(null);
    const pointsRef = useRef(null);
    const morphRef = useRef(0);
    const introStart = useRef(null);
    const matcap = useMemo(() => createMatcapTexture(), []);

    const { size, fluidIterations } = TIERS[quality];
    // Must run before this component's own useFrame: R3F runs same-priority callbacks in subscription order.
    const fluidRef = useFluidSim(fluidIterations);
    const modelView = useMemo(() => new THREE.Matrix4(), []);
    // Low tier, or devices that can only render half floats, simulate at half precision.
    const halfFloat = quality === 'low' || !gl.extensions.has('EXT_color_buffer_float');

    const material = useMemo(() => {
        const { r, g, b } = getCSSColorRGBA('--c-brnd_100');
        const { GRID_COLUMNS, GRID_ROWS, GRID_WIDTH, POINT_SIZE } = LOGO_PARTICLES;
        return new THREE.ShaderMaterial({
            vertexShader: particlesVert,
            fragmentShader: particlesFrag,
            uniforms: {
                tPosition: { value: null },
                uPointSize: { value: POINT_SIZE },
                uDpr: { value: 1 },
                uIntro: { value: 0 },
                uGridSize: { value: new THREE.Vector2(GRID_WIDTH, (GRID_WIDTH * GRID_ROWS) / GRID_COLUMNS) },
                // CSS colors are sRGB; the shader works in linear space.
                uColor: { value: new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace) },
                tMatcap: { value: matcap },
                uTime: { value: 0 },
            },
        });
    }, [matcap]);

    useEffect(
        () => () => {
            material.dispose();
            matcap.dispose();
        },
        [material, matcap]
    );

    useEffect(() => {
        const next = createSimulation(gl, size, halfFloat, targets, morphRef.current);
        if (next.error) {
            console.error('LogoParticles:', next.error);
        }
        simRef.current = next;
        setSim(next);
        return () => {
            simRef.current = null;
            next.dispose();
        };
    }, [gl, size, halfFloat, targets]);

    useFrame((state, delta) => {
        const current = simRef.current;
        if (!current || current.error) {
            return;
        }
        // Skip the one frame where <points> still holds the previous tier's (disposed) geometry.
        const points = pointsRef.current;
        if (points) {
            points.visible = points.geometry === current.geometry;
        }
        const time = state.clock.elapsedTime;

        // uMorph: 0 = dot-matrix grid, 1 = logo. The logo is formed when the page moves to Work.
        morphRef.current = THREE.MathUtils.smoothstep(scrollProgress, 0, SCROLL_THRESHOLDS.HOME_TRANSITION);
        const u = current.variable.material.uniforms;
        u.uTime.value = time;
        u.uDelta.value = Math.min(delta * 60, 2);
        u.uMorph.value = morphRef.current;

        // Fluid velocity is in screen space; map it into the logo's local space (a null sampler reads as black).
        const fluid = fluidRef.current;
        u.tFluid.value = fluid ? fluid.velocity : null;
        u.uFluidStrength.value = fluid ? LOGO_PARTICLES.FLUID_STRENGTH : 0;
        if (points) {
            modelView.multiplyMatrices(state.camera.matrixWorldInverse, points.matrixWorld);
            u.uModelViewProjection.value.multiplyMatrices(state.camera.projectionMatrix, modelView);
            u.uScreenToLocal.value.setFromMatrix4(modelView).invert();
        }
        current.gpu.compute();

        // uIntro: the panel powers on over the reveal, in sync with the camera.
        if (startAnimations && introStart.current === null) {
            introStart.current = time;
        }
        const introT = introStart.current === null ? 0 : (time - introStart.current - REVEAL.DURATION) / SCENE.CAMERA_DURATION;

        const m = material.uniforms;
        m.tPosition.value = current.gpu.getCurrentRenderTarget(current.variable).texture;
        m.uDpr.value = state.viewport.dpr;
        m.uIntro.value = entryEase(THREE.MathUtils.clamp(introT, 0, 1));
        m.uTime.value = time;
    });

    if (!sim || sim.error) {
        return null;
    }
    return <points ref={pointsRef} geometry={sim.geometry} material={material} frustumCulled={false} />;
}
