# GPGPU Logo Particles — Design

**Date:** 2026-10-09
**Status:** Approved for planning
**Branch:** `feat/gpgpu-particles`

## Context

This is sub-project 2 of the canvas roadmap. Sub-project 1, the `core / features / scenes` restructure, was merged in PR #59. The whole portfolio is modelled on activetheory.net, and this spec brings its signature effect to the home page: the logo is drawn as particles. The particles assemble on reveal, swirl away from the mouse like fluid, and scatter into a drifting cloud on scroll.

The particle simulation runs on the GPU (GPGPU). Each particle's position is one texel in a float texture. Every frame a fragment shader reads the previous positions and writes new ones into a second texture, and the two textures swap. This is called "ping-pong". The visible particles are a single `THREE.Points` draw call that reads its positions from that texture.

## Goals

- The home logo is made of particles sampled from the surface of `public/assets/3d/Logo.glb`.
- **Intro:** the particles start as a scattered cloud and assemble into the logo during the reveal.
- **Mouse:** on medium and high quality, pointer movement pushes the particles through a small screen-space fluid simulation.
- **Scroll:** as `scrollProgress` rises, the logo scatters into a drifting curl-noise cloud.
- **Look:** each particle takes its color from `blackwall.mp4`, sampled at the particle's screen position, with a small rotating matcap highlight blended on top (the Active Theory look).
- **Cost:** it runs on every quality tier with a per-tier budget. Devices that cannot render to float textures get a cheap metallic logo instead.
- The expensive glass logo is removed: its refraction shader and the per-frame scene re-render into an offscreen target both go.

## Non-goals

- A general behavior-composition engine or editor (Active Theory's Proton/Antimatter). Shaders are plain files that share chunks through `#include`.
- Morphing particles into other shapes, as page transitions or work cards would need. The design keeps the origin texture swappable so this can be added later, but nothing is built for it now.
- Changes to page transitions, the work page or the routes.
- Adding a test runner. Nothing in this spec is plain logic worth unit-testing (see Verification).

## Building blocks already available

| Need                                                       | Use                                                                                          | Source                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Ping-pong simulation, starting textures, half-float switch | `GPUComputationRenderer`                                                                     | `three/examples/jsm/misc/GPUComputationRenderer.js`              |
| Area-weighted points on the logo surface                   | `MeshSurfaceSampler`                                                                         | `three/examples/jsm/math/MeshSurfaceSampler.js`                  |
| Shared GLSL chunks                                         | `#include`                                                                                   | `vite-plugin-glsl` (already configured in `vite.config.mjs`)     |
| Video texture                                              | `useVideoTexture`                                                                            | `src/canvas/core/textures/useVideoTexture.js`                    |
| Quality tier                                               | `useQuality`                                                                                 | `src/app/QualityContext.jsx`                                     |
| Reveal timing and easing                                   | `REVEAL.DURATION`, `SCENE.CAMERA_DURATION`, `SCROLL_THRESHOLDS.HOME_TRANSITION`, `entryEase` | `src/config/animation.config.js`, `src/utils/easingFunctions.js` |

**Config split:** timing (delays, durations, easing, scroll ranges) comes only from the shared `animation.config.js`, and this spec adds **no new values** to it. `logoParticles.config.js` holds only the effect's own physics and look: particle count per tier, spring, curl, cloud radius, fluid strength and point size.

Shaders that use `#include` are imported **without** `?raw`, so that `vite-plugin-glsl` resolves the includes. Existing shaders keep their `?raw` imports.

## Files

### New

```
src/canvas/core/
  fluid/
    FluidSim.js            screen-space stable-fluids solver with its own small ping-pong helper
    useFluidSim.js         R3F hook: pointer → splats, steps the solver, returns the velocity texture (or null)
    shaders/               base.vert.glsl, splat, advect, curl, vorticity, divergence, pressure, gradient (.frag.glsl)
  shaders/
    curl.glsl              shared curl-noise chunk (written from scratch)
  textures/
    createMatcapTexture.js procedural metallic matcap (canvas radial gradients → CanvasTexture)
src/canvas/features/logoParticles/
  index.js                 export { default as LogoParticles }
  LogoParticles.jsx        GPUComputationRenderer + MeshSurfaceSampler setup, Points render, per-frame uniforms
  position.frag.glsl       simulation: spring to goal + curl drift + fluid push (#include curl)
  particles.vert.glsl      reads position from the sim texture; point size by depth and random
  particles.frag.glsl      round sprite; video color + matcap soft-light; sparkle
  logoParticles.config.js  per-tier sizes and physics/look constants (no timing)
```

### Changed

- `src/canvas/scenes/home/HomeScene.jsx`:
    - owns the single video texture and passes it to `BackgroundMesh` and `LogoParticles`;
    - does the float-support check and renders `LogoParticles` or `LogoMesh`;
    - applies the pointer tilt (moved from `LogoMesh`) to the logo group.
- `src/canvas/features/background/BackgroundMesh.jsx`: takes a `video` prop instead of calling `useVideoTexture` itself. Its pause/play and fallback logic is unchanged.
- `src/canvas/features/logo/LogoMesh.jsx`: rewritten as the fallback. It renders the same geometry with `<meshMatcapMaterial>` and the procedural matcap. The FBO, noise texture, glass material and pointer tilt are removed.
- `COMPONENT_DOCUMENTATION.md`: document the new feature, the fluid core, the changed `BackgroundMesh` and `LogoMesh`, and the 6.0 architecture tree.

### Deleted

- `src/canvas/features/logo/GlassLogoMaterial.js`, `glass.vert.glsl`, `glass.frag.glsl`.

`core/textures/useNoiseTexture.js` stays, because `WorkCard` still uses it.

### Component interfaces

- `LogoParticles({ video, startAnimations, scrollProgress })`:
    - `video` is a `THREE.VideoTexture` or `null`;
    - the other two are the values `HomeScene` already receives.
    - It reads `quality` from `useQuality()`.
- `BackgroundMesh({ video, paused })`.
- `LogoMesh()`: no props.
- `useFluidSim({ enabled, iterations })` returns the current velocity texture, or `null` when disabled.

## Per-frame data flow

```text
pointer (R3F state.pointer, from the existing eventSource)
  └─ useFluidSim            [medium/high only; returns null on low]
       splat(pointer delta) → advect velocity → curl → vorticity → divergence
       → pressure × N → gradient subtract                → velocity texture
LogoParticles useFrame
  ├─ uniforms: uTime, uDelta, uDisperse, tFluid, uFluidStrength, uModelViewProjection, uScreenToLocal
  └─ gpuCompute.compute()                               → position texture
Points (ShaderMaterial) reads the position texture        → drawn inside the logo group
```

`uDelta` is `min(delta * 60, 2)`, so motion stays frame-rate independent and does not jump after a backgrounded tab returns.

### Simulation (`position.frag.glsl`)

Each texel holds one particle's position in the logo's local space. The inputs are:

- `tOrigin`: the logo surface point;
- `tRandom`: four random values in 0–1;
- the previous position, which `GPUComputationRenderer` supplies.

Per frame:

```text
cloud = origin + (random.xyz - 0.5) * CLOUD_RADIUS
goal  = mix(origin, cloud, uDisperse)
pos  += (goal - pos) * SPRING * uDelta
pos  += curlNoise(pos * CURL_SCALE + uTime * CURL_SPEED) * CURL_STRENGTH * (0.15 + uDisperse) * uDelta
uv    = screen position of pos (via uModelViewProjection)
pos  += uScreenToLocal * vec3(texture(tFluid, uv).xy, 0.0) * uFluidStrength * uDelta
```

`uScreenToLocal` is the inverse of the rotation part of the logo group's model-view matrix. It is computed on the CPU each frame, so a push in screen space moves particles the matching way on screen whatever the group's rotation.

### Rendering (`particles.vert.glsl` / `particles.frag.glsl`)

- **Geometry:** one vertex per particle. The `position` attribute holds the particle's texel UV in the simulation texture. A `random` attribute (vec4) holds the same values as `tRandom`.
- **Vertex shader:** reads the position from the simulation texture. Point size is `SIZE * DPR * (1 / -mvPosition.z) * mix(0.5, 1.5, random.x)`.
- **Fragment shader:**
    - draws a round sprite (discard outside the circle);
    - takes its color from the video texture sampled at `gl_FragCoord.xy / uResolution`, or flat `#EEEEEE` until the video is ready;
    - blends a soft-light highlight from the matcap, rotated per particle over time;
    - lifts a small fraction of particles (`pow(random.y, 20.0)`) above the bloom threshold (0.92) so they sparkle;
    - is opaque and writes depth.

### `uDisperse` timeline (0 = logo, 1 = cloud)

- Before the reveal starts it is 1, so the particles sit as a cloud behind the loading screen.
- Intro: `REVEAL.DURATION` after `startAnimations` turns true (the delay the logo and camera reveals already use), `intro` eases from 1 to 0 over `SCENE.CAMERA_DURATION` (1.5 s) with `entryEase`, so the logo finishes forming when the camera finishes moving in.
- From then on: `uDisperse = max(intro, smoothstep(0.0, SCROLL_THRESHOLDS.HOME_TRANSITION, scrollProgress))`, so the logo is fully scattered when the page transition fires.

The logo group's existing scroll push-back and 4× scale still apply on top.

### Video

`HomeScene` calls `useVideoTexture('/assets/video/blackwall.mp4', …)` once, with the options `BackgroundMesh` uses today, and passes the texture to both components. That leaves one `<video>` element and one decode instead of two. `BackgroundMesh` still pauses the video once scroll passes 0.4, so the particle colors freeze at that point. That is accepted.

## Quality tiers

The values live in `logoParticles.config.js`.

| Tier   | Simulation texture | Particles | Data type       | Fluid                                                          |
| ------ | ------------------ | --------- | --------------- | -------------------------------------------------------------- |
| low    | 128 × 128          | 16,384    | `HalfFloatType` | off: `tFluid` is a 1×1 black texture and `uFluidStrength` is 0 |
| medium | 256 × 256          | 65,536    | `FloatType`     | on, 10 pressure iterations                                     |
| high   | 512 × 512          | 262,144   | `FloatType`     | on, 20 pressure iterations                                     |

- The surface is sampled once at 262,144 points. Smaller tiers use the first N points, which is still a uniform sample because the samples are in random order.
- When the tier changes (adaptive quality), `LogoParticles` disposes the `GPUComputationRenderer` and builds a new one at the new size. Tier changes are rare (there is a 5 s cooldown), so the short pause is accepted.
- The fluid solver runs at 128 px on the screen's short side with `HalfFloatType` and linear filtering. Starting dissipation values are velocity 0.97 and pressure 0.8. These are starting points to tune in the browser.

## Fallback and error handling

- `HomeScene` renders `LogoMesh` (metallic matcap) instead of `LogoParticles` when any of these is true:
    - `gl.capabilities.isWebGL2` is false;
    - neither `EXT_color_buffer_float` nor `EXT_color_buffer_half_float` is available;
    - `gl.capabilities.maxVertexTextures` is 0.
- If `gpuCompute.init()` still returns an error, `LogoParticles` logs it with `console.error` and renders nothing.
- When the video is not ready (`null`), the particles use the flat color.
- On unmount or tier change, `LogoParticles` disposes the `GPUComputationRenderer`, the points geometry and material, and the origin and random textures. `useFluidSim` disposes its render targets.

## Verification

The repo has no test runner. Nothing in this spec is plain logic worth unit-testing: the sizes are a lookup table, and the simulation and fluid run on the GPU. Verification is:

1. `npm run build`, `npm run lint` and `npm run fmt:check` pass after every task.
2. Grep checks:
    - no `GlassLogoMaterial` or `glass.` references remain;
    - nothing in `src/canvas/core` imports `@canvas/features`;
    - `logoParticles` imports no other feature.
3. A manual browser check on `npm run dev`:
    - **Intro:** the logo assembles from a cloud during the reveal.
    - **Mouse:** on high quality, moving the mouse swirls particles away, and they spring back.
    - **Scroll:** scrolling scatters the logo into a drifting cloud; scrolling back up reforms it.
    - **Color:** particles carry the video's colors, a few sparkle under bloom, and the color is flat before the video loads.
    - **Low tier** (forced by CPU throttling, or by temporarily editing `getInitialQuality`): about 16k particles, no fluid, still smooth.
    - **Fallback:** forcing `LogoMesh` (by temporarily making the float check fail) shows the metallic logo with the pointer tilt.
    - The console is clean, and no WebGL errors appear when the tier changes.
4. Performance: with the adaptive quality monitor running, high tier holds about 60 fps on the developer machine.

## Risks and tuning

- **Budget:** 262k particles on the high tier is an estimate. If high cannot hold 60 fps, adaptive quality drops a tier. The table can be retuned without code changes.
- **Constants:** the fluid's strength, resolution and dissipation, and the curl and spring constants, will need tuning by eye. They live in `logoParticles.config.js` and as `FluidSim` constructor defaults.
- **Video fit:** the video color is sampled with a plain screen-space stretch, not an aspect-correct cover fit. That is accepted for a color source.
