# Component Documentation

> Canonical reference for every rendered component in the portfolio codebase.
> Updated 2026-05-05 against actual source.

---

## Table of Contents

- [Project Structure](#project-structure)
- [1 — App Shell & Providers](#1--app-shell--providers)
- [2 — Route Components](#2--route-components)
- [3 — About Route Subcomponents](#3--about-route-subcomponents)
- [4 — Entry Page Bodies](#4--entry-page-bodies)
- [5 — Reusable DOM Components](#5--reusable-dom-components)
  - [5.1 — Navigation](#51--navigation)
  - [5.2 — UI](#52--ui)
  - [5.3 — Blocks](#53--blocks)
  - [5.4 — Sections](#54--sections)
  - [5.5 — Layout](#55--layout)
- [6 — Canvas & Scene Components](#6--canvas--scene-components)
  - [6.1 — Home Scene](#61--home-scene)
  - [6.2 — Work Scene](#62--work-scene)
  - [6.3 — Shared Scene Nodes](#63--shared-scene-nodes)
- [7 — Custom JSX Render Primitives](#7--custom-jsx-render-primitives)
- [8 — Cross-Cutting Dependency Index](#8--cross-cutting-dependency-index)

---

## Project Structure

```
src/components/
├── ErrorBoundary.jsx          # Class-based error boundary (root)
├── blocks/                    # Reusable content blocks (WorkHeader, WorkSubHeader)
├── layout/
│   └── image/                 # Image layout utilities (double/, grid/, wide/)
├── navigation/                # App-level navigation & transitions
│   ├── CurtainTransition/     #   Page transition curtain effect
│   ├── LoadingScreen/         #   Asset-loading experience
│   └── NavigationMenu/        #   Global menu (button, panel, links, socials, layers)
├── sections/                  # Case-study content blocks (CaseIntro, FeatureSplit, etc.)
└── ui/                        # Generic UI components (decorations, effects, indicators)
    ├── DashLine/
    ├── GradualBlur/
    ├── GridOverlay/
    ├── NineSliceBorder/
    ├── PixelCard/
    ├── RadialText/            #   CRCL/ and TXT/ subfolders
    ├── RandomText/
    ├── ScrollDown/
    ├── ScrollReveal/
    ├── StatusMessage/
    ├── TypewriterText/
    └── WorkLabel/
```

---

## 1 — App Shell & Providers

### `App`

> **`src/app/App.jsx`** — Root shell

Composes the entire runtime tree. Initializes the sorted project list from generated entry-page data via `sortItems`, then wraps the route outlet with nested providers and persistent navigation.

- Owns the `items` state that powers the work carousel and project detail routes.
- Renders `NavigationMenu` outside the outlet so it persists across routes.
- Provider nesting order: `QualityProvider` → `WorkContext.Provider` → `PageTransitionProvider`.

| Hooks | Context Provided | Config | Children |
|---|---|---|---|
| `useState`, `useEffect` | `QualityProvider`, `WorkContext.Provider`, `PageTransitionProvider` | — | `NavigationMenu`, `ErrorBoundary`, `Outlet` |

---

### `QualityProvider`

> **`src/app/QualityContext.jsx`** — Rendering-quality state provider

Manages the global rendering-quality tier (`'low'` / `'medium'` / `'high'`). Seeds initial state from `getInitialQuality()` (GPU detection). Exposes `quality` and `setQuality` via context.

- `setQuality` only updates state when the new value differs from current (avoids pointless rerenders).
- No debouncing or timer logic — the adaptive quality hook handles rate-limiting externally.

| Hooks | Context Provided | Config | Children |
|---|---|---|---|
| `useState`, `useCallback` | `QualityContext` | — | — |

---

### `WorkContext`

> **`src/app/WorkContext.jsx`** — Work items context

Simple context that holds the sorted project items array. Exposes `useWorkItems()` hook for consumers.

| Hooks | Context Provided |
|---|---|
| `createContext`, `useContext` | `WorkContext` |

---

## 2 — Route Components

### `Home`

> **`src/routes/Home/Home.jsx`** — Landing page

Combines the loading sequence, hero copy, decorative overlays, and the home 3D scene. Uses `useScrollNavigation` to turn downward scroll progress into both route-transition intent and laser-scene parameter changes.

- Skips the loading screen when arriving via internal navigation (`location.state.fromNavigation`).
- Preloads GLB assets (`Logo.glb`, `Wall.glb`) on mount.
- Resets scroll position and clears navigation state on entry.
- Derives `laserParams` by scaling each `LASER_PARAMS` value with scroll progress.
- `HomeCanvas` renders behind the DOM content; interaction enabled only after loading completes.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState`, `useEffect`, `useMemo`, `useRef`, **`useScrollNavigation`** | — | `EASING`, `REVEAL`, `SCROLL_THRESHOLDS`, `STAGGER`, `TIMEOUT`, `LASER_PARAMS` | `HomeCanvas`, `LoadingScreen`, `ScrollDown`, `RadialGrid`, `RedoAnimText` |

---

### `Work`

> **`src/routes/Work/Work.jsx`** — 3D work carousel

The scrollable project carousel page. Delegates 3D presentation to `WorkCanvas`, translates card clicks into page transitions, and implements "scroll up at top to go home".

- Uses `useWorkItems()` for the sorted project list.
- Guards navigation with `hasNavigated` ref to prevent double-fires.
- Accumulates upward wheel/touch input at the top of the carousel until it crosses `WORK_MAX_SCROLL`, then triggers transition home.
- Detects touch devices for mobile swipe hint.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState`, `useCallback`, `useEffect`, `useRef`, **`usePageTransition`** | **`useWorkItems`** | `SCROLL_THRESHOLDS` | `WorkCanvas`, `ErrorBoundary` |

---

### `About`

> **`src/routes/About/About.jsx`** — Tabbed profile page

Tabbed profile page swapping between experience, education, skills, and software sections. Uses Framer Motion `AnimatePresence` and `layoutId` for the active-tab indicator.

- Local `currentPage` state selects one of `EXP`, `EDU`, `SKL`, `SFT` components.
- `PixelCard` used as animated accent inside each selector button.
- `GridOverlay` provides full-page decorative background.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState` | — | `EASING`, `REVEAL`, `SPRING_CONFIG`, `STAGGER` | `GridOverlay`, `PixelCard`, `ExpSection`, `EduSection`, `ListSection` |

---

### `Contact`

> **`src/routes/Contact/Contact.jsx`** — Terminal-style contact flow

Staged terminal-interface flow through `message`, `intercept`, and `complete` phases. Combines inputs, glitch effects, status messaging, and typewriter-driven diagnostic text.

- Phase config object maps each phase to its title, styling, and status message.
- Uses SVG `feTurbulence` displacement filter for glitch sequence.
- First phase collects name + message; second asks for email; final confirms relay.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState`, `useCallback`, `useRef` | — | `EASING`, `REVEAL`, `STAGGER`, `TIMEOUT` | `StatusMessage`, `TypewriterText`, `ErrorBoundary`, `PixelCard`, `RadGridTxt` |

---

### `Entry`

> **`src/routes/Entry/Entry.jsx`** — Dynamic project detail wrapper

Reads the `:title` route param, normalizes via `normalizeKey()`, looks up the matching generated page entry, and renders a common hero plus project-specific content.

- Enables Lenis smooth scrolling for long-form reading.
- Renders 404 fallback when normalized key doesn't resolve.
- Shared structure: `ProjectHero` → synopsis block → `DashLine` → `ScrollReveal` → page body → `GradualBlur`.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useParams`, **`useLenisScroll`** | — | `LENIS` | `ProjectHero`, `ScrollReveal`, `DashLine`, `GradualBlur` |

---

## 3 — About Route Subcomponents

Small isolated tree used exclusively inside the About page.

| Component | File | Description | Hooks | Config | Children |
|---|---|---|---|---|---|
| **`ExpSection`** | `src/routes/About/components/ExpSection.jsx` | Experience timeline. Maps items into company, role, date, details. | — | `EASING`, `REVEAL` | `AboutItem` |
| **`EduSection`** | `src/routes/About/components/EduSection.jsx` | Education list. Formats school, course, date. | — | `EASING`, `REVEAL` | — |
| **`ListSection`** | `src/routes/About/components/ListSection.jsx` | Generic list for skills and software tabs. | — | — | `AboutItem` |
| **`AboutItem`** | `src/routes/About/components/AboutItem.jsx` | Single line with optional icon and metadata. Handles SVG components and image sources. | — | `EASING`, `REVEAL` | — |

---

## 4 — Entry Page Bodies

All are **composition-only** — they sequence shared section blocks into case-study narratives. None owns interactive state.

> **Hooks:** none | **Context:** none | **Config:** none

| Component | File | Project | Shared Blocks Used |
|---|---|---|---|
| **`Cjib`** | `src/routes/Entry/pages/Cjib/Cjib.jsx` | CJIB — motion design and seizure-management UX | `CaseIntro`, `WorkHeader`, `StatementBlock`, `FullImage`, `FeatureSplit`, `ComparisonBlock`, `HeroStatement`, `EvidenceRow`, `ScrollReveal` |
| **`Ld58`** | `src/routes/Entry/pages/Ld58/Ld58.jsx` | Ludum Dare 58 — 3D art and branding in 72h | `CaseIntro`, `WorkHeader`, `StatementBlock`, `FullImage`, `FeatureSplit`, `DoubleImage`, `HeroStatement`, `EvidenceRow`, `ScrollReveal` |
| **`LsdJam`** | `src/routes/Entry/pages/LsdJam/LsdJam.jsx` | LSD Jam — level art and environment design | `CaseIntro`, `WorkHeader`, `StatementBlock`, `FullImage`, `FeatureSplit`, `DoubleImage`, `ComparisonBlock`, `HeroStatement`, `EvidenceRow`, `ScrollReveal` |
| **`Pmot`** | `src/routes/Entry/pages/Pmot/Pmot.jsx` | PMOT — retail webstore redesign | `CaseIntro`, `WorkHeader`, `StatementBlock`, `FullImage`, `FeatureSplit`, `DoubleImage`, `ComparisonBlock`, `HeroStatement`, `EvidenceRow`, `ScrollReveal` |
| **`SqlGame`** | `src/routes/Entry/pages/SqlGame/SqlGame.jsx` | SQL Game — educational SQL game | `CaseIntro`, `WorkHeader`, `StatementBlock`, `FullImage`, `FeatureSplit`, `DoubleImage`, `ComparisonBlock`, `HeroStatement`, `EvidenceRow`, `ScrollReveal` |
| **`SsgNL`** | `src/routes/Entry/pages/SsgNL/SsgNL.jsx` | Sopra Steria — internal products | `CaseIntro`, `WorkHeader`, `StatementBlock`, `FullImage`, `FeatureSplit`, `DoubleImage`, `ComparisonBlock`, `HeroStatement`, `EvidenceRow`, `ScrollReveal` |

---

## 5 — Reusable DOM Components

### 5.1 — Navigation

> **`src/components/navigation/`**

#### `CurtainTransition`

> **`src/components/navigation/CurtainTransition/CurtainTransition.jsx`**

Page-transition curtain that visually covers one route before revealing the next. Renders three staggered color layers moving along a direction axis, firing lifecycle callbacks on completion.

- Supports `up`, `down`, `left`, `right` directions.
- Determines cover vs. reveal by comparing `isOpen` to previous render.
- Displays destination page label on the final layer.
- Visual half of the `usePageTransition` system.

| Hooks | Config | Children |
|---|---|---|
| `useRef`, `useEffect` | `EASING`, `TIMEOUT` | — |

---

#### `LoadingScreen`

> **`src/components/navigation/LoadingScreen/LoadingScreen.jsx`**

Custom animated loading experience. Watches Three.js asset progress via `useProgress`, renders a block-based canvas logo pixelation, cycles cryptic messages with glitch-text decoding. Only exits after both loading and minimum display time are satisfied.

- Internal `BlockLogo` helper samples SVG into a block field.
- Radial pulse wave through blocks; occasional scanline glitches.
- Props: `onComplete`, `minDisplayTime`, `logoSrc`.

| Hooks | Config | Children |
|---|---|---|
| `useState`, `useRef`, `useEffect`, `useCallback`, `useProgress` | `REVEAL`, `TIMEOUT` | Internal `BlockLogo` |

---

#### `NavigationMenu`

> **`src/components/navigation/NavigationMenu/NavigationMenu.jsx`**

Persistent global menu controller. Owns open/closed state, runs RGB glitch on label text, closes on Escape, and delegates visuals to child components.

- Uses `busy` ref to prevent rapid toggle spam.
- Wraps route changes in a close delay so menu animates out before curtain starts.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState`, `useRef`, `useLayoutEffect`, `useCallback`, FM `animate` | **`usePageTransition`** | `REVEAL`, `TIMEOUT` | `MenuBackgroundLayers`, `MenuButton`, `MenuPanel` |

**Menu subcomponents** (all in `src/components/navigation/NavigationMenu/`):

| Component | Description | Config |
|---|---|---|
| `MenuButton` | Toggle button with icon swap and glitch text. ARIA toggle attributes. | `EASING`, `REVEAL` |
| `MenuPanel` | Sliding panel for links/socials. `inert` + `aria-hidden` when closed. | `EASING`, `REVEAL` |
| `MenuLinks` | Fixed nav list (Home, Work, About, Contact). Staggered reveal. | `EASING`, `REVEAL`, `STAGGER` |
| `MenuSocials` | External links (Artstation, GitHub, LinkedIn). `rel="noopener noreferrer"`. | `REVEAL` |
| `MenuBackgroundLayers` | Two animated color slabs. Decorative, `aria-hidden`. | `EASING`, `REVEAL`, `STAGGER` |

> All menu subcomponents are pure presentational — no hooks, no context.

---

### 5.2 — UI

> **`src/components/ui/`**

#### `DashLine`

> **`src/components/ui/DashLine/DashLine.jsx`**

SVG dashed divider. Measures container with resize handling and animates `stroke-dashoffset`. Supports horizontal/vertical via `direction` prop.

| Hooks | Config |
|---|---|
| `useRef`, `useState`, `useEffect` | — |

---

#### `GradualBlur`

> **`src/components/ui/GradualBlur/GradualBlur.jsx`**

Directional progressive blur using stacked `backdrop-filter: blur()` layers. `React.memo`-wrapped.

- Props: `position` (top/bottom/left/right), `strength`, `divCount`, `curve`, `exponential`, `opacity`.

| Hooks | Config |
|---|---|
| `useMemo`, `memo` | — |

---

#### `GridOverlay`

> **`src/components/ui/GridOverlay/GridOverlay.jsx`**

Responsive decorative grid. Computes cell grid from container bounds, randomly activates cells as striped/blurred accents, overlays crosshair icons with spring-smoothed mouse parallax.

- Recalculates via `ResizeObserver`.
- Stable random pattern until grid dimensions change.
- Many sizing/styling props: cell density, stripe intensity, blur, icon size, parallax strength.

| Hooks | Config |
|---|---|
| `useRef`, `useState`, `useEffect`, `useMemo`, `useCallback`, FM `useMotionValue`, `useSpring` | `EASING`, `REVEAL`, `SPRING_CONFIG`, `STAGGER` |

---

#### `NineSliceBorder`

> **`src/components/ui/NineSliceBorder/NineSliceBorder.jsx`**

Screen-space border overlay driven by Framer Motion values (`x`, `y`, `w`, `h`). Used by WorkCanvas to frame the currently centered 3D card after projection.

| Hooks | Config |
|---|---|
| FM `useTransform` | — |

---

#### `PixelCard`

> **`src/components/ui/PixelCard/PixelCard.jsx`**

Canvas-based pixel shimmer overlay. Runs a pixel simulation with configurable color, speed, and delay. Respects `prefers-reduced-motion`.

| Hooks | Config |
|---|---|
| `useRef`, `useEffect`, `useCallback` | — |

---

#### `RadialText` System

> **`src/components/ui/RadialText/`**

Family of small decorative components:

| Component | File | Description | Hooks |
|---|---|---|---|
| `RadialGrid` | `RadialGrid.jsx` | Dispatcher — selects circle or text grid via `type` prop | — |
| `RAD_CRCL` | `CRCL/RAD_CRCL.jsx` | SVG ring with animated progress arc | — |
| `RAD_GRID_CRCL` | `CRCL/RAD_GRID_CRCL.jsx` | 3×3 circle grid with randomized values | `useRandomNumber` |
| `RAD_TXT` | `TXT/RAD_TXT.jsx` | Animated zero-padded numeric counter | `useRef`, `useEffect` |
| `RAD_GRID_TXT` | `TXT/RAD_GRID_TXT.jsx` | 3×3 numeric counter grid | `useRandomNumber` |

---

#### `RedoAnimText`

> **`src/components/ui/RandomText/RedoAnimText.jsx`**

Cycles through fixed phrases with character-count animation using MotionValue counter. Infinite loop through predefined set.

| Hooks | Config |
|---|---|
| `useEffect`, FM `useMotionValue`, `useTransform`, `animate` | — |

---

#### `ScrollDown`

> **`src/components/ui/ScrollDown/ScrollDown.jsx`**

Animated scroll indicator with staggered vertical lines and infinite opacity pulse. Pure Framer Motion variants.

| Hooks | Config |
|---|---|
| — | — |

---

#### `ScrollReveal`

> **`src/components/ui/ScrollReveal/ScrollReveal.jsx`**

Viewport-triggered reveal wrapper. Uses Framer Motion `useInView` with custom `rootMargin` for Lenis compatibility. Animates from low-opacity/shifted to resting position.

| Hooks | Config |
|---|---|
| `useRef`, `useMemo`, `useInView` | `REVEAL` |

---

#### `StatusMessage`

> **`src/components/ui/StatusMessage/StatusMessage.jsx`**

Animated status panel (success/warning/error). Selects icons and decals based on status type. Uses `AnimatePresence` for mount/unmount animation.

| Hooks | Config |
|---|---|
| — | `EASING`, `REVEAL`, `STAGGER` |

---

#### `TypewriterText`

> **`src/components/ui/TypewriterText/TypewriterText.jsx`**

Multi-line typewriter effect. Renders text lines character-by-character with row stagger. Tracks current row and character index in state.

| Hooks | Config |
|---|---|
| `useState`, `useRef`, `useEffect` | `REVEAL`, `TYPEWRITER` |

---

#### `WorkLabel`

> **`src/components/ui/WorkLabel/WorkLabel.jsx`**

Simple badge-style label. Pure presentational — CSS Modules only, no hooks, no config.

---

### 5.3 — Blocks

> **`src/components/blocks/`**

Reusable content blocks that compose into case-study pages. Differ from sections in that they add interactive behavior (scroll reveal).

| Component | File | Description | Children |
|---|---|---|---|
| **`WorkHeader`** | `src/components/blocks/WorkHeader/WorkHeader.jsx` | Main section heading: title + subtitle + description wrapped in `ScrollReveal` | `ScrollReveal` |
| **`WorkSubHeader`** | `src/components/blocks/WorkSubHeader/WorkSubHeader.jsx` | Secondary heading: label + title + optional description in `ScrollReveal` | `ScrollReveal` |

---

### 5.4 — Sections

> **`src/components/sections/`**

Case-study content blocks. All are **pure presentational** — no hooks, no context, no config. They rely on props and CSS Modules.

| Component | File | Description |
|---|---|---|
| **`CaseIntro`** | `CaseIntro/CaseIntro.jsx` | Leading media block with kicker, heading, subtitle. Auto-detects video vs. image. |
| **`ComparisonBlock`** | `ComparisonBlock/ComparisonBlock.jsx` | Side-by-side comparison figures with labels. "Before vs. after" sections. |
| **`DoubleImage`** | `DoubleImage/DoubleImage.jsx` | Two-image side-by-side layout. |
| **`EvidenceRow`** | `EvidenceRow/EvidenceRow.jsx` | Horizontal row of labeled facts/stats. |
| **`FeatureSplit`** | `FeatureSplit/FeatureSplit.jsx` | Two-column: media + text. `reverse` prop flips layout. |
| **`FullImage`** | `FullImage/FullImage.jsx` | Full-width image with `thin` and `contain` modifiers. |
| **`HeroStatement`** | `HeroStatement/HeroStatement.jsx` | Prominent statement callout for outcomes/summaries. |
| **`ImageGrid`** | `ImageGrid/ImageGrid.jsx` | Multi-image grid layout. |
| **`StatementBlock`** | `StatementBlock/StatementBlock.jsx` | Generic labeled prose/content section wrapper. |

---

### 5.5 — Layout

> **`src/components/layout/`**

Contains `image/` with subdirectories (`double/`, `grid/`, `wide/`) — currently empty placeholder folders.

---

### Root-Level

#### `ErrorBoundary`

> **`src/components/ErrorBoundary.jsx`**

Class-based React error boundary — the one deliberate exception to functional-component style.

- Catches render-time errors and stores error + component stack.
- Renders fallback with recovery actions ("Try Again", "Go Home").
- Used around routes and canvas-heavy pages.

---

### Entry Route Subcomponents

#### `ProjectHero`

> **`src/routes/Entry/components/ProjectHero/ProjectHero.jsx`**

Standard hero section for every case-study page. Renders project banner, overlays `GridOverlay`, reveals title and metadata with staggered motion.

| Hooks | Config | Children |
|---|---|---|
| — | `EASING`, `REVEAL`, `STAGGER` | `GridOverlay`, `ScrollDown` |

---

## 6 — Canvas & Scene Components

### 6.1 — Home Scene

#### `HomeCanvas`

> **`src/canvas/home/HomeCanvas.jsx`** — Canvas wrapper for home route

Creates the R3F `<Canvas>` with project-preferred WebGL settings and passes scroll/animation props to `HomeScene`. Contains an internal `AdaptiveQualityMonitor` component that runs the quality monitoring loop.

| Hooks | Config | Children |
|---|---|---|
| **`useAdaptiveQuality`** (in `AdaptiveQualityMonitor`) | `CANVAS_DPR`, `CANVAS_GL_DEFAULTS` | `HomeScene` |

---

#### `HomeScene`

> **`src/canvas/home/HomeScene.jsx`** — Home 3D scene orchestrator

Combines background mesh, animated logo, subtitle text, laser plane, camera, post-processing, and mouse-reactive rig into one scroll-aware scene.

- `entryComplete` flag gates expensive effects (Float, AO) until the ~1.5s opening animation settles.
- Reads `quality` from context to select post-processing preset:
  - **Low:** bloom only (intensity 0.3, 2 levels)
  - **Medium:** N8AO (4 samples) + bloom (intensity 0.45, 4 levels)
  - **High:** N8AO (8 samples) + bloom (intensity 0.55, 6 levels)
- Uses `useObjectAnimation` for logo, background, subtitle transforms.
- Uses `useCameraAnimation` for camera position + FOV.
- Pauses background video once scroll > 0.4.
- Viewport-responsive scale via `BREAKPOINTS.REFERENCE_WIDTH`.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useState`, `useEffect`, `useMemo`, `useFrame`, `useThree`, **`useObjectAnimation`**, **`useCameraAnimation`** | **`useQuality`** | `FLOAT_CONFIG`, `REVEAL`, `SCENE`, `TIMEOUT`, `BREAKPOINTS` | `Rig`, `BackgroundMesh`, `LogoMesh`, `LaserPlane`, `EffectComposer` |

---

#### `LaserPlane`

> **`src/canvas/home/LaserPlane.jsx`** — Procedural laser/fog effect

Procedural laser/fog layer driven by shader uniforms. Scales behavior by quality tier.

- Props: `flowSpeed`, `wispSpeed`, `wispDensity`, `wispIntensity`, `fogIntensity`, `fogScale`, `decay`, `falloffStart`, `color`, etc.
- Updates time, mouse, resolution, quality uniforms every frame.
- Skips frames on low quality (every 2nd frame).
- Render order 1000, ignores frustum culling — effectively a full-screen post effect.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useMemo`, `useEffect`, `useFrame`, `useThree` | **`useQuality`** | — | `LaserFlowMaterial` |

---

### 6.2 — Work Scene

#### `WorkCanvas`

> **`src/canvas/work/WorkCanvas.jsx`** — Canvas wrapper + scroll orchestration

Fixed-position canvas paired with a scroll container. Runs Lenis smooth scrolling and feeds normalized scroll progress into the carousel scene.

- Owns Framer Motion spring values for `NineSliceBorder` to frame the active card.
- Synthetic scroll height = `items.length × 100vh`.
- Snaps to nearest project once scrolling settles (idle frames ≥ 30, snap duration 400ms).
- `useBorderProjection` projects 3D card bounds into 2D for the border overlay.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useEffect`, `useState`, FM `useMotionValue`, `useSpring`, **`useBorderProjection`** | — | `SPRING_CONFIG`, `CANVAS_DPR`, `CANVAS_GL_DEFAULTS`, `CAROUSEL_CONFIG` | `WorkScene`, `NineSliceBorder`, Lenis instance |

---

#### `WorkScene`

> **`src/canvas/work/WorkScene.jsx`** — Carousel rotation and centeredness manager

Rotates the rig per scroll position, moves camera along the spiral, computes which card is most centered, culls distant cards.

- Stores centeredness scores in a ref (no per-frame state updates).
- Updates `visibleCenter` only when best card index changes.
- Notifies parent about centeredness/scroll for border projection and exit logic.
- Visibility culling: only cards within distance ≤ 1 from visible center.
- Responsive FOV adjustment for mobile via `BREAKPOINTS.TABLET`.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useState`, `useEffect`, `useFrame`, `useThree` | — | `BREAKPOINTS`, `CAROUSEL_CONFIG` | `WorkCard` × N |

---

#### `WorkCard`

> **`src/canvas/work/WorkCard.jsx`** — Individual 3D project card

Single project card in the 3D carousel. Combines refractive banner shader, optional pixel-overlay hover, floating motion, and text labels.

- Uses `useTexture` for the banner and `useNoiseTexture` for refraction noise.
- Quality-tiered shader fidelity:
  - **Low:** no refraction, no chromatic aberration, no pixel overlay, no float
  - **Medium:** `uRefractPower: 0.003`, `uChromaticAberration: 0.4`
  - **High:** `uRefractPower: 0.006`, `uChromaticAberration: 0.8`, pixel overlay enabled
- Smoothly scales based on centeredness from `WorkScene`.
- Sets `document.body.style.cursor` on hover; delegates navigation via callback.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useState`, `useMemo`, `useFrame`, `useTexture`, **`useNoiseTexture`** | **`useQuality`** | `FLOAT_CONFIG`, `CAROUSEL_CONFIG` | `workCardMaterial`, `pixelOverlayMaterial`, `Text` labels |

---

### 6.3 — Shared Scene Nodes

#### `Rig`

> **`src/canvas/shared/camera/Rig.jsx`** — Mouse-driven camera parallax

Applies smoothed camera offset based on pointer position and reorients camera toward origin. Frame-skips based on quality tier.

| Hooks | Context | Config |
|---|---|---|
| `useRef`, `useFrame` | **`useQuality`** | — |

---

#### `BackgroundMesh`

> **`src/canvas/shared/meshes/BackgroundMesh.jsx`** — Video-textured background

Renders GLB wall asset with looping video texture. `paused` prop stops playback to save resources. `React.memo`-wrapped with Suspense boundary.

| Hooks | Context | Config |
|---|---|---|
| `useEffect`, `memo`, `useGLTF`, `useVideoTexture` | — | — |

---

#### `LogoMesh`

> **`src/canvas/shared/meshes/LogoMesh.jsx`** — Refractive logo with FBO

3D logo mesh with glass/refraction material. Manages a small FBO (off-screen render target) for transition texture data. Applies pointer-driven rotational motion. `React.memo`-wrapped, FBO renders every 2nd frame.

| Hooks | Context | Config |
|---|---|---|
| `useRef`, `useEffect`, `useFrame`, `useGLTF`, `useFBO`, **`useNoiseTexture`** | **`useQuality`** | `LOGO_BOOTSTRAP` |

---

## 7 — Custom JSX Render Primitives

These register custom JSX elements via `shaderMaterial` + `extend()` (or `RawShaderMaterial` + `extend()`). Used directly in scene component markup.

| Primitive | File | Material Type | Key Uniforms | Used By |
|---|---|---|---|---|
| **`WorkCardMaterial`** | `src/canvas/work/WorkCardMaterial.jsx` | `shaderMaterial` | `uTexture`, `uNoiseTex`, `uTextureSize`, `uPlaneSize`, `uTime`, `uRoughness`, `uRefractPower`, `uChromaticAberration` | `WorkCard` |
| **`GlassLogoMaterial`** | `src/canvas/shared/materials/GlassLogoMaterial.jsx` | `shaderMaterial` | `uTrnsTex`, `uNoiseTex`, `uEnvMap`, `uResolution`, `uTime`, `uRoughness`, `uNoiseScale`, `uRefractPower`, `uChromaticAberration` | `LogoMesh` |
| **`LaserFlowMaterial`** | `src/canvas/shared/materials/LaserFlowMaterial.jsx` | `RawShaderMaterial` | `iTime`, `iResolution`, `iMouse`, `uFlowSpeed`, `uFogIntensity`, `uFogScale`, `uWispDensity`, `uWSpeed`, `uWIntensity`, `uDecay`, `uColor`, `uFade`, `uFogQuality` (25+ total) | `LaserPlane` |
| **`PixelOverlayMaterial`** | `src/canvas/shared/materials/PixelOverlayMaterial.jsx` | `shaderMaterial` | `uTime`, `uHover`, `uResolution`, `uColor1`, `uColor2` | `WorkCard` |

---

## 8 — Cross-Cutting Dependency Index

### Custom Hook → Consumer Map

| Hook | Consumers |
|---|---|
| `useAdaptiveQuality` | `HomeCanvas` (via `AdaptiveQualityMonitor`) |
| `useBorderProjection` | `WorkCanvas` |
| `useCameraAnimation` | `HomeScene` |
| `useLenisScroll` | `Entry` |
| `useNoiseTexture` | `WorkCard`, `LogoMesh` |
| `useObjectAnimation` | `HomeScene` (×3 instances) |
| `usePageTransition` | `Work`, `NavigationMenu`, `useScrollNavigation`, `useAdaptiveQuality` |
| `useRandomNumber` | `RAD_GRID_CRCL`, `RAD_GRID_TXT` |
| `useScrollNavigation` | `Home` |
| `useWorkItems` | `Work` |

### Context Consumer Map

| Context Hook | Consumers |
|---|---|
| `useQuality` | `HomeScene`, `LaserPlane`, `WorkCard`, `Rig`, `LogoMesh` |
| `useWorkItems` | `Work` |
| `usePageTransition` | `Work`, `NavigationMenu`, `useScrollNavigation`, `useAdaptiveQuality` |

### Config File → Consumer Map

| Config Module | Key Exports | Consumers |
|---|---|---|
| `animation.config.js` | `EASING`, `REVEAL`, `STAGGER`, `TIMEOUT`, `LENIS`, `SCROLL_THRESHOLDS`, `FLOAT_CONFIG`, `SCENE`, `SPRING_CONFIG`, `TYPEWRITER`, `BREAKPOINTS`, `LOGO_BOOTSTRAP`, `CAMERA_DEFAULTS` | Most components — see individual tables |
| `canvas.config.js` | `CANVAS_GL_DEFAULTS`, `CANVAS_DPR` | `HomeCanvas`, `WorkCanvas` |
| `carousel.config.js` | `CAROUSEL_CONFIG` | `WorkCanvas`, `WorkScene`, `WorkCard`, `useBorderProjection`, `carousel.js` utils |
| `laser.config.js` | `LASER_PARAMS` | `Home` |

---

> **Maintenance note:** Update this file when component behavior, paths, or dependencies change. Last verified against source: 2026-05-05.
