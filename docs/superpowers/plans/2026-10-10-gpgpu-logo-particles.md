# GPGPU Logo Particles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page's glass logo with a GPU-simulated particle logo. The particles assemble on reveal, scatter on scroll, take their color from the background video, and swirl away from the mouse through a small fluid simulation. A cheap metallic logo is the fallback.

**Architecture:**

- three's `GPUComputationRenderer` runs the particle simulation (ping-pong float textures), and `MeshSurfaceSampler` picks points on the logo surface.
- A `THREE.Points` draw reads the positions from the simulation texture.
- A small stable-fluids solver in `src/canvas/core/fluid/` turns pointer movement into a velocity texture that pushes the particles.
- Shared GLSL comes in through `vite-plugin-glsl`'s `#include`.

**Tech Stack:** React 19, @react-three/fiber 9, @react-three/drei 10, three 0.186 (addons: `GPUComputationRenderer`, `MeshSurfaceSampler`, `FullScreenQuad`), Vite 8 with `vite-plugin-glsl` 1.6, oxlint, oxfmt.

**Spec:** `docs/superpowers/specs/2026-10-09-gpgpu-logo-particles-design.md`

## Global Constraints

**Architecture and imports**

- Layers: `scenes → features → core`. Core never imports features or scenes, and a feature never imports another feature or a scene.
- Nothing in `src/canvas` imports `@routes/*`. Code outside a feature imports it only through the feature's `index.js`.
- Inside one feature folder, or inside `core/`, import siblings relatively (`./x`). Across layers use the `@canvas/...` alias. Add no new aliases.
- Import three addons as `three/addons/...` (for example `three/addons/misc/GPUComputationRenderer.js`).
- Import order is alphabetical by module specifier, with relative imports last.

**Timing**

- All timing (delays, durations, easing, scroll ranges) comes from `src/config/animation.config.js` and `src/utils/easingFunctions.js`. Add **no** new timing values there.
- `logoParticles.config.js` holds physics and look constants only, never timing.

**Shaders**

- New shaders are imported **without** `?raw`, so that `vite-plugin-glsl` resolves `#include path;` lines.
- Never use three's `#include <chunk>` syntax in these shaders, because the plugin would try to resolve it as a file.
- Write new shaders in the GLSL ES 1 style that `ShaderMaterial` uses by default: `attribute`/`varying`, `texture2D`, `gl_FragColor`.
- Shader files are named `<name>.vert.glsl` / `<name>.frag.glsl`, and a single-file chunk is `<name>.glsl`.

**GPU resources**

- The app runs in `<StrictMode>`. Create GPU resources (render targets, `GPUComputationRenderer`, `FluidSim`) inside `useEffect` with cleanup, never inside `useMemo`.
- Cheap CPU-side objects (a `ShaderMaterial`, a `Matrix4`, a `CanvasTexture`) may live in `useMemo`, with an effect that disposes them on unmount.
- `useFrame` callbacks use the default priority (no second argument), so they run before `EffectComposer` renders.

**Git**

- Never run `git add -A`, `git add .` or `git commit -a`. Stage explicit paths only.
- `src/canvas/features/transition/transition.frag.glsl` has uncommitted user edits. Never stage, commit, stash or restore it.
- Every commit message ends with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. That is the project's required attribution line, whichever model writes the code.

**Formatting and verification**

- Format with oxfmt (4-space indent, single quotes, print width 150). Run `npx oxfmt <changed .js/.jsx/.md files>` before committing; it ignores `.glsl`.
- The repo has no test runner, and this plan adds none. A task is verified when `npm run build` succeeds, `npm run lint` exits 0 with no output, `npm run fmt:check` prints "All matched files use the correct format.", and the task's grep checks pass.
- Browser checks are listed per task for the final manual review. The implementer does not run a browser.

**Changes this plan makes to the spec** (Task 6 records them in the spec):

- `gl.capabilities.isWebGL2` is always `true` in three 0.186, so the float-support check drops it.
- When the fluid is off, `tFluid` is `null` instead of a 1×1 black texture. three binds a black empty texture for a `null` sampler, so the result is the same.
- `useFluidSim(iterations)` returns a ref whose `.current` is the `FluidSim`, or `null` when `iterations` is 0. Callers read `.current.velocity` every frame, because the velocity buffer swaps on every step.

## File Structure (end state)

```text
src/canvas/core/
  fluid/
    FluidSim.js                 stable-fluids solver: velocity/pressure ping-pong, 7 pass materials
    useFluidSim.js              pointer → splats, steps FluidSim each frame; returns ref
    shaders/base.vert.glsl      fullscreen pass vertex shader with neighbour UVs
    shaders/splat.frag.glsl, advect.frag.glsl, curl.frag.glsl, vorticity.frag.glsl,
            divergence.frag.glsl, clear.frag.glsl, pressure.frag.glsl, gradient.frag.glsl
  shaders/curl.glsl             simplex noise + curl noise chunk
  textures/createMatcapTexture.js   procedural metallic matcap
src/canvas/features/
  logo/LogoMesh.jsx             rewritten: matcap fallback (GlassLogoMaterial.js, glass.*.glsl deleted)
  logoParticles/
    index.js, LogoParticles.jsx, logoParticles.config.js,
    position.frag.glsl, particles.vert.glsl, particles.frag.glsl
  background/BackgroundMesh.jsx takes `video` prop
src/canvas/scenes/home/HomeScene.jsx   owns video texture, pointer tilt, float check, LogoParticles | LogoMesh
src/config/animation.config.js        TIMEOUT.ENTRY_COMPLETE_MS removed (last user deleted in Task 1)
COMPONENT_DOCUMENTATION.md, the spec   updated in Task 6
```

## Pre-flight

- [ ] Confirm the branch and working tree:

```bash
git branch --show-current
git status --short
```

Expected: `feat/gpgpu-particles`, then exactly ` M src/canvas/features/transition/transition.frag.glsl`.

- [ ] Confirm the baseline is green:

```bash
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`

---

### Task 1: Metallic fallback logo, pointer tilt in the scene

Replaces the expensive glass logo with a matcap-shaded one. The glass logo re-rendered the whole scene into an offscreen target every frame. Its pointer tilt moves up to the logo group in `HomeScene`, so the particle logo inherits it later.

**Files:**

- Create: `src/canvas/core/textures/createMatcapTexture.js`
- Rewrite: `src/canvas/features/logo/LogoMesh.jsx`
- Delete: `src/canvas/features/logo/GlassLogoMaterial.js`, `src/canvas/features/logo/glass.vert.glsl`, `src/canvas/features/logo/glass.frag.glsl`
- Modify: `src/canvas/scenes/home/HomeScene.jsx`
- Modify: `src/config/animation.config.js` (remove `ENTRY_COMPLETE_MS`)

**Interfaces:**

- Consumes: nothing new.
- Produces:
    - `@canvas/core/textures/createMatcapTexture`: default export `createMatcapTexture()`, which returns a `THREE.CanvasTexture` (256×256, `SRGBColorSpace`). The caller owns it and disposes it.
    - `LogoMesh` (via `@canvas/features/logo`) now takes **no props**.
    - In `HomeScene`, `logoRef` (the scroll-animated logo group) now also eases its `rotation.x/y` toward the pointer every frame.

- [ ] **Step 1: Create `src/canvas/core/textures/createMatcapTexture.js`**

```js
import * as THREE from 'three';

const SIZE = 256;

/** Procedural metallic matcap: dark rim, steel mid-tones, soft highlight upper-left. */
export default function createMatcapTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d');
    const r = SIZE / 2;

    const body = ctx.createRadialGradient(r, r, 0, r, r, r);
    body.addColorStop(0, '#a4a9af');
    body.addColorStop(0.65, '#4b5057');
    body.addColorStop(1, '#0c0d0f');
    ctx.fillStyle = body;
    ctx.fillRect(0, 0, SIZE, SIZE);

    const highlight = ctx.createRadialGradient(r * 0.7, r * 0.6, 0, r * 0.7, r * 0.6, r * 0.55);
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = highlight;
    ctx.fillRect(0, 0, SIZE, SIZE);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}
```

- [ ] **Step 2: Replace the whole of `src/canvas/features/logo/LogoMesh.jsx`**

```jsx
import createMatcapTexture from '@canvas/core/textures/createMatcapTexture';
import { useGLTF } from '@react-three/drei';
import { memo, useEffect, useMemo } from 'react';

// Fallback logo for devices that cannot render to float textures (chosen in HomeScene).
function LogoMesh() {
    const { nodes } = useGLTF('/assets/3d/Logo.glb');
    const matcap = useMemo(() => createMatcapTexture(), []);

    useEffect(() => () => matcap.dispose(), [matcap]);

    return (
        <mesh geometry={nodes.Logo.geometry}>
            <meshMatcapMaterial matcap={matcap} />
        </mesh>
    );
}

export default memo(LogoMesh);
```

`src/canvas/features/logo/index.js` stays as it is (`export { default as LogoMesh } from './LogoMesh';`).

- [ ] **Step 3: Delete the glass material and its shaders**

```bash
git rm src/canvas/features/logo/GlassLogoMaterial.js src/canvas/features/logo/glass.vert.glsl src/canvas/features/logo/glass.frag.glsl
```

- [ ] **Step 4: Update the imports in `src/canvas/scenes/home/HomeScene.jsx`**

Replace these three lines:

```text
import { BREAKPOINTS, FLOAT_CONFIG, REVEAL, SCENE, TIMEOUT } from '@config/animation.config';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
```

with (the `@react-three/drei` and `@react-three/postprocessing` lines between them stay where they are):

```text
import { BREAKPOINTS, FLOAT_CONFIG, REVEAL, SCENE } from '@config/animation.config';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
```

- [ ] **Step 5: Remove the dead `entryComplete` state from `HomeScene.jsx`**

Delete this line:

```text
    const [entryComplete, setEntryComplete] = useState(false);
```

Delete this whole effect, including the blank line after it:

```text
    useEffect(() => {
        if (!startAnimations) {
            return;
        }
        const timer = setTimeout(() => {
            setEntryComplete(true);
        }, TIMEOUT.ENTRY_COMPLETE_MS);
        return () => clearTimeout(timer);
    }, [startAnimations]);

```

- [ ] **Step 6: Add the pointer tilt in `HomeScene.jsx`**

Directly after the line `    useCameraAnimation(cameraRef, 'home', cameraAnimConfig);`, insert:

```text

    // Ease the logo group toward the pointer (moved here from the old glass LogoMesh)
    useFrame((state, delta) => {
        const logo = logoRef.current;
        if (!logo) {
            return;
        }
        const smoothing = Math.min(1, 1 - Math.pow(0.001, delta));
        logo.rotation.y += (state.pointer.x * Math.PI * 0.1 - logo.rotation.y) * smoothing;
        logo.rotation.x += (-state.pointer.y * Math.PI * 0.1 - logo.rotation.x) * smoothing;
    });
```

`useObjectAnimation` only sets this group's position and scale, so rotation is free to use.

- [ ] **Step 7: Update the logo element in `HomeScene.jsx`**

Replace:

```text
                    <LogoMesh enableFBO={entryComplete && quality !== 'low'} />
```

with:

```text
                    <LogoMesh />
```

`quality` is still used by `postProcessingSettings`, so keep `useQuality`.

- [ ] **Step 8: Remove the now-unused timing token**

In `src/config/animation.config.js`, delete the line:

```text
    ENTRY_COMPLETE_MS: 800,
```

Check that nothing else used it: `grep -rn "ENTRY_COMPLETE_MS" src` must print nothing.

- [ ] **Step 9: Verify**

```bash
npx oxfmt src/canvas/core/textures/createMatcapTexture.js src/canvas/features/logo/LogoMesh.jsx src/canvas/scenes/home/HomeScene.jsx src/config/animation.config.js
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -rnE "GlassLogoMaterial|glass\.(vert|frag)|enableFBO|entryComplete|ENTRY_COMPLETE_MS|useFBO" src
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`, and the grep prints nothing.

Browser check (final review): the home logo is metallic (dark rim, bright upper-left highlight), tilts toward the pointer, still floats and still scrolls back and scales up as before.

- [ ] **Step 10: Commit**

```bash
git add src/canvas/core/textures/createMatcapTexture.js src/canvas/features/logo/LogoMesh.jsx src/canvas/scenes/home/HomeScene.jsx src/config/animation.config.js
git status --short
git commit -m "feat(canvas): replace glass logo with metallic matcap logo" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Before committing, `git status --short` must show the three deletions staged (`D `), the four files above staged, and ` M src/canvas/features/transition/transition.frag.glsl` unstaged.

---

### Task 2: One shared video texture

`HomeScene` creates the `blackwall.mp4` texture once and hands it to `BackgroundMesh`, and later to the particles. That leaves one `<video>` element and one decode.

**Files:**

- Modify: `src/canvas/scenes/home/HomeScene.jsx`
- Modify: `src/canvas/features/background/BackgroundMesh.jsx`

**Interfaces:**

- Consumes: `@canvas/core/textures/useVideoTexture` (existing): `useVideoTexture(src, options)` returns a `THREE.VideoTexture`, or `null` until the video is ready.
- Produces:
    - In `HomeScene`, a local `video` (`THREE.VideoTexture | null`) with `minFilter = magFilter = LinearFilter`, `generateMipmaps = false` and `flipY = false`.
    - `BackgroundMesh({ video, paused })`. Its pause/play effect and fallback mesh are unchanged.

`flipY = false` matches what `BackgroundMesh` already forced through its `map-flipY={false}` prop. Setting it where the texture is created keeps its orientation fixed for every consumer, from the first frame on.

- [ ] **Step 1: Add the imports in `HomeScene.jsx`**

Insert `import useVideoTexture from '@canvas/core/textures/useVideoTexture';` directly after `import Rig from '@canvas/core/camera/Rig';`.

Insert `import * as THREE from 'three';` directly after `import { useEffect, useMemo, useRef } from 'react';`.

- [ ] **Step 2: Create the shared texture in `HomeScene.jsx`**

Directly after the line `    const { size } = useThree();`, insert:

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

- [ ] **Step 3: Pass the texture to `BackgroundMesh` in `HomeScene.jsx`**

Replace:

```text
                    <BackgroundMesh paused={scrollProgress > 0.4} />
```

with:

```text
                    <BackgroundMesh video={video} paused={scrollProgress > 0.4} />
```

- [ ] **Step 4: Make `BackgroundMesh.jsx` use the prop**

Delete the line `import useVideoTexture from '@canvas/core/textures/useVideoTexture';`.

Replace:

```text
function BackgroundMeshInner({ paused = false, ...props }) {
    const video = useVideoTexture('/assets/video/blackwall.mp4', {
        unsuspend: 'canplaythrough',
        start: true,
        crossOrigin: 'anonymous',
        muted: true,
        loop: true,
        playsInline: true,
    });

    const { nodes } = useGLTF('/assets/3d/Wall.glb');

    // Set video texture to update less frequently for performance
    if (video) {
        video.minFilter = THREE.LinearFilter;
        video.magFilter = THREE.LinearFilter;
        video.generateMipmaps = false;
    }

```

with:

```text
function BackgroundMeshInner({ video, paused = false, ...props }) {
    const { nodes } = useGLTF('/assets/3d/Wall.glb');

```

The filter block was the only use of `THREE` in `BackgroundMesh.jsx`, so also delete the line `import * as THREE from 'three';`.

- [ ] **Step 5: Verify**

```bash
npx oxfmt src/canvas/scenes/home/HomeScene.jsx src/canvas/features/background/BackgroundMesh.jsx
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -rn "useVideoTexture(" src
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.` The grep prints exactly two lines: the definition in `src/canvas/core/textures/useVideoTexture.js` and the call in `src/canvas/scenes/home/HomeScene.jsx`.

Browser check (final review): the background wall video plays upright as before, and pauses once you scroll past 40%. The Network panel shows `blackwall.mp4` requested once.

- [ ] **Step 6: Commit**

```bash
git add src/canvas/scenes/home/HomeScene.jsx src/canvas/features/background/BackgroundMesh.jsx
git status --short
git commit -m "refactor(canvas): share one video texture in HomeScene" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

`transition.frag.glsl` must stay unstaged (` M`).

---

### Task 3: Particle simulation and the scene switch

Adds the curl-noise chunk, the `logoParticles` feature (simulation plus a flat-colored point render) and the float-support switch in `HomeScene`. After this task the logo is made of particles that assemble on reveal and scatter on scroll. Color and the mouse come in later tasks.

**Files:**

- Create: `src/canvas/core/shaders/curl.glsl`
- Create: `src/canvas/features/logoParticles/logoParticles.config.js`
- Create: `src/canvas/features/logoParticles/position.frag.glsl`
- Create: `src/canvas/features/logoParticles/particles.vert.glsl`
- Create: `src/canvas/features/logoParticles/particles.frag.glsl`
- Create: `src/canvas/features/logoParticles/LogoParticles.jsx`
- Create: `src/canvas/features/logoParticles/index.js`
- Modify: `src/canvas/scenes/home/HomeScene.jsx`

**Interfaces:**

- Consumes:
    - `useQuality()` returns `{ quality }`, with `quality` one of `'low' | 'medium' | 'high'`.
    - `REVEAL.DURATION`, `SCENE.CAMERA_DURATION` and `SCROLL_THRESHOLDS.HOME_TRANSITION` from `@config/animation.config`.
    - `entryEase(t)` from `@utils/easingFunctions`.
- Produces:
    - `@canvas/features/logoParticles` exports `LogoParticles({ startAnimations, scrollProgress })`. Task 4 adds a `video` prop.
    - `logoParticles.config.js` exports `TIERS` (`{ low: { size: 128 }, medium: { size: 256 }, high: { size: 512 } }`) and `LOGO_PARTICLES` (physics and look constants).
    - `core/shaders/curl.glsl` defines `float snoise(vec3)` and `vec3 curlNoise(vec3)`.
    - `LogoParticles.jsx` has a module function `createSimulation(gl, size, halfFloat, samples)`. It returns `{ gpu, variable, geometry, error, dispose() }`, and Tasks 4 and 5 extend it.

- [ ] **Step 1: Create `src/canvas/core/shaders/curl.glsl`**

```glsl
// Simplex noise: "webgl-noise" by Ian McEwan and Stefan Gustavson (MIT), https://github.com/stegu/webgl-noise
vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Three decorrelated noise channels used as a vector potential.
vec3 snoiseVec3(vec3 p) {
    return vec3(snoise(p), snoise(p + vec3(-19.1, 33.4, 47.2)), snoise(p + vec3(74.2, -124.5, 99.4)));
}

// Curl of the potential (central differences): a divergence-free flow, so particles swirl instead of clumping.
vec3 curlNoise(vec3 p) {
    const float e = 0.1;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    vec3 px0 = snoiseVec3(p - dx);
    vec3 px1 = snoiseVec3(p + dx);
    vec3 py0 = snoiseVec3(p - dy);
    vec3 py1 = snoiseVec3(p + dy);
    vec3 pz0 = snoiseVec3(p - dz);
    vec3 pz1 = snoiseVec3(p + dz);

    float x = (py1.z - py0.z) - (pz1.y - pz0.y);
    float y = (pz1.x - pz0.x) - (px1.z - px0.z);
    float z = (px1.y - px0.y) - (py1.x - py0.x);
    return vec3(x, y, z) / (2.0 * e);
}
```

- [ ] **Step 2: Create `src/canvas/features/logoParticles/logoParticles.config.js`**

```js
// Particle budget per quality tier: simulation texture size (particle count = size²).
export const TIERS = {
    low: { size: 128 },
    medium: { size: 256 },
    high: { size: 512 },
};

// Physics and look only — timing comes from @config/animation.config. Starting values, tuned by eye.
export const LOGO_PARTICLES = {
    SPRING: 0.06,
    CLOUD_RADIUS: 10,
    CURL_SCALE: 0.35,
    CURL_SPEED: 0.08,
    CURL_STRENGTH: 0.015,
    POINT_SIZE: 30,
};
```

For scale: the logo's local bounds are about 6.8 × 4.4 × 0.75 units (from `Logo.glb`).

- [ ] **Step 3: Create `src/canvas/features/logoParticles/position.frag.glsl`**

```glsl
// Logo particle simulation, run by GPUComputationRenderer (it declares texturePosition and defines resolution).
uniform sampler2D tOrigin;
uniform sampler2D tRandom;
uniform float uTime;
uniform float uDelta;
uniform float uDisperse;
uniform float uSpring;
uniform float uCloudRadius;
uniform float uCurlScale;
uniform float uCurlSpeed;
uniform float uCurlStrength;

#include ../../core/shaders/curl.glsl;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec3 pos = texture2D(texturePosition, uv).xyz;
    vec3 origin = texture2D(tOrigin, uv).xyz;
    vec4 random = texture2D(tRandom, uv);

    // Spring toward the logo surface, or toward a random point in the cloud while dispersed.
    vec3 goal = mix(origin, origin + (random.xyz - 0.5) * uCloudRadius, uDisperse);
    pos += (goal - pos) * uSpring * uDelta;

    // Curl drift: a slight shimmer on the logo, a strong swirl in the cloud.
    pos += curlNoise(pos * uCurlScale + uTime * uCurlSpeed) * uCurlStrength * (0.15 + uDisperse) * uDelta;

    gl_FragColor = vec4(pos, 1.0);
}
```

- [ ] **Step 4: Create `src/canvas/features/logoParticles/particles.vert.glsl`**

```glsl
uniform sampler2D tPosition;
uniform float uPointSize;
uniform float uDpr;
attribute vec4 random;
varying vec4 vRandom;

void main() {
    // position.xy is this particle's texel UV in the simulation texture.
    vec3 pos = texture2D(tPosition, position.xy).xyz;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uPointSize * uDpr * mix(0.5, 1.5, random.x) / -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
    vRandom = random;
}
```

- [ ] **Step 5: Create `src/canvas/features/logoParticles/particles.frag.glsl`**

This version draws a flat color. Task 4 replaces it.

```glsl
varying vec4 vRandom;

void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) {
        discard;
    }
    gl_FragColor = vec4(vec3(0.933), 1.0);
}
```

- [ ] **Step 6: Create `src/canvas/features/logoParticles/LogoParticles.jsx`**

```jsx
import { useQuality } from '@app/QualityContext';
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

function createSimulation(gl, size, halfFloat, { origins, randoms }) {
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
    start.image.data.set(origins.subarray(0, count * 4));
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

export default function LogoParticles({ startAnimations, scrollProgress }) {
    const gl = useThree((state) => state.gl);
    const { quality } = useQuality();
    const { nodes } = useGLTF('/assets/3d/Logo.glb');
    const samples = useMemo(() => samplePoints(nodes.Logo.geometry), [nodes]);
    const [sim, setSim] = useState(null);
    const simRef = useRef(null);
    const introStart = useRef(null);

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
                },
            }),
        []
    );

    useEffect(() => () => material.dispose(), [material]);

    useEffect(() => {
        const next = createSimulation(gl, size, halfFloat, samples);
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
        u.uDisperse.value = Math.max(intro, scatter);
        current.gpu.compute();

        material.uniforms.tPosition.value = current.gpu.getCurrentRenderTarget(current.variable).texture;
        material.uniforms.uDpr.value = state.viewport.dpr;
    });

    if (!sim || sim.error) {
        return null;
    }
    return <points geometry={sim.geometry} material={material} frustumCulled={false} />;
}
```

- [ ] **Step 7: Create `src/canvas/features/logoParticles/index.js`**

```js
export { default as LogoParticles } from './LogoParticles';
```

- [ ] **Step 8: Add the float-support switch in `HomeScene.jsx`**

Insert `import { LogoParticles } from '@canvas/features/logoParticles';` directly after `import { LogoMesh } from '@canvas/features/logo';`.

Replace `    const { size } = useThree();` with `    const { gl, size } = useThree();`.

Directly after the video block from Task 2 (the `if (video) { … }` block), insert:

```text

    // Particles need float or half-float render targets and vertex texture reads; otherwise show the metallic logo.
    const canSimulate = useMemo(
        () =>
            gl.capabilities.maxVertexTextures > 0 &&
            (gl.extensions.has('EXT_color_buffer_float') || gl.extensions.has('EXT_color_buffer_half_float')),
        [gl]
    );
```

Replace:

```text
                    <LogoMesh />
```

with:

```text
                    {canSimulate ? <LogoParticles startAnimations={startAnimations} scrollProgress={scrollProgress} /> : <LogoMesh />}
```

- [ ] **Step 9: Verify**

```bash
npx oxfmt src/canvas/features/logoParticles src/canvas/scenes/home/HomeScene.jsx
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -rnE "@canvas/features|@canvas/scenes" src/canvas/core src/canvas/features
grep -rn "?raw" src/canvas/features/logoParticles src/canvas/core/shaders
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`, and both greps print nothing.

If the build fails resolving `#include ../../core/shaders/curl.glsl;`, report the exact error rather than switching to `?raw`, which would silently drop the include.

Browser check (final review):

- **Intro:** during the reveal the logo assembles from a drifting cloud in about 1.5 s.
- **Scroll:** scrolling down scatters it gradually; scrolling back up reforms it.
- **Formed state:** the formed logo shimmers slightly.
- **Fallback:** temporarily changing `canSimulate` to `false` shows the metallic logo.

- [ ] **Step 10: Commit**

```bash
git add src/canvas/core/shaders/curl.glsl src/canvas/features/logoParticles src/canvas/scenes/home/HomeScene.jsx
git status --short
git commit -m "feat(canvas): add GPU logo particles with assemble and scroll scatter" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

`transition.frag.glsl` must stay unstaged (` M`).

---

### Task 4: Particle shading (video color, matcap highlight, sparkle)

Each particle takes its color from the background video at its screen position. A small matcap highlight, rotated per particle over time, is soft-light blended on top. A few particles go bright enough for bloom to catch them.

**Files:**

- Modify: `src/canvas/features/logoParticles/particles.frag.glsl` (replace the whole file)
- Modify: `src/canvas/features/logoParticles/LogoParticles.jsx`
- Modify: `src/canvas/scenes/home/HomeScene.jsx`

**Interfaces:**

- Consumes:
    - `createMatcapTexture()` (Task 1).
    - The shared `video` in `HomeScene` (Task 2): a `THREE.VideoTexture` or `null`, with `flipY = false`.
- Produces: `LogoParticles({ video, startAnimations, scrollProgress })`.

- [ ] **Step 1: Replace `src/canvas/features/logoParticles/particles.frag.glsl`**

```glsl
uniform sampler2D tVideo;
uniform sampler2D tMatcap;
uniform float uHasVideo;
uniform vec2 uResolution;
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

    // The shared video texture has flipY = false, so texture row 0 is the top of the video.
    vec2 screenUv = gl_FragCoord.xy / uResolution;
    vec3 color = mix(vec3(0.933), texture2D(tVideo, vec2(screenUv.x, 1.0 - screenUv.y)).rgb, uHasVideo);

    // Glossy highlight: the matcap, rotated per particle over time.
    float angle = uTime + vRandom.z * 6.2831853;
    vec2 matcapUv = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * c + 0.5;
    color = softLight(color, texture2D(tMatcap, matcapUv).rgb);

    // A few particles sparkle above the bloom threshold.
    color *= 1.0 + pow(vRandom.y, 20.0) * 2.0;

    gl_FragColor = vec4(color, 1.0);
}
```

- [ ] **Step 2: Add the matcap import in `LogoParticles.jsx`**

Insert `import createMatcapTexture from '@canvas/core/textures/createMatcapTexture';` directly after `import { useQuality } from '@app/QualityContext';`.

- [ ] **Step 3: Accept the `video` prop and create the matcap in `LogoParticles.jsx`**

Replace:

```text
export default function LogoParticles({ startAnimations, scrollProgress }) {
```

with:

```text
export default function LogoParticles({ video, startAnimations, scrollProgress }) {
```

Directly after the line `    const introStart = useRef(null);`, insert:

```text
    const matcap = useMemo(() => createMatcapTexture(), []);
```

- [ ] **Step 4: Extend the point material in `LogoParticles.jsx`**

Replace the `material` `useMemo` and its dispose effect:

```text
    const material = useMemo(
        () =>
            new THREE.ShaderMaterial({
                vertexShader: particlesVert,
                fragmentShader: particlesFrag,
                uniforms: {
                    tPosition: { value: null },
                    uPointSize: { value: LOGO_PARTICLES.POINT_SIZE },
                    uDpr: { value: 1 },
                },
            }),
        []
    );

    useEffect(() => () => material.dispose(), [material]);
```

with:

```text
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
```

- [ ] **Step 5: Update the per-frame render uniforms in `LogoParticles.jsx`**

Replace:

```text
        material.uniforms.tPosition.value = current.gpu.getCurrentRenderTarget(current.variable).texture;
        material.uniforms.uDpr.value = state.viewport.dpr;
```

with:

```text
        const m = material.uniforms;
        m.tPosition.value = current.gpu.getCurrentRenderTarget(current.variable).texture;
        m.uDpr.value = state.viewport.dpr;
        m.tVideo.value = video;
        m.uHasVideo.value = video ? 1 : 0;
        m.uTime.value = state.clock.elapsedTime;
        state.gl.getDrawingBufferSize(m.uResolution.value);
```

`getDrawingBufferSize` writes the canvas's real pixel size, DPR included, into the vector. `gl_FragCoord` is measured in that space.

- [ ] **Step 6: Pass the video in `HomeScene.jsx`**

Replace:

```text
                    {canSimulate ? <LogoParticles startAnimations={startAnimations} scrollProgress={scrollProgress} /> : <LogoMesh />}
```

with:

```text
                    {canSimulate ? <LogoParticles video={video} startAnimations={startAnimations} scrollProgress={scrollProgress} /> : <LogoMesh />}
```

- [ ] **Step 7: Verify**

```bash
npx oxfmt src/canvas/features/logoParticles src/canvas/scenes/home/HomeScene.jsx
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -rnE "@canvas/features|@canvas/scenes" src/canvas/core src/canvas/features
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`, and the grep prints nothing.

Browser check (final review):

- The particles carry the video's colors, upright (the image lines up with the wall behind).
- Each dot has a glossy highlight.
- A few dots glow under bloom.
- Before the video loads, the dots are flat off-white.

- [ ] **Step 8: Commit**

```bash
git add src/canvas/features/logoParticles/particles.frag.glsl src/canvas/features/logoParticles/LogoParticles.jsx src/canvas/scenes/home/HomeScene.jsx
git status --short
git commit -m "feat(canvas): color logo particles from video with matcap highlight" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

`transition.frag.glsl` must stay unstaged (` M`).

---

### Task 5: Mouse fluid

Adds a small screen-space fluid solver in `core/fluid` and wires its velocity into the particle simulation on medium and high tiers.

The solver follows Jos Stam's "stable fluids" method, in the form popularised by Pavel Dobryakov's WebGL-Fluid-Simulation (MIT). Each frame it:

1. adds a splat of pointer velocity;
2. adds vorticity confinement, which keeps swirls alive;
3. projects the field to divergence-free (divergence, then a few Jacobi pressure iterations, then gradient subtract);
4. advects the velocity by itself.

**Files:**

- Create: `src/canvas/core/fluid/shaders/base.vert.glsl`, `splat.frag.glsl`, `advect.frag.glsl`, `curl.frag.glsl`, `vorticity.frag.glsl`, `divergence.frag.glsl`, `clear.frag.glsl`, `pressure.frag.glsl`, `gradient.frag.glsl`
- Create: `src/canvas/core/fluid/FluidSim.js`
- Create: `src/canvas/core/fluid/useFluidSim.js`
- Modify: `src/canvas/features/logoParticles/logoParticles.config.js`
- Modify: `src/canvas/features/logoParticles/position.frag.glsl`
- Modify: `src/canvas/features/logoParticles/LogoParticles.jsx`

**Interfaces:**

- Consumes: R3F `state.pointer` (`Vector2` in [-1, 1], updated from the existing `eventSource` on `#root`).
- Produces:
    - `FluidSim` (default export of `@canvas/core/fluid/FluidSim`):
        - `new FluidSim(renderer, aspect, iterations)`;
        - `.splat(x, y, dx, dy)`, where x and y are in [0, 1] UV and dx and dy are the UV delta since the last frame;
        - `.step(dt)`, with dt in seconds;
        - `.velocity`, the current velocity `THREE.Texture` (xy in texels per second);
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

- [ ] **Step 4: Extend `src/canvas/features/logoParticles/logoParticles.config.js`**

Replace the `TIERS` block and its comment with:

```text
// Particle budget per quality tier: simulation texture size (particle count = size²) and fluid pressure iterations (0 = fluid off).
export const TIERS = {
    low: { size: 128, fluidIterations: 0 },
    medium: { size: 256, fluidIterations: 10 },
    high: { size: 512, fluidIterations: 20 },
};
```

In `LOGO_PARTICLES`, add a line after `POINT_SIZE: 30,`:

```text
    FLUID_STRENGTH: 0.0002,
```

- [ ] **Step 5: Add the fluid push to `src/canvas/features/logoParticles/position.frag.glsl`**

After the line `uniform float uCurlStrength;`, insert:

```glsl
uniform sampler2D tFluid;
uniform float uFluidStrength;
uniform mat4 uModelViewProjection;
uniform mat3 uScreenToLocal;
```

Directly before `    gl_FragColor = vec4(pos, 1.0);`, insert:

```glsl
    // Push by the fluid velocity under the particle on screen, mapped back into the logo's local space.
    vec4 clip = uModelViewProjection * vec4(pos, 1.0);
    vec2 screenUv = clip.xy / clip.w * 0.5 + 0.5;
    vec2 flow = texture2D(tFluid, screenUv).xy;
    pos += uScreenToLocal * vec3(flow, 0.0) * uFluidStrength * uDelta;

```

- [ ] **Step 6: Wire the fluid into `src/canvas/features/logoParticles/LogoParticles.jsx`**

Insert `import useFluidSim from '@canvas/core/fluid/useFluidSim';` directly after `import { useQuality } from '@app/QualityContext';`.

In `createSimulation`, inside the `Object.assign(variable.material.uniforms, { … })` object, add after `uCurlStrength: { value: LOGO_PARTICLES.CURL_STRENGTH },`:

```text
        tFluid: { value: null },
        uFluidStrength: { value: 0 },
        uModelViewProjection: { value: new THREE.Matrix4() },
        uScreenToLocal: { value: new THREE.Matrix3() },
```

In the component, replace:

```text
    const { size } = TIERS[quality];
```

with:

```text
    const { size, fluidIterations } = TIERS[quality];
    const fluidRef = useFluidSim(fluidIterations);
    const pointsRef = useRef(null);
    const modelView = useMemo(() => new THREE.Matrix4(), []);
```

`useFluidSim` must be called before this component's own `useFrame`. R3F runs same-priority frame callbacks in subscription order, so the fluid steps before the particles read it. The placement above guarantees that.

In the `useFrame` callback, replace:

```text
        u.uDisperse.value = Math.max(intro, scatter);
        current.gpu.compute();
```

with:

```text
        u.uDisperse.value = Math.max(intro, scatter);

        // Fluid velocity is in screen space; map it into the logo's local space (a null sampler reads as black).
        const fluid = fluidRef.current;
        u.tFluid.value = fluid ? fluid.velocity : null;
        u.uFluidStrength.value = fluid ? LOGO_PARTICLES.FLUID_STRENGTH : 0;
        if (pointsRef.current) {
            modelView.multiplyMatrices(state.camera.matrixWorldInverse, pointsRef.current.matrixWorld);
            u.uModelViewProjection.value.multiplyMatrices(state.camera.projectionMatrix, modelView);
            u.uScreenToLocal.value.setFromMatrix4(modelView).invert();
        }
        current.gpu.compute();
```

In the returned JSX, replace:

```text
    return <points geometry={sim.geometry} material={material} frustumCulled={false} />;
```

with:

```text
    return <points ref={pointsRef} geometry={sim.geometry} material={material} frustumCulled={false} />;
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

- On high or medium, moving the mouse across the logo swirls the particles away along the motion, and they spring back once the mouse stops.
- On low (DevTools CPU throttling until quality drops), there is no fluid reaction but the particles are still smooth.
- No WebGL errors in the console, including when the quality tier changes or the window is resized.

- [ ] **Step 8: Commit**

```bash
git add src/canvas/core/fluid src/canvas/features/logoParticles
git status --short
git commit -m "feat(canvas): swirl logo particles with a mouse-driven fluid sim" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

`transition.frag.glsl` must stay unstaged (` M`).

---

### Task 6: Documentation, spec sync and final checks

**Files:**

- Modify: `COMPONENT_DOCUMENTATION.md`
- Modify: `docs/superpowers/specs/2026-10-09-gpgpu-logo-particles-design.md`

**Interfaces:**

- Consumes: the final code from Tasks 1–5.
- Produces: nothing new in code.

- [ ] **Step 1: Update `COMPONENT_DOCUMENTATION.md`**

Make these edits. Table cells can be edited with any spacing, because Step 3 realigns them.

1. **Section 6.0:** in the bullet that starts `- **`core/`**:`, replace `(`CanvasRoot`, quality, animation and texture hooks, camera `Rig`)` with `(`CanvasRoot`, quality, animation and texture hooks, camera `Rig`, the fluid simulation, shared shader chunks)`.

2. **`HomeScene` section:**
    - Replace the bullet ``- `entryComplete` flag gates expensive effects (Float, AO) until the ~1.5s opening animation settles.`` with these three bullets:

```markdown
- Owns the single `blackwall.mp4` video texture and shares it with `BackgroundMesh` and `LogoParticles`.
- Renders `LogoParticles` when float or half-float render targets are supported, otherwise the metallic `LogoMesh`.
- Eases the logo group's rotation toward the pointer.
```

    - In its table row:
        - set Hooks to `` `useRef`, `useEffect`, `useMemo`, `useFrame`, `useThree`, **`useVideoTexture`**, **`useObjectAnimation`**, **`useCameraAnimation`** ``;
        - set Config to `` `FLOAT_CONFIG`, `REVEAL`, `SCENE`, `BREAKPOINTS` ``;
        - set Children to `` `Rig`, `BackgroundMesh`, `LogoParticles` / `LogoMesh`, `LaserPlane`, `EffectComposer` ``.

3. **Add a `LogoParticles` section** directly before the `---` that ends the `LaserPlane` section:

```markdown
---

#### `LogoParticles`

> **`src/canvas/features/logoParticles/LogoParticles.jsx`** — GPU-simulated particle logo

Samples points on the `Logo.glb` surface (`MeshSurfaceSampler`) and simulates them with `GPUComputationRenderer`: spring back to the logo, curl-noise drift, and a push from the mouse fluid (`useFluidSim`, medium/high only). `uDisperse` assembles the logo from a cloud during the reveal (`REVEAL.DURATION` delay, `SCENE.CAMERA_DURATION` length) and scatters it on scroll up to `SCROLL_THRESHOLDS.HOME_TRANSITION`. Points are colored from the shared video at their screen position, with a matcap soft-light highlight and a few sparkles for bloom.

- Props: `video`, `startAnimations`, `scrollProgress`.
- Particle budget per tier from `TIERS`: 16k (low, half-float, no fluid), 65k (medium), 262k (high).

| Hooks                                                                                              | Context          | Config                                                            | Children |
| -------------------------------------------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------- | -------- |
| `useState`, `useRef`, `useMemo`, `useEffect`, `useFrame`, `useThree`, `useGLTF`, **`useFluidSim`** | **`useQuality`** | `TIERS`, `LOGO_PARTICLES`, `REVEAL`, `SCENE`, `SCROLL_THRESHOLDS` | `points` |
```

4. **`BackgroundMesh` section:**
    - Replace the sentence `Renders GLB wall asset with looping video texture.` with ``Renders the GLB wall asset with the shared video texture (`video` prop, owned by `HomeScene`).``
    - In its table row, set Hooks to `` `useEffect`, `memo`, `useGLTF` ``.

5. **`LogoMesh` section:**
    - Replace the summary line `— Refractive logo with FBO` with `— Metallic matcap logo (fallback)`.
    - Replace the paragraph starting `3D logo mesh with glass/refraction material.` with ``Fallback logo for devices without float render targets. Renders the logo geometry with `meshMatcapMaterial` and the procedural matcap from `createMatcapTexture`. `React.memo`-wrapped.``
    - In its table row, set Hooks to `` `useMemo`, `useEffect`, `memo`, `useGLTF` ``, Context to `—` and Config to `—`.

6. **Section 7 table:** delete the `GlassLogoMaterial` row.

7. **"Custom Hook → Consumer Map":**
    - set the `useNoiseTexture` consumers to `` `WorkCard` ``;
    - add a row ``| `useFluidSim` | `LogoParticles` |``;
    - add a row ``| `useVideoTexture` | `HomeScene` |``.

8. **"Context Consumer Map":** in the `useQuality` row, replace `` `LogoMesh` `` with `` `LogoParticles` ``.

9. **"Config File → Consumer Map":** add a row ``| `canvas/features/logoParticles/logoParticles.config.js` | `TIERS`, `LOGO_PARTICLES` | `LogoParticles` |``.

- [ ] **Step 2: Sync the spec with this plan's refinements**

In `docs/superpowers/specs/2026-10-09-gpgpu-logo-particles-design.md`:

1. In "Fallback and error handling", delete the bullet ``- `gl.capabilities.isWebGL2` is false;``.
2. In "Component interfaces", replace the `useFluidSim` bullet with:

```markdown
- `useFluidSim(iterations)` returns a ref. Its `.current` is the `FluidSim`, or `null` when `iterations` is 0. Read `.current.velocity` every frame, because the velocity buffer swaps on every step.
```

3. In the "Quality tiers" table's low row, replace `off: `tFluid`is a 1×1 black texture and`uFluidStrength` is 0` with `off: `tFluid`is`null`(reads as black) and`uFluidStrength` is 0`.

- [ ] **Step 3: Format and verify**

```bash
npx oxfmt COMPONENT_DOCUMENTATION.md docs/superpowers/specs/2026-10-09-gpgpu-logo-particles-design.md
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -nE "GlassLogoMaterial|Refractive logo|entryComplete|isWebGL2" COMPONENT_DOCUMENTATION.md docs/superpowers/specs/2026-10-09-gpgpu-logo-particles-design.md
grep -rnE "GlassLogoMaterial|glass\.(vert|frag)|ENTRY_COMPLETE_MS|useFBO" src
grep -rnE "@canvas/features|@canvas/scenes" src/canvas/core src/canvas/features
grep -rn "@routes/" src/canvas
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`, and all four greps print nothing.

- [ ] **Step 4: Commit**

```bash
git add COMPONENT_DOCUMENTATION.md docs/superpowers/specs/2026-10-09-gpgpu-logo-particles-design.md
git status --short
git commit -m "docs: document logo particles and fluid sim" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git log --oneline master..HEAD
```

Expected: after committing, `git status --short` shows only ` M src/canvas/features/transition/transition.frag.glsl`.

- [ ] **Step 5: Manual browser review (hand to the user)**

Run `npm run dev`, open `http://localhost:3000` and go through the browser checks from Tasks 1–5:

- metallic fallback and tilt;
- shared video, upright and requested once;
- assemble, scatter and reform;
- video colors, highlight and sparkle;
- mouse swirl on high/medium and none on low;
- no console or WebGL errors when the tier changes or the window is resized;
- about 60 fps on high on the developer machine.

Tune `LOGO_PARTICLES` and the `FluidSim` constants by eye if needed, as a follow-up commit.
