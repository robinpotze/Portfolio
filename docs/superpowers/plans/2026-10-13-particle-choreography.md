# Particle Choreography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the home-page particle logo with the amended choreography:

- the page opens on a brand-colored dot-matrix panel that powers on at reveal;
- the panel assimilates into the logo on scroll while the "ROBIN POTZE" title rises away;
- the particles swirl away from the mouse through a small fluid simulation.

**Architecture:**

- `LogoParticles` (three's `GPUComputationRenderer`) already simulates particles toward the logo surface. This plan replaces the old cloud target with a second target: a dot-matrix grid.
- A scroll-driven `uMorph` blends between the grid and the logo.
- The render shader gains a power-on intro and a brand color.
- A small stable-fluids solver in `src/canvas/core/fluid/` pushes particles under the mouse.

**Tech Stack:** React 19, @react-three/fiber 9, @react-three/drei 10, three 0.186 (addons `GPUComputationRenderer`, `MeshSurfaceSampler`, `FullScreenQuad`), Vite 8 with `vite-plugin-glsl` 1.6, oxlint, oxfmt.

**Spec:** `docs/superpowers/specs/2026-10-09-gpgpu-logo-particles-design.md` (amended 2026-10-13).

**Supersedes:** Tasks 5–6 of `docs/superpowers/plans/2026-10-10-gpgpu-logo-particles.md`. Tasks 1–4 of that plan are done (718b399, 3a8f285, 7056c45, 0667633, 8e41366).

## Global Constraints

**Architecture and imports**

- Layers: `scenes → features → core`. Core never imports features or scenes, and a feature never imports another feature or a scene.
- Nothing in `src/canvas` imports `@routes/*`. Code outside a feature imports it only through the feature's `index.js`.
- Inside one feature folder, or inside `core/`, import siblings relatively (`./x`). Across layers use the `@canvas/...` alias. Add no new aliases.
- Import three addons as `three/addons/...`.
- Import order is alphabetical by module specifier, with relative imports last.

**Timing**

- All timing (delays, durations, easing, scroll ranges) comes from `src/config/animation.config.js` and `src/utils/easingFunctions.js`. Add **no** new timing values there.
- `logoParticles.config.js` holds physics and look constants only, never timing.

**Shaders**

- New shaders are imported **without** `?raw`, so that `vite-plugin-glsl` resolves `#include path;` lines.
- Never use three's `#include <chunk>` syntax in these shaders, because the plugin would try to resolve it as a file.
- Write new shaders in the GLSL ES 1 style that `ShaderMaterial` uses by default: `attribute`/`varying`, `texture2D`, `gl_FragColor`.

**GPU resources**

- The app runs in `<StrictMode>`. Create GPU resources (render targets, `GPUComputationRenderer`, `FluidSim`) inside `useEffect` with cleanup, never inside `useMemo`.
- Cheap CPU-side objects (a `ShaderMaterial`, a `Matrix4`, a `CanvasTexture`) may live in `useMemo`, with an effect that disposes them on unmount.
- `useFrame` callbacks use the default priority (no second argument).

**Git**

- Never run `git add -A`, `git add .` or `git commit -a`. Stage explicit paths only.
- Before staging, check `git status --short`. If any file outside your task's list shows up, leave it alone; the user may be editing it.
- Every commit message ends with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. That is the project's required attribution line, whichever model writes the code.

**Formatting and verification**

- Format with oxfmt (4-space indent, single quotes, print width 150). Run `npx oxfmt <changed .js/.jsx/.md files>` before committing; it ignores `.glsl`.
- The repo has no test runner, and this plan adds none. A task is verified when `npm run build` succeeds, `npm run lint` exits 0 with no output, `npm run fmt:check` prints "All matched files use the correct format.", and the task's grep checks pass.
- Browser checks are listed per task for the final manual review. The implementer does not run a browser.
- When a step gives a **whole file** in a `js`/`jsx`/`glsl` fence, replace the entire file with it (oxfmt may reflow the JS afterwards, which is fine). Snippets in `text` fences are partial edits: match them against the real file, indentation included.

## File Structure (end state)

```text
src/canvas/core/fluid/
  FluidSim.js, useFluidSim.js,
  shaders/base.vert.glsl, splat.frag.glsl, advect.frag.glsl, curl.frag.glsl, vorticity.frag.glsl,
          divergence.frag.glsl, clear.frag.glsl, pressure.frag.glsl, gradient.frag.glsl      NEW (Task 3)
src/canvas/features/logoParticles/
  logoParticles.config.js    grid layout + morph stagger (Task 1); fluid iterations/strength (Task 3)
  position.frag.glsl         grid ↔ logo morph (Task 1); fluid push (Task 3)
  particles.vert.glsl        power-on intro (Task 2)
  particles.frag.glsl        brand color, no video (Task 2)
  LogoParticles.jsx          grid targets + morph (Task 1); intro + brand color (Task 2); fluid (Task 3)
src/canvas/features/background/BackgroundMesh.jsx   loads its own video again (Task 2)
src/canvas/scenes/home/HomeScene.jsx                no shared video; title rise (Task 2)
COMPONENT_DOCUMENTATION.md, the spec                 Task 4
```

## Pre-flight

- [ ] Confirm the branch and a clean tree:

```bash
git branch --show-current
git status --short
```

Expected: `feat/gpgpu-particles`, and no output from `git status --short`.

- [ ] Confirm the baseline is green:

```bash
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`

---

### Task 1: Grid ↔ logo simulation

Replaces the cloud target with a dot-matrix grid. Particles start on the grid and assimilate into the logo as `scrollProgress` rises.

It also fixes a deferred review finding, which the controller has approved. When the tier changes, `<points>` could draw the previous tier's disposed geometry for one frame, which leaked a re-upload of about 7 MB. A one-line visibility guard now skips that frame.

**Files:**

- Modify (whole file): `src/canvas/features/logoParticles/logoParticles.config.js`
- Modify (whole file): `src/canvas/features/logoParticles/position.frag.glsl`
- Modify (whole file): `src/canvas/features/logoParticles/LogoParticles.jsx`

**Interfaces:**

- Consumes:
    - `SCROLL_THRESHOLDS.HOME_TRANSITION` from `@config/animation.config`;
    - `createMatcapTexture()` from `@canvas/core/textures/createMatcapTexture`.
- Produces:
    - `LOGO_PARTICLES` gains `GRID_COLUMNS` (160), `GRID_ROWS` (90), `GRID_WIDTH` (17), `GRID_Z` (-0.5) and `MORPH_STAGGER` (0.3), and loses `CLOUD_RADIUS`.
    - The simulation's uniforms now include `tGrid`, `uMorph` and `uMorphStagger`. `uDisperse` and `uCloudRadius` are gone.
    - `LogoParticles.jsx` exposes:
        - `buildTargets(geometry)`, which returns `{ origins, grids, randoms }`;
        - `createDataTexture(data, size)`;
        - `createSimulation(gl, size, halfFloat, targets, morph)`, which returns `{ gpu, variable, geometry, error, dispose() }`;
        - inside the component, a `pointsRef` on `<points>` and a `morphRef`.
    - For one task only, `LogoParticles` takes `{ video, scrollProgress }`. Task 2 changes that.

- [ ] **Step 1: Replace `src/canvas/features/logoParticles/logoParticles.config.js`**

```js
// Particle budget per quality tier: simulation texture size (particle count = size²).
export const TIERS = {
    low: { size: 128 },
    medium: { size: 256 },
    high: { size: 512 },
};

// Physics and look only — timing comes from @config/animation.config. Starting values, tuned by eye.
export const LOGO_PARTICLES = {
    // Dot-matrix panel in the logo's local space (the logo is about 6.8 × 4.4 units); 160 × 90 keeps 16:9 square cells.
    GRID_COLUMNS: 160,
    GRID_ROWS: 90,
    GRID_WIDTH: 17,
    GRID_Z: -0.5,
    MORPH_STAGGER: 0.3,
    SPRING: 0.06,
    CURL_SCALE: 0.35,
    CURL_SPEED: 0.08,
    CURL_STRENGTH: 0.015,
    POINT_SIZE: 30,
};
```

- [ ] **Step 2: Replace `src/canvas/features/logoParticles/position.frag.glsl`**

```glsl
// Logo particle simulation, run by GPUComputationRenderer (it declares texturePosition and defines resolution).
uniform sampler2D tOrigin;
uniform sampler2D tGrid;
uniform sampler2D tRandom;
uniform float uTime;
uniform float uDelta;
uniform float uMorph;
uniform float uMorphStagger;
uniform float uSpring;
uniform float uCurlScale;
uniform float uCurlSpeed;
uniform float uCurlStrength;

#include ../../core/shaders/curl.glsl;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 origin = texture2D(tOrigin, uv).xyz;
    vec3 grid = texture2D(tGrid, uv).xyz;
    vec4 random = texture2D(tRandom, uv);

    // Each particle lags by a random amount, so the panel dissolves instead of moving as one sheet.
    float morph = clamp((uMorph - random.w * uMorphStagger) / (1.0 - uMorphStagger), 0.0, 1.0);

    // Spring from the dot-matrix cell toward the logo surface as morph rises.
    vec3 goal = mix(grid, origin, morph);
    pos += (goal - pos) * uSpring * uDelta;

    // Curl swirl: barely there at rest (keeps the panel crisp), strongest halfway through the transition.
    pos += curlNoise(pos * uCurlScale + uTime * uCurlSpeed) * uCurlStrength * (0.02 + sin(3.14159265 * morph)) * uDelta;

    gl_FragColor = vec4(pos, 1.0);
}
```

- [ ] **Step 3: Replace `src/canvas/features/logoParticles/LogoParticles.jsx`**

The render half (the material, the video and the matcap) is unchanged for now. Task 2 replaces it.

```jsx
import { useQuality } from '@app/QualityContext';
import createMatcapTexture from '@canvas/core/textures/createMatcapTexture';
import { SCROLL_THRESHOLDS } from '@config/animation.config';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
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
        uTime: { value: 0 },
        uDelta: { value: 1 },
        uMorph: { value: morph },
        uMorphStagger: { value: LOGO_PARTICLES.MORPH_STAGGER },
        uSpring: { value: LOGO_PARTICLES.SPRING },
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
            gridTexture.dispose();
            randomTexture.dispose();
        },
    };
}

export default function LogoParticles({ video, scrollProgress }) {
    const gl = useThree((state) => state.gl);
    const { quality } = useQuality();
    const { nodes } = useGLTF('/assets/3d/Logo.glb');
    const targets = useMemo(() => buildTargets(nodes.Logo.geometry), [nodes]);
    const [sim, setSim] = useState(null);
    const simRef = useRef(null);
    const pointsRef = useRef(null);
    const morphRef = useRef(0);
    const matcap = useMemo(() => createMatcapTexture(), []);

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

        // uMorph: 0 = dot-matrix grid, 1 = logo. The logo is formed when the page moves to Work.
        morphRef.current = THREE.MathUtils.smoothstep(scrollProgress, 0, SCROLL_THRESHOLDS.HOME_TRANSITION);
        const u = current.variable.material.uniforms;
        u.uTime.value = state.clock.elapsedTime;
        u.uDelta.value = Math.min(delta * 60, 2);
        u.uMorph.value = morphRef.current;
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
    return <points ref={pointsRef} geometry={sim.geometry} material={material} frustumCulled={false} />;
}
```

`HomeScene.jsx` still passes `startAnimations` and `video`. The extra `startAnimations` prop is ignored for now, and Task 2 uses it again.

- [ ] **Step 4: Verify**

```bash
npx oxfmt src/canvas/features/logoParticles
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -rnE "uDisperse|CLOUD_RADIUS|uCloudRadius|disperseRef" src
grep -rnE "@canvas/features|@canvas/scenes" src/canvas/core src/canvas/features
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`, and both greps print nothing.

Browser check (final review):

- At the top of the page the particles form a flat 160 × 90 dot panel behind the logo's position.
- Scrolling down, the dots split and swirl into the logo, which is formed just before the page moves to Work.
- Scrolling back up returns the dots to the panel.

- [ ] **Step 5: Commit**

```bash
git add src/canvas/features/logoParticles/logoParticles.config.js src/canvas/features/logoParticles/position.frag.glsl src/canvas/features/logoParticles/LogoParticles.jsx
git status --short
git commit -m "feat(canvas): morph logo particles from a dot-matrix grid on scroll" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Power-on intro, brand color, title rise

The particles become brand-colored and stop sampling the video. The background video moves back into `BackgroundMesh`, because it is its only consumer again. The dot panel powers on diagonally during the reveal, and the "ROBIN POTZE" title rises out of frame on scroll.

**Files:**

- Modify (whole file): `src/canvas/features/logoParticles/particles.vert.glsl`
- Modify (whole file): `src/canvas/features/logoParticles/particles.frag.glsl`
- Modify (whole file): `src/canvas/features/logoParticles/LogoParticles.jsx`
- Restore: `src/canvas/features/background/BackgroundMesh.jsx` (to its `master` version)
- Modify: `src/canvas/scenes/home/HomeScene.jsx`

**Interfaces:**

- Consumes:
    - Task 1's `buildTargets`, `createDataTexture`, `createSimulation`, `pointsRef` and `morphRef`;
    - `REVEAL.DURATION`, `SCENE.CAMERA_DURATION` and `SCROLL_THRESHOLDS.HOME_TRANSITION`;
    - `entryEase`;
    - `getCSSColorRGBA` from `@utils/cssUtils`, which returns `{ r, g, b, a }` with r, g and b in 0–255.
- Produces:
    - `LogoParticles({ startAnimations, scrollProgress })` (no `video`).
    - Render uniforms: `tPosition`, `uPointSize`, `uDpr`, `uIntro`, `uGridSize`, `uColor`, `tMatcap`, `uTime`.
    - `BackgroundMesh({ paused })` loads its own video, exactly as on `master`.
    - `HomeScene` has no `video` and no `useVideoTexture`.

- [ ] **Step 1: Replace `src/canvas/features/logoParticles/particles.vert.glsl`**

```glsl
uniform sampler2D tPosition;
uniform float uPointSize;
uniform float uDpr;
uniform float uIntro;
uniform vec2 uGridSize;
attribute vec4 random;
varying vec4 vRandom;

void main() {
    // position.xy is this particle's texel UV in the simulation texture.
    vec3 pos = texture2D(tPosition, position.xy).xyz;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Power-on: dots grow in a diagonal sweep from the panel's top-left to its bottom-right.
    vec2 panel = clamp(pos.xy / uGridSize + 0.5, 0.0, 1.0);
    float delay = 0.25 * (panel.x + 1.0 - panel.y);
    float power = clamp((uIntro - delay) / 0.5, 0.0, 1.0);

    gl_PointSize = uPointSize * uDpr * mix(0.5, 1.5, random.x) * power / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    vRandom = random;
}
```

- [ ] **Step 2: Replace `src/canvas/features/logoParticles/particles.frag.glsl`**

```glsl
uniform sampler2D tMatcap;
uniform vec3 uColor;
uniform float uTime;
varying vec4 vRandom;

vec3 softLight(vec3 base, vec3 blend) {
    vec3 dark = 2.0 * base * blend + base * base * (1.0 - 2.0 * blend);
    vec3 light = sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend);
    return mix(dark, light, step(0.5, blend));
}

void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) {
        discard;
    }

    // Glossy highlight: the matcap, rotated per particle over time, over the brand color.
    float angle = uTime + vRandom.z * 6.2831853;
    vec2 matcapUv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * c + 0.5;
    vec3 color = softLight(uColor, texture2D(tMatcap, matcapUv).rgb);

    // A few particles sparkle above the bloom threshold.
    color *= 1.0 + pow(vRandom.y, 20.0) * 2.0;

    gl_FragColor = vec4(color, 1.0);
}
```

- [ ] **Step 3: Replace `src/canvas/features/logoParticles/LogoParticles.jsx`**

The module-level functions `buildTargets`, `createDataTexture` and `createSimulation` are identical to Task 1. Only the imports and the component change.

```jsx
import { useQuality } from '@app/QualityContext';
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
        uTime: { value: 0 },
        uDelta: { value: 1 },
        uMorph: { value: morph },
        uMorphStagger: { value: LOGO_PARTICLES.MORPH_STAGGER },
        uSpring: { value: LOGO_PARTICLES.SPRING },
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

    const { size } = TIERS[quality];
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
```

- [ ] **Step 4: Move the video back into `BackgroundMesh`**

```bash
git checkout master -- src/canvas/features/background/BackgroundMesh.jsx
```

This restores the `master` version, which calls `useVideoTexture` itself, sets the texture filters and takes `{ paused }`.

- [ ] **Step 5: Update `src/canvas/scenes/home/HomeScene.jsx`**

1. Delete the line `import useVideoTexture from '@canvas/core/textures/useVideoTexture';`.

2. Replace `import { BREAKPOINTS, FLOAT_CONFIG, REVEAL, SCENE } from '@config/animation.config';` with:

```text
import { BREAKPOINTS, FLOAT_CONFIG, REVEAL, SCENE, SCROLL_THRESHOLDS } from '@config/animation.config';
```

3. Directly above the line `export default function HomeScene(`, insert:

```text
// How far the "ROBIN POTZE" title rises by the end of the home scroll (background-group local units; that group is scaled ~5–8×).
const TITLE_RISE = 5;

```

4. Delete this whole block, including the blank line after it:

```text
    // One <video> shared by the background wall and the logo particles.
    const video = useVideoTexture('/assets/video/blackwall.mp4', {
        unsuspend: 'canplaythrough',
        start: true,
        crossOrigin: 'anonymous',
        muted: true,
        loop: true,
        playsInline: true,
    });
    if (video) {
        video.minFilter = THREE.LinearFilter;
        video.magFilter = THREE.LinearFilter;
        video.generateMipmaps = false;
        video.flipY = false;
    }

```

5. Directly after the line that defines `viewportScale` (`    const viewportScale = useMemo(...);`), insert:

```text

    // The title rises out of frame on the same curve the particles assimilate on, so only the logo is left.
    const titleRise = THREE.MathUtils.smoothstep(scrollProgress, 0, SCROLL_THRESHOLDS.HOME_TRANSITION) * TITLE_RISE;
```

6. Replace:

```text
                    <BackgroundMesh video={video} paused={scrollProgress > 0.4} />
                    <Text font="/assets/fonts/Orbitron/static/Orbitron-Medium.ttf" color="#EEE">
                        ROBIN POTZE
                    </Text>
```

with:

```text
                    <BackgroundMesh paused={scrollProgress > 0.4} />
                    <group position-y={titleRise}>
                        <Text font="/assets/fonts/Orbitron/static/Orbitron-Medium.ttf" color="#EEE">
                            ROBIN POTZE
                        </Text>
                    </group>
```

7. Replace:

```text
                    {canSimulate ? <LogoParticles video={video} startAnimations={startAnimations} scrollProgress={scrollProgress} /> : <LogoMesh />}
```

with:

```text
                    {canSimulate ? <LogoParticles startAnimations={startAnimations} scrollProgress={scrollProgress} /> : <LogoMesh />}
```

`HomeScene` still uses `THREE` (for `titleRise`), so keep `import * as THREE from 'three';`.

- [ ] **Step 6: Verify**

```bash
npx oxfmt src/canvas/features/logoParticles src/canvas/scenes/home/HomeScene.jsx src/canvas/features/background/BackgroundMesh.jsx
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -rnE "tVideo|uHasVideo|uResolution|video" src/canvas/features/logoParticles
grep -rn "useVideoTexture(" src
git diff master -- src/canvas/features/background/BackgroundMesh.jsx
```

Expected:

- `BUILD_OK`, no lint output, `All matched files use the correct format.`
- The first grep prints nothing.
- The second grep prints exactly two lines: the definition in `src/canvas/core/textures/useVideoTexture.js` and the call in `src/canvas/features/background/BackgroundMesh.jsx`.
- `git diff master` for `BackgroundMesh.jsx` prints nothing.

Browser check (final review):

- During the reveal the dot panel powers on in a diagonal sweep.
- The particles are brand cyan with a glossy highlight, and a few sparkle under bloom.
- Scrolling down, "ROBIN POTZE" rises out of frame while the dots assimilate, leaving only the logo.
- The background wall video still plays and pauses past 40% scroll.

- [ ] **Step 7: Commit**

```bash
git add src/canvas/features/logoParticles/particles.vert.glsl src/canvas/features/logoParticles/particles.frag.glsl src/canvas/features/logoParticles/LogoParticles.jsx src/canvas/features/background/BackgroundMesh.jsx src/canvas/scenes/home/HomeScene.jsx
git status --short
git commit -m "feat(canvas): brand-colored power-on particles and rising home title" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Mouse fluid

Adds a small screen-space fluid solver in `core/fluid` and wires its velocity into the particle simulation on medium and high tiers.

The solver follows Jos Stam's "stable fluids" method, in the form popularised by Pavel Dobryakov's WebGL-Fluid-Simulation (MIT). Each frame it:

1. adds a splat of pointer velocity;
2. adds vorticity confinement, which keeps swirls alive;
3. projects the field to divergence-free (divergence, then Jacobi pressure iterations, then gradient subtract);
4. advects the velocity by itself.

**Files:**

- Create: `src/canvas/core/fluid/shaders/base.vert.glsl`, `splat.frag.glsl`, `advect.frag.glsl`, `curl.frag.glsl`, `vorticity.frag.glsl`, `divergence.frag.glsl`, `clear.frag.glsl`, `pressure.frag.glsl`, `gradient.frag.glsl`
- Create: `src/canvas/core/fluid/FluidSim.js`
- Create: `src/canvas/core/fluid/useFluidSim.js`
- Modify (whole file): `src/canvas/features/logoParticles/logoParticles.config.js`
- Modify (whole file): `src/canvas/features/logoParticles/position.frag.glsl`
- Modify (whole file): `src/canvas/features/logoParticles/LogoParticles.jsx`

**Interfaces:**

- Consumes:
    - R3F `state.pointer` (`Vector2` in [-1, 1], updated from the existing `eventSource` on `#root`);
    - Task 2's `LogoParticles`.
- Produces:
    - `FluidSim` (default export of `@canvas/core/fluid/FluidSim`):
        - `new FluidSim(renderer, aspect, iterations)`;
        - `.splat(x, y, dx, dy)`, where x and y are in [0, 1] UV and dx and dy are the UV delta since the last frame;
        - `.step(dt)`;
        - `.velocity`, the current velocity `THREE.Texture`;
        - `.dispose()`.
    - `useFluidSim(iterations)` (default export of `@canvas/core/fluid/useFluidSim`) returns a React ref. `ref.current` is the `FluidSim`, or `null` when `iterations` is 0.
    - `TIERS` entries gain `fluidIterations` (0 = fluid off), and `LOGO_PARTICLES` gains `FLUID_STRENGTH`.

- [ ] **Step 1: Create the fluid shaders in `src/canvas/core/fluid/shaders/`**

`base.vert.glsl`:

```glsl
// Fullscreen pass (FullScreenQuad's triangle is already in clip space) with neighbour UVs for finite differences.
uniform vec2 texelSize;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main() {
    vUv = uv;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
```

`splat.frag.glsl`:

```glsl
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;
varying vec2 vUv;

void main() {
    vec2 p = vUv - point;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
}
```

`advect.frag.glsl`:

```glsl
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;
varying vec2 vUv;

void main() {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    gl_FragColor = vec4(dissipation * texture2D(uSource, coord).xy, 0.0, 1.0);
}
```

`curl.frag.glsl`:

```glsl
uniform sampler2D uVelocity;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main() {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}
```

`vorticity.frag.glsl`:

```glsl
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main() {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;

    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;

    vec2 velocity = texture2D(uVelocity, vUv).xy + force * dt;
    gl_FragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
}
```

`divergence.frag.glsl`:

```glsl
uniform sampler2D uVelocity;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main() {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    vec2 C = texture2D(uVelocity, vUv).xy;

    // Reflect at the screen edges so the fluid bounces instead of leaking out.
    if (vL.x < 0.0) {
        L = -C.x;
    }
    if (vR.x > 1.0) {
        R = -C.x;
    }
    if (vT.y > 1.0) {
        T = -C.y;
    }
    if (vB.y < 0.0) {
        B = -C.y;
    }

    gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}
```

`clear.frag.glsl`:

```glsl
uniform sampler2D uTexture;
uniform float value;
varying vec2 vUv;

void main() {
    gl_FragColor = value * texture2D(uTexture, vUv);
}
```

`pressure.frag.glsl`:

```glsl
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main() {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float divergence = texture2D(uDivergence, vUv).x;
    gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
}
```

`gradient.frag.glsl`:

```glsl
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;

void main() {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
}
```

- [ ] **Step 2: Create `src/canvas/core/fluid/FluidSim.js`**

```js
import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import advectFrag from './shaders/advect.frag.glsl';
import baseVert from './shaders/base.vert.glsl';
import clearFrag from './shaders/clear.frag.glsl';
import curlFrag from './shaders/curl.frag.glsl';
import divergenceFrag from './shaders/divergence.frag.glsl';
import gradientFrag from './shaders/gradient.frag.glsl';
import pressureFrag from './shaders/pressure.frag.glsl';
import splatFrag from './shaders/splat.frag.glsl';
import vorticityFrag from './shaders/vorticity.frag.glsl';

// Starting values from WebGL-Fluid-Simulation (Pavel Dobryakov, MIT); tune by eye.
const SIM_RESOLUTION = 128;
const VELOCITY_DISSIPATION = 0.97;
const PRESSURE_DISSIPATION = 0.8;
const CURL = 30;
const SPLAT_RADIUS = 0.0025;
const SPLAT_FORCE = 6000;

function createTarget(width, height) {
    return new THREE.WebGLRenderTarget(width, height, {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: false,
    });
}

function createDoubleTarget(width, height) {
    let read = createTarget(width, height);
    let write = createTarget(width, height);
    return {
        get read() {
            return read;
        },
        get write() {
            return write;
        },
        swap() {
            [read, write] = [write, read];
        },
        dispose() {
            read.dispose();
            write.dispose();
        },
    };
}

/** Screen-space stable-fluids velocity field (no dye), at SIM_RESOLUTION on the short screen side. */
export default class FluidSim {
    constructor(renderer, aspect, iterations) {
        this.renderer = renderer;
        this.aspect = aspect;
        this.iterations = iterations;

        const width = Math.round(aspect >= 1 ? SIM_RESOLUTION * aspect : SIM_RESOLUTION);
        const height = Math.round(aspect >= 1 ? SIM_RESOLUTION : SIM_RESOLUTION / aspect);
        const texelSize = new THREE.Vector2(1 / width, 1 / height);

        this.velocityTargets = createDoubleTarget(width, height);
        this.pressureTargets = createDoubleTarget(width, height);
        this.divergenceTarget = createTarget(width, height);
        this.curlTarget = createTarget(width, height);
        this.quad = new FullScreenQuad();

        const pass = (fragmentShader, uniforms) =>
            new THREE.ShaderMaterial({
                vertexShader: baseVert,
                fragmentShader,
                uniforms: { texelSize: { value: texelSize }, ...uniforms },
                depthTest: false,
                depthWrite: false,
            });

        this.materials = {
            splat: pass(splatFrag, {
                uTarget: { value: null },
                aspectRatio: { value: aspect },
                point: { value: new THREE.Vector2() },
                color: { value: new THREE.Vector3() },
                radius: { value: SPLAT_RADIUS * Math.max(aspect, 1) },
            }),
            advect: pass(advectFrag, {
                uVelocity: { value: null },
                uSource: { value: null },
                dt: { value: 0 },
                dissipation: { value: VELOCITY_DISSIPATION },
            }),
            curl: pass(curlFrag, { uVelocity: { value: null } }),
            vorticity: pass(vorticityFrag, {
                uVelocity: { value: null },
                uCurl: { value: null },
                curl: { value: CURL },
                dt: { value: 0 },
            }),
            divergence: pass(divergenceFrag, { uVelocity: { value: null } }),
            clear: pass(clearFrag, { uTexture: { value: null }, value: { value: PRESSURE_DISSIPATION } }),
            pressure: pass(pressureFrag, { uPressure: { value: null }, uDivergence: { value: null } }),
            gradient: pass(gradientFrag, { uPressure: { value: null }, uVelocity: { value: null } }),
        };
    }

    get velocity() {
        return this.velocityTargets.read.texture;
    }

    render(material, target) {
        this.quad.material = material;
        this.renderer.setRenderTarget(target);
        this.quad.render(this.renderer);
    }

    splat(x, y, dx, dy) {
        const previous = this.renderer.getRenderTarget();
        const u = this.materials.splat.uniforms;
        u.uTarget.value = this.velocityTargets.read.texture;
        u.point.value.set(x, y);
        u.color.value.set(dx * SPLAT_FORCE, dy * SPLAT_FORCE, 0);
        this.render(this.materials.splat, this.velocityTargets.write);
        this.velocityTargets.swap();
        this.renderer.setRenderTarget(previous);
    }

    step(dt) {
        const previous = this.renderer.getRenderTarget();
        const { velocityTargets: velocity, pressureTargets: pressure, materials: m } = this;

        m.curl.uniforms.uVelocity.value = velocity.read.texture;
        this.render(m.curl, this.curlTarget);

        m.vorticity.uniforms.uVelocity.value = velocity.read.texture;
        m.vorticity.uniforms.uCurl.value = this.curlTarget.texture;
        m.vorticity.uniforms.dt.value = dt;
        this.render(m.vorticity, velocity.write);
        velocity.swap();

        m.divergence.uniforms.uVelocity.value = velocity.read.texture;
        this.render(m.divergence, this.divergenceTarget);

        m.clear.uniforms.uTexture.value = pressure.read.texture;
        this.render(m.clear, pressure.write);
        pressure.swap();

        m.pressure.uniforms.uDivergence.value = this.divergenceTarget.texture;
        for (let i = 0; i < this.iterations; i++) {
            m.pressure.uniforms.uPressure.value = pressure.read.texture;
            this.render(m.pressure, pressure.write);
            pressure.swap();
        }

        m.gradient.uniforms.uPressure.value = pressure.read.texture;
        m.gradient.uniforms.uVelocity.value = velocity.read.texture;
        this.render(m.gradient, velocity.write);
        velocity.swap();

        m.advect.uniforms.uVelocity.value = velocity.read.texture;
        m.advect.uniforms.uSource.value = velocity.read.texture;
        m.advect.uniforms.dt.value = dt;
        this.render(m.advect, velocity.write);
        velocity.swap();

        this.renderer.setRenderTarget(previous);
    }

    dispose() {
        this.velocityTargets.dispose();
        this.pressureTargets.dispose();
        this.divergenceTarget.dispose();
        this.curlTarget.dispose();
        Object.values(this.materials).forEach((material) => material.dispose());
        this.quad.dispose();
    }
}
```

- [ ] **Step 3: Create `src/canvas/core/fluid/useFluidSim.js`**

```js
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import FluidSim from './FluidSim';

/**
 * Screen-space fluid driven by pointer movement. Returns a ref whose .current is the FluidSim,
 * or null when iterations is 0. Read .current.velocity every frame: the buffer swaps each step.
 */
export default function useFluidSim(iterations) {
    const gl = useThree((state) => state.gl);
    const size = useThree((state) => state.size);
    const fluidRef = useRef(null);
    const lastPointer = useRef(null);

    useEffect(() => {
        if (!iterations) {
            return;
        }
        const fluid = new FluidSim(gl, size.width / size.height, iterations);
        fluidRef.current = fluid;
        return () => {
            fluidRef.current = null;
            fluid.dispose();
        };
    }, [gl, size.width, size.height, iterations]);

    useFrame((state, delta) => {
        const fluid = fluidRef.current;
        const pointer = state.pointer;
        if (fluid && lastPointer.current) {
            // Pointer is in [-1, 1]; the fluid works in [0, 1] UV space.
            const dx = (pointer.x - lastPointer.current.x) / 2;
            const dy = (pointer.y - lastPointer.current.y) / 2;
            if (dx !== 0 || dy !== 0) {
                fluid.splat((pointer.x + 1) / 2, (pointer.y + 1) / 2, dx, dy);
            }
        }
        if (fluid) {
            fluid.step(Math.min(delta, 1 / 60));
        }
        lastPointer.current = (lastPointer.current ?? pointer.clone()).copy(pointer);
    });

    return fluidRef;
}
```

- [ ] **Step 4: Replace `src/canvas/features/logoParticles/logoParticles.config.js`**

```js
// Particle budget per quality tier: simulation texture size (particle count = size²) and fluid pressure iterations (0 = fluid off).
export const TIERS = {
    low: { size: 128, fluidIterations: 0 },
    medium: { size: 256, fluidIterations: 10 },
    high: { size: 512, fluidIterations: 20 },
};

// Physics and look only — timing comes from @config/animation.config. Starting values, tuned by eye.
export const LOGO_PARTICLES = {
    // Dot-matrix panel in the logo's local space (the logo is about 6.8 × 4.4 units); 160 × 90 keeps 16:9 square cells.
    GRID_COLUMNS: 160,
    GRID_ROWS: 90,
    GRID_WIDTH: 17,
    GRID_Z: -0.5,
    MORPH_STAGGER: 0.3,
    SPRING: 0.06,
    CURL_SCALE: 0.35,
    CURL_SPEED: 0.08,
    CURL_STRENGTH: 0.015,
    POINT_SIZE: 30,
    FLUID_STRENGTH: 0.0002,
};
```

- [ ] **Step 5: Replace `src/canvas/features/logoParticles/position.frag.glsl`**

```glsl
// Logo particle simulation, run by GPUComputationRenderer (it declares texturePosition and defines resolution).
uniform sampler2D tOrigin;
uniform sampler2D tGrid;
uniform sampler2D tRandom;
uniform sampler2D tFluid;
uniform float uTime;
uniform float uDelta;
uniform float uMorph;
uniform float uMorphStagger;
uniform float uSpring;
uniform float uCurlScale;
uniform float uCurlSpeed;
uniform float uCurlStrength;
uniform float uFluidStrength;
uniform mat4 uModelViewProjection;
uniform mat3 uScreenToLocal;

#include ../../core/shaders/curl.glsl;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 origin = texture2D(tOrigin, uv).xyz;
    vec3 grid = texture2D(tGrid, uv).xyz;
    vec4 random = texture2D(tRandom, uv);

    // Each particle lags by a random amount, so the panel dissolves instead of moving as one sheet.
    float morph = clamp((uMorph - random.w * uMorphStagger) / (1.0 - uMorphStagger), 0.0, 1.0);

    // Spring from the dot-matrix cell toward the logo surface as morph rises.
    vec3 goal = mix(grid, origin, morph);
    pos += (goal - pos) * uSpring * uDelta;

    // Curl swirl: barely there at rest (keeps the panel crisp), strongest halfway through the transition.
    pos += curlNoise(pos * uCurlScale + uTime * uCurlSpeed) * uCurlStrength * (0.02 + sin(3.14159265 * morph)) * uDelta;

    // Push by the fluid velocity under the particle on screen, mapped back into the logo's local space.
    vec4 clip = uModelViewProjection * vec4(pos, 1.0);
    vec2 screenUv = clip.xy / clip.w * 0.5 + 0.5;
    vec2 flow = texture2D(tFluid, screenUv).xy;
    pos += uScreenToLocal * vec3(flow, 0.0) * uFluidStrength * uDelta;

    gl_FragColor = vec4(pos, 1.0);
}
```

- [ ] **Step 6: Replace `src/canvas/features/logoParticles/LogoParticles.jsx`**

Compared with Task 2, this version:

- imports `useFluidSim`;
- adds four uniforms in `createSimulation`;
- reads `fluidIterations` and creates a `modelView` matrix in the component;
- sets the fluid uniforms in `useFrame`.

```jsx
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
```

- [ ] **Step 7: Verify**

```bash
npx oxfmt src/canvas/core/fluid src/canvas/features/logoParticles
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -rnE "@canvas/features|@canvas/scenes" src/canvas/core src/canvas/features
grep -rn "?raw" src/canvas/core/fluid src/canvas/features/logoParticles
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`, and both greps print nothing.

Browser check (final review):

- On high or medium, moving the mouse across the panel or the logo swirls particles away along the motion, and they spring back once the mouse stops.
- On low (DevTools CPU throttling until quality drops), there is no fluid reaction and the particles are still smooth.
- No WebGL errors in the console, including on tier changes and window resizes.

- [ ] **Step 8: Commit**

```bash
git add src/canvas/core/fluid src/canvas/features/logoParticles
git status --short
git commit -m "feat(canvas): swirl logo particles with a mouse-driven fluid sim" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Documentation, spec sync and final checks

**Files:**

- Modify: `COMPONENT_DOCUMENTATION.md`
- Modify: `docs/superpowers/specs/2026-10-09-gpgpu-logo-particles-design.md`

**Interfaces:**

- Consumes: the final code from Tasks 1–3.
- Produces: nothing new in code.

- [ ] **Step 1: Update `COMPONENT_DOCUMENTATION.md`**

Make these edits. Table cells can be edited with any spacing, because Step 3 realigns them.

1. **Section 6.0:** in the bullet that starts `- **`core/`**:`, replace `(`CanvasRoot`, quality, animation and texture hooks, camera `Rig`)` with `(`CanvasRoot`, quality, animation and texture hooks, camera `Rig`, the fluid simulation, shared shader chunks)`.

2. **`HomeScene` section:**
    - Replace the bullet ``- `entryComplete` flag gates expensive effects (Float, AO) until the ~1.5s opening animation settles.`` with these three bullets:

```text
- Renders `LogoParticles` when float or half-float render targets are supported, otherwise the metallic `LogoMesh`.
- Eases the logo group's rotation toward the pointer.
- Raises the "ROBIN POTZE" title out of frame on scroll (`TITLE_RISE`), on the same curve the particles assimilate on.
```

    - In its table row:
        - set Hooks to `` `useRef`, `useEffect`, `useMemo`, `useFrame`, `useThree`, **`useObjectAnimation`**, **`useCameraAnimation`** ``;
        - set Config to `` `FLOAT_CONFIG`, `REVEAL`, `SCENE`, `SCROLL_THRESHOLDS`, `BREAKPOINTS` ``;
        - set Children to `` `Rig`, `BackgroundMesh`, `LogoParticles` / `LogoMesh`, `LaserPlane`, `EffectComposer` ``.

3. **Add a `LogoParticles` section** directly before the `---` that ends the `LaserPlane` section:

```text
---

#### `LogoParticles`

> **`src/canvas/features/logoParticles/LogoParticles.jsx`** — GPU-simulated particle logo

Simulates particles with `GPUComputationRenderer` between two targets: a 160 × 90 dot-matrix panel and points on the `Logo.glb` surface (`MeshSurfaceSampler`). Scroll drives `uMorph` (0 = panel, 1 = logo, formed at `SCROLL_THRESHOLDS.HOME_TRANSITION`), with a random per-particle lag and a curl-noise swirl mid-transition. The panel powers on diagonally during the reveal (`REVEAL.DURATION` delay, `SCENE.CAMERA_DURATION` length). Medium/high tiers add a mouse fluid push (`useFluidSim`). Points are brand-colored (`--c-brnd_100`) with a matcap soft-light highlight and a few sparkles for bloom.

- Props: `startAnimations`, `scrollProgress`.
- Particle budget per tier from `TIERS`: 16k (low, half-float, no fluid), 65k (medium), 262k (high).

| Hooks | Context | Config | Children |
| --- | --- | --- | --- |
| `useState`, `useRef`, `useMemo`, `useEffect`, `useFrame`, `useThree`, `useGLTF`, **`useFluidSim`** | **`useQuality`** | `TIERS`, `LOGO_PARTICLES`, `REVEAL`, `SCENE`, `SCROLL_THRESHOLDS` | `points` |
```

4. **`LogoMesh` section:**
    - Replace the summary line `— Refractive logo with FBO` with `— Metallic matcap logo (fallback)`.
    - Replace the paragraph starting `3D logo mesh with glass/refraction material.` with ``Fallback logo for devices without float render targets. Renders the logo geometry with `meshMatcapMaterial` and the procedural matcap from `createMatcapTexture`. `React.memo`-wrapped.``
    - In its table row, set Hooks to `` `useMemo`, `useEffect`, `memo`, `useGLTF` ``, Context to `—` and Config to `—`.

5. **Section 7 table:** delete the `GlassLogoMaterial` row.

6. **"Custom Hook → Consumer Map":** set the `useNoiseTexture` consumers to `` `WorkCard` `` and add a row ``| `useFluidSim` | `LogoParticles` |``.

7. **"Context Consumer Map":** in the `useQuality` row, replace `` `LogoMesh` `` with `` `LogoParticles` ``.

8. **"Config File → Consumer Map":** add a row ``| `canvas/features/logoParticles/logoParticles.config.js` | `TIERS`, `LOGO_PARTICLES` | `LogoParticles` |``.

The `BackgroundMesh` section needs no change, because `BackgroundMesh` is back to its documented behavior.

- [ ] **Step 2: Sync the spec with what was built**

In `docs/superpowers/specs/2026-10-09-gpgpu-logo-particles-design.md`:

1. In "Simulation", in the formula line that starts `pos  += curlNoise(`, replace `(0.1 + sin(π · morph))` with `(0.02 + sin(π · morph))`. Then replace the sentence `The curl swirl is faint on the finished grid and on the finished logo, and peaks halfway through the transition.` with `The curl swirl is barely there on the finished grid and logo (0.02, so the panel stays crisp), and peaks halfway through the transition.`
2. In "Implementation status", replace the line `- one shared video texture owned by `HomeScene` (3a8f285);` with `- one shared video texture owned by `HomeScene`(3a8f285). This was reverted once the particles became brand-colored:`BackgroundMesh` loads its own video again;`.
3. In "Files" → "Changed":
    - replace the bullet ` - owns the video texture for`BackgroundMesh` (built);` with `  - no longer owns a video texture (the shared-video step was reverted);`;
    - replace the line ``- `src/canvas/features/background/BackgroundMesh.jsx`: takes a `video` prop (built).`` with ``- `src/canvas/features/background/BackgroundMesh.jsx`: unchanged from `master` (loads its own video).``
4. In "Component interfaces", replace ``- `BackgroundMesh({ video, paused })`.`` with ``- `BackgroundMesh({ paused })` (unchanged).``

- [ ] **Step 3: Format and verify**

```bash
npx oxfmt COMPONENT_DOCUMENTATION.md docs/superpowers/specs/2026-10-09-gpgpu-logo-particles-design.md
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -nE "GlassLogoMaterial|Refractive logo|entryComplete" COMPONENT_DOCUMENTATION.md
grep -rnE "GlassLogoMaterial|glass\.(vert|frag)|ENTRY_COMPLETE_MS|useFBO|uDisperse|CLOUD_RADIUS" src
grep -rnE "@canvas/features|@canvas/scenes" src/canvas/core src/canvas/features
grep -rn "@routes/" src/canvas
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`, and all four greps print nothing.

- [ ] **Step 4: Commit**

```bash
git add COMPONENT_DOCUMENTATION.md docs/superpowers/specs/2026-10-09-gpgpu-logo-particles-design.md
git status --short
git commit -m "docs: document logo particle choreography and fluid sim" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git log --oneline master..HEAD
```

- [ ] **Step 5: Manual browser review (hand to the user)**

Run `npm run dev`, open `http://localhost:3000` and go through the browser checks from Tasks 1–3:

- panel power-on;
- brand color, highlight and sparkle;
- assimilation into the logo with the title rising away, and the reverse on scroll up;
- mouse swirl on high/medium and none on low;
- metallic fallback;
- no console or WebGL errors when the tier changes or the window is resized;
- about 60 fps on high.

Tune the `LOGO_PARTICLES` values, `TITLE_RISE` and the `FluidSim` constants by eye, as a follow-up commit.
