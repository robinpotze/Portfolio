# Canvas Architecture Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize `src/canvas` and its canvas-only hooks, configs and utils into a `core / features / scenes` architecture without changing runtime behavior.

**Architecture:** `core/` holds generic 3D infrastructure, `features/<name>/` colocates each visual unit (component, material, shaders, config), and `scenes/<route>/` holds the per-route composition roots. Imports flow one way only: scenes → features → core. Four small logic relocations remove the duplicated `<Canvas>` setup and three dependency inversions.

**Tech Stack:** React 19, @react-three/fiber 9, @react-three/drei 10, three 0.186, Vite 8 (`vite-plugin-glsl`, shaders imported with `?raw`), oxlint, oxfmt.

**Spec:** `docs/superpowers/specs/2026-10-01-canvas-architecture-design.md`

## Global Constraints

- Pure refactor: no visual, performance or behavioral change.
- Dependency direction: `scenes → features → core`. Core never imports features or scenes. A feature never imports another feature or a scene.
- Nothing in `src/canvas` imports `@routes/*`.
- Routes import only `@canvas/scenes/*`.
- Code outside a feature imports it only through the feature's `index.js`.
- Inside one feature folder, or inside `core/`, import siblings relatively (`./x`). Across layers, use the `@canvas/...` alias. No new aliases.
- Shader files are named `<name>.vert.glsl` / `<name>.frag.glsl` (a single-file shader stays `<name>.glsl`). Shader imports keep the `?raw` suffix.
- Material modules use the `.js` extension and keep self-registering with `extend()` as a side effect, imported by the feature's component.
- Folder names are lowercase camelCase. Component files are PascalCase.
- Import order: alphabetical by module specifier, relative imports last (matches existing files).
- Move every file with `git mv` (run `mkdir -p` on the destination folder first).
- **Never** run `git add -A`, `git add .` or `git commit -a`. Stage explicit paths only.
- `src/canvas/shaders/transition/Transition.glsl` has uncommitted user edits. Never stage or commit its content changes (Task 6 explains how to move it safely).
- Formatting: oxfmt (4-space indent, single quotes, print width 150). Run `npx oxfmt <changed files>` before committing, Markdown included.
- Every commit message ends with the trailer `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- The repo has no test runner. The "test" for each task is: `npm run build` succeeds (Vite fails on unresolved imports), `npm run lint` exits 0 with no output, `npm run fmt:check` prints "All matched files use the correct format.", plus the task's stale-path grep.

## File Structure (end state)

```
src/canvas/
  core/
    CanvasRoot.jsx                    NEW: shared <Canvas> + DPR + gl defaults + adaptive quality monitor
    canvas.config.js                  ← src/config/canvas.config.js
    quality/useAdaptiveQuality.js     ← src/hooks/useAdaptiveQuality.js
    animation/useObjectAnimation.js   ← src/hooks/useObjectAnimation.js
    animation/useCameraAnimation.js   ← src/hooks/useCameraAnimation.js
    textures/useNoiseTexture.js       ← src/hooks/useNoiseTexture.js
    textures/useVideoTexture.js       ← src/hooks/useVideoTexture.js
    camera/Rig.jsx                    ← src/canvas/camera/Rig.jsx
  features/
    logo/        index.js, LogoMesh.jsx, GlassLogoMaterial.js, glass.vert.glsl, glass.frag.glsl
    laser/       index.js, LaserPlane.jsx, LaserFlowMaterial.js, laser.vert.glsl, laser.frag.glsl, laser.config.js
    background/  index.js, BackgroundMesh.jsx
    carousel/    index.js, WorkCard.jsx, WorkCardMaterial.js, PixelOverlayMaterial.js,
                 workCard.vert.glsl, workCard.frag.glsl, pixelOverlay.vert.glsl, pixelOverlay.frag.glsl,
                 carousel.config.js, carousel.js, cardGeometry.js (NEW), useBorderProjection.js
    transition/  transition.vert.glsl, transition.frag.glsl
    lab/         flame.glsl
  scenes/
    home/        HomeCanvas.jsx, HomeCanvas.module.css (NEW), HomeScene.jsx
    work/        WorkCanvas.jsx, WorkCanvas.module.css (NEW), WorkScene.jsx
```

Other files modified: `src/routes/Home/Home.jsx`, `src/routes/Home/Home.module.css`, `src/routes/Work/Work.jsx`, `src/routes/Work/Work.module.css`, `COMPONENT_DOCUMENTATION.md`.

## Pre-flight

- [ ] Confirm you are on branch `refactor/canvas-architecture` and the only uncommitted change is the user's WIP:

```bash
git branch --show-current
git status --short
```

Expected: `refactor/canvas-architecture`, then exactly ` M src/canvas/shaders/transition/Transition.glsl`.

- [ ] Confirm the baseline is green:

```bash
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`

---

### Task 1: Core layer and shared `CanvasRoot`

Moves the canvas-only hooks, `canvas.config.js` and `Rig` into `core/`, creates `CanvasRoot`, and adopts it in both canvases (still at their current paths).

**Files:**

- Move: `src/config/canvas.config.js` → `src/canvas/core/canvas.config.js`
- Move: `src/hooks/useAdaptiveQuality.js` → `src/canvas/core/quality/useAdaptiveQuality.js`
- Move: `src/hooks/useObjectAnimation.js` → `src/canvas/core/animation/useObjectAnimation.js`
- Move: `src/hooks/useCameraAnimation.js` → `src/canvas/core/animation/useCameraAnimation.js`
- Move: `src/hooks/useNoiseTexture.js` → `src/canvas/core/textures/useNoiseTexture.js`
- Move: `src/hooks/useVideoTexture.js` → `src/canvas/core/textures/useVideoTexture.js`
- Move: `src/canvas/camera/Rig.jsx` → `src/canvas/core/camera/Rig.jsx`
- Create: `src/canvas/core/CanvasRoot.jsx`
- Modify: `src/canvas/home/HomeCanvas.jsx` (full rewrite below)
- Modify: `src/canvas/work/WorkCanvas.jsx` (imports + `<Canvas>` block)
- Modify: `src/canvas/home/HomeScene.jsx` (imports)
- Modify: `src/canvas/meshes/LogoMesh.jsx` (imports)
- Modify: `src/canvas/meshes/BackgroundMesh.jsx` (imports)
- Modify: `src/canvas/work/WorkCard.jsx` (imports)

**Interfaces:**

- Consumes: nothing from earlier tasks.
- Produces:
    - `@canvas/core/CanvasRoot`: default export `CanvasRoot({ adaptiveQuality = true, gl, children, ...canvasProps })`. Renders `<Canvas dpr={CANVAS_DPR} {...canvasProps} gl={{ ...CANVAS_GL_DEFAULTS, ...gl }}>` with an adaptive quality monitor as the first child.
    - `@canvas/core/camera/Rig` (default export `Rig`)
    - `@canvas/core/animation/useObjectAnimation` and `@canvas/core/animation/useCameraAnimation` (default exports, unchanged signatures)
    - `@canvas/core/textures/useNoiseTexture` and `@canvas/core/textures/useVideoTexture` (default exports, unchanged signatures)
    - `@canvas/core/quality/useAdaptiveQuality` (default export, unchanged)
    - `@canvas/core/canvas.config` (named exports `CANVAS_GL_DEFAULTS`, `CANVAS_DPR`)

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/canvas/core/quality src/canvas/core/animation src/canvas/core/textures src/canvas/core/camera
git mv src/config/canvas.config.js src/canvas/core/canvas.config.js
git mv src/hooks/useAdaptiveQuality.js src/canvas/core/quality/useAdaptiveQuality.js
git mv src/hooks/useObjectAnimation.js src/canvas/core/animation/useObjectAnimation.js
git mv src/hooks/useCameraAnimation.js src/canvas/core/animation/useCameraAnimation.js
git mv src/hooks/useNoiseTexture.js src/canvas/core/textures/useNoiseTexture.js
git mv src/hooks/useVideoTexture.js src/canvas/core/textures/useVideoTexture.js
git mv src/canvas/camera/Rig.jsx src/canvas/core/camera/Rig.jsx
```

The moved files' own imports (`@app/...`, `@config/animation.config`, `@utils/easingFunctions.js`) stay valid and need no edits.

- [ ] **Step 2: Run the build to confirm it now fails on the old paths**

Run: `npm run build 2>&1 | tail -5`
Expected: the build fails with an unresolved import error mentioning one of the moved modules (for example `@config/canvas.config` or `@hooks/useAdaptiveQuality`).

- [ ] **Step 3: Create `src/canvas/core/CanvasRoot.jsx`**

```jsx
import { Canvas } from '@react-three/fiber';
import { CANVAS_DPR, CANVAS_GL_DEFAULTS } from './canvas.config';
import useAdaptiveQuality from './quality/useAdaptiveQuality';

function AdaptiveQualityMonitor({ enabled }) {
    useAdaptiveQuality({ enabled });
    return null;
}

/**
 * Shared R3F <Canvas>: project DPR and GL defaults plus the adaptive quality monitor.
 * `gl` is merged over CANVAS_GL_DEFAULTS; every other prop is forwarded to <Canvas>.
 */
export default function CanvasRoot({ adaptiveQuality = true, gl, children, ...canvasProps }) {
    return (
        <Canvas dpr={CANVAS_DPR} {...canvasProps} gl={{ ...CANVAS_GL_DEFAULTS, ...gl }}>
            <AdaptiveQualityMonitor enabled={adaptiveQuality} />
            {children}
        </Canvas>
    );
}
```

- [ ] **Step 4: Rewrite `src/canvas/home/HomeCanvas.jsx`**

Replace the whole file with:

```jsx
import CanvasRoot from '@canvas/core/CanvasRoot';
import styles from '@routes/Home/Home.module.css';
import HomeScene from './HomeScene';

export default function HomeCanvas({ scrollProgress, startAnimations, laserParams, onSceneReady }) {
    return (
        <div className={styles.canvasContainer}>
            <CanvasRoot
                adaptiveQuality={startAnimations}
                performance={{ min: 0.5 }}
                eventSource={document.getElementById('root')}
                eventPrefix="client"
                gl={{ antialias: true }}
            >
                <HomeScene scrollProgress={scrollProgress} startAnimations={startAnimations} laserParams={laserParams} onSceneReady={onSceneReady} />
            </CanvasRoot>
        </div>
    );
}
```

(The `@routes` CSS import is removed in Task 7, and `laserParams` in Task 3.)

- [ ] **Step 5: Update `src/canvas/work/WorkCanvas.jsx`**

Replace the import block and the `AdaptiveQualityMonitor` function at the top of the file:

```jsx
import NineSliceBorder from '@components/ui/NineSliceBorder';
import { SPRING_CONFIG } from '@config/animation.config';
import { CANVAS_DPR, CANVAS_GL_DEFAULTS } from '@config/canvas.config';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import useAdaptiveQuality from '@hooks/useAdaptiveQuality';
import useBorderProjection from '@hooks/useBorderProjection';
import { PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import styles from '@routes/Work/Work.module.css';
import Lenis from 'lenis';
import { useMotionValue, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import WorkScene from './WorkScene';

function AdaptiveQualityMonitor({ enabled = true }) {
    useAdaptiveQuality({ enabled });
    return null;
}
```

with:

```jsx
import CanvasRoot from '@canvas/core/CanvasRoot';
import NineSliceBorder from '@components/ui/NineSliceBorder';
import { SPRING_CONFIG } from '@config/animation.config';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import useBorderProjection from '@hooks/useBorderProjection';
import { PerspectiveCamera } from '@react-three/drei';
import styles from '@routes/Work/Work.module.css';
import Lenis from 'lenis';
import { useMotionValue, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import WorkScene from './WorkScene';
```

Then, in the returned JSX, replace:

```jsx
            <Canvas
                dpr={CANVAS_DPR}
                performance={{ min: 0.5 }}
                gl={{
                    ...CANVAS_GL_DEFAULTS,
                    antialias: false,
                }}
                style={canvasStyle}
            >
                <AdaptiveQualityMonitor enabled={startAnimations} />
```

with:

```jsx
            <CanvasRoot adaptiveQuality={startAnimations} performance={{ min: 0.5 }} gl={{ antialias: false }} style={canvasStyle}>
```

and replace the closing `            </Canvas>` with `            </CanvasRoot>`. Leave everything between them (`<PerspectiveCamera>`, `<WorkScene>`) unchanged.

- [ ] **Step 6: Update `src/canvas/home/HomeScene.jsx` imports**

Replace:

```jsx
import Rig from '@canvas/camera/Rig';
```

with:

```jsx
import useCameraAnimation from '@canvas/core/animation/useCameraAnimation';
import useObjectAnimation from '@canvas/core/animation/useObjectAnimation';
import Rig from '@canvas/core/camera/Rig';
```

Then delete these two lines:

```jsx
import useCameraAnimation from '@hooks/useCameraAnimation';
import useObjectAnimation from '@hooks/useObjectAnimation';
```

The top of the file should now read:

```jsx
import { useQuality } from '@app/QualityContext';
import useCameraAnimation from '@canvas/core/animation/useCameraAnimation';
import useObjectAnimation from '@canvas/core/animation/useObjectAnimation';
import Rig from '@canvas/core/camera/Rig';
import LaserPlane from '@canvas/effects/LaserPlane';
import BackgroundMesh from '@canvas/meshes/BackgroundMesh';
import LogoMesh from '@canvas/meshes/LogoMesh';
import { BREAKPOINTS, FLOAT_CONFIG, REVEAL, SCENE, TIMEOUT } from '@config/animation.config';
import { Float, PerspectiveCamera, Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef, useState } from 'react';
```

- [ ] **Step 7: Update `src/canvas/meshes/LogoMesh.jsx` imports**

Replace:

```jsx
import '@canvas/materials/GlassLogoMaterial';
import useNoiseTexture from '@hooks/useNoiseTexture';
```

with:

```jsx
import useNoiseTexture from '@canvas/core/textures/useNoiseTexture';
import '@canvas/materials/GlassLogoMaterial';
```

- [ ] **Step 8: Update `src/canvas/meshes/BackgroundMesh.jsx` imports**

Replace:

```jsx
import { useGLTF } from '@react-three/drei';
import { memo, useEffect } from 'react';
import * as THREE from 'three';
import useVideoTexture from '@hooks/useVideoTexture.js';
```

with:

```jsx
import useVideoTexture from '@canvas/core/textures/useVideoTexture';
import { useGLTF } from '@react-three/drei';
import { memo, useEffect } from 'react';
import * as THREE from 'three';
```

- [ ] **Step 9: Update `src/canvas/work/WorkCard.jsx` imports**

Replace:

```jsx
import { useQuality } from '@app/QualityContext';
import '@canvas/materials/PixelOverlayMaterial';
```

with:

```jsx
import { useQuality } from '@app/QualityContext';
import useNoiseTexture from '@canvas/core/textures/useNoiseTexture';
import '@canvas/materials/PixelOverlayMaterial';
```

Then delete the line:

```jsx
import useNoiseTexture from '@hooks/useNoiseTexture';
```

- [ ] **Step 10: Verify**

```bash
npx oxfmt src/canvas
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -rnE "@hooks/(useAdaptiveQuality|useCameraAnimation|useObjectAnimation|useNoiseTexture|useVideoTexture)|@config/canvas\.config|@canvas/camera/|AdaptiveQualityMonitor" src | grep -v "^src/canvas/core/CanvasRoot.jsx"
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`, and the grep prints nothing.

- [ ] **Step 11: Commit**

```bash
git add src/canvas/core/CanvasRoot.jsx src/canvas/home/HomeCanvas.jsx src/canvas/work/WorkCanvas.jsx src/canvas/home/HomeScene.jsx src/canvas/meshes/LogoMesh.jsx src/canvas/meshes/BackgroundMesh.jsx src/canvas/work/WorkCard.jsx
git status --short
git commit -m "refactor(canvas): add core layer and shared CanvasRoot" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Before committing, `git status --short` must still show ` M src/canvas/shaders/transition/Transition.glsl` as unstaged (leading space). After committing, it is the only line left.

---

### Task 2: Logo feature

**Files:**

- Move: `src/canvas/meshes/LogoMesh.jsx` → `src/canvas/features/logo/LogoMesh.jsx`
- Move: `src/canvas/materials/GlassLogoMaterial.jsx` → `src/canvas/features/logo/GlassLogoMaterial.js`
- Move: `src/canvas/shaders/glass/GlassVert.glsl` → `src/canvas/features/logo/glass.vert.glsl`
- Move: `src/canvas/shaders/glass/GlassFrag.glsl` → `src/canvas/features/logo/glass.frag.glsl`
- Create: `src/canvas/features/logo/index.js`
- Modify: `src/canvas/features/logo/GlassLogoMaterial.js` (shader imports)
- Modify: `src/canvas/features/logo/LogoMesh.jsx` (material import)
- Modify: `src/canvas/home/HomeScene.jsx` (import)

**Interfaces:**

- Consumes: `@canvas/core/textures/useNoiseTexture` (Task 1), already imported by `LogoMesh.jsx`.
- Produces: `@canvas/features/logo` with named export `LogoMesh` (the same memoized component as before, same props: `enableFBO` plus group props).

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/canvas/features/logo
git mv src/canvas/meshes/LogoMesh.jsx src/canvas/features/logo/LogoMesh.jsx
git mv src/canvas/materials/GlassLogoMaterial.jsx src/canvas/features/logo/GlassLogoMaterial.js
git mv src/canvas/shaders/glass/GlassVert.glsl src/canvas/features/logo/glass.vert.glsl
git mv src/canvas/shaders/glass/GlassFrag.glsl src/canvas/features/logo/glass.frag.glsl
```

- [ ] **Step 2: Run the build to confirm it fails**

Run: `npm run build 2>&1 | tail -5`
Expected: FAIL, with an unresolved import for `@canvas/meshes/LogoMesh` or `../shaders/glass/...`.

- [ ] **Step 3: Fix the shader imports in `GlassLogoMaterial.js`**

Replace:

```js
import glassFragmentShader from '../shaders/glass/GlassFrag.glsl?raw';
import glassVertexShader from '../shaders/glass/GlassVert.glsl?raw';
```

with:

```js
import glassFragmentShader from './glass.frag.glsl?raw';
import glassVertexShader from './glass.vert.glsl?raw';
```

- [ ] **Step 4: Fix the material import in `LogoMesh.jsx`**

Delete the line `import '@canvas/materials/GlassLogoMaterial';` and add `import './GlassLogoMaterial';` as the last import. The import block becomes:

```jsx
import { useQuality } from '@app/QualityContext';
import useNoiseTexture from '@canvas/core/textures/useNoiseTexture';
import { useFBO, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { memo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import './GlassLogoMaterial';
```

- [ ] **Step 5: Create `src/canvas/features/logo/index.js`**

```js
export { default as LogoMesh } from './LogoMesh';
```

- [ ] **Step 6: Update `src/canvas/home/HomeScene.jsx`**

Delete the line `import LogoMesh from '@canvas/meshes/LogoMesh';` and insert this line directly after `import Rig from '@canvas/core/camera/Rig';`:

```jsx
import { LogoMesh } from '@canvas/features/logo';
```

The JSX usage `<LogoMesh enableFBO={...} />` is unchanged.

- [ ] **Step 7: Verify**

```bash
npx oxfmt src/canvas
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -rnE "@canvas/meshes/LogoMesh|materials/GlassLogoMaterial|shaders/glass" src
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`, and the grep prints nothing.

- [ ] **Step 8: Commit**

```bash
git add src/canvas/features/logo src/canvas/home/HomeScene.jsx
git status --short
git commit -m "refactor(canvas): colocate logo feature" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Before committing, `Transition.glsl` must still be unstaged (` M`).

---

### Task 3: Laser feature, with the scroll mapping moved into `LaserPlane`

**Files:**

- Move: `src/canvas/effects/LaserPlane.jsx` → `src/canvas/features/laser/LaserPlane.jsx`
- Move: `src/canvas/materials/LaserFlowMaterial.jsx` → `src/canvas/features/laser/LaserFlowMaterial.js`
- Move: `src/canvas/shaders/laser/laser.vert` → `src/canvas/features/laser/laser.vert.glsl`
- Move: `src/canvas/shaders/laser/laser.frag` → `src/canvas/features/laser/laser.frag.glsl`
- Move: `src/config/laser.config.js` → `src/canvas/features/laser/laser.config.js`
- Create: `src/canvas/features/laser/index.js`
- Modify: `src/canvas/features/laser/LaserFlowMaterial.js` (shader imports)
- Modify: `src/canvas/features/laser/LaserPlane.jsx` (imports, inner component rename, new wrapper)
- Modify: `src/canvas/home/HomeScene.jsx` (import, signature, `<LaserPlane>` usage)
- Modify: `src/canvas/home/HomeCanvas.jsx` (drop `laserParams`)
- Modify: `src/routes/Home/Home.jsx` (drop the laser mapping)

**Interfaces:**

- Consumes: nothing new.
- Produces: `@canvas/features/laser` with named export `LaserPlane`, signature `LaserPlane({ progress = 0 })`. For each key of `LASER_PARAMS` it computes `base + progress * scale` and renders the internal `LaserFlow` component (the former `LaserPlane` body, unchanged) with those props.
- Removes: the `laserParams` prop from `HomeCanvas` and `HomeScene`.

**Why this is behavior-neutral:** `Home.jsx` computed `laserProgress = sceneStarted ? scrollProgress : 0`. `LaserPlane` only renders when `startAnimations` (which is `sceneStarted`) is true, so in every rendered state `laserProgress === scrollProgress`. That is exactly what `HomeScene` now passes as `progress`.

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/canvas/features/laser
git mv src/canvas/effects/LaserPlane.jsx src/canvas/features/laser/LaserPlane.jsx
git mv src/canvas/materials/LaserFlowMaterial.jsx src/canvas/features/laser/LaserFlowMaterial.js
git mv src/canvas/shaders/laser/laser.vert src/canvas/features/laser/laser.vert.glsl
git mv src/canvas/shaders/laser/laser.frag src/canvas/features/laser/laser.frag.glsl
git mv src/config/laser.config.js src/canvas/features/laser/laser.config.js
```

- [ ] **Step 2: Run the build to confirm it fails**

Run: `npm run build 2>&1 | tail -5`
Expected: FAIL, with an unresolved import for `@canvas/effects/LaserPlane`, `@config/laser.config` or `../shaders/laser/...`.

- [ ] **Step 3: Fix the shader imports in `LaserFlowMaterial.js`**

Replace:

```js
import laserFragmentShader from '../shaders/laser/laser.frag?raw';
import laserVertexShader from '../shaders/laser/laser.vert?raw';
```

with:

```js
import laserFragmentShader from './laser.frag.glsl?raw';
import laserVertexShader from './laser.vert.glsl?raw';
```

- [ ] **Step 4: Update the imports in `LaserPlane.jsx`**

Replace:

```jsx
import { useQuality } from '@app/QualityContext';
import '@canvas/materials/LaserFlowMaterial';
import { useFrame, useThree } from '@react-three/fiber';
import { getCSSColorRGBA } from '@utils/cssUtils';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
```

with:

```jsx
import { useQuality } from '@app/QualityContext';
import { useFrame, useThree } from '@react-three/fiber';
import { getCSSColorRGBA } from '@utils/cssUtils';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { LASER_PARAMS } from './laser.config';
import './LaserFlowMaterial';
```

- [ ] **Step 5: Rename the existing component in `LaserPlane.jsx`**

Replace the line:

```jsx
export default function LaserPlane({
```

with:

```jsx
function LaserFlow({
```

Leave the rest of that function (its parameters, hooks, `useFrame` and returned `<mesh>`) untouched.

- [ ] **Step 6: Append the new `LaserPlane` wrapper at the end of `LaserPlane.jsx`**

```jsx
/**
 * Scroll-driven laser. Maps `progress` (0–1) to LaserFlow params: base + progress * scale per LASER_PARAMS key.
 */
export default function LaserPlane({ progress = 0 }) {
    const params = useMemo(() => {
        const mapped = {};
        for (const [key, { base, scale }] of Object.entries(LASER_PARAMS)) {
            mapped[key] = base + progress * scale;
        }
        return mapped;
    }, [progress]);

    return <LaserFlow {...params} />;
}
```

- [ ] **Step 7: Create `src/canvas/features/laser/index.js`**

```js
export { default as LaserPlane } from './LaserPlane';
```

- [ ] **Step 8: Update `src/canvas/home/HomeScene.jsx`**

1. Delete the line `import LaserPlane from '@canvas/effects/LaserPlane';` and insert this line directly after `import Rig from '@canvas/core/camera/Rig';`:

```jsx
import { LaserPlane } from '@canvas/features/laser';
```

2. Replace the signature line:

```jsx
export default function HomeScene({ scrollProgress = 0, startAnimations = true, laserParams = {}, onSceneReady = null }) {
```

with:

```jsx
export default function HomeScene({ scrollProgress = 0, startAnimations = true, onSceneReady = null }) {
```

3. Replace:

```jsx
{
    startAnimations && <LaserPlane {...laserParams} />;
}
```

with:

```jsx
{
    startAnimations && <LaserPlane progress={scrollProgress} />;
}
```

- [ ] **Step 9: Update `src/canvas/home/HomeCanvas.jsx`**

Replace:

```jsx
export default function HomeCanvas({ scrollProgress, startAnimations, laserParams, onSceneReady }) {
```

with:

```jsx
export default function HomeCanvas({ scrollProgress, startAnimations, onSceneReady }) {
```

And replace:

```jsx
<HomeScene scrollProgress={scrollProgress} startAnimations={startAnimations} laserParams={laserParams} onSceneReady={onSceneReady} />
```

with:

```jsx
<HomeScene scrollProgress={scrollProgress} startAnimations={startAnimations} onSceneReady={onSceneReady} />
```

- [ ] **Step 10: Update `src/routes/Home/Home.jsx`**

1. Delete the line `import { LASER_PARAMS } from '@config/laser.config';`
2. Replace `import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';` with:

```jsx
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
```

(`useMemo` has no other use in this file. Confirm with `grep -n useMemo src/routes/Home/Home.jsx`, which should print nothing after this step.)

3. Delete this block, including the blank line after it:

```jsx
const laserProgress = sceneStarted ? scrollProgress : 0;
const laserParams = useMemo(() => {
    const params = {};
    for (const [key, { base, scale }] of Object.entries(LASER_PARAMS)) {
        params[key] = base + laserProgress * scale;
    }
    return params;
}, [laserProgress]);
```

4. Replace:

```jsx
<HomeCanvas scrollProgress={scrollProgress} startAnimations={sceneStarted} laserParams={laserParams} />
```

with:

```jsx
<HomeCanvas scrollProgress={scrollProgress} startAnimations={sceneStarted} />
```

- [ ] **Step 11: Verify**

```bash
npx oxfmt src/canvas src/routes/Home/Home.jsx
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -rnE "@canvas/effects|materials/LaserFlowMaterial|shaders/laser|@config/laser\.config|laserParams|laserProgress" src
grep -n "useMemo" src/routes/Home/Home.jsx
grep -rln "LASER_PARAMS" src
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.` The first two greps print nothing. The third lists exactly `src/canvas/features/laser/LaserPlane.jsx` and `src/canvas/features/laser/laser.config.js`.

- [ ] **Step 12: Commit**

```bash
git add src/canvas/features/laser src/canvas/home/HomeScene.jsx src/canvas/home/HomeCanvas.jsx src/routes/Home/Home.jsx
git status --short
git commit -m "refactor(canvas): colocate laser feature and own scroll mapping" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Before committing, `Transition.glsl` must still be unstaged (` M`).

---

### Task 4: Background feature

**Files:**

- Move: `src/canvas/meshes/BackgroundMesh.jsx` → `src/canvas/features/background/BackgroundMesh.jsx`
- Create: `src/canvas/features/background/index.js`
- Modify: `src/canvas/home/HomeScene.jsx` (import)

**Interfaces:**

- Consumes: `@canvas/core/textures/useVideoTexture` (Task 1), already imported by `BackgroundMesh.jsx`.
- Produces: `@canvas/features/background` with named export `BackgroundMesh` (same memoized component, same `paused` prop).

- [ ] **Step 1: Move the file**

```bash
mkdir -p src/canvas/features/background
git mv src/canvas/meshes/BackgroundMesh.jsx src/canvas/features/background/BackgroundMesh.jsx
```

- [ ] **Step 2: Run the build to confirm it fails**

Run: `npm run build 2>&1 | tail -5`
Expected: FAIL, with an unresolved import for `@canvas/meshes/BackgroundMesh`.

- [ ] **Step 3: Create `src/canvas/features/background/index.js`**

```js
export { default as BackgroundMesh } from './BackgroundMesh';
```

- [ ] **Step 4: Update `src/canvas/home/HomeScene.jsx`**

Delete the line `import BackgroundMesh from '@canvas/meshes/BackgroundMesh';` and insert this line directly after `import Rig from '@canvas/core/camera/Rig';`:

```jsx
import { BackgroundMesh } from '@canvas/features/background';
```

The top of the file should now read:

```jsx
import { useQuality } from '@app/QualityContext';
import useCameraAnimation from '@canvas/core/animation/useCameraAnimation';
import useObjectAnimation from '@canvas/core/animation/useObjectAnimation';
import Rig from '@canvas/core/camera/Rig';
import { BackgroundMesh } from '@canvas/features/background';
import { LaserPlane } from '@canvas/features/laser';
import { LogoMesh } from '@canvas/features/logo';
import { BREAKPOINTS, FLOAT_CONFIG, REVEAL, SCENE, TIMEOUT } from '@config/animation.config';
import { Float, PerspectiveCamera, Text } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef, useState } from 'react';
```

- [ ] **Step 5: Verify**

```bash
npx oxfmt src/canvas
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -rn "@canvas/meshes" src
find src/canvas/meshes -type f ! -name .DS_Store 2>/dev/null
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`, and both greps print nothing.

- [ ] **Step 6: Commit**

```bash
git add src/canvas/features/background src/canvas/home/HomeScene.jsx
git status --short
git commit -m "refactor(canvas): colocate background feature" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Before committing, `Transition.glsl` must still be unstaged (` M`).

---

### Task 5: Carousel feature, with card geometry extracted

**Files:**

- Move: `src/canvas/work/WorkCard.jsx` → `src/canvas/features/carousel/WorkCard.jsx`
- Move: `src/canvas/materials/WorkCardMaterial.jsx` → `src/canvas/features/carousel/WorkCardMaterial.js`
- Move: `src/canvas/materials/PixelOverlayMaterial.jsx` → `src/canvas/features/carousel/PixelOverlayMaterial.js`
- Move: `src/canvas/shaders/workCard/workCard.vert` → `src/canvas/features/carousel/workCard.vert.glsl`
- Move: `src/canvas/shaders/workCard/workCard.frag` → `src/canvas/features/carousel/workCard.frag.glsl`
- Move: `src/canvas/shaders/pixelOverlay/pixelOverlay.vert` → `src/canvas/features/carousel/pixelOverlay.vert.glsl`
- Move: `src/canvas/shaders/pixelOverlay/pixelOverlay.frag` → `src/canvas/features/carousel/pixelOverlay.frag.glsl`
- Move: `src/config/carousel.config.js` → `src/canvas/features/carousel/carousel.config.js`
- Move: `src/utils/carousel.js` → `src/canvas/features/carousel/carousel.js`
- Move: `src/hooks/useBorderProjection.js` → `src/canvas/features/carousel/useBorderProjection.js`
- Create: `src/canvas/features/carousel/cardGeometry.js`
- Create: `src/canvas/features/carousel/index.js`
- Modify: `WorkCardMaterial.js`, `PixelOverlayMaterial.js`, `carousel.js`, `useBorderProjection.js`, `WorkCard.jsx` (all in `features/carousel/`)
- Modify: `src/canvas/work/WorkScene.jsx`, `src/canvas/work/WorkCanvas.jsx` (imports)

**Interfaces:**

- Consumes: `@canvas/core/textures/useNoiseTexture` (Task 1), already imported by `WorkCard.jsx`.
- Produces:
    - `features/carousel/cardGeometry.js` (internal): named exports `CARD_WIDTH`, `CARD_HEIGHT` (numbers, the same formula as before).
    - `@canvas/features/carousel` with named exports `WorkCard` (same props: `item, index, visible, onNavigate, centerednessRef, entryComplete, entryDelay`), `CAROUSEL_CONFIG`, `calculateCardCenteredness(rigRotation, cardIndex)` and `useBorderProjection(containerRef, cameraRef, rigRef, { rawX, rawY, rawW, rawH, springX, springY, springW, springH })`.
- Removes: the `CARD_WIDTH` / `CARD_HEIGHT` exports from `WorkCard.jsx`. The only other consumer, `useBorderProjection`, switches to `cardGeometry.js` in this task.

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/canvas/features/carousel
git mv src/canvas/work/WorkCard.jsx src/canvas/features/carousel/WorkCard.jsx
git mv src/canvas/materials/WorkCardMaterial.jsx src/canvas/features/carousel/WorkCardMaterial.js
git mv src/canvas/materials/PixelOverlayMaterial.jsx src/canvas/features/carousel/PixelOverlayMaterial.js
git mv src/canvas/shaders/workCard/workCard.vert src/canvas/features/carousel/workCard.vert.glsl
git mv src/canvas/shaders/workCard/workCard.frag src/canvas/features/carousel/workCard.frag.glsl
git mv src/canvas/shaders/pixelOverlay/pixelOverlay.vert src/canvas/features/carousel/pixelOverlay.vert.glsl
git mv src/canvas/shaders/pixelOverlay/pixelOverlay.frag src/canvas/features/carousel/pixelOverlay.frag.glsl
git mv src/config/carousel.config.js src/canvas/features/carousel/carousel.config.js
git mv src/utils/carousel.js src/canvas/features/carousel/carousel.js
git mv src/hooks/useBorderProjection.js src/canvas/features/carousel/useBorderProjection.js
```

- [ ] **Step 2: Run the build to confirm it fails**

Run: `npm run build 2>&1 | tail -5`
Expected: FAIL, with an unresolved import for one of `./WorkCard`, `@config/carousel.config`, `@utils/carousel` or `@hooks/useBorderProjection`.

- [ ] **Step 3: Fix the shader imports in both materials**

In `src/canvas/features/carousel/WorkCardMaterial.js`, replace:

```js
import fragShader from '../shaders/workCard/workCard.frag?raw';
import vertShader from '../shaders/workCard/workCard.vert?raw';
```

with:

```js
import fragShader from './workCard.frag.glsl?raw';
import vertShader from './workCard.vert.glsl?raw';
```

In `src/canvas/features/carousel/PixelOverlayMaterial.js`, replace:

```js
import fragShader from '../shaders/pixelOverlay/pixelOverlay.frag?raw';
import vertShader from '../shaders/pixelOverlay/pixelOverlay.vert?raw';
```

with:

```js
import fragShader from './pixelOverlay.frag.glsl?raw';
import vertShader from './pixelOverlay.vert.glsl?raw';
```

- [ ] **Step 4: Fix the config import in `carousel.js`**

Replace `import { CAROUSEL_CONFIG } from '@config/carousel.config';` with:

```js
import { CAROUSEL_CONFIG } from './carousel.config';
```

- [ ] **Step 5: Create `src/canvas/features/carousel/cardGeometry.js`**

```js
import { CAROUSEL_CONFIG } from './carousel.config';

// Derive card size from carousel geometry: slightly less than one polygon side
const chord = 2 * CAROUSEL_CONFIG.RADIUS * Math.sin(CAROUSEL_CONFIG.ANGLE_STEP / 2);
export const CARD_WIDTH = chord * CAROUSEL_CONFIG.CARD_GAP_FACTOR;
export const CARD_HEIGHT = CARD_WIDTH / CAROUSEL_CONFIG.CARD_ASPECT;
```

- [ ] **Step 6: Update the header of `WorkCard.jsx`**

Replace everything from the first line through the line `export const CARD_HEIGHT = CARD_WIDTH / CAROUSEL_CONFIG.CARD_ASPECT;` (the imports plus the comment, `chord`, `CARD_WIDTH` and `CARD_HEIGHT` lines) with:

```jsx
import { useQuality } from '@app/QualityContext';
import useNoiseTexture from '@canvas/core/textures/useNoiseTexture';
import { FLOAT_CONFIG } from '@config/animation.config';
import { Float, Text, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { getCSSVariable } from '@utils/cssUtils';
import { entryEase } from '@utils/easingFunctions';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { CARD_HEIGHT, CARD_WIDTH } from './cardGeometry';
import { calculateCardPosition, calculateCardRotation, calculateCardScale } from './carousel';
import { CAROUSEL_CONFIG } from './carousel.config';
import './PixelOverlayMaterial';
import './WorkCardMaterial';
```

The next existing line, `const LGHT_COLOR = getCSSVariable('--c-LGHT') || '#eee';`, and everything after it stay unchanged. `CAROUSEL_CONFIG` is still used further down (`CAROUSEL_CONFIG.ENTRY.CARD_DURATION`), so keep that import.

- [ ] **Step 7: Update the header of `useBorderProjection.js`**

Replace:

```js
import { CARD_HEIGHT, CARD_WIDTH } from '@canvas/work/WorkCard';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import { calculateCardPosition, calculateCardScale } from '@utils/carousel';
import { useCallback, useRef } from 'react';
import * as THREE from 'three';
```

with:

```js
import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { CARD_HEIGHT, CARD_WIDTH } from './cardGeometry';
import { calculateCardPosition, calculateCardScale } from './carousel';
import { CAROUSEL_CONFIG } from './carousel.config';
```

- [ ] **Step 8: Create `src/canvas/features/carousel/index.js`**

```js
export { calculateCardCenteredness } from './carousel';
export { CAROUSEL_CONFIG } from './carousel.config';
export { default as useBorderProjection } from './useBorderProjection';
export { default as WorkCard } from './WorkCard';
```

- [ ] **Step 9: Update the imports in `src/canvas/work/WorkScene.jsx`**

Replace:

```jsx
import { useQuality } from '@app/QualityContext';
import { BREAKPOINTS } from '@config/animation.config';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { calculateCardCenteredness } from '@utils/carousel';
import { entryEase } from '@utils/easingFunctions';
import { useEffect, useMemo, useRef, useState } from 'react';
import WorkCard from './WorkCard';
```

with:

```jsx
import { useQuality } from '@app/QualityContext';
import { CAROUSEL_CONFIG, calculateCardCenteredness, WorkCard } from '@canvas/features/carousel';
import { BREAKPOINTS } from '@config/animation.config';
import { useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { entryEase } from '@utils/easingFunctions';
import { useEffect, useMemo, useRef, useState } from 'react';
```

- [ ] **Step 10: Update the imports in `src/canvas/work/WorkCanvas.jsx`**

Replace:

```jsx
import CanvasRoot from '@canvas/core/CanvasRoot';
import NineSliceBorder from '@components/ui/NineSliceBorder';
import { SPRING_CONFIG } from '@config/animation.config';
import { CAROUSEL_CONFIG } from '@config/carousel.config';
import useBorderProjection from '@hooks/useBorderProjection';
```

with:

```jsx
import CanvasRoot from '@canvas/core/CanvasRoot';
import { CAROUSEL_CONFIG, useBorderProjection } from '@canvas/features/carousel';
import NineSliceBorder from '@components/ui/NineSliceBorder';
import { SPRING_CONFIG } from '@config/animation.config';
```

- [ ] **Step 11: Verify**

```bash
npx oxfmt src/canvas
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -rnE "@canvas/work/WorkCard|@config/carousel\.config|@utils/carousel|@hooks/useBorderProjection|materials/(WorkCard|PixelOverlay)Material|shaders/(workCard|pixelOverlay)" src
grep -rn "export const CARD_WIDTH" src
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.` The first grep prints nothing. The second prints only `src/canvas/features/carousel/cardGeometry.js`.

- [ ] **Step 12: Commit**

```bash
git add src/canvas/features/carousel src/canvas/work/WorkScene.jsx src/canvas/work/WorkCanvas.jsx
git status --short
git commit -m "refactor(canvas): colocate carousel feature and extract card geometry" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Before committing, `Transition.glsl` must still be unstaged (` M`).

---

### Task 6: Transition and lab shaders (WIP-safe move)

`Transition.glsl` has uncommitted user edits. `git mv` stages only the rename (using the committed content) and carries the working-tree edits along as an unstaged modification at the new path. This commit must contain renames only.

**Files:**

- Move: `src/canvas/shaders/transition/Transition.vert` → `src/canvas/features/transition/transition.vert.glsl`
- Move: `src/canvas/shaders/transition/Transition.glsl` → `src/canvas/features/transition/transition.frag.glsl` (it is the fragment shader: it writes `gl_FragColor`)
- Move: `src/canvas/shaders/Flame.glsl` → `src/canvas/features/lab/flame.glsl`

**Interfaces:**

- Consumes: nothing.
- Produces: nothing importable. Neither folder gets an `index.js` until a component consumes these shaders.

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/canvas/features/transition src/canvas/features/lab
git mv src/canvas/shaders/transition/Transition.vert src/canvas/features/transition/transition.vert.glsl
git mv src/canvas/shaders/transition/Transition.glsl src/canvas/features/transition/transition.frag.glsl
git mv src/canvas/shaders/Flame.glsl src/canvas/features/lab/flame.glsl
```

- [ ] **Step 2: Check the staging state**

Run: `git status --short`
Expected, exactly these three lines (in any order):

```
R  src/canvas/shaders/Flame.glsl -> src/canvas/features/lab/flame.glsl
R  src/canvas/shaders/transition/Transition.vert -> src/canvas/features/transition/transition.vert.glsl
RM src/canvas/shaders/transition/Transition.glsl -> src/canvas/features/transition/transition.frag.glsl
```

`RM` means the rename is staged and the user's edits are unstaged. Do **not** run `git add` on any of these paths.

- [ ] **Step 3: Verify that nothing else references the old shader folder**

```bash
find src/canvas/shaders -type f ! -name .DS_Store 2>/dev/null
grep -rn "shaders/" src --include='*.js' --include='*.jsx'
npm run build >/dev/null && echo BUILD_OK
```

Expected: `find` prints nothing, `grep` prints nothing, `BUILD_OK`.

- [ ] **Step 4: Commit the renames only (no `git add`, no `-a`)**

```bash
git commit -m "refactor(canvas): move transition and lab shaders into features" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git show --stat --summary HEAD | grep -E "rename|changed"
git status --short
```

Expected: three `rename ... (100%)` lines and `3 files changed, 0 insertions(+), 0 deletions(-)`. Then `git status --short` prints exactly ` M src/canvas/features/transition/transition.frag.glsl` (the user's WIP, still uncommitted).

---

### Task 7: Scenes and scene-owned container CSS

**Files:**

- Move: `src/canvas/home/HomeCanvas.jsx` → `src/canvas/scenes/home/HomeCanvas.jsx`
- Move: `src/canvas/home/HomeScene.jsx` → `src/canvas/scenes/home/HomeScene.jsx`
- Move: `src/canvas/work/WorkCanvas.jsx` → `src/canvas/scenes/work/WorkCanvas.jsx`
- Move: `src/canvas/work/WorkScene.jsx` → `src/canvas/scenes/work/WorkScene.jsx`
- Create: `src/canvas/scenes/home/HomeCanvas.module.css`
- Create: `src/canvas/scenes/work/WorkCanvas.module.css`
- Modify: `src/canvas/scenes/home/HomeCanvas.jsx`, `src/canvas/scenes/work/WorkCanvas.jsx` (CSS import)
- Modify: `src/routes/Home/Home.module.css`, `src/routes/Work/Work.module.css` (remove moved rules)
- Modify: `src/routes/Home/Home.jsx`, `src/routes/Work/Work.jsx` (lazy import paths)

**Interfaces:**

- Consumes: `@canvas/core/CanvasRoot` (Task 1), `@canvas/features/{logo,laser,background,carousel}` (Tasks 2–5).
- Produces: `@canvas/scenes/home/HomeCanvas` (default export, props `scrollProgress, startAnimations, onSceneReady`) and `@canvas/scenes/work/WorkCanvas` (default export, props `items, onCardNavigate, onScrollChange, startAnimations`). These are the only canvas modules routes import.

Neither `Home.jsx` nor `Work.jsx` uses `.canvasContainer` or `.scrollContent` (checked 2026-10-01), so removing these classes from the route CSS modules is safe. Step 7 re-checks this.

- [ ] **Step 1: Move the files**

```bash
mkdir -p src/canvas/scenes/home src/canvas/scenes/work
git mv src/canvas/home/HomeCanvas.jsx src/canvas/scenes/home/HomeCanvas.jsx
git mv src/canvas/home/HomeScene.jsx src/canvas/scenes/home/HomeScene.jsx
git mv src/canvas/work/WorkCanvas.jsx src/canvas/scenes/work/WorkCanvas.jsx
git mv src/canvas/work/WorkScene.jsx src/canvas/scenes/work/WorkScene.jsx
```

- [ ] **Step 2: Run the build to confirm it fails**

Run: `npm run build 2>&1 | tail -5`
Expected: FAIL, with an unresolved import for `@canvas/home/HomeCanvas` or `@canvas/work/WorkCanvas`.

- [ ] **Step 3: Point the routes at the scenes**

In `src/routes/Home/Home.jsx`, replace:

```jsx
const HomeCanvas = lazy(() => import('@canvas/home/HomeCanvas'));
```

with:

```jsx
const HomeCanvas = lazy(() => import('@canvas/scenes/home/HomeCanvas'));
```

In `src/routes/Work/Work.jsx`, replace:

```jsx
const WorkCanvas = lazy(() => import('@canvas/work/WorkCanvas'));
```

with:

```jsx
const WorkCanvas = lazy(() => import('@canvas/scenes/work/WorkCanvas'));
```

- [ ] **Step 4: Create `src/canvas/scenes/home/HomeCanvas.module.css`**

```css
.canvasContainer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: -1;
    pointer-events: none;
}

/* Mobile */
@media (max-width: 768px) {
    .canvasContainer {
        width: 100%;
    }
}
```

- [ ] **Step 5: Create `src/canvas/scenes/work/WorkCanvas.module.css`**

```css
.canvasContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    z-index: 0;
    pointer-events: all;
    touch-action: pan-y;
    overflow-y: auto;
    scrollbar-width: none;
}

@media (max-width: 768px) {
    .canvasContainer {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        touch-action: pan-x;
    }
}

.canvasContainer::-webkit-scrollbar {
    display: none;
}

.scrollContent {
    pointer-events: none;
}
```

- [ ] **Step 6: Switch the scenes to their own CSS modules**

In `src/canvas/scenes/home/HomeCanvas.jsx`, replace the import block:

```jsx
import CanvasRoot from '@canvas/core/CanvasRoot';
import styles from '@routes/Home/Home.module.css';
import HomeScene from './HomeScene';
```

with:

```jsx
import CanvasRoot from '@canvas/core/CanvasRoot';
import styles from './HomeCanvas.module.css';
import HomeScene from './HomeScene';
```

In `src/canvas/scenes/work/WorkCanvas.jsx`, delete the line `import styles from '@routes/Work/Work.module.css';` and replace `import WorkScene from './WorkScene';` with:

```jsx
import styles from './WorkCanvas.module.css';
import WorkScene from './WorkScene';
```

The WorkCanvas import block should now read:

```jsx
import CanvasRoot from '@canvas/core/CanvasRoot';
import { CAROUSEL_CONFIG, useBorderProjection } from '@canvas/features/carousel';
import NineSliceBorder from '@components/ui/NineSliceBorder';
import { SPRING_CONFIG } from '@config/animation.config';
import { PerspectiveCamera } from '@react-three/drei';
import Lenis from 'lenis';
import { useMotionValue, useSpring } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import styles from './WorkCanvas.module.css';
import WorkScene from './WorkScene';
```

- [ ] **Step 7: Remove the moved rules from the route CSS modules**

First re-check that the route JSX doesn't use these classes:

Run: `grep -rnE "canvasContainer|scrollContent" src/routes --include='*.jsx'`
Expected: nothing.

In `src/routes/Home/Home.module.css`, delete this block and the blank line after it:

```css
.canvasContainer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    z-index: -1;
    pointer-events: none;
}
```

and inside the `/* Mobile */ @media (max-width: 768px)` block, replace:

```css
    .quote,
    .accentsBottom,
    .side,
    .name {
        display: none !important;
    }

    .canvasContainer {
        width: 100%;
    }
}
```

with:

```css
    .quote,
    .accentsBottom,
    .side,
    .name {
        display: none !important;
    }
}
```

In `src/routes/Work/Work.module.css`, delete this whole run of rules and the blank line after it (it sits between `.pageContainer { ... }` and `.touchHint {`):

```css
.canvasContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    height: 100dvh;
    z-index: 0;
    pointer-events: all;
    touch-action: pan-y;
    overflow-y: auto;
    scrollbar-width: none;
}

@media (max-width: 768px) {
    .canvasContainer {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        touch-action: pan-x;
    }
}

.canvasContainer::-webkit-scrollbar {
    display: none;
}

.scrollContent {
    pointer-events: none;
}
```

- [ ] **Step 8: Verify**

```bash
npx oxfmt src/canvas src/routes/Home src/routes/Work
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
grep -rnE "@canvas/(home|work)/" src
grep -rn "@routes/" src/canvas
grep -rnE "canvasContainer|scrollContent" src/routes
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`, and all three greps print nothing.

- [ ] **Step 9: Commit**

```bash
git add src/canvas/scenes src/routes/Home/Home.jsx src/routes/Home/Home.module.css src/routes/Work/Work.jsx src/routes/Work/Work.module.css
git status --short
git commit -m "refactor(canvas): move scenes and own container styles" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Before committing, `transition.frag.glsl` must still be unstaged (` M`).

---

### Task 8: Cleanup, documentation and final verification

**Files:**

- Delete: empty directories left under `src/canvas` (not tracked by git)
- Modify: `COMPONENT_DOCUMENTATION.md` (canvas paths, `CanvasRoot`, `LaserPlane` props, dependency maps, new architecture section)

**Interfaces:**

- Consumes: the final layout from Tasks 1–7.
- Produces: nothing new in code.

- [ ] **Step 1: Remove empty directories**

```bash
find src/canvas -name .DS_Store -delete
find src/canvas -type d -empty -print -delete
```

Expected: prints the leftover empty folders (some or all of `src/canvas/camera`, `effects`, `home`, `materials`, `meshes`, `shaders/glass`, `shaders/laser`, `shaders/workCard`, `shaders/pixelOverlay`, `shaders/transition`, `shaders`, `work`) and removes them. `.DS_Store` files are untracked macOS metadata (`git ls-files src/canvas | grep DS_Store` prints nothing).

- [ ] **Step 2: Check the final tree**

Run: `find src/canvas -type f | sort`
Expected: exactly these 42 files (sort order may differ):

```
src/canvas/core/CanvasRoot.jsx
src/canvas/core/animation/useCameraAnimation.js
src/canvas/core/animation/useObjectAnimation.js
src/canvas/core/camera/Rig.jsx
src/canvas/core/canvas.config.js
src/canvas/core/quality/useAdaptiveQuality.js
src/canvas/core/textures/useNoiseTexture.js
src/canvas/core/textures/useVideoTexture.js
src/canvas/features/background/BackgroundMesh.jsx
src/canvas/features/background/index.js
src/canvas/features/carousel/PixelOverlayMaterial.js
src/canvas/features/carousel/WorkCard.jsx
src/canvas/features/carousel/WorkCardMaterial.js
src/canvas/features/carousel/cardGeometry.js
src/canvas/features/carousel/carousel.config.js
src/canvas/features/carousel/carousel.js
src/canvas/features/carousel/index.js
src/canvas/features/carousel/pixelOverlay.frag.glsl
src/canvas/features/carousel/pixelOverlay.vert.glsl
src/canvas/features/carousel/useBorderProjection.js
src/canvas/features/carousel/workCard.frag.glsl
src/canvas/features/carousel/workCard.vert.glsl
src/canvas/features/lab/flame.glsl
src/canvas/features/laser/LaserFlowMaterial.js
src/canvas/features/laser/LaserPlane.jsx
src/canvas/features/laser/index.js
src/canvas/features/laser/laser.config.js
src/canvas/features/laser/laser.frag.glsl
src/canvas/features/laser/laser.vert.glsl
src/canvas/features/logo/GlassLogoMaterial.js
src/canvas/features/logo/LogoMesh.jsx
src/canvas/features/logo/glass.frag.glsl
src/canvas/features/logo/glass.vert.glsl
src/canvas/features/logo/index.js
src/canvas/features/transition/transition.frag.glsl
src/canvas/features/transition/transition.vert.glsl
src/canvas/scenes/home/HomeCanvas.jsx
src/canvas/scenes/home/HomeCanvas.module.css
src/canvas/scenes/home/HomeScene.jsx
src/canvas/scenes/work/WorkCanvas.jsx
src/canvas/scenes/work/WorkCanvas.module.css
src/canvas/scenes/work/WorkScene.jsx
```

- [ ] **Step 3: Run the spec's stale-path and layer checks**

```bash
grep -rnE "@canvas/(camera|effects|home|materials|meshes|shaders|work)/|@hooks/(useAdaptiveQuality|useBorderProjection|useCameraAnimation|useObjectAnimation|useNoiseTexture|useVideoTexture)|@config/(canvas|carousel|laser)\.config|@utils/carousel" src
grep -rn "@routes/" src/canvas
grep -rnE "@canvas/(features|scenes)" src/canvas/core src/canvas/features
grep -rn "@canvas/" src | grep -v "^src/canvas/"
```

Expected: the first three print nothing. The fourth prints exactly two lines, the lazy imports of `@canvas/scenes/home/HomeCanvas` in `src/routes/Home/Home.jsx` and `@canvas/scenes/work/WorkCanvas` in `src/routes/Work/Work.jsx`.

(The third check passes because files inside a feature import their siblings relatively and only reach outward to `@canvas/core/...`.)

- [ ] **Step 4: Update `COMPONENT_DOCUMENTATION.md`**

This file's maintenance note requires updating it when paths change. Make these edits:

1. Directly under the heading `## 6 — Canvas & Scene Components`, insert:

```markdown
### 6.0 — Canvas Architecture

`src/canvas` is split into three layers. Imports flow one way only: `scenes → features → core`.

- **`core/`**: generic 3D infrastructure (`CanvasRoot`, quality, animation and texture hooks, camera `Rig`). Never imports features or scenes.
- **`features/<name>/`**: one folder per visual unit, with its component, material, shaders and config colocated. `index.js` is the public API. Features never import other features or scenes.
- **`scenes/<route>/`**: composition roots (`HomeCanvas`/`HomeScene`, `WorkCanvas`/`WorkScene`). The only canvas modules routes import.

Nothing in `src/canvas` imports `@routes/*`. Shaders are named `<name>.vert.glsl` / `<name>.frag.glsl`.

---
```

2. Path replacements (each appears once):

| Find                                                   | Replace with                                           |
| ------------------------------------------------------ | ------------------------------------------------------ |
| `src/canvas/home/HomeCanvas.jsx`                       | `src/canvas/scenes/home/HomeCanvas.jsx`                |
| `src/canvas/home/HomeScene.jsx`                        | `src/canvas/scenes/home/HomeScene.jsx`                 |
| `src/canvas/home/LaserPlane.jsx`                       | `src/canvas/features/laser/LaserPlane.jsx`             |
| `src/canvas/work/WorkCanvas.jsx`                       | `src/canvas/scenes/work/WorkCanvas.jsx`                |
| `src/canvas/work/WorkScene.jsx`                        | `src/canvas/scenes/work/WorkScene.jsx`                 |
| `src/canvas/work/WorkCard.jsx`                         | `src/canvas/features/carousel/WorkCard.jsx`            |
| `src/canvas/shared/camera/Rig.jsx`                     | `src/canvas/core/camera/Rig.jsx`                       |
| `src/canvas/shared/meshes/BackgroundMesh.jsx`          | `src/canvas/features/background/BackgroundMesh.jsx`    |
| `src/canvas/shared/meshes/LogoMesh.jsx`                | `src/canvas/features/logo/LogoMesh.jsx`                |
| `src/canvas/work/WorkCardMaterial.jsx`                 | `src/canvas/features/carousel/WorkCardMaterial.js`     |
| `src/canvas/shared/materials/GlassLogoMaterial.jsx`    | `src/canvas/features/logo/GlassLogoMaterial.js`        |
| `src/canvas/shared/materials/LaserFlowMaterial.jsx`    | `src/canvas/features/laser/LaserFlowMaterial.js`       |
| `src/canvas/shared/materials/PixelOverlayMaterial.jsx` | `src/canvas/features/carousel/PixelOverlayMaterial.js` |

3. `HomeCanvas` section: replace the paragraph starting "Creates the R3F `<Canvas>` with project-preferred WebGL settings" with:

```markdown
Renders `CanvasRoot` (shared `<Canvas>` with project DPR/GL defaults and the adaptive quality monitor) inside a fixed container styled by `HomeCanvas.module.css`, and passes scroll/animation props to `HomeScene`.
```

In its table row, set Hooks to `—`, Config to `—` and Children to `` `CanvasRoot`, `HomeScene` ``.

4. `LaserPlane` section: replace the bullet starting "- Props: `flowSpeed`, `wispSpeed`" with:

```markdown
- Prop: `progress` (0–1 scroll progress). For each key of `LASER_PARAMS` (colocated `laser.config.js`) it computes `base + progress * scale` and passes the result to the internal `LaserFlow` component.
```

In its table row, set Config to `` `LASER_PARAMS` ``.

5. `WorkCanvas` section table row: remove `` `CANVAS_DPR`, `CANVAS_GL_DEFAULTS` `` from Config (leaving `` `SPRING_CONFIG`, `CAROUSEL_CONFIG` ``) and add `` `CanvasRoot` `` to the front of Children.

6. "Custom Hook → Consumer Map": set the `useAdaptiveQuality` consumers to `` `CanvasRoot` (via `AdaptiveQualityMonitor`) ``.

7. "Config File → Consumer Map":
    - `canvas.config.js` row: Config Module `canvas/core/canvas.config.js`, Consumers `` `CanvasRoot` ``.
    - `carousel.config.js` row: Config Module `canvas/features/carousel/carousel.config.js`, and change `` `carousel.js` utils `` to `` `carousel.js` ``, `` `cardGeometry.js` ``.
    - `laser.config.js` row: Config Module `canvas/features/laser/laser.config.js`, Consumers `` `LaserPlane` ``.

Then realign the tables and check:

```bash
npx oxfmt COMPONENT_DOCUMENTATION.md
grep -nE "src/canvas/(home|work|shared)/|AdaptiveQualityMonitor\` component" COMPONENT_DOCUMENTATION.md
```

Expected: the grep prints nothing.

- [ ] **Step 5: Full automated verification**

```bash
npm run build >/dev/null && echo BUILD_OK
npm run lint
npm run fmt:check
```

Expected: `BUILD_OK`, no lint output, `All matched files use the correct format.`

- [ ] **Step 6: Manual behavior check in the dev server**

Run `npm run dev` and open `http://localhost:3000`. For a side-by-side comparison with `master`, optionally run:

```bash
git worktree add ../portfolio-master master
cd ../portfolio-master && npm ci && npm run dev -- --port 3001
```

Then compare `http://localhost:3001`. Check every item:

- **Home:** loading screen → reveal; logo glass refraction; background video plays and pauses after scrolling past 0.4; the laser grows and shifts as you scroll (horizontal/vertical sizing, fog, wisps); camera and object scroll animations; rig parallax on mouse move; no console errors.
- **Work:** carousel scrolls (vertically on desktop, horizontally at ≤768px width), with the scrollbar hidden; the border frame tracks the centered card; card hover cursor and click navigation; entry animation; no console errors.
- **Adaptive quality:** with DevTools CPU throttling at 6×, quality still drops (visible as bloom/AO changes) on both pages.

Remove the comparison worktree afterwards: `git worktree remove ../portfolio-master`.

- [ ] **Step 7: Commit**

```bash
git add COMPONENT_DOCUMENTATION.md
git status --short
git commit -m "docs: update component docs for canvas architecture" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git log --oneline master..HEAD
```

Expected: after committing, `git status --short` shows only ` M src/canvas/features/transition/transition.frag.glsl`. The log shows the 2 spec commits, the plan commit and the 8 task commits.

Pushing and opening a PR are not part of this plan. Ask the user first.
