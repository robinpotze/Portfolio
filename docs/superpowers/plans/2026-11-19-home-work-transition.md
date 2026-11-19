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

### Task 6: Final verification

**Files:** none changed unless a check fails.

- [ ] **Step 1: Full checks**

Run: `npm test && npm run lint && npm run fmt:check && npm run build`
Expected: pass.

- [ ] **Step 2: Browser sweep** (shared procedure). Repeat Task 3 Step 16 items 1–10 on the finished build, plus: quality tier `low` (temporarily force it in `QualityContext`) shows the trunk with fewer particles and no ambient occlusion; navigating About → menu WORK runs the curtain and lands on the first card; Entry page → Back returns to `/work` at the first card.

- [ ] **Step 3: Report** any failure with its screenshot path and fix it in the task it belongs to before finishing the branch.
