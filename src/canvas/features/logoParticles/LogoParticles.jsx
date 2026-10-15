import { useQuality } from '@app/QualityContext';
import useFluidSim from '@canvas/core/fluid/useFluidSim';
import createMatcapTexture from '@canvas/core/textures/createMatcapTexture';
import { SCENE, SCROLL_THRESHOLDS } from '@config/animation.config';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { getCSSColorRGBA } from '@utils/cssUtils';
import { entryEase } from '@utils/easingFunctions';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/addons/math/MeshSurfaceSampler.js';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
import { LOGO_PARTICLES, TIERS } from './logoParticles.config';
import LogoParticlesMaterial from './LogoParticlesMaterial';
import positionFrag from './position.frag.glsl';

const { clamp, lerp, smoothstep } = THREE.MathUtils;
const MAX_COUNT = TIERS.high.size ** 2;

// { a: 1 } → { a: { value: 1 } } for the GPUComputationRenderer's plain ShaderMaterial.
const toUniforms = (values) => Object.fromEntries(Object.entries(values).map(([name, value]) => [name, { value }]));

// Targets per logo geometry, so returning to Home doesn't re-sample 262k points (useGLTF reuses the geometry object).
const targetsCache = new WeakMap();

/** Logo surface points and per-particle randoms (RGBA rows) for the largest tier; smaller tiers use the first N. */
// ponytail: samples on the main thread (~tens of ms), once per geometry thanks to targetsCache.
function buildTargets(geometry) {
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry)).build();
    const origins = new Float32Array(MAX_COUNT * 4);
    const point = new THREE.Vector3();
    for (let k = 0; k < origins.length; k += 4) {
        sampler.sample(point);
        point.toArray(origins, k);
        origins[k + 3] = 1;
    }
    return { origins, randoms: Float32Array.from({ length: origins.length }, Math.random) };
}

function createDataTexture(data, size) {
    const texture = new THREE.DataTexture(data.subarray(0, size * size * 4), size, size, THREE.RGBAFormat, THREE.FloatType);
    texture.needsUpdate = true;
    return texture;
}

/** ~GRID_CELLS square cells across a panel of the given size (logo-local units), whatever its aspect. */
function gridLayout([width, height]) {
    const columns = Math.max(1, Math.round(Math.sqrt((LOGO_PARTICLES.GRID_CELLS * width) / height)));
    const rows = Math.max(1, Math.round(LOGO_PARTICLES.GRID_CELLS / columns));
    return { columns, rows, width, height };
}

/** GPU simulation for size² particles, seeded where each particle rests at the given morph, plus their point geometry. */
function createSimulation(gl, size, halfFloat, { origins, randoms }, morph, grid) {
    const count = size * size;
    const { columns, rows, width, height } = grid;
    const { GRID_Z, MORPH_STAGGER } = LOGO_PARTICLES;
    const originTexture = createDataTexture(origins, size);
    const randomTexture = createDataTexture(randoms, size);

    const gpu = new GPUComputationRenderer(size, size, gl);
    if (halfFloat) {
        gpu.setDataType(THREE.HalfFloatType);
    }
    // Seed at the current morph (0 = grid on first mount), so tier rebuilds don't jump.
    const start = gpu.createTexture();
    const seed = start.image.data;
    for (let i = 0, k = 0; i < count; i++, k += 4) {
        // Grid cell (row 0 at the top) and per-particle lag; both must match position.frag.glsl.
        const cell = i % (columns * rows);
        const gridX = ((cell % columns) - (columns - 1) / 2) * (width / columns);
        const gridY = ((rows - 1) / 2 - Math.floor(cell / columns)) * (height / rows);
        const t = clamp((morph - randoms[k + 3] * MORPH_STAGGER) / (1 - MORPH_STAGGER), 0, 1);
        seed[k] = lerp(gridX, origins[k], t);
        seed[k + 1] = lerp(gridY, origins[k + 1], t);
        seed[k + 2] = lerp(GRID_Z, origins[k + 2], t);
        seed[k + 3] = 1;
    }

    const variable = gpu.addVariable('texturePosition', positionFrag, start);
    gpu.setVariableDependencies(variable, [variable]);
    Object.assign(
        variable.material.uniforms,
        toUniforms({
            tOrigin: originTexture,
            tRandom: randomTexture,
            tFluid: null,
            uTime: 0,
            uDelta: 1,
            uMorph: morph,
            uMorphStagger: MORPH_STAGGER,
            uGridColumns: columns,
            uGridRows: rows,
            uGridSize: new THREE.Vector2(width, height),
            uGridZ: GRID_Z,
            uSpring: LOGO_PARTICLES.SPRING,
            uCurlScale: LOGO_PARTICLES.CURL_SCALE,
            uCurlSpeed: LOGO_PARTICLES.CURL_SPEED,
            uCurlStrength: LOGO_PARTICLES.CURL_STRENGTH,
            uFluidStrength: 0,
            uModelViewProjection: new THREE.Matrix4(),
            uScreenToLocal: new THREE.Matrix3(),
        })
    );
    const error = gpu.init();
    // init() has copied the seed into the render targets; free its GPU copy (gpu.dispose() disposing it again is harmless).
    start.dispose();

    // One point per texel: position holds the texel-centre UV the vertex shader reads from.
    const references = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        references[i * 3] = ((i % size) + 0.5) / size;
        references[i * 3 + 1] = (Math.floor(i / size) + 0.5) / size;
    }
    const geometry = new THREE.BufferGeometry()
        .setAttribute('position', new THREE.BufferAttribute(references, 3))
        .setAttribute('random', new THREE.BufferAttribute(randoms.subarray(0, count * 4), 4));

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

export default function LogoParticles({ startAnimations, scrollProgress, gridSize }) {
    const gl = useThree((state) => state.gl);
    const { quality } = useQuality();
    const { size, fluidIterations } = TIERS[quality];
    // Low tier, or devices that can only render half floats, simulate at half precision.
    const halfFloat = quality === 'low' || !gl.extensions.has('EXT_color_buffer_float');

    const { nodes } = useGLTF('/assets/3d/Logo.glb');
    const targets = useMemo(() => {
        const geometry = nodes.Logo.geometry;
        if (!targetsCache.has(geometry)) {
            targetsCache.set(geometry, buildTargets(geometry));
        }
        return targetsCache.get(geometry);
    }, [nodes]);

    // The panel follows the viewport live (uniforms only); a rebuild reads the latest layout for its seed.
    const grid = useMemo(() => gridLayout(gridSize), [gridSize]);
    const gridRef = useRef(grid);
    gridRef.current = grid;

    const matcap = useMemo(() => createMatcapTexture(), []);
    useEffect(() => () => matcap.dispose(), [matcap]);
    const color = useMemo(() => {
        const { r, g, b } = getCSSColorRGBA('--c-brnd_100');
        // CSS colors are sRGB; the shader works in linear space.
        return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    }, []);

    // Must run before this component's own useFrame: R3F runs same-priority callbacks in subscription order.
    const fluidRef = useFluidSim(fluidIterations);
    const [sim, setSim] = useState(null);
    const simRef = useRef(null);
    const pointsRef = useRef(null);
    const materialRef = useRef(null);
    const morphRef = useRef(0);
    const introStart = useRef(null);
    const modelView = useMemo(() => new THREE.Matrix4(), []);

    useEffect(() => {
        const next = createSimulation(gl, size, halfFloat, targets, morphRef.current, gridRef.current);
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

    useFrame(({ camera, clock, viewport }, delta) => {
        const current = simRef.current;
        const points = pointsRef.current;
        const material = materialRef.current;
        if (!current || current.error || !points || !material) {
            return;
        }
        // Skip the one frame where <points> still holds the previous tier's (disposed) geometry.
        points.visible = points.geometry === current.geometry;
        const time = clock.elapsedTime;
        const { columns, rows, width, height } = gridRef.current;
        const fluid = fluidRef.current;

        // Simulation. uMorph: 0 = dot-matrix grid, 1 = logo; the logo is formed when the page moves to Work.
        morphRef.current = smoothstep(scrollProgress, 0, SCROLL_THRESHOLDS.HOME_TRANSITION);
        const u = current.variable.material.uniforms;
        u.uTime.value = time;
        u.uDelta.value = Math.min(delta * 60, 2);
        u.uMorph.value = morphRef.current;
        u.uGridColumns.value = columns;
        u.uGridRows.value = rows;
        u.uGridSize.value.set(width, height);
        // Fluid off on low tiers: a null sampler reads as black.
        u.tFluid.value = fluid ? fluid.velocity : null;
        u.uFluidStrength.value = fluid ? LOGO_PARTICLES.FLUID_STRENGTH : 0;
        // The fluid pushes in screen space; these map a particle to the screen and the push back into the logo's space.
        modelView.multiplyMatrices(camera.matrixWorldInverse, points.matrixWorld);
        u.uModelViewProjection.value.multiplyMatrices(camera.projectionMatrix, modelView);
        u.uScreenToLocal.value.setFromMatrix4(modelView).invert();
        current.gpu.compute();

        // Render. uIntro: the panel powers on over the reveal, in sync with the camera.
        if (startAnimations && introStart.current === null) {
            introStart.current = time;
        }
        const introT = introStart.current === null ? 0 : (time - introStart.current) / SCENE.CAMERA_DURATION;
        material.tPosition = current.gpu.getCurrentRenderTarget(current.variable).texture;
        material.uDpr = viewport.dpr;
        material.uIntro = entryEase(clamp(introT, 0, 1));
        material.uTime = time;
        material.uGridSize.set(width, height);
    });

    if (!sim || sim.error) {
        return null;
    }
    return (
        <points ref={pointsRef} geometry={sim.geometry} frustumCulled={false}>
            {/* key = drei's per-class id, so shader or config edits rebuild the material on hot reload */}
            <logoParticlesMaterial key={LogoParticlesMaterial.key} ref={materialRef} tMatcap={matcap} uColor={color} />
        </points>
    );
}
