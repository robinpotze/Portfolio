# Canvas Architecture Restructure — Design

**Date:** 2026-10-01
**Status:** Approved for planning
**Branch:** `refactor/canvas-architecture`

## Context

This is sub-project 1 of 3:

1. **Canvas restructure** (this spec): reorganize `src/canvas` and its satellite hooks, configs and utils into a `core / features / scenes` architecture. Pure refactor, no visual or behavioral change.
2. **GPGPU particle engine + logo particles**: its own spec, written against the layout defined here.
3. **Routes/components restructure**: its own spec, after particles.

## Problems with the current layout

- **Type-based folders separate things that change together.** A material in `canvas/materials/` imports its shaders from `canvas/shaders/<name>/`, and the component that uses it lives in `canvas/meshes/`, `canvas/effects/` or `canvas/work/`. One visual effect is spread over three folders.
- **Dependencies point the wrong way.**
  - `canvas/home/HomeCanvas.jsx` imports `@routes/Home/Home.module.css`.
  - `canvas/work/WorkCanvas.jsx` imports `@routes/Work/Work.module.css`.
  - `hooks/useBorderProjection.js` imports `CARD_WIDTH` and `CARD_HEIGHT` from the `canvas/work/WorkCard.jsx` component.
- **Canvas-only code sits in app-wide folders.**
  - `src/hooks`: useAdaptiveQuality, useBorderProjection, useCameraAnimation, useObjectAnimation, useNoiseTexture, useVideoTexture.
  - `src/config`: canvas.config, carousel.config, laser.config.
  - `src/utils`: carousel.js.
- **Duplication.** `AdaptiveQualityMonitor` and the `<Canvas>` setup (DPR, gl defaults) are copy-pasted in HomeCanvas and WorkCanvas.
- **Naming drift.** Shader files use `.glsl`, `.frag` and `.vert` inconsistently. Material files use `.jsx` but contain no JSX.
- **Orphans.** `shaders/Flame.glsl` is imported nowhere. `shaders/transition/*` is unused and work in progress (`Transition.glsl` has uncommitted edits).

## Architecture

Three layers inside `src/canvas`. Dependencies flow in one direction only:

```
scenes  ──▶  features  ──▶  core
```

- **core/**: generic 3D infrastructure with no knowledge of portfolio content. Canvas setup, quality, animation hooks, texture hooks and the camera rig. The particle engine and fluid sim from sub-project 2 will also live here.
- **features/**: one folder per visual unit. Each folder holds its component, material, shaders, config and feature-specific hooks and utils. `index.js` is the feature's public API.
- **scenes/**: composition roots, one per route. They compose features inside a `CanvasRoot`. Scenes are the only canvas modules that routes import.

### Rules

1. Routes import only `@canvas/scenes/*` (via `lazy()` as today).
2. A feature never imports another feature or a scene.
3. Core never imports features or scenes.
4. Nothing in `src/canvas` imports `@routes/*`.
5. Code outside a feature imports it only through the feature's `index.js`.
6. Shader files are named `<name>.vert.glsl` / `<name>.frag.glsl`. A single-file shader stays as `<name>.glsl`.
7. Material modules use the `.js` extension. They keep self-registering with R3F through `extend()` as a side effect, imported by the feature's component.
8. Folder names are lowercase camelCase (`logo`, `laser`, `carousel`). Component files are PascalCase.
9. Any canvas layer may import app-wide shared modules: `@app/*`, `@config/*`, `@utils/*`, `@components/*`, `@hooks/*`. For example, WorkCanvas keeps importing `@components/ui/NineSliceBorder`.

### What stays where it is

These are used by DOM code too, or are app-level state:

- `src/app/QualityContext.jsx`
- `src/utils/deviceCapability.js`, `src/utils/easingFunctions.js`, `src/utils/cssUtils.js`
- `src/config/animation.config.js`
- The `@canvas` alias. No new aliases are added.

## Target layout and file mapping

```
src/canvas/
  core/
    CanvasRoot.jsx                    NEW — shared <Canvas> wrapper (see below)
    canvas.config.js                  ← src/config/canvas.config.js
    quality/useAdaptiveQuality.js     ← src/hooks/useAdaptiveQuality.js
    animation/useObjectAnimation.js   ← src/hooks/useObjectAnimation.js
    animation/useCameraAnimation.js   ← src/hooks/useCameraAnimation.js
    textures/useNoiseTexture.js       ← src/hooks/useNoiseTexture.js
    textures/useVideoTexture.js       ← src/hooks/useVideoTexture.js
    camera/Rig.jsx                    ← src/canvas/camera/Rig.jsx
  features/
    logo/
      index.js
      LogoMesh.jsx                    ← src/canvas/meshes/LogoMesh.jsx
      GlassLogoMaterial.js            ← src/canvas/materials/GlassLogoMaterial.jsx
      glass.vert.glsl                 ← src/canvas/shaders/glass/GlassVert.glsl
      glass.frag.glsl                 ← src/canvas/shaders/glass/GlassFrag.glsl
    laser/
      index.js
      LaserPlane.jsx                  ← src/canvas/effects/LaserPlane.jsx
      LaserFlowMaterial.js            ← src/canvas/materials/LaserFlowMaterial.jsx
      laser.vert.glsl                 ← src/canvas/shaders/laser/laser.vert
      laser.frag.glsl                 ← src/canvas/shaders/laser/laser.frag
      laser.config.js                 ← src/config/laser.config.js
    background/
      index.js
      BackgroundMesh.jsx              ← src/canvas/meshes/BackgroundMesh.jsx
    carousel/
      index.js
      WorkCard.jsx                    ← src/canvas/work/WorkCard.jsx
      WorkCardMaterial.js             ← src/canvas/materials/WorkCardMaterial.jsx
      PixelOverlayMaterial.js         ← src/canvas/materials/PixelOverlayMaterial.jsx
      workCard.vert.glsl              ← src/canvas/shaders/workCard/workCard.vert
      workCard.frag.glsl              ← src/canvas/shaders/workCard/workCard.frag
      pixelOverlay.vert.glsl          ← src/canvas/shaders/pixelOverlay/pixelOverlay.vert
      pixelOverlay.frag.glsl          ← src/canvas/shaders/pixelOverlay/pixelOverlay.frag
      carousel.config.js              ← src/config/carousel.config.js
      carousel.js                     ← src/utils/carousel.js
      cardGeometry.js                 NEW — CARD_WIDTH / CARD_HEIGHT extracted from WorkCard.jsx
      useBorderProjection.js          ← src/hooks/useBorderProjection.js
    transition/
      transition.vert.glsl            ← src/canvas/shaders/transition/Transition.vert
      transition.frag.glsl            ← src/canvas/shaders/transition/Transition.glsl
    lab/
      flame.glsl                      ← src/canvas/shaders/Flame.glsl
  scenes/
    home/
      HomeCanvas.jsx                  ← src/canvas/home/HomeCanvas.jsx
      HomeCanvas.module.css           NEW — .canvasContainer moved from routes/Home/Home.module.css
      HomeScene.jsx                   ← src/canvas/home/HomeScene.jsx
    work/
      WorkCanvas.jsx                  ← src/canvas/work/WorkCanvas.jsx
      WorkCanvas.module.css           NEW — .canvasContainer, .scrollContent and related rules moved from routes/Work/Work.module.css
      WorkScene.jsx                   ← src/canvas/work/WorkScene.jsx
```

`transition/` and `lab/` hold unused shaders. They get no `index.js` until a component consumes them.

After the move, these old folders are empty and get removed: `canvas/camera`, `canvas/effects`, `canvas/home`, `canvas/materials`, `canvas/meshes`, `canvas/shaders`, `canvas/work`.

## Logic relocations

These are the only changes beyond moving and renaming files. Each must produce identical runtime output.

### 1. `CanvasRoot`

`core/CanvasRoot.jsx` replaces the duplicated setup in HomeCanvas and WorkCanvas. It renders `<Canvas>` with:

- `dpr={CANVAS_DPR}`
- `gl={{ ...CANVAS_GL_DEFAULTS, ...gl }}`
- an internal `AdaptiveQualityMonitor` that calls `useAdaptiveQuality({ enabled: adaptiveQuality })`

Every other prop is forwarded to `<Canvas>`, and `children` render inside it. Each scene keeps its current props exactly:

- **HomeCanvas:** `gl={{ antialias: true }}`, `performance={{ min: 0.5 }}`, `eventSource={document.getElementById('root')}`, `eventPrefix="client"`, `adaptiveQuality={startAnimations}`.
- **WorkCanvas:** `gl={{ antialias: false }}`, `performance={{ min: 0.5 }}`, `style={canvasStyle}`, `adaptiveQuality={startAnimations}`.

The monitor must stay the first child inside `<Canvas>`, as it is today.

### 2. `cardGeometry.js`

`CARD_WIDTH`, `CARD_HEIGHT` and the `chord` calculation move out of `WorkCard.jsx` into `features/carousel/cardGeometry.js`. Both `WorkCard.jsx` and `useBorderProjection.js` import from it. This removes the hook → component dependency.

### 3. Laser parameter mapping

`routes/Home/Home.jsx` currently builds `laserParams` from `LASER_PARAMS` and `scrollProgress` (`base + progress * scale` per key) and passes it down through HomeCanvas and HomeScene to LaserPlane. After the change:

- `LaserPlane` accepts a `progress` prop and computes the params internally from its colocated `laser.config.js`.
- `HomeScene` passes `progress={scrollProgress}`.
- `Home.jsx` drops its `LASER_PARAMS` import, its `laserProgress`/`laserParams` memo and the `laserParams` prop.

This is equivalent because LaserPlane only renders when `startAnimations` (= `sceneStarted`) is true, and in that state `laserProgress === scrollProgress`.

### 4. Scene-owned container CSS

The canvas container styles move from the route CSS modules into the scene CSS modules listed above, including media queries and the `::-webkit-scrollbar` rule for Work. The classes are then removed from the route CSS modules. Neither `Home.jsx` nor `Work.jsx` references `.canvasContainer` or `.scrollContent` (checked 2026-10-01).

## Migration mechanics

- Move every file with `git mv` so history is preserved. `Transition.glsl` has uncommitted user edits. `git mv` carries the working-tree changes along, and those edits must **not** be committed as part of this work: stage only the rename, or leave the file unstaged.
- Shader imports keep the `?raw` suffix and only their paths change.
- Commit in slices. Each commit must build on its own:
  1. core (hooks, config, Rig, CanvasRoot)
  2. logo
  3. laser (including the param relocation)
  4. background
  5. carousel (including cardGeometry)
  6. transition + lab
  7. scenes (including the CSS move and CanvasRoot adoption)
  8. cleanup (empty folders, stale references)

## Verification

The repo has no test runner. Every slice is verified with:

1. `npm run build` succeeds.
2. `npm run lint` and `npm run fmt:check` pass.
3. No stale paths: `grep -rnE "@canvas/(camera|effects|home|materials|meshes|shaders|work)/|@hooks/(useAdaptiveQuality|useBorderProjection|useCameraAnimation|useObjectAnimation|useNoiseTexture|useVideoTexture)|@config/(canvas|carousel|laser)\.config|@utils/carousel" src` returns nothing.
4. Layer rules hold:
   - `grep -rn "@routes/" src/canvas` returns nothing.
   - No file under `src/canvas/features/<a>/` imports `@canvas/features/<b>` or `@canvas/scenes`.
   - No file under `src/canvas/core/` imports `@canvas/features` or `@canvas/scenes`.

After the last slice, do a manual behavior check in the dev server against `master`:

- **Home:** loading → reveal, logo glass refraction, background video, laser response to scroll, camera and object scroll animations, rig parallax, adaptive quality still switching.
- **Work:** carousel scroll (vertical on desktop, horizontal on mobile width), border projection tracking the centered card, card hover and click navigation, entry animation.

## Out of scope

- Restructuring routes and components (sub-project 3).
- Particle engine work (sub-project 2).
- Lint-level enforcement of the layer rules (`no-restricted-imports`). Can be added later.
- Any visual, performance or behavioral change.
