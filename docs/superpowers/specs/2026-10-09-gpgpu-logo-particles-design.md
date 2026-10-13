# GPGPU Logo Particles — Design

**Date:** 2026-10-09 (amended 2026-10-13)
**Status:** Approved for planning
**Branch:** `feat/gpgpu-particles`

## Context

This is sub-project 2 of the canvas roadmap. Sub-project 1, the `core / features / scenes` restructure, was merged in PR #59. The whole portfolio is modelled on activetheory.net, and this spec brings its signature effect to the home page: the logo is drawn as particles.

The page tells a three-step story: order, then identity, then work.

1. **Order:** the page opens on a dot-matrix panel.
2. **Identity:** scrolling pulls the dots out of the panel, and they assimilate into the logo. At the end of the home scroll only the logo is left.
3. **Work:** the page moves to the Work route with the logo formed. Turning the logo into a datastream around the work cards is a separate spec, sub-project 2b (see Non-goals).

The particle simulation runs on the GPU (GPGPU). Each particle's position is one texel in a float texture. Every frame a fragment shader reads the previous positions and writes new ones into a second texture, and the two textures swap. This is called "ping-pong". The visible particles are a single `THREE.Points` draw call that reads its positions from that texture.

### Revision history

- **2026-10-09:** original design. The particles assembled from a cloud on reveal and scattered on scroll, and took their color from `blackwall.mp4`.
- **2026-10-13:** the choreography changed. The page now opens on a dot-matrix grid that assimilates into the logo on scroll. The particles are brand-colored. The "ROBIN POTZE" title rises out of frame on scroll. This spec also absorbs three refinements from the implementation plan: no `isWebGL2` check, a `null` fluid texture, and a ref returned from `useFluidSim`.

### Implementation status

Built on `feat/gpgpu-particles` from the original design, and still valid:

- metallic matcap fallback logo, with the pointer tilt moved into `HomeScene` (718b399);
- one shared video texture owned by `HomeScene` (3a8f285);
- GPU simulation, the float-support switch, and seeding each particle at its resting position (7056c45, 0667633);
- matcap highlight and sparkle shading (8e41366).

Still to build, as covered by this amendment:

- the grid → logo choreography;
- the power-on intro;
- brand color in place of video color;
- the rising title;
- the mouse fluid;
- docs.

## Goals

- The home logo is made of particles sampled from the surface of `public/assets/3d/Logo.glb`.
- **Start:** the particles form a flat 16:9 dot-matrix panel behind the logo's position. Several particles share each dot.
- **Intro:** during the reveal the panel "powers on": each dot grows from size 0 to full, staggered diagonally across the panel.
- **Scroll:** as `scrollProgress` rises, the dots split apart and assimilate into the logo. They swirl in transit, and each particle lags by a small random amount. The logo is fully formed at `SCROLL_THRESHOLDS.HOME_TRANSITION`, which is when the page moves to Work.
- **Title:** the "ROBIN POTZE" text rises out of frame on the same scroll curve, so that only the logo pops out.
- **Mouse:** on medium and high quality, pointer movement pushes the particles through a small screen-space fluid simulation.
- **Look:** particles use the brand color (`--c-brnd_100`), with a small rotating matcap highlight blended on top and a few sparkles that catch the bloom.
- **Cost:** it runs on every quality tier with a per-tier budget. Devices that cannot render to float textures get a cheap metallic logo instead.
- The expensive glass logo is removed: its refraction shader and the per-frame scene re-render into an offscreen target both go. This part is done.

## Non-goals

- **Sub-project 2b, the Work datastream.** On Work the particles form from the logo into a datastream that spirals through the card centers. It has its own spec. The handoff is "staged": Home ends with the formed logo, the curtain covers the swap, and the Work canvas starts its own particles as that same logo. Sub-project 2b is also where the particle setup moves into a shared hook, because Work is its second consumer.
- One persistent canvas across routes. That belongs to the later page-transitions work.
- A general behavior-composition engine or editor (Active Theory's Proton/Antimatter). Shaders are plain files that share chunks through `#include`.
- Changes to page transitions, the work page or the routes.
- Adding a test runner. Nothing in this spec is plain logic worth unit-testing (see Verification).

## Building blocks already available

| Need                                                       | Use                                                                                          | Source                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Ping-pong simulation, starting textures, half-float switch | `GPUComputationRenderer`                                                                     | `three/addons/misc/GPUComputationRenderer.js`                    |
| Area-weighted points on the logo surface                   | `MeshSurfaceSampler`                                                                         | `three/addons/math/MeshSurfaceSampler.js`                        |
| Shared GLSL chunks                                         | `#include`                                                                                   | `vite-plugin-glsl` (already configured in `vite.config.mjs`)     |
| Brand color                                                | `getCSSColorRGBA('--c-brnd_100')`                                                            | `src/utils/cssUtils.js` (as `LaserPlane` uses it)                |
| Quality tier                                               | `useQuality`                                                                                 | `src/app/QualityContext.jsx`                                     |
| Timing and easing                                          | `REVEAL.DURATION`, `SCENE.CAMERA_DURATION`, `SCROLL_THRESHOLDS.HOME_TRANSITION`, `entryEase` | `src/config/animation.config.js`, `src/utils/easingFunctions.js` |

**Config split:** timing (delays, durations, easing, scroll ranges) comes only from the shared `animation.config.js`, and this spec adds **no new values** to it. `logoParticles.config.js` holds only the effect's own physics and look: particle count per tier, grid layout, spring, curl, morph stagger, fluid strength and point size.

Shaders that use `#include` are imported **without** `?raw`, so that `vite-plugin-glsl` resolves the includes. Existing shaders keep their `?raw` imports.

## Files

### New

```text
src/canvas/core/
  fluid/
    FluidSim.js            screen-space stable-fluids solver with its own small ping-pong helper
    useFluidSim.js         R3F hook: pointer → splats, steps the solver; returns a ref to the FluidSim
    shaders/               base.vert.glsl, splat, advect, curl, vorticity, divergence, clear, pressure, gradient (.frag.glsl)
  shaders/
    curl.glsl              shared curl-noise chunk                                                   (built)
  textures/
    createMatcapTexture.js procedural metallic matcap                                                (built)
src/canvas/features/logoParticles/
  index.js                 export { default as LogoParticles }                                       (built)
  LogoParticles.jsx        GPUComputationRenderer + MeshSurfaceSampler setup, Points render, per-frame uniforms
  position.frag.glsl       simulation: spring to goal (grid ↔ logo) + curl swirl + fluid push (#include curl)
  particles.vert.glsl      reads position from the sim texture; point size by depth, random and intro power-on
  particles.frag.glsl      round sprite; brand color + matcap soft-light; sparkle
  logoParticles.config.js  per-tier sizes and physics/look constants (no timing)
```

### Changed

- `src/canvas/scenes/home/HomeScene.jsx`:
    - owns the video texture for `BackgroundMesh` (built);
    - does the float-support check and renders `LogoParticles` or `LogoMesh` (built);
    - applies the pointer tilt to the logo group (built);
    - **new:** wraps the "ROBIN POTZE" `<Text>` in a group whose `y` rises with the scroll curve.
- `src/canvas/features/background/BackgroundMesh.jsx`: takes a `video` prop (built).
- `src/canvas/features/logo/LogoMesh.jsx`: the metallic matcap fallback (built).
- `COMPONENT_DOCUMENTATION.md`: document the new feature, the fluid core, the changed `BackgroundMesh` and `LogoMesh`, and the 6.0 architecture tree.

### Deleted

`src/canvas/features/logo/GlassLogoMaterial.js`, `glass.vert.glsl` and `glass.frag.glsl` are deleted (done). `core/textures/useNoiseTexture.js` stays, because `WorkCard` still uses it.

### Component interfaces

- `LogoParticles({ startAnimations, scrollProgress })`:
    - it takes no `video` prop any more, because the particles are brand-colored;
    - it reads `quality` from `useQuality()`.
- `BackgroundMesh({ video, paused })`.
- `LogoMesh()`: no props.
- `useFluidSim(iterations)` returns a ref. Its `.current` is the `FluidSim`, or `null` when `iterations` is 0. Read `.current.velocity` every frame, because the velocity buffer swaps on every step.

## Per-frame data flow

```text
pointer (R3F state.pointer, from the existing eventSource)
  └─ useFluidSim            [medium/high only; ref.current is null on low]
       splat(pointer delta) → curl → vorticity → divergence → pressure × N → gradient subtract → advect
                                                        → velocity texture
LogoParticles useFrame
  ├─ uniforms: uTime, uDelta, uMorph, tFluid, uFluidStrength, uModelViewProjection, uScreenToLocal
  └─ gpuCompute.compute()                               → position texture
Points (ShaderMaterial) reads the position texture        → drawn inside the logo group
  └─ uniforms: tPosition, uIntro, uColor, tMatcap, uTime, uDpr, uPointSize, uGridSize
```

`uDelta` is `min(delta * 60, 2)`, so motion stays frame-rate independent and does not jump after a backgrounded tab returns.

### Targets

There are two target textures, built once on the CPU at the largest tier's size. Smaller tiers use the first N entries.

- **`tOrigin`:** the logo surface points from `MeshSurfaceSampler`. The samples come out in random order.
- **`tGrid`:** the dot-matrix cell for particle i, which is cell `i mod (GRID_COLUMNS × GRID_ROWS)`. The cell centers are laid out on a `GRID_WIDTH × GRID_WIDTH·9/16` panel, centered at x = y = 0 and at `z = GRID_Z`.
    - Because the logo samples are in random order, the grid ↔ logo pairing is effectively random. Paths cross, and the transition reads as a swarm.
    - Every tier has at least 16,384 particles and there are 14,400 cells, so every dot is filled. On higher tiers several particles stack on each dot and split apart as they leave.

### Simulation (`position.frag.glsl`)

Each texel holds one particle's position in the logo's local space. The inputs are:

- `tOrigin` (logo point) and `tGrid` (grid cell);
- `tRandom`: four random values in 0–1;
- the previous position, which `GPUComputationRenderer` supplies.

Per frame:

```text
morph = clamp((uMorph - random.w * MORPH_STAGGER) / (1 - MORPH_STAGGER), 0, 1)   // per-particle lag
goal  = mix(grid, origin, morph)
pos  += (goal - pos) * SPRING * uDelta
pos  += curlNoise(pos * CURL_SCALE + uTime * CURL_SPEED) * CURL_STRENGTH * (0.1 + sin(π · morph)) * uDelta
uv    = screen position of pos (via uModelViewProjection)
pos  += uScreenToLocal * vec3(texture(tFluid, uv).xy, 0.0) * uFluidStrength * uDelta
```

The curl swirl is faint on the finished grid and on the finished logo, and peaks halfway through the transition.

`uScreenToLocal` is the inverse of the rotation part of the logo group's model-view matrix. It is computed on the CPU each frame, so a push in screen space moves particles the matching way on screen whatever the group's rotation.

**Seeding:** a new simulation (first mount, return to Home, tier change) seeds each particle at `mix(grid, origin, lastMorph)`. `lastMorph` starts at 0, the grid. That way rebuilds don't jump.

### Rendering (`particles.vert.glsl` / `particles.frag.glsl`)

- **Geometry:** one vertex per particle. The `position` attribute holds the particle's texel UV in the simulation texture. A `random` attribute (vec4) holds the same values as `tRandom`.
- **Vertex shader:**
    - reads the position from the simulation texture;
    - point size is `POINT_SIZE * DPR * (1 / -mvPosition.z) * mix(0.5, 1.5, random.x) * power`;
    - `power` is the intro factor: `clamp((uIntro - delay) / 0.5, 0, 1)`, where `delay = 0.5 * diagonal`, and `diagonal` runs from 0 at the panel's top-left to 1 at its bottom-right. It is computed from the particle's position over `uGridSize`.
- **Fragment shader:**
    - draws a round sprite (discard outside the circle);
    - its color is `uColor`, the brand color `--c-brnd_100` read with `getCSSColorRGBA` and converted from sRGB to linear (`THREE.Color.setRGB(…, SRGBColorSpace)`);
    - blends a soft-light highlight from the matcap, rotated per particle over time;
    - lifts a small fraction of particles (`pow(random.y, 20.0)`) above the bloom threshold (0.92) so they sparkle;
    - is opaque and writes depth.

### Timelines

- **`uIntro` (0 → 1, render):**
    - It is 0 before the reveal, so the dots are invisible behind the loading screen.
    - Starting `REVEAL.DURATION` after `startAnimations` turns true (the delay the logo and camera reveals use), it eases to 1 over `SCENE.CAMERA_DURATION` with `entryEase`.
- **`uMorph` (0 = grid, 1 = logo, simulation):** `smoothstep(0.0, SCROLL_THRESHOLDS.HOME_TRANSITION, scrollProgress)`. The logo is formed exactly when the page transition fires.
- **Title rise:** the "ROBIN POTZE" group's `y = smoothstep(0, SCROLL_THRESHOLDS.HOME_TRANSITION, scrollProgress) * TITLE_RISE`. `TITLE_RISE` is a layout constant in `HomeScene` (local units of the background group, which is scaled 8×), large enough to carry the title out of frame.

The logo group's existing scroll push-back and 4× scale still apply on top.

## Quality tiers

The values live in `logoParticles.config.js`.

| Tier   | Simulation texture | Particles | Data type       | Fluid                                                              |
| ------ | ------------------ | --------- | --------------- | ------------------------------------------------------------------ |
| low    | 128 × 128          | 16,384    | `HalfFloatType` | off: `tFluid` is `null` (reads as black) and `uFluidStrength` is 0 |
| medium | 256 × 256          | 65,536    | `FloatType`     | on, 10 pressure iterations                                         |
| high   | 512 × 512          | 262,144   | `FloatType`     | on, 20 pressure iterations                                         |

- Devices that support only half-float rendering simulate at half precision on every tier.
- When the tier changes (adaptive quality), `LogoParticles` disposes the `GPUComputationRenderer` and builds a new one at the new size, seeded at the current morph. Tier changes are rare (there is a 5 s cooldown), so this is accepted.
- The fluid solver runs at 128 px on the screen's short side with `HalfFloatType` and linear filtering. Starting dissipation values are velocity 0.97 and pressure 0.8. These are starting points to tune in the browser.

## Fallback and error handling

- `HomeScene` renders `LogoMesh` (metallic matcap) instead of `LogoParticles` when either of these is true:
    - neither `EXT_color_buffer_float` nor `EXT_color_buffer_half_float` is available;
    - `gl.capabilities.maxVertexTextures` is 0.
- WebGL2 is always present in three 0.186, so there is no separate check for it.
- If `gpuCompute.init()` still returns an error, `LogoParticles` logs it with `console.error` and renders nothing.
- On unmount or tier change, `LogoParticles` disposes the `GPUComputationRenderer`, the points geometry, and the origin, grid and random textures. It disposes the material and matcap on unmount. `useFluidSim` disposes its render targets.

## Verification

The repo has no test runner. Nothing in this spec is plain logic worth unit-testing: the sizes and grid layout are lookup tables and constants, and the simulation and fluid run on the GPU. Verification is:

1. `npm run build`, `npm run lint` and `npm run fmt:check` pass after every task.
2. Grep checks:
    - no `GlassLogoMaterial` or `glass.` references remain;
    - nothing in `src/canvas/core` imports `@canvas/features`;
    - `logoParticles` imports no other feature;
    - no `tVideo` / `uHasVideo` remains in `logoParticles`.
3. A manual browser check on `npm run dev`:
    - **Intro:** the dot-matrix panel powers on diagonally during the reveal.
    - **Scroll:**
        - scrolling down splits the dots and they swirl into the logo;
        - the "ROBIN POTZE" title rises out of frame;
        - at the end only the logo is left;
        - scrolling back up returns the dots to the panel.
    - **Color:** the particles are brand cyan with a glossy highlight, and a few sparkle under bloom.
    - **Mouse:** on high quality, moving the mouse swirls particles away, and they spring back.
    - **Low tier** (forced by CPU throttling): about 16k particles, no fluid, still smooth.
    - **Fallback:** forcing `LogoMesh` (by temporarily making the float check fail) shows the metallic logo with the pointer tilt.
    - The console is clean, and no WebGL errors appear when the tier changes or the window is resized.
4. Performance: with the adaptive quality monitor running, high tier holds about 60 fps on the developer machine.

## Risks and tuning

- **Budget:** 262k particles on the high tier is an estimate. If high cannot hold 60 fps, adaptive quality drops a tier. The table can be retuned without code changes.
- **Constants:** these will need tuning by eye: the grid size and position, `MORPH_STAGGER`, `TITLE_RISE`, the fluid's strength, resolution and dissipation, and the curl and spring constants. They live in `logoParticles.config.js`, in `HomeScene` and as `FluidSim` defaults.
- **Interaction with the existing scroll animation:** the logo group still pushes back and scales up 4× on scroll, so it moves while the logo forms. If that reads as too much motion, retune `logoAnimConfig` in a follow-up.
- **Precision on half-float tiers:** small formed-state curl movements round away. That is accepted.
