# Home → Work Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the curtain cut between `/` and `/work` with one scroll-scrubbed transformation: the Home logo unravels into a vertical particle trunk on the carousel axis that branches to the active work card.

**Architecture:** A React Router layout route wraps `/` and `/work` and owns one scroll container (Lenis), one shared canvas and the URL sync. `HomeScene` and `WorkScene` render side by side in that canvas and read a shared `segmentsRef` (`home`, `morph`, `carousel`, each 0–1). The particle simulation gains a stream target (trunk plus one branch) mapped from carousel space into particle space.

**Tech Stack:** React 19, React Router 7, @react-three/fiber 9, drei 10, @react-three/postprocessing 3, three 0.186 (GPUComputationRenderer), Lenis 1.3, motion 14, oxlint, oxfmt, `node:test`.

Spec: `docs/superpowers/specs/2026-11-19-home-work-transition-design.md`

## Global Constraints

- Timing values come only from `src/config/animation.config.js`; feature configs (`carousel.config.js`, `logoParticles.config.js`) hold no timing. Reuse an existing token before adding one.
- No new CSS custom properties beyond the two layout progress variables `--home-out` and `--work-in` defined in Task 3; reuse existing tokens.
- No new dependencies.
- About, Contact and Entry keep the curtain transition.
- The first crossing into the carousel pushes `/work`; every other URL change between `/` and `/work` uses `replace`.
- The carousel scrolls vertically on every device.
- Snippets in this plan use `text` fences: oxfmt reformats `js`/`jsx` fences in Markdown.
- After every task: `npm test`, `npm run lint`, `npm run fmt:check`, `npm run build` pass. Run `npx oxfmt <files>` if `fmt:check` fails.

## Shared procedure: browser check

Headless Chrome via `playwright-core` in the session scratchpad (not a project dependency). Launch with `chromium.launch({ channel: 'chrome', args: ['--use-angle=metal'] })`; without the flag WebGL is disabled and the ErrorBoundary shows "SOMETHING WENT WRONG". Start the dev server with `npm run dev -- --port 5199 --strictPort`, stop it with `lsof -ti:5199 -sTCP:LISTEN | xargs kill`. Scroll the layout by setting `document.getElementById('home-work-scroller').scrollTop` and waiting ~1.5 s for Lenis to settle.

## File structure

- Create `src/routes/HomeWork/homeWork.js`: pure scroll math and URL decision (no imports).
- Create `src/routes/HomeWork/homeWork.test.mjs`: `node:test` for it.
- Create `src/routes/HomeWork/HomeWorkLayout.jsx` + `HomeWorkLayout.module.css`: layout route (scroll, Lenis, URL sync, loading, canvas, outlet).
- Create `src/canvas/scenes/homeWork/HomeWorkCanvas.jsx` + `HomeWorkCanvas.module.css`: shared canvas, camera, border frame, card navigation.
- Create `src/canvas/scenes/homeWork/PostFX.jsx`: one effect chain blended by `morph`.
- Modify `src/hooks/usePageTransition.jsx`: local navigation hook.
- Modify `src/app/routes.jsx`, `src/config/animation.config.js`, `src/canvas/features/carousel/{carousel.js,carousel.config.js,WorkCard.jsx}`, `src/canvas/scenes/home/HomeScene.jsx`, `src/canvas/scenes/work/WorkScene.jsx`, `src/routes/Home/{Home.jsx,Home.module.css}`, `src/routes/Work/{Work.jsx,Work.module.css}`, `src/canvas/features/logoParticles/{LogoParticles.jsx,position.frag.glsl,logoParticles.config.js}`, `package.json`.
- Delete `src/hooks/useScrollNavigation.js`, `src/canvas/scenes/home/HomeCanvas.jsx`, `src/canvas/scenes/home/HomeCanvas.module.css`, `src/canvas/scenes/work/WorkCanvas.jsx`, `src/canvas/scenes/work/WorkCanvas.module.css`.

---

### Task 1: Scroll math and URL decision

**Files:**

- Create: `src/routes/HomeWork/homeWork.js`
- Create: `src/routes/HomeWork/homeWork.test.mjs`
- Modify: `package.json` (`test` script)

**Interfaces:**

- Produces: `getSegmentBounds(viewportHeight, itemCount, lengths)` → `{ home, morph, card, carouselStart, total }` (px); `getSegments(scroll, bounds)` → `{ home, morph, carousel, inCarousel }`; `pathForSegment(inCarousel)` → `'/' | '/work'`; `scrollForPath(pathname, bounds)` → px; `decideUrl(inCarousel, pathname, hasPushed)` → `null | { path, replace }`; `snapTarget(scroll, bounds)` → `null | px`. The module takes the segment lengths as an argument, so it needs no config import.

- [ ] **Step 1: Check no existing file in `src/` matches the test runner's default patterns**

Run: `find src -name "*.test.*" -o -name "*-test.*" -o -name "*_test.*" -o -name "test-*" -o -name "test.*" -o -type d -name test`
Expected: no output.

- [ ] **Step 2: Write the failing test** `src/routes/HomeWork/homeWork.test.mjs`

```text
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decideUrl, getSegmentBounds, getSegments, scrollForPath, snapTarget } from './homeWork.js';

const LENGTHS = { HOME_VH: 0.5, MORPH_VH: 1, CARD_VH: 1 };
const bounds = getSegmentBounds(1000, 6, LENGTHS);

test('bounds: home 500, morph 1000, five card steps', () => {
    assert.deepEqual(bounds, { home: 500, morph: 1000, card: 1000, carouselStart: 1500, total: 6500 });
});

test('segments at the edges and in the middle', () => {
    assert.deepEqual(getSegments(0, bounds), { home: 0, morph: 0, carousel: 0, inCarousel: false });
    assert.deepEqual(getSegments(1000, bounds), { home: 1, morph: 0.5, carousel: 0, inCarousel: false });
    assert.deepEqual(getSegments(1500, bounds), { home: 1, morph: 1, carousel: 0, inCarousel: true });
    assert.deepEqual(getSegments(6500, bounds), { home: 1, morph: 1, carousel: 1, inCarousel: true });
});

test('one work item: carousel stays 0 instead of dividing by zero', () => {
    const single = getSegmentBounds(1000, 1, LENGTHS);
    assert.equal(getSegments(5000, single).carousel, 0);
});

test('scroll target per path', () => {
    assert.equal(scrollForPath('/', bounds), 0);
    assert.equal(scrollForPath('/work', bounds), 1500);
});

test('url: first entry into the carousel pushes, everything else replaces', () => {
    assert.deepEqual(decideUrl(true, '/', false), { path: '/work', replace: false });
    assert.deepEqual(decideUrl(true, '/', true), { path: '/work', replace: true });
    assert.deepEqual(decideUrl(false, '/work', false), { path: '/', replace: true });
    assert.equal(decideUrl(true, '/work', false), null);
    assert.equal(decideUrl(false, '/', true), null);
});

test('snap only inside the carousel, to the nearest card', () => {
    assert.equal(snapTarget(1200, bounds), null);
    assert.equal(snapTarget(2400, bounds), 2500);
    assert.equal(snapTarget(1900, bounds), 1500);
});
```

- [ ] **Step 3: Widen the test script** in `package.json`

```text
"test": "node --test workers/ src/",
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npm test`
Expected: FAIL, `Cannot find module` for `./homeWork.js`.

- [ ] **Step 5: Write `src/routes/HomeWork/homeWork.js`**

```text
// Pure scroll math for the Home → Work layout. No imports, so node:test can load it directly.

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/** Segment lengths in px for one viewport height. lengths: { HOME_VH, MORPH_VH, CARD_VH } from HOME_WORK. */
export function getSegmentBounds(viewportHeight, itemCount, { HOME_VH, MORPH_VH, CARD_VH }) {
    const home = HOME_VH * viewportHeight;
    const morph = MORPH_VH * viewportHeight;
    const card = CARD_VH * viewportHeight;
    const carouselStart = home + morph;
    return { home, morph, card, carouselStart, total: carouselStart + Math.max(0, itemCount - 1) * card };
}

/** Each segment's 0–1 progress for a scroll position. inCarousel allows 1 px for fractional scroll targets. */
export function getSegments(scroll, bounds) {
    const carouselLength = bounds.total - bounds.carouselStart;
    return {
        home: clamp01(scroll / bounds.home),
        morph: clamp01((scroll - bounds.home) / bounds.morph),
        carousel: carouselLength > 0 ? clamp01((scroll - bounds.carouselStart) / carouselLength) : 0,
        inCarousel: scroll >= bounds.carouselStart - 1,
    };
}

export const pathForSegment = (inCarousel) => (inCarousel ? '/work' : '/');

export const scrollForPath = (pathname, bounds) => (pathname === '/work' ? bounds.carouselStart : 0);

/** URL change for the current segment: push only on the first entry into the carousel, replace otherwise. */
export function decideUrl(inCarousel, pathname, hasPushed) {
    const path = pathForSegment(inCarousel);
    if (pathname === path) {
        return null;
    }
    return { path, replace: !inCarousel || hasPushed };
}

/** Nearest card position inside the carousel; null before it, so snapping never pulls the user out of the morph. */
export function snapTarget(scroll, bounds) {
    if (scroll < bounds.carouselStart) {
        return null;
    }
    return bounds.carouselStart + Math.round((scroll - bounds.carouselStart) / bounds.card) * bounds.card;
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `npm test`
Expected: all tests pass (5 worker tests + 6 new).

- [ ] **Step 7: Commit**

```text
git add src/routes/HomeWork/homeWork.js src/routes/HomeWork/homeWork.test.mjs package.json
git commit -m "feat(homework): pure scroll segment math and URL decision with tests"
```

---

### Task 2: Local navigation in the page transition provider

**Files:**

- Modify: `src/hooks/usePageTransition.jsx`

**Interfaces:**

- Produces: `usePageTransition()` returns `{ navigateWithTransition, registerLocalNavigation }`. `registerLocalNavigation(handler)` stores `handler(path) → boolean` and returns an unregister function. When the handler returns `true`, `navigateWithTransition` skips the curtain.

- [ ] **Step 1: Add the handler ref and registration** below `pendingState`:

```text
    // A mounted layout can take over navigation between its own routes (no curtain): handler(path) → true when handled.
    const localNavigationRef = useRef(null);
    const registerLocalNavigation = useCallback((handler) => {
        localNavigationRef.current = handler;
        return () => {
            if (localNavigationRef.current === handler) {
                localNavigationRef.current = null;
            }
        };
    }, []);
```

- [ ] **Step 2: Consult it in `navigateWithTransition`**, right after the `pendingNavigation` guard:

```text
        if (pendingNavigation.current) {
            return false;
        }
        if (localNavigationRef.current?.(path)) {
            return true;
        }
```

- [ ] **Step 3: Expose it**

```text
        <PageTransitionContext.Provider value={{ navigateWithTransition, registerLocalNavigation }}>
```

- [ ] **Step 4: Run checks**

Run: `npm test && npm run lint && npm run fmt:check && npm run build`
Expected: pass (nothing calls `registerLocalNavigation` yet, behaviour unchanged).

- [ ] **Step 5: Commit**

```text
git add src/hooks/usePageTransition.jsx
git commit -m "feat(transition): let a mounted layout handle navigation between its own routes"
```

---

### Task 3: Shared layout, one canvas, one scroll (stage 1)

Deliverable: `/` and `/work` share one canvas and one scroll. Scrolling Home forms the logo as today; during the morph the logo shrinks onto the axis while the camera blends to the carousel pose; cards reveal as each becomes centred. No curtain between Home and Work. No stream yet.

**Files:**

- Modify: `src/config/animation.config.js` (add `HOME_WORK`; remove Work scroll-exit thresholds)
- Modify: `src/canvas/features/carousel/carousel.config.js`, `carousel.js`, `WorkCard.jsx`
- Modify: `src/canvas/scenes/home/HomeScene.jsx`, `src/canvas/scenes/work/WorkScene.jsx`
- Create: `src/canvas/scenes/homeWork/PostFX.jsx`, `HomeWorkCanvas.jsx`, `HomeWorkCanvas.module.css`
- Create: `src/routes/HomeWork/HomeWorkLayout.jsx`, `HomeWorkLayout.module.css`
- Modify: `src/app/routes.jsx`, `src/routes/Home/Home.jsx`, `Home.module.css`, `src/routes/Work/Work.jsx`, `Work.module.css`
- Delete: `src/hooks/useScrollNavigation.js`, `src/canvas/scenes/home/HomeCanvas.jsx`, `HomeCanvas.module.css`, `src/canvas/scenes/work/WorkCanvas.jsx`, `WorkCanvas.module.css`

**Interfaces:**

- Consumes: Task 1 (`getSegmentBounds`, `getSegments`, `decideUrl`, `scrollForPath`, `pathForSegment`, `snapTarget`), Task 2 (`registerLocalNavigation`).
- Produces: `segmentsRef.current = { home, morph, carousel, inCarousel, velocity }` (velocity in viewport heights per frame, signed); `streamRef.current = { space, trunkY, trunkHalf, velocity, grow, branchY, branchEnd }` (Task 3 writes `space`, `trunkY`, `trunkHalf`, `velocity`, `grow`; Task 5 adds `branchY`, `branchEnd`); `getCarouselFov()` from `@canvas/features/carousel`; `WorkCard` prop `revealed: boolean` replaces `entryComplete`/`entryDelay`; `HomeScene({ segmentsRef, streamRef, startAnimations })`; `WorkScene({ items, segmentsRef, streamRef, onCardNavigate, onCenterednessChange, rigRef, isMobile })`.

- [ ] **Step 0: Layout config** in `src/config/animation.config.js`. Replace the `SCROLL_THRESHOLDS` block (the three `WORK_*` values belong to `Work.jsx`'s scroll-exit code, deleted in Step 13):

```text
export const SCROLL_THRESHOLDS = {
    HOME_TRANSITION: 0.95,
};

// Home → Work layout: segment lengths in viewport heights (one card step per CARD_VH).
export const HOME_WORK = {
    HOME_VH: 0.5,
    MORPH_VH: 1,
    CARD_VH: 1,
};
```

`HOME_VH: 0.5` keeps today's Home scroll length (the old page scrolled half a viewport).

- [ ] **Step 1: Carousel config** in `carousel.config.js`. Replace the `ENTRY` block:

```text
    ENTRY: {
        CARD_DURATION: 0.6,
    },

    // The branch to the centred card: full length at centeredness 0, gone at RANGE (half a card step).
    // A card reveals the first time its branch reaches REVEAL_AT.
    BRANCH: {
        RANGE: 0.4 / Math.PI,
        REVEAL_AT: 0.9,
        REACH: 0.85,
    },
```

`ENTRY.CARD_DURATION` is timing kept from the existing config (not new); `RANGE`, `REVEAL_AT` and `REACH` are geometry.

- [ ] **Step 2: Shared carousel FOV** — append to `carousel.js` and export it from `index.js`:

```text
import { BREAKPOINTS } from '@config/animation.config';

// One MediaQueryList, so the per-frame camera code reads a cached boolean.
const tabletQuery = window.matchMedia(BREAKPOINTS.TABLET);

/** Carousel camera FOV: wider below the tablet breakpoint. */
export function getCarouselFov() {
    return tabletQuery.matches ? CAROUSEL_CONFIG.CAMERA.FOV + 15 : CAROUSEL_CONFIG.CAMERA.FOV;
}
```

```text
export { calculateCardCenteredness, getCarouselFov } from './carousel';
```

- [ ] **Step 3: `WorkCard` reveal** — in `WorkCard.jsx` replace the props `entryComplete = false, entryDelay = 0` with `revealed = false`, and the entry gate with:

```text
        // Hidden until the branch first reaches this card, then grow in once.
        if (!revealed) {
            group.scale.setScalar(0);
            scaleRef.current = 0;
            return;
        }
        if (entryTimeRef.current === null) {
            entryTimeRef.current = clock.elapsedTime;
        }
```

The `entryT` line below it stays unchanged.

- [ ] **Step 4: `WorkScene`** — rewrite `src/canvas/scenes/work/WorkScene.jsx`:

```text
import { useQuality } from '@app/QualityContext';
import { CAROUSEL_CONFIG, calculateCardCenteredness, getCarouselFov, WorkCard } from '@canvas/features/carousel';
import useNoiseTexture from '@canvas/core/textures/useNoiseTexture';
import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

const { clamp, degToRad } = THREE.MathUtils;
// The trunk spans a bit more than the visible height, so its ends stay off-screen.
const TRUNK_OVERSCAN = 1.3;

export default function WorkScene({ items = [], segmentsRef, streamRef, onCardNavigate, onCenterednessChange, rigRef: externalRigRef, isMobile }) {
    const rigRef = useRef();
    const centerednessRef = useRef([]);
    const bestIndexRef = useRef(0);
    const revealedRef = useRef(0);
    const [visibleCenter, setVisibleCenter] = useState(0);
    const [revealedCount, setRevealedCount] = useState(0);
    const camera = useThree((state) => state.camera);
    const { quality } = useQuality();

    const scale = isMobile ? CAROUSEL_CONFIG.MOBILE.SCALE_FACTOR : CAROUSEL_CONFIG.SCALE_FACTOR;
    // One shared noise texture for every card (same inputs, so one CPU build instead of one per card).
    const noiseTexture = useNoiseTexture({ size: quality === 'low' ? 64 : 256, scale: 10, octaves: quality === 'low' ? 2 : 3, persistence: 0.5 });

    const setRigRef = (node) => {
        rigRef.current = node;
        if (externalRigRef) {
            externalRigRef.current = node;
        }
    };

    // Priority -1: runs before LogoParticles reads streamRef this frame.
    useFrame(() => {
        const rig = rigRef.current;
        if (!rig || items.length === 0) {
            return;
        }
        const { carousel: offset, morph, velocity } = segmentsRef.current;

        const targetRotation = -offset * (items.length - 1) * CAROUSEL_CONFIG.ANGLE_STEP;
        rig.rotation.y += (targetRotation - rig.rotation.y) * CAROUSEL_CONFIG.LERP_SPEED;

        // HomeScene owns the camera until the morph completes; from then on it follows the descending spiral.
        if (morph >= 1) {
            camera.position.set(0, offset * (items.length - 1) * CAROUSEL_CONFIG.VERTICAL_STEP * scale, CAROUSEL_CONFIG.CAMERA.POSITION[2]);
            camera.lookAt(0, camera.position.y, 0);
            const fov = getCarouselFov();
            if (camera.fov !== fov) {
                camera.fov = fov;
                camera.updateProjectionMatrix();
            }
        }

        let minCenteredness = 1;
        let bestIndex = 0;
        for (let i = 0; i < items.length; i++) {
            const c = calculateCardCenteredness(rig.rotation.y, i);
            centerednessRef.current[i] = c;
            if (c < minCenteredness) {
                minCenteredness = c;
                bestIndex = i;
            }
        }
        if (bestIndex !== bestIndexRef.current) {
            bestIndexRef.current = bestIndex;
            setVisibleCenter(bestIndex);
        }

        // Branch to the centred card; reveal every card up to it the first time the branch reaches it.
        const grow = morph < 1 ? 0 : 1 - clamp(minCenteredness / CAROUSEL_CONFIG.BRANCH.RANGE, 0, 1);
        if (grow >= CAROUSEL_CONFIG.BRANCH.REVEAL_AT && bestIndex >= revealedRef.current) {
            revealedRef.current = bestIndex + 1;
            setRevealedCount(bestIndex + 1);
        }

        // Trunk in rig space: rig y = world y / scale (the rig only rotates about y).
        const stream = streamRef.current;
        stream.space = rig;
        stream.trunkY = camera.position.y / scale;
        stream.trunkHalf = (CAROUSEL_CONFIG.CAMERA.POSITION[2] * Math.tan(degToRad(getCarouselFov()) / 2) * TRUNK_OVERSCAN) / scale;
        stream.velocity = velocity;
        stream.grow = grow;

        onCenterednessChange?.(minCenteredness, bestIndex);
    }, -1);

    if (!items?.length) {
        return null;
    }

    return (
        <>
            <group scale={scale}>
                <group ref={setRigRef}>
                    {items.map((item, i) => (
                        <WorkCard
                            key={item.key}
                            item={item}
                            index={i}
                            visible={Math.abs(i - visibleCenter) <= 1}
                            revealed={i < revealedCount}
                            onNavigate={onCardNavigate}
                            noiseTexture={noiseTexture}
                            centerednessRef={centerednessRef}
                        />
                    ))}
                </group>
            </group>
            <ambientLight intensity={1} />
        </>
    );
}
```

- [ ] **Step 5: `HomeScene`** — edits in `src/canvas/scenes/home/HomeScene.jsx`:

1. Imports: drop `useQuality`, `PerspectiveCamera`, `Bloom`, `EffectComposer`, `N8AO`; add `CAROUSEL_CONFIG, getCarouselFov` from `@canvas/features/carousel`. Delete the `POST_PROCESSING` constant and the `quality`/`post` lines. Export the two camera keyframe arrays for the canvas's initial camera: `export const CAMERA_Z = …` and `export const CAMERA_FOV = …`. If lint flags a non-component export from a component file, move both arrays into `src/canvas/scenes/home/homeScene.config.js` and import them from there in both files.
2. Signature: `export default function HomeScene({ segmentsRef, streamRef, startAnimations = true })`. Add `const laserRef = useRef();`, `const extrasRef = useRef();` and `const homeProgressRef = useRef(0);` (LaserPlane reads a plain number ref).
3. At the top of the `useFrame` body, replace `const scrollProgress = scrollProgressRef.current;` with:

```text
        const { home: scrollProgress, morph: streamProgress } = segmentsRef.current;
        homeProgressRef.current = scrollProgress;
        // Morph segment: blend from Home's end pose to the carousel's start pose.
        const blend = easeCurve(streamProgress);
```

4. Replace the camera block (from `const cameraReveal` through the fov update) with:

```text
        const cameraReveal = reveal(0, SCENE.CAMERA_DURATION);
        timeline.current.morph = morph;
        timeline.current.intro = cameraReveal;
        // WorkScene owns the camera once the morph completes.
        if (streamProgress < 1) {
            camera.position.set(
                lerp(parallax.x, 0, blend),
                lerp(parallax.y, 0, blend),
                lerp(keyframe(CAMERA_Z, cameraReveal, scroll) + parallax.z, CAROUSEL_CONFIG.CAMERA.POSITION[2], blend)
            );
            camera.lookAt(0, 0, 0);
            const fov = lerp(keyframe(CAMERA_FOV, cameraReveal, scroll), getCarouselFov(), blend);
            if (camera.fov !== fov) {
                camera.fov = fov;
                camera.updateProjectionMatrix();
            }
        }
        // Home's extras are out of frame once the morph starts; hide them without unmounting (keeps the video loaded).
        if (extrasRef.current) {
            extrasRef.current.visible = streamProgress === 0;
        }
        if (laserRef.current) {
            laserRef.current.visible = streamProgress === 0;
        }
```

5. In the logo block, shrink the logo onto the axis during the morph (stage 1; Task 4 limits this to the fallback):

```text
            logo.position.z = lerp(keyframe(LOGO_Z, 1, scroll), 0, blend);
            logo.scale.setScalar(keyframe(LOGO_SCALE, 1, scroll) * viewportScale * (1 - blend));
```

6. JSX: delete `<PerspectiveCamera …/>` and the `<EffectComposer>` block. Wrap the laser and the two extras groups:

```text
            {startAnimations && (
                <group ref={laserRef}>
                    <LaserPlane progressRef={homeProgressRef} />
                </group>
            )}
            <ambientLight ref={lightRef} intensity={0} />

            <group ref={extrasRef}>
                {startAnimations && (
                    <group ref={backgroundRef}>
                        …unchanged background and title…
                    </group>
                )}
                {startAnimations && (
                    <group ref={subtitleRef}>
                        …unchanged subtitle…
                    </group>
                )}
            </group>
```

7. Pass `streamRef` to the particles: `<LogoParticles timeline={timeline} gridSize={gridSize} streamRef={streamRef} />` (the prop is unused until Task 4).

- [ ] **Step 6: `PostFX`** — create `src/canvas/scenes/homeWork/PostFX.jsx`:

```text
import { useQuality } from '@app/QualityContext';
import { useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, N8AO } from '@react-three/postprocessing';
import { useRef } from 'react';
import * as THREE from 'three';

const { lerp } = THREE.MathUtils;

// Home: ambient occlusion (off on low) + bloom. Work: bloom only. Values per quality tier, from the former scene files.
const HOME = {
    low: { ao: null, bloom: { intensity: 0.3, levels: 2 } },
    medium: { ao: { aoSamples: 4, denoiseSamples: 2, intensity: 1.2 }, bloom: { intensity: 0.45, levels: 4 } },
    high: { ao: { aoSamples: 8, denoiseSamples: 4, intensity: 1.5 }, bloom: { intensity: 0.55, levels: 6 } },
};
const WORK_BLOOM = { low: 0.2, medium: 0.3, high: 0.4 };

/** One effect chain for the layout: AO fades out and bloom blends from Home to Work over the morph. */
export default function PostFX({ segmentsRef }) {
    const { quality } = useQuality();
    const home = HOME[quality];
    const aoRef = useRef();
    const bloomRef = useRef();

    useFrame(() => {
        const { morph } = segmentsRef.current;
        if (aoRef.current && home.ao) {
            aoRef.current.configuration.intensity = home.ao.intensity * (1 - morph);
        }
        if (bloomRef.current) {
            bloomRef.current.intensity = lerp(home.bloom.intensity, WORK_BLOOM[quality], morph);
        }
    });

    return (
        <EffectComposer multisampling={0}>
            {home.ao && <N8AO ref={aoRef} aoRadius={1} {...home.ao} />}
            <Bloom ref={bloomRef} mipmapBlur luminanceThreshold={0.92} radius={0.4} {...home.bloom} />
        </EffectComposer>
    );
}
```

If `aoRef.current.configuration` is undefined at runtime, log `aoRef.current` once, find the N8AO pass instance's `configuration` object, and adjust the access; do not drop the fade.

- [ ] **Step 7: `HomeWorkCanvas`** — create `src/canvas/scenes/homeWork/HomeWorkCanvas.module.css`:

```text
.canvasContainer {
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
}

.border {
    opacity: var(--work-in, 0);
}
```

and `src/canvas/scenes/homeWork/HomeWorkCanvas.jsx`:

```text
import { useWorkItems } from '@app/WorkContext';
import CanvasRoot from '@canvas/core/CanvasRoot';
import { CAROUSEL_CONFIG, useBorderProjection } from '@canvas/features/carousel';
import HomeScene, { CAMERA_FOV, CAMERA_Z } from '@canvas/scenes/home/HomeScene';
import WorkScene from '@canvas/scenes/work/WorkScene';
import NineSliceBorder from '@components/ui/NineSliceBorder';
import { SPRING_CONFIG } from '@config/animation.config';
import { usePageTransition } from '@hooks/usePageTransition';
import { PerspectiveCamera } from '@react-three/drei';
import { prefetchEntryPages } from '@routes/Entry/pages/autogen';
import { useMotionValue, useSpring } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import styles from './HomeWorkCanvas.module.css';
import PostFX from './PostFX';

/** The shared canvas for / and /work: Home and the carousel in one scene, driven by the layout's segmentsRef. */
export default function HomeWorkCanvas({ segmentsRef, startAnimations }) {
    const items = useWorkItems();
    const { navigateWithTransition } = usePageTransition();
    const containerRef = useRef(null);
    const cameraRef = useRef(null);
    const rigRef = useRef(null);
    const hasNavigated = useRef(false);
    const streamRef = useRef({ space: null, trunkY: 0, trunkHalf: 10, velocity: 0, grow: 0, branchY: 0, branchEnd: new THREE.Vector3() });
    const [isMobile] = useState(() => window.innerWidth <= CAROUSEL_CONFIG.MOBILE.BREAKPOINT);

    // Border frame around the centred card.
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const rawW = useMotionValue(0);
    const rawH = useMotionValue(0);
    const x = useSpring(rawX, SPRING_CONFIG.BORDER_ANIMATION);
    const y = useSpring(rawY, SPRING_CONFIG.BORDER_ANIMATION);
    const w = useSpring(rawW, SPRING_CONFIG.BORDER_ANIMATION);
    const h = useSpring(rawH, SPRING_CONFIG.BORDER_ANIMATION);
    const springs = useMemo(() => ({ rawX, rawY, rawW, rawH, springX: x, springY: y, springW: w, springH: h }), [rawX, rawY, rawW, rawH, x, y, w, h]);
    const onCenterednessChange = useBorderProjection(containerRef, cameraRef, rigRef, springs);

    // Prefetch entry page bundles so a card click opens instantly.
    useEffect(() => {
        prefetchEntryPages();
    }, []);

    const onCardNavigate = useCallback(
        (pageKey) => {
            if (hasNavigated.current) {
                return;
            }
            hasNavigated.current = true;
            const item = items.find((i) => i.key === pageKey);
            navigateWithTransition(`/work/${pageKey}`, item?.data?.title || pageKey, 'up');
        },
        [items, navigateWithTransition]
    );

    return (
        <div ref={containerRef} className={styles.canvasContainer}>
            <CanvasRoot
                adaptiveQuality={startAnimations}
                performance={{ min: 0.5 }}
                eventSource={document.getElementById('root')}
                eventPrefix="client"
                gl={{ antialias: true }}
            >
                <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 0, CAMERA_Z[0]]} fov={CAMERA_FOV[0]} />
                <HomeScene segmentsRef={segmentsRef} streamRef={streamRef} startAnimations={startAnimations} />
                <WorkScene
                    items={items}
                    segmentsRef={segmentsRef}
                    streamRef={streamRef}
                    onCardNavigate={onCardNavigate}
                    onCenterednessChange={onCenterednessChange}
                    rigRef={rigRef}
                    isMobile={isMobile}
                />
                {startAnimations && <PostFX segmentsRef={segmentsRef} />}
            </CanvasRoot>
            <div className={styles.border}>
                <NineSliceBorder x={x} y={y} w={w} h={h} />
            </div>
        </div>
    );
}
```

`useBorderProjection` previously received a fresh object each render; the `useMemo` keeps its callback stable.

- [ ] **Step 8: Layout CSS** — create `src/routes/HomeWork/HomeWorkLayout.module.css`:

```text
.scroller {
    position: fixed;
    inset: 0;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none;
    touch-action: pan-y;
}

.scroller::-webkit-scrollbar {
    display: none;
}

.spacer {
    pointer-events: none;
}
```

- [ ] **Step 9: Layout** — create `src/routes/HomeWork/HomeWorkLayout.jsx`:

```text
import { useWorkItems } from '@app/WorkContext';
import { CAROUSEL_CONFIG } from '@canvas/features/carousel';
import ErrorBoundary from '@components/ErrorBoundary';
import LoadingScreen from '@components/navigation/LoadingScreen';
import { HOME_WORK, SCENE, TIMEOUT } from '@config/animation.config';
import { usePageTransition } from '@hooks/usePageTransition';
import { useGLTF } from '@react-three/drei';
import Lenis from 'lenis';
import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { decideUrl, getSegmentBounds, getSegments, pathForSegment, scrollForPath, snapTarget } from './homeWork';
import styles from './HomeWorkLayout.module.css';

const HomeWorkCanvas = lazy(() => import('@canvas/scenes/homeWork/HomeWorkCanvas'));

const clamp01 = (value) => Math.min(1, Math.max(0, value));

/** Layout route for / and /work: one scroll timeline (home → morph → carousel), one canvas, URL kept in sync. */
export default function HomeWorkLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const items = useWorkItems();
    const { registerLocalNavigation } = usePageTransition();

    const rootRef = useRef(null);
    const scrollerRef = useRef(null);
    const spacerRef = useRef(null);
    const lenisRef = useRef(null);
    const boundsRef = useRef(null);
    const segmentsRef = useRef({ home: 0, morph: 0, carousel: 0, inCarousel: false, velocity: 0 });
    const pathnameRef = useRef(location.pathname);
    pathnameRef.current = location.pathname;
    const hasPushedRef = useRef(false);
    const seekingRef = useRef(false);

    const skipLoading = !!location.state?.fromNavigation;
    const [isLoading, setIsLoading] = useState(!skipLoading);
    const [sceneStarted, setSceneStarted] = useState(skipLoading);
    const [showContent, setShowContent] = useState(skipLoading);
    const loadingTimerRef = useRef(null);

    useEffect(() => {
        useGLTF.preload('/assets/3d/Logo.glb');
        useGLTF.preload('/assets/3d/Wall.glb');
    }, []);

    // Clear the curtain's navigation state after reading it.
    useEffect(() => {
        if (location.state?.fromNavigation) {
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state?.fromNavigation, location.pathname, navigate]);

    const syncUrl = useCallback(() => {
        const action = decideUrl(segmentsRef.current.inCarousel, pathnameRef.current, hasPushedRef.current);
        if (!action) {
            return;
        }
        if (!action.replace) {
            hasPushedRef.current = true;
        }
        navigate(action.path, { replace: action.replace });
    }, [navigate]);

    useLayoutEffect(() => {
        const root = rootRef.current;
        const scroller = scrollerRef.current;
        const spacer = spacerRef.current;
        const lenis = new Lenis({
            wrapper: scroller,
            content: spacer,
            lerp: CAROUSEL_CONFIG.LENIS.LERP,
            smoothWheel: true,
            wheelMultiplier: CAROUSEL_CONFIG.LENIS.WHEEL_MULTIPLIER,
            touchMultiplier: CAROUSEL_CONFIG.LENIS.TOUCH_MULTIPLIER,
        });
        lenisRef.current = lenis;

        const onScroll = ({ scroll, velocity }) => {
            const segments = getSegments(scroll, boundsRef.current);
            Object.assign(segmentsRef.current, segments, { velocity: velocity / window.innerHeight });
            // Overlay fades without React renders: Home's DOM leaves over the end of home, Work's border arrives at the end of the morph.
            root.style.setProperty('--home-out', String(clamp01((segments.home - 0.7) / 0.3)));
            root.style.setProperty('--work-in', String(clamp01((segments.morph - 0.8) / 0.2)));
            if (!seekingRef.current) {
                syncUrl();
            }
        };

        const measure = () => {
            boundsRef.current = getSegmentBounds(window.innerHeight, items.length, HOME_WORK);
            // Scroll range = content height − viewport height.
            spacer.style.height = `${boundsRef.current.total + window.innerHeight}px`;
            lenis.resize();
        };

        measure();
        lenis.on('scroll', onScroll);
        lenis.scrollTo(scrollForPath(pathnameRef.current, boundsRef.current), { immediate: true, force: true });
        onScroll({ scroll: lenis.scroll, velocity: 0 });
        window.addEventListener('resize', measure);

        let rafId = 0;
        let idleFrames = 0;
        const raf = (time) => {
            lenis.raf(time);
            // Snap to the nearest card once the scroll settles, only inside the carousel.
            if (!lenis.isScrolling && !seekingRef.current) {
                idleFrames++;
                if (idleFrames === CAROUSEL_CONFIG.SNAP_IDLE_FRAMES) {
                    const target = snapTarget(lenis.scroll, boundsRef.current);
                    if (target !== null && Math.abs(lenis.scroll - target) > 1) {
                        lenis.scrollTo(target, { duration: CAROUSEL_CONFIG.SNAP_DURATION });
                    }
                }
            } else {
                idleFrames = 0;
            }
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', measure);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, [items.length, syncUrl]);

    // Animated scroll to a route's segment; the morph plays on the way. URL syncs once it lands.
    const seek = useCallback(
        (pathname) => {
            const lenis = lenisRef.current;
            if (!lenis) {
                return;
            }
            seekingRef.current = true;
            lenis.scrollTo(scrollForPath(pathname, boundsRef.current), {
                duration: SCENE.CAMERA_DURATION,
                force: true,
                onComplete: () => {
                    seekingRef.current = false;
                    syncUrl();
                },
            });
        },
        [syncUrl]
    );

    // Menu links between / and /work scroll instead of running the curtain.
    useEffect(
        () => registerLocalNavigation((path) => (path === '/' || path === '/work' ? (seek(path), true) : false)),
        [registerLocalNavigation, seek]
    );

    // Back/Forward: the URL moved but the scroll did not; follow it.
    useEffect(() => {
        if (!seekingRef.current && location.pathname !== pathForSegment(segmentsRef.current.inCarousel)) {
            seek(location.pathname);
        }
    }, [location.pathname, seek]);

    const onRevealStart = useCallback(() => setSceneStarted(true), []);
    const onLoadingComplete = () => {
        loadingTimerRef.current = setTimeout(() => {
            setIsLoading(false);
            setShowContent(true);
        }, TIMEOUT.COMPLETE_DELAY_MS);
    };
    useEffect(() => () => clearTimeout(loadingTimerRef.current), []);

    return (
        <div ref={rootRef}>
            {isLoading && (
                <LoadingScreen
                    onComplete={onLoadingComplete}
                    onRevealStart={onRevealStart}
                    minDisplayTime={TIMEOUT.LOADING_MIN_DISPLAY_MS}
                    logoSrc="/assets/img/logo/logo.svg"
                />
            )}
            <div ref={scrollerRef} id="home-work-scroller" className={styles.scroller}>
                <div ref={spacerRef} className={styles.spacer} />
                <Outlet context={{ showContent }} />
            </div>
            <ErrorBoundary>
                <Suspense fallback={null}>
                    <HomeWorkCanvas segmentsRef={segmentsRef} startAnimations={sceneStarted} />
                </Suspense>
            </ErrorBoundary>
        </div>
    );
}
```

- [ ] **Step 10: Routes** — in `src/app/routes.jsx`:

```text
const HomeWorkLayout = lazy(() => import('@routes/HomeWork/HomeWorkLayout.jsx'));
```

and replace the two route lines for `/` and `/work` with:

```text
            {
                element: withSuspense(<HomeWorkLayout />),
                children: [
                    { path: '/', element: withSuspense(<Home />) },
                    { path: '/work', element: withSuspense(<Work />) },
                ],
            },
```

- [ ] **Step 11: Home overlay** — `src/routes/Home/Home.jsx` keeps only the DOM. Remove the imports of `ErrorBoundary`, `LoadingScreen`, `useScrollNavigation`, `useGLTF`, `lazy`, `Suspense`, `useCallback`, `useEffect`, `useRef`, `useState`, `useLocation`, `useNavigate`, `SCROLL_THRESHOLDS`, `TIMEOUT`, and the `HomeCanvas` lazy import. Add `import { useOutletContext } from 'react-router-dom';`. The component becomes:

```text
export default function Home() {
    const { showContent } = useOutletContext();

    return (
        <div
            style={{
                opacity: showContent ? 1 : 0,
                transition: 'opacity 0.6s ease-out',
                pointerEvents: showContent ? 'auto' : 'none',
            }}
        >
            <div className={styles.section}>
                …the existing .content and .side blocks, unchanged…
            </div>
        </div>
    );
}
```

The `transitionSection` div and the `HomeCanvas` block are gone. `sideContainerVariants`/`sideItemVariants` stay.

- [ ] **Step 12: Home CSS** — in `src/routes/Home/Home.module.css` delete the `.page` rule (the layout's scroller replaced it) and the `.transitionSection` rule, and add the fade to `.section`:

```text
    opacity: calc(1 - var(--home-out, 0));
```

- [ ] **Step 13: Work overlay** — replace `src/routes/Work/Work.jsx` with:

```text
import { useState } from 'react';
import styles from './Work.module.css';

/** Work's DOM overlay; the carousel itself lives in the shared Home/Work canvas. */
export default function Work() {
    const [isTouchDevice] = useState(() => 'ontouchstart' in window);
    return isTouchDevice ? <p className={styles.touchHint}>Swipe to browse</p> : null;
}
```

and delete the `.pageContainer` rule from `Work.module.css`.

- [ ] **Step 14: Delete the replaced files**

```text
git rm src/hooks/useScrollNavigation.js src/canvas/scenes/home/HomeCanvas.jsx src/canvas/scenes/home/HomeCanvas.module.css src/canvas/scenes/work/WorkCanvas.jsx src/canvas/scenes/work/WorkCanvas.module.css
```

Then confirm nothing still references them:
Run: `grep -rn "useScrollNavigation\|HomeCanvas\|WorkCanvas\|scrollProgressRef\|entryComplete\|WORK_TOP_THRESHOLD" src`
Expected: no output.

- [ ] **Step 15: Run checks**

Run: `npm test && npm run lint && npm run fmt:check && npm run build`
Expected: pass.

- [ ] **Step 16: Browser check** (shared procedure), 1440×900:

1. `/` at scrollTop 0: dot panel and Home DOM visible, no console errors.
2. scrollTop = 0.5 × innerHeight (end of home): logo formed, Home DOM faded out.
3. scrollTop = 1.0 × innerHeight (mid-morph): logo smaller and nearer, camera between poses, URL still `/`.
4. scrollTop = 1.5 × innerHeight (carousel start): first card revealed and centred with the border frame; URL `/work`.
5. scrollTop = 2.5 × innerHeight: second card centred and revealed.
6. `history.back()` via `page.goBack()`: URL `/`, page scrolls back to the top, logo returns to the dot panel.
7. Fresh load of `/work`: loading screen, then the carousel at the first card.
8. Open the menu and click WORK while on `/`: no curtain, the morph plays, URL ends at `/work`.
9. Click the centred card: curtain, Entry page opens.
10. Viewport 390×844: carousel scrolls vertically.

- [ ] **Step 17: Commit**

```text
git add -A src package.json
git commit -m "feat(homework): share one canvas and scroll between Home and Work"
```

---

### Task 4: Particle trunk (stage 2)

Deliverable: during the morph the logo particles unravel into a vertical trunk on the carousel axis that keeps flowing down and speeds up while scrolling. The metallic logo fallback still shrinks onto the axis.

**Files:**

- Modify: `src/config/animation.config.js` (add `STREAM`)
- Modify: `src/canvas/features/logoParticles/logoParticles.config.js`
- Modify: `src/canvas/features/logoParticles/position.frag.glsl`
- Modify: `src/canvas/features/logoParticles/LogoParticles.jsx`
- Modify: `src/canvas/scenes/home/HomeScene.jsx`

**Interfaces:**

- Consumes: `streamRef.current.{ space, trunkY, trunkHalf, velocity }` from Task 3; `timeline.current.stream` (set here in HomeScene).
- Produces: sim uniforms `uStream`, `uStreamToLocal`, `uTrunkY`, `uTrunkHalf`, `uTrunkRadius`, `uFlow`, `uFlowStep` (Task 5 adds the branch uniforms).

- [ ] **Step 1: Config** — add the flow timing to `src/config/animation.config.js`:

```text
// Particle trunk flow: cycles per second at rest, plus extra cycles per second per viewport height per second of scroll.
export const STREAM = {
    FLOW_BASE: 0.05,
    FLOW_SCROLL_GAIN: 0.5,
};
```

and the geometry to `LOGO_PARTICLES`:

```text
    // Stream: trunk thickness (carousel units) and the share of particles that form the branch (Task 5).
    TRUNK_RADIUS: 0.08,
    BRANCH_SHARE: 0.2,
```

- [ ] **Step 2: Shader** — in `position.frag.glsl` add uniforms after `uScreenToLocal`:

```text
uniform float uStream;
uniform mat4 uStreamToLocal;
uniform float uTrunkY;
uniform float uTrunkHalf;
uniform float uTrunkRadius;
uniform float uFlow;
uniform float uFlowStep;
```

add the target function above `main`:

```text
// Point on the flowing trunk in carousel space, mapped into the particles' local space.
// wrapped: the particle crossed the bottom this frame and restarts at the top.
vec3 streamTarget(vec4 random, out bool wrapped) {
    float along = fract(random.x + uFlow);
    wrapped = along < uFlowStep;
    float angle = random.z * 6.2831853;
    float radius = uTrunkRadius * sqrt(fract(random.x * 13.37));
    vec3 p = vec3(cos(angle) * radius, uTrunkY + uTrunkHalf * (1.0 - 2.0 * along), sin(angle) * radius);
    return (uStreamToLocal * vec4(p, 1.0)).xyz;
}
```

and replace the goal and spring lines in `main`:

```text
    // Second stage: logo → stream, with the same per-particle lag.
    float stream = clamp((uStream - random.w * uMorphStagger) / (1.0 - uMorphStagger), 0.0, 1.0);
    bool wrapped;
    vec3 streamGoal = streamTarget(random, wrapped);

    vec3 goal = mix(mix(grid, origin, morph), streamGoal, stream);
    pos += (goal - pos) * uSpring * uDelta;
    // Jump wrapped particles straight to the top instead of springing back up the whole trunk.
    if (stream >= 1.0 && wrapped) {
        pos = goal;
    }
```

and widen the curl term to swirl during both transitions:

```text
    pos += curlNoise(pos * uCurlScale + uTime * uCurlSpeed) * uCurlStrength * (0.02 + sin(3.14159265 * morph) + sin(3.14159265 * stream)) * uDelta;
```

- [ ] **Step 3: Simulation uniforms** — in `createSimulation`'s `toUniforms({ … })` add:

```text
            uStream: 0,
            uStreamToLocal: new THREE.Matrix4(),
            uTrunkY: 0,
            uTrunkHalf: 10,
            uTrunkRadius: LOGO_PARTICLES.TRUNK_RADIUS,
            uFlow: 0,
            uFlowStep: 0,
```

- [ ] **Step 4: Per-frame stream inputs** — in `LogoParticles.jsx`: add `streamRef` to the props (`export default function LogoParticles({ timeline, gridSize, streamRef })`), import `STREAM` from `@config/animation.config`, add `const flowRef = useRef(0);`, read `stream` alongside `morph, intro` from `timeline.current`, and before `current.gpu.compute()` add:

```text
        // Stream: carousel space → particle space, trunk placement and flow.
        u.uStream.value = stream;
        const s = streamRef?.current;
        if (s?.space) {
            s.space.updateWorldMatrix(true, false);
            u.uStreamToLocal.value.copy(points.matrixWorld).invert().multiply(s.space.matrixWorld);
            u.uTrunkY.value = s.trunkY;
            u.uTrunkHalf.value = s.trunkHalf;
        }
        const flowStep = delta * (STREAM.FLOW_BASE + Math.abs(s?.velocity ?? 0) * STREAM.FLOW_SCROLL_GAIN * 60);
        flowRef.current = (flowRef.current + flowStep) % 1;
        u.uFlow.value = flowRef.current;
        u.uFlowStep.value = flowStep;
```

`velocity` is viewport heights per frame; `× 60` turns it into per second at 60 fps, matching `FLOW_SCROLL_GAIN`'s unit.

- [ ] **Step 5: HomeScene** — set the stream value and limit the shrink to the fallback. After `timeline.current.intro = cameraReveal;` add:

```text
        timeline.current.stream = blend;
```

initialise it in the ref: `useRef({ morph: 0, intro: 0, stream: 0 })`, and change the logo block from Task 3 to:

```text
            // Particles unravel into the stream; the metallic fallback shrinks onto the axis instead.
            const shrink = canSimulate ? 1 : 1 - blend;
            logo.position.z = canSimulate ? keyframe(LOGO_Z, 1, scroll) : lerp(keyframe(LOGO_Z, 1, scroll), 0, blend);
            logo.scale.setScalar(keyframe(LOGO_SCALE, 1, scroll) * viewportScale * shrink);
```

- [ ] **Step 6: Run checks**

Run: `npm test && npm run lint && npm run fmt:check && npm run build`
Expected: pass.

- [ ] **Step 7: Browser check** (shared procedure), 1440×900: screenshots at 1.0, 1.25 and 1.5 × innerHeight show the logo dissolving into a vertical line on the axis, then a thin flowing trunk behind the first card; two screenshots 0.5 s apart at 1.5 × innerHeight show particles moved down the trunk; no console errors. Then force the fallback (temporarily set `canSimulate` to `false`), confirm the metallic logo shrinks onto the axis and cards still reveal, and revert.

- [ ] **Step 8: Commit**

```text
git add src/config/animation.config.js src/canvas/features/logoParticles src/canvas/scenes/home/HomeScene.jsx
git commit -m "feat(particles): unravel the logo into a flowing trunk on the carousel axis"
```

---

### Task 5: Branch to the active card (stage 3)

Deliverable: a share of the trunk particles flows out along a branch to the centred card; it grows as the card centres and retracts as it leaves, then the next card's branch grows.

**Files:**

- Modify: `src/canvas/features/logoParticles/position.frag.glsl`
- Modify: `src/canvas/features/logoParticles/LogoParticles.jsx`
- Modify: `src/canvas/scenes/work/WorkScene.jsx`

**Interfaces:**

- Consumes: `streamRef.current.grow` (Task 3); adds `streamRef.current.branchY: number`, `streamRef.current.branchEnd: THREE.Vector3` (rig space, allocated in `HomeWorkCanvas`).
- Produces: sim uniforms `uBranchY`, `uBranchEnd`, `uBranchGrow`, `uBranchShare`.

- [ ] **Step 1: WorkScene writes the branch** — `calculateCardPosition` is not exported from the carousel index yet. In `src/canvas/features/carousel/index.js` change the first line to `export { calculateCardCenteredness, calculateCardPosition, getCarouselFov } from './carousel';`. Then in `WorkScene.jsx` import `calculateCardPosition` and, after `stream.grow = grow;`, add:

```text
        // Branch from the axis at the card's height out to just short of the card centre (rig space).
        const [cardX, cardY, cardZ] = calculateCardPosition(bestIndex);
        stream.branchY = cardY;
        stream.branchEnd.set(cardX * CAROUSEL_CONFIG.BRANCH.REACH, cardY, cardZ * CAROUSEL_CONFIG.BRANCH.REACH);
```

- [ ] **Step 2: Shader** — add uniforms:

```text
uniform float uBranchY;
uniform vec3 uBranchEnd;
uniform float uBranchGrow;
uniform float uBranchShare;
```

and in `streamTarget`, before the `return`, divert the branch share:

```text
    // A share of particles runs out along the branch to the centred card (twice the trunk's flow speed).
    if (random.y < uBranchShare && uBranchGrow > 0.0) {
        float out_ = fract(random.x + uFlow * 2.0);
        wrapped = out_ < uFlowStep * 2.0;
        p = mix(vec3(0.0, uBranchY, 0.0), uBranchEnd, out_ * uBranchGrow) + vec3(cos(angle), sin(angle), 0.0) * radius * 0.5;
    }
```

- [ ] **Step 3: Simulation uniforms** — add to `toUniforms({ … })`:

```text
            uBranchY: 0,
            uBranchEnd: new THREE.Vector3(),
            uBranchGrow: 0,
            uBranchShare: LOGO_PARTICLES.BRANCH_SHARE,
```

and inside the `if (s?.space)` block in `useFrame`:

```text
            u.uBranchY.value = s.branchY;
            u.uBranchEnd.value.copy(s.branchEnd);
            u.uBranchGrow.value = s.grow;
```

- [ ] **Step 4: Run checks**

Run: `npm test && npm run lint && npm run fmt:check && npm run build`
Expected: pass.

- [ ] **Step 5: Browser check** (shared procedure), 1440×900: at 1.5 × innerHeight a branch runs from the trunk to the first card; at 2.0 × innerHeight (between cards) the branch is short or gone; at 2.5 × innerHeight it reaches the second card. Repeat at 390×844. No console errors.

- [ ] **Step 6: Commit**

```text
git add src/canvas/features/carousel/index.js src/canvas/features/logoParticles src/canvas/scenes/work/WorkScene.jsx
git commit -m "feat(particles): branch the trunk to the centred work card"
```

---

### Task 6: Fibre stream (amendment 2026-11-20)

Deliverable: the dense dot trunk becomes a sparse, swaying bundle of brand-cyan light trails (fibre-optic look) with a few sparks; the logo particles hand off to it over the end of the morph and then stop simulating. The branch uses the same trails while scrolling.

**Files:**

- Create: `src/canvas/core/shaders/streamPath.glsl` (shared path: sim + fibres)
- Create: `src/canvas/features/streamFibers/{StreamFibers.jsx,streamFibers.config.js,streamFibers.vert.glsl,streamFibers.frag.glsl,index.js}`
- Modify: `src/config/animation.config.js` (`STREAM.SWAY_SPEED`)
- Modify: `src/canvas/scenes/work/WorkScene.jsx` (flow + fade into `streamRef`, mount fibres in the rig)
- Modify: `src/canvas/features/logoParticles/{position.frag.glsl,LogoParticles.jsx,LogoParticlesMaterial.js,particles.vert.glsl,logoParticles.config.js}`

**Interfaces:**

- Consumes: `streamRef.current.{ space, trunkY, trunkHalf, velocity, grow, branchY, branchEnd }`, `segmentsRef.current.morph`.
- Produces: `streamRef.current.flow` (0–1, wraps), `streamRef.current.flowStep` (this frame's flow increment), `streamRef.current.fade` (0 = particles, 1 = fibres), all written by WorkScene; `STREAM_FIBERS` config; GLSL `swayBend`, `trunkPoint`, `branchPoint`.

- [ ] **Step 1: Config.** Add to `STREAM` in `src/config/animation.config.js`:

```text
    // Bundle sway: radians of phase per second.
    SWAY_SPEED: 0.4,
```

Create `src/canvas/features/streamFibers/streamFibers.config.js`:

```text
// Fibre stream geometry and look (timing lives in @config/animation.config STREAM).
export const FIBER_TIERS = { low: 300, medium: 700, high: 1200 };

export const STREAM_FIBERS = {
    POINTS_PER_FIBER: 24,
    // Trail length as a fraction of the trunk's flow cycle.
    TRAIL: 0.06,
    // Bundle radius in carousel units; the logo particles land on the same spread.
    SPREAD: 0.35,
    // Bundle sway: amplitude (units), frequency (per unit of height), per-strand amplitude.
    SWAY_AMPLITUDE: 0.25,
    SWAY_FREQUENCY: 0.6,
    STRAND_AMPLITUDE: 0.06,
    // One spark per this many fibres; sparks drift at SPARK_SPREAD × SPREAD.
    SPARK_EVERY: 10,
    SPARK_SPREAD: 3,
    SPARK_SIZE: 6,
    // Hand-off: fibres fade in (particles out) over this last part of the morph.
    HANDOFF_START: 0.85,
};
```

and `index.js`: `export { default as StreamFibers } from './StreamFibers';` plus `export { STREAM_FIBERS } from './streamFibers.config';`. In `logoParticles.config.js` delete `TRUNK_RADIUS` (the spread now comes from `STREAM_FIBERS.SPREAD`).

- [ ] **Step 2: Shared path** — create `src/canvas/core/shaders/streamPath.glsl`:

```text
// Stream path in carousel (rig) space, shared by the logo-particle sim and the fibres so the hand-off lines up.
// sway = (bundle amplitude, frequency, phase = time × speed, per-strand amplitude).

vec2 swayBend(float y, vec4 sway) {
    return sway.x * vec2(sin(y * sway.y + sway.z), cos(y * sway.y * 0.7 + sway.z * 1.3));
}

vec2 swayStrand(float y, float angle, vec4 sway) {
    return sway.w * vec2(sin(y * sway.y * 3.1 + angle + sway.z * 1.7), cos(y * sway.y * 2.3 + angle * 1.3 + sway.z));
}

// along 0 = top of the trunk, 1 = bottom.
vec3 trunkPoint(float along, float angle, float radius, float trunkY, float trunkHalf, vec4 sway) {
    float y = trunkY + trunkHalf * (1.0 - 2.0 * along);
    vec2 offset = swayBend(y, sway) + swayStrand(y, angle, sway) + vec2(cos(angle), sin(angle)) * radius;
    return vec3(offset.x, y, offset.y);
}

// t 0 = on the trunk at the card's height, 1 = at branchEnd. Bows upward mid-way so it reads as a curve.
vec3 branchPoint(float t, float angle, float radius, float branchY, vec3 branchEnd, vec4 sway) {
    vec2 bend = swayBend(branchY, sway);
    vec3 p = mix(vec3(bend.x, branchY, bend.y), branchEnd, t) + vec3(0.0, sin(3.14159265 * t) * 0.25, 0.0);
    vec2 offset = swayStrand(p.y, angle, sway) + vec2(cos(angle), sin(angle)) * radius * (1.0 - 0.5 * t);
    return p + vec3(offset.x, 0.0, offset.y);
}
```

- [ ] **Step 3: Sim uses the shared path.** In `position.frag.glsl`: add `#include ../../core/shaders/streamPath.glsl;` after the curl include, add `uniform vec4 uSway;`, and replace the body of `streamTarget()` after the `seed` line with:

```text
    float angle = random.z * 6.2831853;
    float radius = uTrunkRadius * sqrt(fract(random.x * 13.37));
    float along = fract(seed + uFlow);
    wrapped = along < uFlowStep;
    vec3 p = trunkPoint(along, angle, radius, uTrunkY, uTrunkHalf, uSway);
    // A share of particles runs out along the branch to the centred card (twice the trunk's flow speed).
    if (random.y < uBranchShare && uBranchGrow > 0.0) {
        float out_ = fract(seed + uFlow * 2.0);
        wrapped = out_ < uFlowStep * 2.0;
        p = branchPoint(out_ * uBranchGrow, angle, radius, uBranchY, uBranchEnd, uSway);
    }
    return (uStreamToLocal * vec4(p, 1.0)).xyz;
```

- [ ] **Step 4: WorkScene owns flow and fade.** In `WorkScene.jsx`: change the frame callback to `useFrame((_, delta) => { … }, -1)`, import `STREAM` from `@config/animation.config`, `easeCurve` from `@utils/easingFunctions`, `StreamFibers, STREAM_FIBERS` from `@canvas/features/streamFibers`, destructure `smoothstep` from `THREE.MathUtils`, and after the branch lines add:

```text
        // Flow: one shared phase for the sim and the fibres. velocity is viewport heights per frame.
        const scrollSpeed = delta > 0 ? Math.abs(velocity) / delta : 0;
        stream.flowStep = delta * (STREAM.FLOW_BASE + scrollSpeed * STREAM.FLOW_SCROLL_GAIN);
        stream.flow = (stream.flow + stream.flowStep) % 1;
        // Hand-off from particles to fibres over the end of the morph (same easing as HomeScene's blend).
        stream.fade = smoothstep(easeCurve(morph), STREAM_FIBERS.HANDOFF_START, 1);
```

Initialise `flow: 0, flowStep: 0, fade: 0` in the `streamRef` object in `HomeWorkCanvas.jsx`. Mount the fibres inside the rig so they share its space: `<group ref={setRigRef}>{…cards…}<StreamFibers streamRef={streamRef} /></group>`.

- [ ] **Step 5: LogoParticles hands off.** In `LogoParticles.jsx`: delete `flowRef` and the `STREAM` import; replace the flow lines with `u.uFlow.value = s?.flow ?? 0; u.uFlowStep.value = s?.flowStep ?? 0;`; add `uTrunkRadius: STREAM_FIBERS.SPREAD` (import from `@canvas/features/streamFibers`) and `uSway: new THREE.Vector4()` to `toUniforms`; inside `if (s?.space)` set `u.uSway.value.set(STREAM_FIBERS.SWAY_AMPLITUDE, STREAM_FIBERS.SWAY_FREQUENCY, time * STREAM.SWAY_SPEED, STREAM_FIBERS.STRAND_AMPLITUDE)` (keep the `STREAM` import for this). Before `current.gpu.compute()`:

```text
        // Once the fibres have taken over, the particles are out of view: stop simulating and drawing them.
        const fade = s?.fade ?? 0;
        points.visible = points.visible && fade < 1;
        if (fade >= 1) {
            return;
        }
```

and after the render uniforms: `material.uStreamFade = fade;`. In `LogoParticlesMaterial.js` add `uStreamFade: 0` to the uniforms; in `particles.vert.glsl` add `uniform float uStreamFade;` and multiply `gl_PointSize` by `(1.0 - uStreamFade)`.

- [ ] **Step 6: Fibre shaders** — `streamFibers.vert.glsl`:

```text
uniform float uTrunkY;
uniform float uTrunkHalf;
uniform float uSpread;
uniform float uFlow;
uniform float uTrail;
uniform float uBranchY;
uniform vec3 uBranchEnd;
uniform float uBranchGrow;
uniform float uBranchShare;
uniform vec4 uSway;
uniform float uSpark;
uniform float uPointSize;
uniform float uDpr;
attribute vec4 random;
attribute float trail;
varying float vAlpha;

#include ../../core/shaders/streamPath.glsl;

void main() {
    // Same seed as the particle sim, so fibres sit where the particles were.
    float seed = fract(sin(dot(random.xyz, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
    float angle = random.z * 6.2831853;
    float radius = uSpread * sqrt(fract(random.x * 13.37)) * mix(1.0, 3.0, uSpark);
    // Head at the flow position, tail sampled slightly earlier on the same path.
    float head = fract(seed + uFlow * mix(1.0, 0.5, uSpark));
    float along = head - trail * uTrail;
    vec3 p = trunkPoint(along, angle, radius, uTrunkY, uTrunkHalf, uSway);
    float alpha = (1.0 - trail) * (1.0 - trail) * mix(0.25, 1.0, random.w);
    if (uSpark < 0.5 && random.y < uBranchShare && uBranchGrow > 0.0) {
        float out_ = fract(seed + uFlow * 2.0) - trail * uTrail * 2.0;
        p = branchPoint(clamp(out_, 0.0, 1.0) * uBranchGrow, angle, radius, uBranchY, uBranchEnd, uSway);
        alpha *= step(0.0, out_);
    }
    // Hide the part of a tail that would wrap past the top of the trunk.
    alpha *= step(0.0, along);
    vAlpha = alpha;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uPointSize * uDpr * uSpark / -mvPosition.z;
}
```

`streamFibers.frag.glsl`:

```text
uniform vec3 uColor;
uniform float uFade;
varying float vAlpha;

void main() {
    gl_FragColor = vec4(uColor * vAlpha * uFade, 1.0);
}
```

(Additive blending: colour is pre-multiplied by alpha.)

- [ ] **Step 7: `StreamFibers.jsx`:**

```text
import { useQuality } from '@app/QualityContext';
import { STREAM } from '@config/animation.config';
import { useFrame, useThree } from '@react-three/fiber';
import { getCSSColorRGBA } from '@utils/cssUtils';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { FIBER_TIERS, STREAM_FIBERS } from './streamFibers.config';
import fibersFrag from './streamFibers.frag.glsl';
import fibersVert from './streamFibers.vert.glsl';

const { POINTS_PER_FIBER: K } = STREAM_FIBERS;

/** Fibre geometry: `count` strands of K points (line segments between neighbours), plus per-vertex random and trail position. */
function createFibers(count) {
    const randoms = new Float32Array(count * K * 4);
    const trail = new Float32Array(count * K);
    const index = [];
    for (let f = 0; f < count; f++) {
        const r = [Math.random(), Math.random(), Math.random(), Math.random()];
        for (let k = 0; k < K; k++) {
            const v = f * K + k;
            randoms.set(r, v * 4);
            trail[v] = k / (K - 1);
            if (k > 0) {
                index.push(v - 1, v);
            }
        }
    }
    const geometry = new THREE.BufferGeometry()
        .setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * K * 3), 3))
        .setAttribute('random', new THREE.BufferAttribute(randoms, 4))
        .setAttribute('trail', new THREE.BufferAttribute(trail, 1));
    geometry.setIndex(index);
    return geometry;
}

/** Spark geometry: one point per SPARK_EVERY fibres, at the head (trail 0). */
function createSparks(count) {
    const sparks = Math.max(1, Math.round(count / STREAM_FIBERS.SPARK_EVERY));
    return new THREE.BufferGeometry()
        .setAttribute('position', new THREE.BufferAttribute(new Float32Array(sparks * 3), 3))
        .setAttribute('random', new THREE.BufferAttribute(Float32Array.from({ length: sparks * 4 }, Math.random), 4))
        .setAttribute('trail', new THREE.BufferAttribute(new Float32Array(sparks), 1));
}

function createMaterial(color, spark) {
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
            uBranchY: { value: 0 },
            uBranchEnd: { value: new THREE.Vector3() },
            uBranchGrow: { value: 0 },
            uBranchShare: { value: 0.2 },
            uSway: { value: new THREE.Vector4() },
            uSpark: { value: spark ? 1 : 0 },
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
    const count = FIBER_TIERS[quality];

    const color = useMemo(() => {
        const { r, g, b } = getCSSColorRGBA('--c-brnd_100');
        return new THREE.Color().setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
    }, []);
    const fibers = useMemo(() => createFibers(count), [count]);
    const sparks = useMemo(() => createSparks(count), [count]);
    const materials = useMemo(() => [createMaterial(color, false), createMaterial(color, true)], [color]);
    useEffect(() => () => fibers.dispose(), [fibers]);
    useEffect(() => () => sparks.dispose(), [sparks]);
    useEffect(() => () => materials.forEach((m) => m.dispose()), [materials]);

    useFrame(({ clock }) => {
        const s = streamRef.current;
        const group = groupRef.current;
        if (!group) {
            return;
        }
        // Only drawn once the hand-off has started.
        group.visible = s.fade > 0;
        if (!group.visible) {
            return;
        }
        for (const material of materials) {
            const u = material.uniforms;
            u.uTrunkY.value = s.trunkY;
            u.uTrunkHalf.value = s.trunkHalf;
            u.uFlow.value = s.flow;
            u.uBranchY.value = s.branchY;
            u.uBranchEnd.value.copy(s.branchEnd);
            u.uBranchGrow.value = s.grow;
            u.uSway.value.set(STREAM_FIBERS.SWAY_AMPLITUDE, STREAM_FIBERS.SWAY_FREQUENCY, clock.elapsedTime * STREAM.SWAY_SPEED, STREAM_FIBERS.STRAND_AMPLITUDE);
            u.uDpr.value = dpr;
            u.uFade.value = s.fade;
        }
    });

    return (
        <group ref={groupRef} visible={false}>
            <lineSegments geometry={fibers} material={materials[0]} frustumCulled={false} />
            <points geometry={sparks} material={materials[1]} frustumCulled={false} />
        </group>
    );
}
```

`uBranchShare` must match `LOGO_PARTICLES.BRANCH_SHARE`; import it instead of the literal `0.2` (`import { LOGO_PARTICLES } from '@canvas/features/logoParticles/logoParticles.config'`).

- [ ] **Step 8: Run checks**

Run: `npm test && npm run lint && npm run fmt:check && npm run build`
Expected: pass.

- [ ] **Step 9: Browser check** (shared procedure), 1440×900 and 390×844: at 1.0 × innerHeight particles converge on a swaying path; at 1.4 × innerHeight particles fade while trails appear; at 1.5 × innerHeight a sparse bundle of thin cyan light trails with bright heads and fading tails, gently curved, a few sparks, no dense dots; two frames 0.5 s apart differ (flow + sway); about 90 ms after setting scrollTop to 1.7 × innerHeight trails run out to the second card. Compare against the reference look (fibre-optic light trails). No console errors. Tune only the `STREAM_FIBERS` values (spread, trail, sway, counts) if the look is clearly off, and report the values used.

- [ ] **Step 10: Commit**

```text
git add src/config/animation.config.js src/canvas/core/shaders/streamPath.glsl src/canvas/features/streamFibers src/canvas/features/logoParticles src/canvas/scenes/work/WorkScene.jsx src/canvas/scenes/homeWork/HomeWorkCanvas.jsx
git commit -m "feat(stream): fibre-optic light trails replace the dense particle trunk"
```

---

### Task 7: Final verification

**Files:** none changed unless a check fails.

- [ ] **Step 1: Full checks**

Run: `npm test && npm run lint && npm run fmt:check && npm run build`
Expected: pass.

- [ ] **Step 2: Browser sweep** (shared procedure). Repeat Task 3 Step 16 items 1–10 on the finished build, plus: quality tier `low` (temporarily force it in `QualityContext`) shows the trunk with fewer particles and no ambient occlusion; navigating About → menu WORK runs the curtain and lands on the first card; Entry page → Back returns to `/work` at the first card.

- [ ] **Step 3: Report** any failure with its screenshot path and fix it in the task it belongs to before finishing the branch.

---

## Revisions (amendment 2026-11-21)

User revisions after Task 7: on-screen card growth, an organic branch to the card's four corners, and a gradual exit from Home. Global Constraints still apply.

### Task 8: Cards grow with their place on screen

**Files:**

- Modify: `src/canvas/features/carousel/carousel.config.js`, `carousel.js`, `index.js`, `WorkCard.jsx`
- Modify: `src/canvas/scenes/work/WorkScene.jsx`

**Interfaces:**

- Produces: `calculateCardFrameScale(centeredness, morph) → number` (0 = hidden, otherwise the card's scale), exported from `@canvas/features/carousel`. Task 9 uses it for the corners. `WorkCard` prop `revealed` is replaced by `segmentsRef`.

- [ ] **Step 1: Config** — in `carousel.config.js` delete the `ENTRY` block and `BRANCH.REVEAL_AT` and its comment line, and add:

```text
    // On-screen growth: full size within FULL_WITHIN of the centre, 0 at ENTER_FROM (about 1.5 card steps, just past the
    // frame edge). Centeredness units: |angle difference| / π. The first card grows in from MORPH_FROM of the morph.
    FRAME: {
        FULL_WITHIN: 0.2 / Math.PI,
        ENTER_FROM: 1.2 / Math.PI,
        MORPH_FROM: 0.6,
    },
```

- [ ] **Step 2: Scale function** — append to `carousel.js` and export it from `index.js`:

```text
const smooth01 = (t) => {
    const x = Math.min(1, Math.max(0, t));
    return x * x * (3 - 2 * x);
};

/** Card scale on screen: grows in from the frame edge, full near the centre, and grows in over the end of the morph. */
export function calculateCardFrameScale(centeredness, morph) {
    const { FULL_WITHIN, ENTER_FROM, MORPH_FROM } = CAROUSEL_CONFIG.FRAME;
    const onScreen = 1 - smooth01((centeredness - FULL_WITHIN) / (ENTER_FROM - FULL_WITHIN));
    const arrived = smooth01((morph - MORPH_FROM) / (1 - MORPH_FROM));
    return calculateCardScale(centeredness) * onScreen * arrived;
}
```

- [ ] **Step 3: `WorkCard`** — replace the `revealed = false` prop with `segmentsRef`; delete `entryTimeRef`, `wasVisibleRef`, `scaleRef`, `SCALE_DAMPING`, the `entryEase` and `damp`-for-scale usage that only served them (keep `damp` for the hover). Replace the body between the hover-reset block and the hover damping with:

```text
        // Size follows the card's place on screen; nothing is drawn or hit-tested at scale 0.
        const scale = calculateCardFrameScale(centerednessRef.current[index] ?? 1, segmentsRef.current.morph);
        group.scale.setScalar(scale);
        group.visible = visible && scale > 0.001;
        if (!group.visible) {
            return;
        }
```

Import `calculateCardFrameScale` from `./carousel` (and drop `calculateCardScale` from that import if unused). Remove the JSX `visible={visible}` on the group (the frame loop owns it now).

- [ ] **Step 4: `WorkScene`** — delete `revealedRef`, `revealedCount`/`setRevealedCount` and the reveal block (`grow >= …REVEAL_AT`); pass `segmentsRef={segmentsRef}` to each `WorkCard` instead of `revealed`. Keep `grow` (the branch still uses it).

- [ ] **Step 5: Checks** — `npm test && npm run lint && npm run fmt:check && npm run build`; `grep -rn "revealed\|REVEAL_AT\|ENTRY\.CARD_DURATION" src` returns nothing.

- [ ] **Step 6: Browser check** (shared procedure), 1440×900: at 1.3 × innerHeight (end of the morph) the first card is growing in; at 1.5 × the first card is full size and the neighbour at the frame edge is partly grown; about 90 ms after setting scrollTop to 2.0 × both cards are mid-size; at 2.5 × the second card is full size and the first has shrunk at the edge. Repeat at 390×844. No console errors.

- [ ] **Step 7: Commit**

```text
git add src/canvas/features/carousel src/canvas/scenes/work/WorkScene.jsx
git commit -m "feat(carousel): cards grow as they enter the frame and shrink as they leave"
```

---

### Task 9: Organic branch to the card's four corners

**Files:**

- Modify: `src/canvas/core/shaders/streamPath.glsl`
- Modify: `src/canvas/features/streamFibers/{streamFibers.vert.glsl,StreamFibers.jsx}`
- Modify: `src/canvas/features/logoParticles/{position.frag.glsl,LogoParticles.jsx}`
- Modify: `src/canvas/features/carousel/carousel.config.js`, `src/canvas/scenes/work/WorkScene.jsx`, `src/canvas/scenes/homeWork/HomeWorkCanvas.jsx`

**Interfaces:**

- Consumes: `calculateCardFrameScale` (Task 8), `CARD_WIDTH`/`CARD_HEIGHT` from `@canvas/features/carousel/cardGeometry`.
- Produces: `streamRef.current.{ cardCenter, cardRight, cardUp }` (THREE.Vector3, rig space; right/up are half-extent vectors at the card's current scale), replacing `branchY`/`branchEnd`. GLSL `cornerBranchPoint`.

- [ ] **Step 1: Config** — in `carousel.config.js` replace `BRANCH.REACH` with:

```text
        // Strands leave the trunk this far above/below the card centre (rig units) and bow outward past the corner
        // by OUTWARD × the centre→corner distance before landing on it.
        RISE: 1.2,
        OUTWARD: 0.35,
```

- [ ] **Step 2: Path** — in `streamPath.glsl` replace `branchPoint` with:

```text
// Branch strand from the trunk (above or below the card) onto one card corner, as a cubic Bézier.
// t 0 = on the trunk at startY, 1 = on the corner. The strand keeps the flow's sway and tapers onto the corner.
vec3 cornerBranchPoint(float t, float angle, float radius, float startY, vec3 corner, vec3 cardCenter, float outward, vec4 sway) {
    vec2 bend = swayBend(startY, sway);
    vec3 p0 = vec3(bend.x, startY, bend.y);
    // Leave along the flow first, then swing outward past the corner and land on it.
    vec3 p1 = vec3(p0.x, mix(startY, corner.y, 0.6), p0.z);
    vec3 p2 = corner + (corner - cardCenter) * outward;
    float u = 1.0 - t;
    vec3 p = u * u * u * p0 + 3.0 * u * u * t * p1 + 3.0 * u * t * t * p2 + t * t * t * corner;
    vec2 offset = swayStrand(p.y, angle, sway) * (1.0 - t) + vec2(cos(angle), sin(angle)) * radius * (1.0 - t);
    return p + vec3(offset.x, 0.0, offset.y);
}
```

- [ ] **Step 3: Sim drops its branch** — in `position.frag.glsl` delete the branch `if` block in `streamTarget()` and the uniforms `uBranchY`, `uBranchEnd`, `uBranchGrow`, `uBranchShare`; in `LogoParticles.jsx` delete those four from `toUniforms` and from the per-frame update. (The branch is only active once the morph has completed, when the sim no longer runs.)

- [ ] **Step 4: Fibre shader** — in `streamFibers.vert.glsl` replace the uniforms `uBranchY`, `uBranchEnd` with:

```text
uniform vec3 uCardCenter;
uniform vec3 uCardRight;
uniform vec3 uCardUp;
uniform float uBranchRise;
uniform float uBranchOutward;
```

and replace the branch block inside `if (uSpark < 0.5 && random.y < uBranchShare && uBranchGrow > 0.0) { … }` with:

```text
        // Corner pick: two bits from a decorrelated hash (random.y is the branch pick, random.x the radius).
        float corner = floor(fract(seed * 7.31) * 4.0);
        float sx = mod(corner, 2.0) * 2.0 - 1.0;
        float sy = step(2.0, corner) * 2.0 - 1.0;
        vec3 target = uCardCenter + uCardRight * sx + uCardUp * sy;
        float out_ = fract(seed + uFlow * 2.0) - trail * uTrail * 2.0;
        p = cornerBranchPoint(clamp(out_, 0.0, 1.0) * uBranchGrow, angle, radius, uCardCenter.y + sy * uBranchRise, target, uCardCenter, uBranchOutward, uSway);
        alpha *= step(0.0, out_);
```

- [ ] **Step 5: Fibre uniforms** — in `StreamFibers.jsx`'s `createMaterial` replace `uBranchY`/`uBranchEnd` with `uCardCenter`, `uCardRight`, `uCardUp` (`new THREE.Vector3()` each), `uBranchRise: CAROUSEL_CONFIG.BRANCH.RISE`, `uBranchOutward: CAROUSEL_CONFIG.BRANCH.OUTWARD` (import `CAROUSEL_CONFIG` from `@canvas/features/carousel`), and in the frame loop replace the two branch copies with `u.uCardCenter.value.copy(s.cardCenter); u.uCardRight.value.copy(s.cardRight); u.uCardUp.value.copy(s.cardUp);`.

- [ ] **Step 6: WorkScene writes the card frame** — replace the `branchY`/`branchEnd` lines with:

```text
        // The centred card's centre and half-extents at its current on-screen scale (rig space), for the corner branch.
        const [cardX, cardY, cardZ] = calculateCardPosition(bestIndex);
        const angle = bestIndex * CAROUSEL_CONFIG.ANGLE_STEP;
        const cardScale = calculateCardFrameScale(minCenteredness, morph);
        stream.cardCenter.set(cardX, cardY, cardZ);
        stream.cardRight.set(Math.cos(angle), 0, -Math.sin(angle)).multiplyScalar((CARD_WIDTH / 2) * cardScale);
        stream.cardUp.set(0, (CARD_HEIGHT / 2) * cardScale, 0);
```

(import `calculateCardFrameScale` from `@canvas/features/carousel`, `CARD_WIDTH, CARD_HEIGHT` from `@canvas/features/carousel/cardGeometry`). In `HomeWorkCanvas.jsx` replace `branchY: 0, branchEnd: new THREE.Vector3()` in the `streamRef` object with `cardCenter: new THREE.Vector3(), cardRight: new THREE.Vector3(), cardUp: new THREE.Vector3()`. Confirm with `grep -rn "branchY\|branchEnd\|REACH" src` that nothing else uses the old names.

- [ ] **Step 7: Checks** — `npm test && npm run lint && npm run fmt:check && npm run build`.

- [ ] **Step 8: Browser check** (shared procedure), 1440×900 and 390×844: at 1.5 × innerHeight (first card centred, settled) curved strands leave the trunk above and below the card and land on its four corners, visible around the card; about 90 ms after setting scrollTop to 2.0 × the branch has retracted; at 2.5 × the strands reach the second card's corners. Compare with the variant A mockup (strands from above to the top corners, from below to the bottom corners). No console errors.

- [ ] **Step 9: Commit**

```text
git add src/canvas/core/shaders/streamPath.glsl src/canvas/features/streamFibers src/canvas/features/logoParticles src/canvas/features/carousel/carousel.config.js src/canvas/scenes/work/WorkScene.jsx src/canvas/scenes/homeWork/HomeWorkCanvas.jsx
git commit -m "feat(stream): branch strands peel off the flow onto the card's corners"
```

---

### Task 10: Gradual, cinematic exit from Home

**Files:**

- Modify: `src/config/animation.config.js` (`HOME_WORK.EXIT_END`, `HOME_WORK.EXIT_RECEDE`)
- Modify: `src/canvas/scenes/home/HomeScene.jsx`
- Modify: `src/canvas/features/laser/LaserPlane.jsx`
- Modify: `src/canvas/features/logoParticles/{particles.vert.glsl,LogoParticles.jsx,LogoParticlesMaterial.js}`
- Modify: `src/canvas/features/streamFibers/streamFibers.config.js`

**Interfaces:**

- Consumes: `segmentsRef.current.morph` via HomeScene's `streamProgress`.
- Produces: `LaserPlane` prop `fadeOutRef` (number ref, 0 = visible, 1 = gone; optional).

- [ ] **Step 1: Config** — add to `HOME_WORK` in `animation.config.js`:

```text
    // Home's video wall, title, subtitle and laser fade and recede over the first EXIT_END of the morph, by EXIT_RECEDE units.
    EXIT_END: 0.5,
    EXIT_RECEDE: 20,
```

In `streamFibers.config.js` replace the two hand-off values and their comment with:

```text
    // Morph progress (logo → stream, 0–1): the fibres brighten by FADE_IN_END; each dense logo particle disappears at
    // its own moment between PARTICLE_FADE_START and PARTICLE_FADE_END, so the density drops gradually.
    FADE_IN_END: 0.6,
    PARTICLE_FADE_START: 0.05,
    PARTICLE_FADE_END: 0.85,
```

- [ ] **Step 2: No warp** — in `HomeScene.jsx` change `export const CAMERA_FOV = [70, 50, 100];` to `[70, 50, 75]`.

- [ ] **Step 3: Extras fade and recede** — in `HomeScene.jsx` import `HOME_WORK` from `@config/animation.config`, add `const exitRef = useRef(0);`, and replace the two `.visible = streamProgress === 0` blocks with:

```text
        // Home's extras fade and recede over the first part of the morph; they stop rendering once fully gone.
        const exit = smoothstep(streamProgress, 0, HOME_WORK.EXIT_END);
        exitRef.current = exit;
        const extras = extrasRef.current;
        if (extras) {
            extras.visible = exit < 1;
            extras.position.z = -exit * HOME_WORK.EXIT_RECEDE;
            extras.traverse((object) => {
                const material = object.material;
                if (material && !Array.isArray(material)) {
                    material.transparent = true;
                    material.opacity = 1 - exit;
                }
            });
        }
        if (laserRef.current) {
            laserRef.current.visible = exit < 1;
        }
```

and pass `fadeOutRef={exitRef}` to `<LaserPlane />`. If the title/subtitle (drei `Text`) ignore `material.opacity`, set their `fillOpacity` instead through a ref, and say so in the report.

- [ ] **Step 4: Laser fade-out** — in `LaserPlane.jsx` accept `fadeOutRef`, keep the fade-in in its own ref and multiply:

```text
    const fadeInRef = useRef(0);
```

```text
        fadeInRef.current = Math.min(1, fadeInRef.current + dt); // fades in over ~1 s (~2 s on low quality)
        u.uFade.value = fadeInRef.current * (1 - (fadeOutRef?.current ?? 0));
```

(replacing the existing `u.uFade.value = Math.min(1, u.uFade.value + dt);` line).

- [ ] **Step 5: Particles disappear one by one** — in `LogoParticlesMaterial.js` add `uFadeStart: STREAM_FIBERS.PARTICLE_FADE_START` and `uFadeEnd: STREAM_FIBERS.PARTICLE_FADE_END` to the uniforms (import `STREAM_FIBERS` from `@canvas/features/streamFibers`) and rename `uStreamFade` to `uStream`. In `particles.vert.glsl` replace `uniform float uStreamFade;` with:

```text
uniform float uStream;
uniform float uFadeStart;
uniform float uFadeEnd;
```

and the `(1.0 - uStreamFade)` factor with `keep`, computed before the `gl_PointSize` line:

```text
    // Each particle disappears at its own moment over the morph (decorrelated from random.x, which sets its size).
    float cut = mix(uFadeStart, uFadeEnd, fract(random.z * 7.31 + random.y * 3.17));
    float keep = 1.0 - smoothstep(cut - 0.05, cut, uStream);
```

In `LogoParticles.jsx` replace the `fade` lines with:

```text
        // The dense logo thins out particle by particle over the morph; once past the last cut nothing is drawn.
        points.visible = points.visible && stream < STREAM_FIBERS.PARTICLE_FADE_END;
```

and set `material.uStream = stream;` where `material.uStreamFade = fade;` was.

- [ ] **Step 6: Checks** — `npm test && npm run lint && npm run fmt:check && npm run build`; `grep -rn "uStreamFade" src` returns nothing.

- [ ] **Step 7: Browser check** (shared procedure), 1440×900: frames every ~100 ms during a menu Home → Work seek and at scroll positions 0.45, 0.5, 0.6, 0.75, 0.9, 1.1, 1.3 × innerHeight. Expected: no wide-angle warp at the end of Home; the video wall, title and laser fade and recede over the first half of the morph (no single-frame disappearance); the logo thins out gradually into strands (no sudden density change); the fibres brighten smoothly. Scroll back to 0.3 × and everything returns. No console errors.

- [ ] **Step 8: Commit**

```text
git add src/config/animation.config.js src/canvas/scenes/home/HomeScene.jsx src/canvas/features/laser/LaserPlane.jsx src/canvas/features/logoParticles src/canvas/features/streamFibers/streamFibers.config.js
git commit -m "feat(homework): gradual exit from Home — no warp, fading extras, particles thin out one by one"
```

---

### Task 11: Verify the revisions (superseded by Task 14)

**Files:** none changed unless a check fails (then report, do not fix).

- [ ] **Step 1:** `npm test && npm run lint && npm run fmt:check && npm run build` pass.
- [ ] **Step 2:** Browser sweep (shared procedure) at 1440×900 and 390×844: a full menu Home → Work seek and a Work → Home Back, captured every ~100 ms; scroll positions 0, 0.5, 1.0, 1.5, 2.0 (≈90 ms after setting), 2.5 × innerHeight. Check: Home overlay visible at the top; gradual exit (no warp, no poof, no density jump); fibres the whole way; cards grow in at the frame edge and shrink out; branch strands reach the centred card's four corners; URL `/work` in the carousel, `/` after Back; no console errors.
- [ ] **Step 3:** Report per check with screenshot paths.

---

## Revisions (amendment 2026-11-22)

### Task 12: Cinematic seek

**Files:** Modify `src/config/animation.config.js`, `src/utils/easingFunctions.js`, `src/routes/HomeWork/HomeWorkLayout.jsx`.

- [ ] **Step 1:** add to `HOME_WORK`: `// Menu/Back seek between Home and Work, seconds.` `SEEK_DURATION: 3,` and to `easingFunctions.js`:

```text
/** Even ease-in-out (sine): slow start and end, steady through the middle. */
export const easeInOutSine = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);
```

- [ ] **Step 2:** in `HomeWorkLayout.jsx`'s `seek`, use `duration: HOME_WORK.SEEK_DURATION` and `easing: easeInOutSine` (replacing `SCENE.CAMERA_DURATION`; drop the `SCENE` import if unused).
- [ ] **Step 3:** checks (`npm test && npm run lint && npm run fmt:check && npm run build`); browser: Menu → WORK from the top of Home captured every ~100 ms takes about 3 s and the morph spans many frames; interrupting with a wheel still works; Back returns in about 3 s.
- [ ] **Step 4:** commit `feat(homework): slower, even seek between Home and Work`.

---

### Task 13: Per-card pyramids and dissolving cards

**Files:**

- Modify: `src/canvas/features/carousel/{carousel.config.js,carousel.js,index.js,WorkCard.jsx,WorkCardMaterial.js,workCard.frag.glsl,useBorderProjection.js}`
- Modify: `src/canvas/scenes/work/WorkScene.jsx`, `src/canvas/scenes/homeWork/HomeWorkCanvas.jsx`
- Modify: `src/canvas/features/streamFibers/{StreamFibers.jsx,streamFibers.vert.glsl}`

**Interfaces:**

- Produces: `calculateCardPresence(centeredness, morph) → 0–1` (replaces `calculateCardFrameScale`); `branchGrow(presence)`, `cardDissolve(presence)` in `carousel.js`; `streamRef.current.cards = [{ center, right, up, grow }, { … }]` (two slots, THREE.Vector3 + number), replacing `cardCenter`/`cardRight`/`cardUp`/`grow`.

- [ ] **Step 1: Config** — in `carousel.config.js` replace the `BRANCH` block (keep `INSET`, `BOW`) and keep `FRAME`:

```text
    // Per-card sequence over its presence (0 at the frame edge → 1 near the centre): the branch reaches the card by
    // GROW_BY, then the card dissolves in from DISSOLVE_FROM to 1. Leaving reverses it.
    BRANCH: {
        GROW_BY: 0.5,
        DISSOLVE_FROM: 0.4,
        INSET: 0.85,
        BOW: 0.35,
    },
    // Card dissolve: square cells across the card (dot-matrix look) and the width of the glowing edge band.
    DISSOLVE: {
        CELLS: [48, 27],
        EDGE: 0.08,
    },
```

- [ ] **Step 2: Presence helpers** — in `carousel.js` replace `calculateCardFrameScale` with (keep `smooth01`):

```text
/** How present a card is (0–1): 0 past the frame edge, 1 near the centre, and only once the morph has arrived. */
export function calculateCardPresence(centeredness, morph) {
    const { FULL_WITHIN, ENTER_FROM, MORPH_FROM } = CAROUSEL_CONFIG.FRAME;
    const onScreen = 1 - smooth01((centeredness - FULL_WITHIN) / (ENTER_FROM - FULL_WITHIN));
    return onScreen * smooth01((morph - MORPH_FROM) / (1 - MORPH_FROM));
}

/** Branch length for a card's presence: reaches the card first. */
export const branchGrow = (presence) => smooth01(presence / CAROUSEL_CONFIG.BRANCH.GROW_BY);

/** Card dissolve for a card's presence: forms once the branch has arrived. */
export const cardDissolve = (presence) => smooth01((presence - CAROUSEL_CONFIG.BRANCH.DISSOLVE_FROM) / (1 - CAROUSEL_CONFIG.BRANCH.DISSOLVE_FROM));
```

and export the three from `index.js` (drop `calculateCardFrameScale`). The card's size is `calculateCardScale(centeredness)` again (no growth from 0).

- [ ] **Step 3: Card dissolve shader** — in `WorkCardMaterial.js` add uniforms `uDissolve: 1`, `uCells: new THREE.Vector2(...CAROUSEL_CONFIG.DISSOLVE.CELLS)`, `uEdge: CAROUSEL_CONFIG.DISSOLVE.EDGE`, `uEdgeColor: new THREE.Color()`, and set `transparent: false` (discard-based). In `workCard.frag.glsl` declare them and, at the very start of `main()`:

```text
    // Cell dissolve: square cells (dot-matrix look) appear in a noise-driven order, the card's edges first (where the
    // branch lands); the cells just forming glow in the brand colour.
    vec2 cell = floor(vUv * uCells);
    float cellNoise = mix(random(cell), texture2D(uNoiseTex, (cell + 0.5) / uCells).r, 0.6);
    vec2 fromCentre = abs((cell + 0.5) / uCells - 0.5) * 2.0;
    float order = mix(cellNoise, 1.0 - max(fromCentre.x, fromCentre.y), 0.5) * 0.98;
    if (order > uDissolve) discard;
    float edge = 1.0 - smoothstep(uDissolve - uEdge, uDissolve, order);
```

and replace the final `gl_FragColor = vec4(color, 1.0);` with:

```text
    gl_FragColor = vec4(mix(uEdgeColor * 1.6, color, edge * step(uDissolve, 0.999) + step(0.999, uDissolve)), 1.0);
```

(at full dissolve no edge tint remains).

- [ ] **Step 4: `WorkCard`** — replace the scale block with:

```text
        // Presence drives the card: it forms by dissolve once its branch has arrived; nothing is drawn or hit-tested
        // while fully dissolved.
        const centeredness = centerednessRef.current[index] ?? 1;
        const dissolve = cardDissolve(calculateCardPresence(centeredness, segmentsRef.current.morph));
        group.scale.setScalar(calculateCardScale(centeredness));
        group.visible = visible && dissolve > 0.001;
        if (!group.visible) {
            return;
        }
        if (cardMaterialRef.current) {
            cardMaterialRef.current.uDissolve = dissolve;
        }
        for (const text of textRefs.current) {
            if (text) {
                text.fillOpacity = dissolve;
            }
        }
        if (overlayRef.current) {
            overlayRef.current.visible = dissolve >= 1;
        }
```

Give the `workCardMaterial` a `ref={cardMaterialRef}` and `uEdgeColor={edgeColor}` (brand colour via `getCSSColorRGBA('--c-brnd_100')`, sRGB, memoised, as in StreamFibers), the overlay `<mesh>` a ref (rename the material ref if needed so `overlayRef` points at the mesh for visibility and keep the material's `uHover`/`uTime` updates working), and the three `Text` elements `ref={(el) => (textRefs.current[i] = el)}`.

- [ ] **Step 5: Two pyramids** — in `WorkScene.jsx` replace the single-card frame block with: compute each card's presence, pick the two highest (`best` and `second`), and write slots:

```text
        // Branches for the (at most two) cards on screen: the most and second-most present.
        let first = 0;
        let second = -1;
        for (let i = 0; i < items.length; i++) {
            presenceRef.current[i] = calculateCardPresence(centerednessRef.current[i], morph);
            if (presenceRef.current[i] > presenceRef.current[first]) {
                second = first;
                first = i;
            } else if (i !== first && (second < 0 || presenceRef.current[i] > presenceRef.current[second])) {
                second = i;
            }
        }
        [first, second].forEach((index, slot) => {
            const card = stream.cards[slot];
            if (index < 0) {
                card.grow = 0;
                return;
            }
            const [x, y, z] = calculateCardPosition(index);
            const angle = index * CAROUSEL_CONFIG.ANGLE_STEP;
            const scale = calculateCardScale(centerednessRef.current[index]);
            card.center.set(x, y, z);
            card.right.set(Math.cos(angle), 0, -Math.sin(angle)).multiplyScalar((CARD_WIDTH / 2) * scale);
            card.up.set(0, (CARD_HEIGHT / 2) * scale, 0);
            card.grow = branchGrow(presenceRef.current[index]);
        });
```

(`presenceRef = useRef([])`; remove the old `grow`/`cardCenter`/`cardRight`/`cardUp` writes and `BRANCH.RANGE` use). In `HomeWorkCanvas.jsx` replace `grow`, `cardCenter`, `cardRight`, `cardUp` in `streamRef` with `cards: [0, 1].map(() => ({ center: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(), grow: 0 }))`. In `useBorderProjection.js` size the frame with `calculateCardScale(centeredness)` again.

- [ ] **Step 6: Fibres for two pyramids** — in `streamFibers.vert.glsl` turn `uCardCenter`, `uCardRight`, `uCardUp`, `uBranchGrow` into two-element arrays (`uniform vec3 uCardCenter[2];` …, `uniform float uBranchGrow[2];`) and replace the face pick with:

```text
        // Eight faces: two pyramids (slot 0 = most present card) × four sides, evenly filled.
        float pick = random.y / uBranchShare;
        float slotFace = floor(pick * 8.0);
        int slot = int(slotFace >= 4.0);
        float face = mod(slotFace, 4.0);
        float across = (fract(pick * 8.0) * 2.0 - 1.0) * uBranchInset;
```

then use `uCardCenter[slot]`, `uCardRight[slot]`, `uCardUp[slot]`, `uBranchGrow[slot]` where the single values were used, and change the branch condition to `uBranchGrow[slot] > 0.0` (compute `slot` before the condition). In `StreamFibers.jsx` create the uniforms as arrays (`{ value: [new THREE.Vector3(), new THREE.Vector3()] }`, `{ value: [0, 0] }`) and copy both slots from `s.cards` each frame.

- [ ] **Step 7: Checks** — `npm test && npm run lint && npm run fmt:check && npm run build`; `grep -rn "calculateCardFrameScale\|cardCenter\|\.grow\b" src` only shows the new slot fields.

- [ ] **Step 8: Browser check** (shared procedure), 1440×900 and 390×844, frames every ~100 ms while scrolling from 1.5 × to 2.5 × innerHeight with a held wheel or small scrollTop steps (avoid snapping): the next card's pyramid reaches out from the trunk first, then the card forms by cell dissolve with a cyan edge, title/year/client fading in; the leaving card dissolves into cells, then its branch retracts; at rest (centred) the card is complete and its pyramid sits behind it. No console errors.

- [ ] **Step 9: Commit** `feat(carousel): per-card pyramid branches and cell-dissolve cards`.

---

### Task 14: Verify the revisions

Same as Task 11, plus: the seek takes about 3 s and stays interruptible; cards form by dissolve after their pyramid arrives, and dissolve out before it retracts.
