# Component Documentation

> Canonical reference for every rendered component in the portfolio codebase.
> Combines detailed behavior descriptions with dependency tables and cross-cutting indexes.

---

## Table of Contents

- [Scope](#scope)
- [1 — App Shell & Providers](#1--app-shell--providers)
- [2 — Route Components](#2--route-components)
- [3 — About Route Subcomponents](#3--about-route-subcomponents)
- [4 — Entry Page Bodies](#4--entry-page-bodies)
- [5 — Reusable DOM Components](#5--reusable-dom-components)
  - [5.1 — Root](#51--root)
  - [5.2 — Decoration](#52--decoration)
  - [5.3 — Effects](#53--effects)
  - [5.4 — Layout](#54--layout)
  - [5.5 — UI (Content Blocks)](#55--ui-content-blocks)
- [6 — Canvas & Scene Components](#6--canvas--scene-components)
  - [6.1 — Home Scene](#61--home-scene)
  - [6.2 — Work Scene](#62--work-scene)
  - [6.3 — Shared Scene Nodes](#63--shared-scene-nodes)
- [7 — Custom JSX Render Primitives](#7--custom-jsx-render-primitives)
- [8 — Cross-Cutting Dependency Index](#8--cross-cutting-dependency-index)

---

## Scope

| Included | Excluded |
|---|---|
| App shell and providers | Hook implementations (`src/hooks/`) |
| Route and page components | Utility modules (`src/utils/`) |
| Reusable DOM components | Config internals (`src/config/`) |
| R3F scene/mesh components | Data files and `autogen.js` |
| Custom JSX render primitives | GLSL shader source files |
| | `index.js` barrel re-exports |

---

## 1 — App Shell & Providers

### `App`

> **`src/app/App.jsx`** — Root shell

The root app shell composes the entire runtime tree. It initializes the project list from the generated entry-page data, sorts it once on mount with `sortItems`, and then wraps the route outlet with the quality provider, work-item context, page-transition provider, persistent navigation menu, and error boundary.

- Owns the `items` state that powers the work carousel and project detail routes.
- Makes navigation UI global by rendering `NavigationMenu` outside the outlet.
- Uses nested providers to keep quality, work data, and route-transition state available everywhere.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState`, `useEffect` | Provides: `QualityProvider`, `WorkContext.Provider`, `PageTransitionProvider` | — | `NavigationMenu`, `ErrorBoundary`, `Outlet` |

---

### `QualityProvider`

> **`src/app/QualityContext.jsx`** — Rendering-quality state provider

Manages the global rendering-quality tier used by the canvas layer. Seeds its initial state from `getInitialQuality()` and exposes `quality` plus a guarded `setQuality` method through context.

- Debounces quality changes by enforcing a 2-second minimum delay between updates.
- Exists mainly to let scene code degrade gracefully on weaker devices.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState`, `useRef`, `useCallback` | Provides: `QualityContext` | — | — |

---

## 2 — Route Components

### `Home`

> **`src/routes/Home/Home.jsx`** — Landing page

The landing page combines the loading sequence, hero copy, decorative overlays, and the home 3D scene. It uses `useScrollNavigation` to turn downward scroll progress into both route-transition intent and laser-scene parameter changes.

- Skips the loading screen when arriving via internal navigation state (`location.state.fromNavigation`).
- Preloads the GLB assets (`Logo.glb`, `Wall.glb`) used by the home scene.
- Resets scroll position and clears navigation state on entry.
- Derives `laserParams` from `LASER_PARAMS`, scaling each value with scroll progress.
- Renders `HomeCanvas` behind the DOM hero content and only enables interaction once loading completes.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState`, `useEffect`, `useMemo`, `useRef`, **`useScrollNavigation`** | — | `EASING`, `LOADING`, `REVEAL`, `SCROLL_THRESHOLDS`, `STAGGER`, `LASER_PARAMS` | `HomeCanvas`, `LoadingScreen`, `ScrollDown`, `RadialGrid`, `RedoAnimText` |

---

### `Work`

> **`src/routes/Work/Work.jsx`** — 3D work carousel

The scrollable project carousel page. It delegates the 3D presentation to `WorkCanvas`, translates card clicks into page transitions, and implements the "scroll up at the top to go home" interaction.

- Uses `useWorkItems()` to read the sorted project list built in `App`.
- Guards navigation with a `hasNavigated` ref so repeated scroll or click events cannot double-fire.
- Tracks whether the carousel is near its top and accumulates upward wheel or touch input until it crosses the configured exit threshold.
- Shows a mobile-only swipe hint when touch support is detected.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState`, `useCallback`, `useEffect`, `useRef`, **`usePageTransition`** | **`useWorkItems`** | `SCROLL_THRESHOLDS` | `WorkCanvas`, `ErrorBoundary` |

---

### `About`

> **`src/routes/About/About.jsx`** — Tabbed profile page

A tabbed profile page that swaps between experience, education, skills, and software lists. It is a composition-heavy page: a selector rail on one side, animated content panel on the other, and a large decorative grid behind both.

- Keeps local `currentPage` state to select one of the section components (`EXP`, `EDU`, `SKL`, `SFT`).
- Uses Framer Motion `AnimatePresence` and shared-layout animation (`layoutId`) for the active-tab indicator.
- Uses `PixelCard` as an animated accent inside each selector button.
- Applies `GridOverlay` as a full-page decorative system.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState` | — | `EASING`, `REVEAL`, `SPRING_CONFIG`, `STAGGER` | `GridOverlay`, `PixelCard`, `ExpSection`, `EduSection`, `ListSection` |

---

### `Contact`

> **`src/routes/Contact/Contact.jsx`** — Terminal-style contact flow

The contact page behaves like a staged terminal-interface flow rather than a plain form. It moves through `message`, `intercept`, and `complete` phases, combining inputs, glitch effects, status messaging, and typewriter-driven diagnostic text.

- Tracks phase, form data (`name`, `message`, `email`), and a `glitching` flag in local state.
- Uses an SVG `feTurbulence` displacement filter plus layered overlays for the intercept glitch sequence.
- First phase collects name and message; second phase asks for email identification; final phase confirms relay.
- Uses `StatusMessage`, `TypewriterText`, and radial text decorations to sell the "signal intercept" fiction.
- Wraps the full page in `ErrorBoundary` so failures in the motion-heavy UI degrade safely.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState`, `useCallback`, `useRef` | — | `CONTACT_TIMING`, `EASING`, `REVEAL`, `STAGGER` | `StatusMessage`, `TypewriterText`, `ErrorBoundary`, `PixelCard` |

---

### `Entry`

> **`src/routes/Entry/Entry.jsx`** — Dynamic project detail wrapper

The dynamic wrapper for all project case-study pages. It reads the `:title` route param, normalizes it via `normalizeKey()`, looks up the matching generated page entry, and then renders a common hero plus the project-specific content component.

- Enables Lenis smooth scrolling for long-form reading.
- Renders a 404-style fallback when the normalized key does not resolve.
- Uses `ProjectHero` for the standard project header and then mounts the page-specific body inside `Suspense`.
- Adds a synopsis block, `DashLine`, `ScrollReveal`, and bottom `GradualBlur` so every project page shares the same narrative structure.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useParams`, **`useLenisScroll`** | — | `LENIS` | `ProjectHero`, `ScrollReveal`, `DashLine`, `GradualBlur` |

---

## 3 — About Route Subcomponents

These form a small isolated tree used exclusively inside the About page.

| Component | File | Description | Hooks | Config | Children |
|---|---|---|---|---|---|
| **`ExpSection`** | `src/routes/About/components/ExpSection.jsx` | Renders the experience timeline. Maps each item into company, role, date, and details. | — | `EASING`, `REVEAL` | `AboutItem` |
| **`EduSection`** | `src/routes/About/components/EduSection.jsx` | Renders the education list. Formats school, course, and date data. | — | `EASING`, `REVEAL` | — |
| **`ListSection`** | `src/routes/About/components/ListSection.jsx` | Generic list renderer for the skills and software tabs. | — | — | `AboutItem` |
| **`AboutItem`** | `src/routes/About/components/AboutItem.jsx` | Smallest reusable unit: one line of text with optional icon and metadata. Handles both SVG components and plain image sources. | — | `EASING`, `REVEAL` | — |

---

## 4 — Entry Page Bodies

All of these are **composition-only** page components. None owns significant interactive state — they sequence shared UI blocks, project copy, and asset references into case-study narratives. All share the same dependency profile:

> **Hooks:** none &nbsp;|&nbsp; **Context:** none &nbsp;|&nbsp; **Config:** none

| Component | File | Project | Shared Blocks Used |
|---|---|---|---|
| **`Cjib`** | `src/routes/Entry/pages/Cjib/Cjib.jsx` | CJIB — motion design, documentation, and seizure-management UX across three product teams. | `CaseIntro`, `WorkHeader`, `StatementBlock`, `FullImage`, `FeatureSplit`, `ComparisonBlock`, `HeroStatement`, `EvidenceRow`, `ScrollReveal` |
| **`Ld58`** | `src/routes/Entry/pages/Ld58/Ld58.jsx` | Ludum Dare 58 — 3D art, UI design, and branding delivered in 72 hours. | `CaseIntro`, `WorkHeader`, `StatementBlock`, `FullImage`, `FeatureSplit`, `DoubleImage`, `HeroStatement`, `EvidenceRow`, `ScrollReveal` |
| **`LsdJam`** | `src/routes/Entry/pages/LsdJam/LsdJam.jsx` | LSD Jam — level art and environment design for a reality-bending game jam. | `CaseIntro`, `WorkHeader`, `StatementBlock`, `FullImage`, `FeatureSplit`, `DoubleImage`, `ComparisonBlock`, `HeroStatement`, `EvidenceRow`, `ScrollReveal` |
| **`Pmot`** | `src/routes/Entry/pages/Pmot/Pmot.jsx` | PMOT — retail webstore and learning platform redesign. Most information-dense case study. | `CaseIntro`, `WorkHeader`, `StatementBlock`, `FullImage`, `FeatureSplit`, `DoubleImage`, `ComparisonBlock`, `HeroStatement`, `EvidenceRow`, `ScrollReveal` |
| **`SqlGame`** | `src/routes/Entry/pages/SqlGame/SqlGame.jsx` | SQL Game — educational game that teaches SQL through play. | `CaseIntro`, `WorkHeader`, `StatementBlock`, `FullImage`, `FeatureSplit`, `DoubleImage`, `ComparisonBlock`, `HeroStatement`, `EvidenceRow`, `ScrollReveal` |
| **`SsgNL`** | `src/routes/Entry/pages/SsgNL/SsgNL.jsx` | Sopra Steria — four internal products (branding, board games, chatbot UI). | `CaseIntro`, `WorkHeader`, `StatementBlock`, `FullImage`, `FeatureSplit`, `DoubleImage`, `ComparisonBlock`, `HeroStatement`, `EvidenceRow`, `ScrollReveal` |

---

## 5 — Reusable DOM Components

### 5.1 — Root

#### `ErrorBoundary`

> **`src/components/ErrorBoundary.jsx`** — Runtime error containment

The global failure-containment component used around high-risk route and canvas trees. It is a **class-based** React error boundary — the one deliberate exception to the project's functional-component style.

- Catches render-time errors and stores both the thrown error and component stack info.
- Renders a fallback screen with recovery actions ("Try Again", "Go Home") instead of crashing the entire app.
- Used around routes and canvas-heavy pages where runtime failures are more likely.

| Hooks | Context | Config | Children |
|---|---|---|---|
| — (class component) | — | — | — |

---

### 5.2 — Decoration

#### `DashLine`

> **`src/components/decoration/DashLine/DashLine.jsx`** — Adaptive dashed SVG divider

An SVG-based decorative divider that measures its container and draws either a horizontal or vertical dashed line. It uses a `ResizeObserver` so the path stays correct when the layout changes.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useState`, `useEffect` | — | — | — |

---

#### `GridOverlay`

> **`src/components/decoration/GridOverlay/GridOverlay.jsx`** — Responsive decorative grid system

The most elaborate decorative DOM component in the codebase. It computes a responsive cell grid from its own bounds, randomly activates some cells as striped/blurred accents, and overlays crosshair icons that move with a spring-smoothed mouse parallax offset.

- Accepts many sizing and styling props for cell density, stripe intensity, blur, icon size, and parallax strength.
- Recalculates rows and columns with `ResizeObserver`.
- Uses Framer Motion values and springs for smooth mouse tracking.
- Keeps its random stripe pattern stable until the grid dimensions change.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useState`, `useEffect`, `useMemo`, `useCallback`, `useMotionValue`, `useSpring` | — | `EASING`, `REVEAL`, `SPRING_CONFIG`, `STAGGER` | Default crosshair icon (`PlsIcon`) |

---

#### `NineSliceBorder`

> **`src/components/decoration/NineSliceBorder/NineSliceBorder.jsx`** — Screen-space framing border

Renders a screen-space border overlay whose position and size come from Framer Motion values. Used by the work carousel to frame the currently centered card, after the 3D card bounds have been projected into 2D screen coordinates.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useTransform` | — | — | — |

---

#### Radial Decoration System

A family of small decorative components used on the Home page and elsewhere:

| Component | File | Description | Hooks | Config | Children |
|---|---|---|---|---|---|
| **`RadialGrid`** | `src/components/decoration/RadialText/RadialGrid.jsx` | Dispatcher — selects circle or text grid via `type` prop. | — | — | `RAD_GRID_CRCL`, `RAD_GRID_TXT` |
| **`RAD_CRCL`** | `src/components/decoration/RadialText/CRCL/RAD_CRCL.jsx` | Single SVG ring with animated progress arc. | — | `SPRING_CONFIG` | — |
| **`RAD_GRID_CRCL`** | `src/components/decoration/RadialText/CRCL/RAD_GRID_CRCL.jsx` | 3×3 circle indicator grid with randomized values. | **`useRandomNumber`** | — | `RAD_CRCL` |
| **`RAD_TXT`** | `src/components/decoration/RadialText/TXT/RAD_TXT.jsx` | Animated zero-padded numeric counter. | `useRef`, `useEffect` | — | — |
| **`RAD_GRID_TXT`** | `src/components/decoration/RadialText/TXT/RAD_GRID_TXT.jsx` | 3×3 numeric counter grid with randomized values. | **`useRandomNumber`** | — | `RAD_TXT` |

---

#### `RedoAnimText`

> **`src/components/decoration/RandomText/RedoAnimText.jsx`** — Cycling phrase animation

Cycles through a fixed set of phrases (`"| VOID OF AMBITION |"`, `"| VOID OF CREATION |"`, `"| VOID OF PROGRESS |"`) with a character-count animation. Used on the home page to inject motion into the quote block.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useEffect`, `useMotionValue`, `useTransform`, `animate` | — | — | — |

---

#### `ScrollDown`

> **`src/components/decoration/ScrollDown/ScrollDown.jsx`** — Scroll affordance indicator

An animated SVG scroll indicator with pulsing lines and a bouncing arrow. Parameterized by `color`, `width`, `height`, and `speed`.

| Hooks | Context | Config | Children |
|---|---|---|---|
| — | — | — | — |

---

### 5.3 — Effects

#### `CurtainTransition`

> **`src/components/effects/CurtainTransition/CurtainTransition.jsx`** — Page transition curtain

The page-transition effect that visually covers one route before revealing the next. It renders three staggered color layers, each moving along an axis determined by the requested direction, and fires completion callbacks when the last layer finishes.

- Supports `up`, `down`, `left`, and `right` entry directions.
- Knows whether it is covering or revealing by comparing `isOpen` to the previous render.
- Displays the destination page label on the final layer.
- Serves as the visual half of `usePageTransition`.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useEffect` | — | `CURTAIN`, `EASING` | — |

---

#### `GradualBlur`

> **`src/components/effects/GradualBlur/GradualBlur.jsx`** — Directional progressive blur

Creates a directional blur fade by stacking multiple masked `backdrop-filter: blur()` layers. Used to soften hard visual cutoffs, especially at the bottom of long pages.

- Supports top, bottom, left, and right orientations.
- Allows different curve types (`linear`, `bezier`, `ease-in`, `ease-out`, `ease-in-out`) and exponential progression.
- Is `React.memo`-wrapped because its output is fully derived from props.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useMemo`, `memo` | — | — | — |

---

#### `LoadingScreen`

> **`src/components/effects/LoadingScreen/LoadingScreen.jsx`** — Asset-loading experience

A custom animated loading system rather than a simple spinner. It watches Three.js asset progress with `useProgress`, renders the logo as a block-based canvas graphic, cycles cryptic messages with glitch-text decoding, and only exits after both loading and a minimum display time have been satisfied.

- Contains an internal `BlockLogo` helper that samples the SVG into a block field.
- Animates a radial pulse wave through those blocks and occasionally applies scanline-like glitches.
- Exposes `onComplete`, `minDisplayTime`, and `logoSrc` so the route can coordinate when the main content fades in.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState`, `useRef`, `useEffect`, `useProgress` | — | `LOADING` | Internal `BlockLogo`, `AnimatePresence` |

---

#### `PixelCard`

> **`src/components/effects/PixelCard/PixelCard.jsx`** — Pixel shimmer overlay

An effect component that overlays a canvas-based pixel shimmer on top of its children. Used mostly as a decorative surface treatment. Respects `prefers-reduced-motion` by collapsing animation speed.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useEffect`, `useCallback` | — | — | Canvas pixel animation internals |

---

#### `ScrollReveal`

> **`src/components/effects/ScrollReveal/ScrollReveal.jsx`** — Viewport-triggered reveal

Wraps text in a viewport-triggered reveal animation. Uses Framer Motion's `useInView` with intersection detection and animates from low-opacity, slightly shifted content into its resting position.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useMemo`, `useInView` | — | `REVEAL` | — |

---

#### `TypewriterText`

> **`src/components/effects/TypewriterText/TypewriterText.jsx`** — Multi-line typewriter

Renders an array of text lines with a timed character-by-character reveal. Tracks the current row and character index in state. Used heavily on the contact page for diagnostic-log styling.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState`, `useRef`, `useEffect` | — | `REVEAL`, `TYPEWRITER` | `AnimatePresence` |

---

### 5.4 — Layout

#### `NavigationMenu`

> **`src/components/layout/NavigationMenu/NavigationMenu.jsx`** — Global menu controller

The persistent site navigation controller. Owns the open/closed state, runs the RGB glitch treatment on the label, closes on Escape, and delegates the actual visuals to `MenuBackgroundLayers`, `MenuButton`, and `MenuPanel`.

- Uses a `busy` ref to prevent rapid toggle spam.
- Changes button color after a delay timed to the glitch effect.
- Wraps route changes in a small close delay so the menu can animate out before the curtain transition starts.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useState`, `useRef`, `useEffect`, `useLayoutEffect`, `useCallback`, `animate` | **`usePageTransition`** | `GLITCH`, `MENU_TIMING` | `MenuBackgroundLayers`, `MenuButton`, `MenuPanel` |

---

#### Menu Subcomponents

These form the internal structure of the `NavigationMenu` and share common config dependencies:

| Component | File | Description | Config | Children |
|---|---|---|---|---|
| **`MenuButton`** | `src/components/layout/NavigationMenu/MenuButton.jsx` | Toggle button with icon swap and glitch text layers. Exposes ARIA toggle attributes. | `EASING`, `MENU_TIMING` | Icon stack + glitch refs |
| **`MenuPanel`** | `src/components/layout/NavigationMenu/MenuPanel.jsx` | Sliding container for links and socials. Marked `inert` and `aria-hidden` when closed. Uses separate open/close timings. | `EASING`, `MENU_TIMING` | `MenuLinks`, `MenuSocials` |
| **`MenuLinks`** | `src/components/layout/NavigationMenu/MenuLinks.jsx` | Fixed nav list (Home, Work, About, Contact). Staggered slide-up reveal. | `EASING`, `MENU_TIMING` | — |
| **`MenuSocials`** | `src/components/layout/NavigationMenu/MenuSocials.jsx` | External social links (Artstation, GitHub, LinkedIn). Opens in new tab with `rel="noopener noreferrer"`. | `MENU_TIMING`, `REVEAL` | — |
| **`MenuBackgroundLayers`** | `src/components/layout/NavigationMenu/MenuBackgroundLayers.jsx` | Two animated color slabs behind the panel. Purely decorative, `aria-hidden`. | `EASING`, `MENU_TIMING` | — |

> All menu subcomponents have **no hooks** and **no context** dependencies.

---

#### `ProjectHero`

> **`src/components/layout/ProjectHero/ProjectHero.jsx`** — Project page hero section

The standard hero section for every case-study page. Renders the project banner, overlays `GridOverlay`, reveals title and metadata with staggered motion, and anchors the page with the same visual language regardless of which entry component follows.

| Hooks | Context | Config | Children |
|---|---|---|---|
| — | — | `EASING`, `REVEAL`, `STAGGER` | `GridOverlay`, `ScrollDown` |

---

### 5.5 — UI (Content Blocks)

These components form the **case-study content system**. Most are thin presentational wrappers with no hooks, no context, and no config — they rely entirely on props and CSS Modules for their output.

#### Zero-Dependency Content Blocks

| Component | File | Description |
|---|---|---|
| **`CaseIntro`** | `src/components/ui/CaseIntro/CaseIntro.jsx` | Leading media block with kicker, heading, and subtitle. Auto-detects video vs. image source. |
| **`ComparisonBlock`** | `src/components/ui/ComparisonBlock/ComparisonBlock.jsx` | Side-by-side comparison figures with label and heading. Used for "before vs. after" sections. |
| **`DoubleImage`** | `src/components/ui/DoubleImage/DoubleImage.jsx` | Two-image side-by-side layout. The simplest image component. |
| **`EvidenceRow`** | `src/components/ui/EvidenceRow/EvidenceRow.jsx` | Horizontal row of labeled facts/stats. Summarizes scope, duration, tools, or outcomes. |
| **`FeatureSplit`** | `src/components/ui/FeatureSplit/FeatureSplit.jsx` | Two-column section with media on one side and text on the other. `reverse` prop flips layout. |
| **`FullImage`** | `src/components/ui/FullImage/FullImage.jsx` | Full-width image with `thin` (reduced height) and `contain` (object-fit) modifiers. |
| **`HeroStatement`** | `src/components/ui/HeroStatement/HeroStatement.jsx` | Prominent statement callout. Used for outcome or system-summary moments. |
| **`StatementBlock`** | `src/components/ui/StatementBlock/StatementBlock.jsx` | Generic labeled prose/content section wrapper. |
| **`WorkLabel`** | `src/components/ui/WorkLabel/WorkLabel.jsx` | Small badge-style label for project classification. |

#### Content Blocks With Dependencies

| Component | File | Description | Config | Children |
|---|---|---|---|---|
| **`StatusMessage`** | `src/components/ui/StatusMessage/StatusMessage.jsx` | Animated status panel (success/warning/error). Selects icons, decals, and styling based on status. | `EASING`, `REVEAL`, `STAGGER` | Decorative icon/decal stack |
| **`WorkHeader`** | `src/components/ui/WorkHeader/WorkHeader.jsx` | Main section heading block for case studies. Combines title, subtitle, and description. | — | `ScrollReveal` |
| **`WorkSubHeader`** | `src/components/ui/WorkSubHeader/WorkSubHeader.jsx` | Secondary heading block for subsection framing. Optionally reveals a descriptive paragraph. | — | `ScrollReveal` |

---

## 6 — Canvas & Scene Components

The codebase treats the 3D layer as a component system of its own. These pieces either create a `<Canvas>`, orchestrate a scene, or render reusable scene nodes.

### 6.1 — Home Scene

#### `HomeCanvas`

> **`src/canvas/home/HomeCanvas.jsx`** — Canvas wrapper for home route

Creates the R3F `<Canvas>` with the project's preferred WebGL settings (`dpr: [1, 1.5]`, `performance.min: 0.5`, high-performance GPU preference) and passes scroll/animation props through to `HomeScene`.

| Hooks | Context | Config | Children |
|---|---|---|---|
| — | — | — | `HomeScene` |

---

#### `HomeScene`

> **`src/canvas/home/HomeScene.jsx`** — Home 3D scene orchestrator

The main 3D orchestrator for the landing page. Combines the background mesh, animated logo, subtitle text, laser plane, camera setup, post-processing, and mouse-reactive camera rig into one scroll-aware scene.

- Tracks an `entryComplete` flag so expensive effects (FBO, Float, AO) only turn on after the ~1.5s opening animation has settled.
- Uses `useAdaptiveQuality` to pick among low, medium, and high post-processing presets:
  - **Low:** bloom only (intensity 0.3, 2 levels)
  - **Medium:** N8AO (4 samples) + bloom (intensity 0.45, 4 levels)
  - **High:** N8AO (8 samples) + bloom (intensity 0.55, 6 levels)
- Uses `useObjectAnimation` for logo, background, and subtitle transforms.
- Uses `useCameraAnimation` to animate both camera position and FOV.
- Pauses the background video once scroll progress passes `0.4`.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useState`, `useEffect`, `useMemo`, **`useAdaptiveQuality`**, **`useObjectAnimation`**, **`useCameraAnimation`** | — | `ENTRY`, `FLOAT_CONFIG` | `Rig`, `BackgroundMesh`, `LogoMesh`, `LaserPlane`, `EffectComposer` stack |

---

#### `LaserPlane`

> **`src/canvas/home/LaserPlane.jsx`** — Procedural laser/fog effect

Renders the procedural laser or fog layer that cuts through the home hero scene. Driven almost entirely by uniforms on the custom laser material and scales some behavior according to the global quality tier.

- Accepts many visual tuning props: `flowSpeed`, `wispSpeed`, `wispDensity`, `wispIntensity`, `fogIntensity`, `fogScale`, `decay`, `falloffStart`, `color`, etc.
- Updates shader time, mouse, resolution, and quality-dependent uniforms every frame via `useFrame`.
- Skips frames on low quality (every 2nd frame) to keep the effect cheap.
- Sits high in render order (`1000`) and ignores frustum culling — acts more like a full-screen post effect than a mesh.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useMemo`, `useEffect`, `useFrame`, `useThree` | **`useQuality`** | — | `LaserFlowMaterial` |

---

### 6.2 — Work Scene

#### `WorkCanvas`

> **`src/canvas/work/WorkCanvas.jsx`** — Canvas wrapper + scroll orchestration

Pairs a fixed-position canvas with a scroll container, runs Lenis smooth scrolling on that container, and feeds the current normalized scroll progress into the carousel scene.

- Owns the Framer Motion spring values used by `NineSliceBorder` to frame the active card.
- Creates a synthetic scroll height equal to `items.length × 100vh`.
- Snaps to the nearest project once scrolling settles (idle frames ≥ 30, snap duration 400ms).
- Passes camera and rig refs into `useBorderProjection` so the active 3D card can be framed in the DOM layer.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useEffect`, `useMotionValue`, `useSpring`, **`useBorderProjection`** | — | `SPRING_CONFIG`, `CAROUSEL_CONFIG` | `WorkScene`, `NineSliceBorder`, Lenis instance |

---

#### `WorkScene`

> **`src/canvas/work/WorkScene.jsx`** — Carousel rotation and centeredness manager

The scene manager for the 3D project carousel. Rotates the rig according to scroll position, moves the camera vertically along the spiral, computes which card is currently most centered, and only keeps nearby cards visible.

- Stores centeredness scores for all cards in a ref so children can read them without causing rerenders.
- Updates `visibleCenter` only when the best card index changes (avoids per-frame state updates).
- Notifies the parent about centeredness and scroll so border projection and route-level exit logic stay synchronized.
- Renders only cards within distance ≤ 1 from the visible center (visibility culling).

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useState`, `useFrame`, `useThree` | — | `CAROUSEL_CONFIG` | `WorkCard` × N |

---

#### `WorkCard`

> **`src/canvas/work/WorkCard.jsx`** — Individual 3D project card

Represents a single project card in the 3D carousel. Combines the refractive banner shader, optional pixel-overlay hover treatment, floating motion, and text labels for year, title, and client.

- Uses `useTexture` for the banner and `useNoiseTexture` for refraction noise.
- Reads the global quality tier and adjusts shader fidelity:
  - **Low:** no refraction, no chromatic aberration, no pixel overlay, no float
  - **Medium:** `uRefractPower: 0.003`, `uChromaticAberration: 0.4`
  - **High:** `uRefractPower: 0.006`, `uChromaticAberration: 0.8`, pixel overlay enabled
- Smoothly scales based on the centeredness value computed by `WorkScene`.
- Sets `document.body.style.cursor` on hover and delegates navigation via the supplied callback.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useState`, `useMemo`, `useFrame`, `useTexture`, **`useNoiseTexture`** | **`useQuality`** | `FLOAT_CONFIG`, `CAROUSEL_CONFIG` | `workCardMaterial`, `pixelOverlayMaterial`, `Text` labels |

---

### 6.3 — Shared Scene Nodes

#### `Rig`

> **`src/canvas/shared/camera/Rig.jsx`** — Mouse-driven camera parallax

Reusable camera-rig controller. Applies a smoothed camera offset based on pointer position and reorients the camera toward the scene origin every frame. Frame-skips (every 2nd frame) for CPU savings.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useFrame` | — | — | — |

---

#### `BackgroundMesh`

> **`src/canvas/shared/meshes/BackgroundMesh.jsx`** — Video-textured background

Renders the GLB wall/background asset and maps a looping video onto it. The `paused` prop lets the scene stop playback after a certain scroll threshold to save resources. `React.memo`-wrapped.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useMemo`, `memo`, `Suspense`, `useGLTF`, `useVideoTexture` | — | — | — |

---

#### `LogoMesh`

> **`src/canvas/shared/meshes/LogoMesh.jsx`** — Refractive logo with FBO

Renders the 3D logo mesh with the glass/refraction material. Manages a small off-screen render target (256×256 FBO) to feed transition texture data back into the material. Applies pointer-driven rotational motion. `React.memo`-wrapped, FBO renders every 2nd frame.

| Hooks | Context | Config | Children |
|---|---|---|---|
| `useRef`, `useMemo`, `memo`, `useFrame`, `useGLTF`, `useFBO`, **`useNoiseTexture`** | — | — | `glassLogoMaterial` |

---

## 7 — Custom JSX Render Primitives

These are not traditional React function components but they register custom JSX elements via `shaderMaterial` + `extend()` (or `RawShaderMaterial` + `extend()`) used directly in scene component markup.

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
| `useAdaptiveQuality` | `HomeScene` |
| `useBorderProjection` | `WorkCanvas` |
| `useCameraAnimation` | `HomeScene` |
| `useLenisScroll` | `Entry` |
| `useNoiseTexture` | `WorkCard`, `LogoMesh` |
| `useObjectAnimation` | `HomeScene` |
| `usePageTransition` | `Work`, `NavigationMenu` |
| `useRandomNumber` | `RAD_GRID_CRCL`, `RAD_GRID_TXT` |
| `useScrollNavigation` | `Home` |
| `useWorkItems` | `Work` |

### Context Consumer Map

| Context Hook | Consumers |
|---|---|
| `useQuality` | `LaserPlane`, `WorkCard` |
| `useWorkItems` | `Work` |
| `usePageTransition` | `Work`, `NavigationMenu` |

### Config File → Consumer Map

| Config Module | Consumers |
|---|---|
| `animation.config.js` | `Home`, `About`, `Contact`, `GridOverlay`, `CurtainTransition`, `LoadingScreen`, `ScrollReveal`, `TypewriterText`, `StatusMessage`, `NavigationMenu` + menu subs, `ProjectHero`, `HomeScene`, `WorkCanvas` |
| `carousel.config.js` | `WorkCanvas`, `WorkScene`, `WorkCard` |
| `laser.config.js` | `Home` |

---

> **Maintenance note:** This file is the canonical merged version and should be updated first when component behavior or dependencies change.
