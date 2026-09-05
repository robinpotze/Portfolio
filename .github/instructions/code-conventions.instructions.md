---
description: 'Use when writing or editing React components, custom hooks, utility functions, config files, or context providers. Covers component structure, hook ordering, import conventions, state management, performance patterns, and file organization.'
applyTo: 'src/**'
---

# Code Conventions

## Code Quality Principles

Write code the way a senior developer reads it — small, obvious, and reusable.

### Keep units small

- **Components**: one clear responsibility. If a component has multiple visual sections or behaviors, split into sub-components within the same directory.
- **Functions/hooks**: ≤ 40 lines of logic (excluding JSX). If longer, extract a helper or custom hook.
- **CSS modules**: group related rules together. If a module exceeds ~150 rules, the component it styles is probably too large — split both.

### Don't repeat yourself

- Before writing a new utility, component, or style pattern, **search the codebase** for existing implementations.
- If two components share the same logic (event handler, derived value, data transform), extract it to:
    - A shared hook in `src/hooks/` (for stateful/effect logic)
    - A utility in `src/utils/` (for pure transforms)
    - A shared UI component in `src/components/ui/` (for presentational patterns)
- If two CSS modules share the same block of declarations, extract a shared component or use CSS composition via `composes`.

### Write less to do the same

- Prefer declarative patterns (`.map`, `.filter`, object lookups) over imperative if/else chains.
- Replace verbose conditionals with early returns.
- Use object maps for variant selection instead of switch/if ladders:
    ```javascript
    const ICON_MAP = { success: ChkIcon, error: ErrIcon, info: InfoIcon };
    const Icon = ICON_MAP[status];
    ```
- Avoid wrapper functions that only forward arguments — call the target directly.

### Architectural placement

- **Shared across routes** → `src/components/` (ui, layout, effects, etc.)
- **Used only within a route** → co-locate inside that route's directory (e.g., `src/routes/About/components/`)
- **Used across canvas scenes** → `src/canvas/meshes/`, `src/canvas/materials/`, or `src/canvas/effects/`
- **Used in one scene only** → co-locate inside that scene's directory
- When a co-located component gains a second consumer, promote it to the shared directory.

### Readability conventions

- Name things for what they represent, not how they work. Prefer `errorMessage` over `str`, `visibleItems` over `filtered`.
- Group related state declarations together with a brief comment if the grouping isn't obvious.
- Separate logical sections within a component with a single blank line — no more.
- Avoid nested ternaries. Use early returns or a lookup object instead.

## Import Ordering

Group imports in this order, separated by blank lines:

1. **External libraries** — `react`, `react-router-dom`, `motion/react`, `three`, `@react-three/*`
2. **Path-aliased project imports** — `@app`, `@canvas`, `@components`, `@config`, `@hooks`, `@utils` (alphabetical by alias)
3. **Relative imports** — CSS modules (`.module.css`), sibling data files, sub-components

```javascript
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useWorkItems } from '@app/App';
import WorkCanvas from '@canvas/work/WorkCanvas';
import ErrorBoundary from '@components/ErrorBoundary';
import { EASING, REVEAL, SCROLL_THRESHOLDS } from '@config/animation.config';
import { usePageTransition } from '@hooks/usePageTransition';

import styles from './Work.module.css';
import { ABOUT_DATA } from './about.data';
import ExpSection from './components/ExpSection';
```

Always use path aliases — never traverse more than one level up (`../`).
Import React hooks as a single grouped import: `import { useRef, useState, useEffect } from 'react'`.

## Component Structure

### Function Declaration & Export

Use `export default function` for components. Arrow function components are not used:

```javascript
export default function GridOverlay({ cellMinSize = 80, className = '' }) {
    // ...
    return <div className={styles.grid}>{/* ... */}</div>;
}
```

### Props

Destructure props in the function parameter with inline defaults:

```javascript
export default function ScrollReveal({ children, threshold = 0.2, once = true }) {
```

For many props, use multi-line destructuring:

```javascript
export default function GridOverlay({
    cellMinSize = 80,
    cellMaxSize = 160,
    cellAspectRatio = 1.6,
    className = '',
    style = {},
}) {
```

### Hook Ordering

Follow this order strictly inside every component:

```javascript
export default function MyComponent({ prop1, prop2 }) {
    // 1. Router / context hooks
    const navigate = useNavigate();
    const { navigateWithTransition } = usePageTransition();

    // 2. Refs
    const containerRef = useRef(null);
    const hasNavigated = useRef(false);

    // 3. State
    const [value, setValue] = useState(initial);

    // 4. Derived / memoized values
    const config = useMemo(() => ({/* ... */}), [deps]);

    // 5. Effects (each with full dependency array)
    useEffect(() => {
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, [handler]);

    // 6. Callbacks
    const onClick = useCallback(() => {
        /* ... */
    }, [deps]);

    return <JSX />;
}
```

### Handler Naming

Prefix event handlers with `on` — not `handle`:

```javascript
const onClick = useCallback(() => {
    /* ... */
}, []);
const onScroll = useCallback((e) => {
    /* ... */
}, []);
const onCardNavigate = useCallback(
    (path) => {
        /* ... */
    },
    [navigateWithTransition]
);
```

````

## Custom Hook Patterns

### Structure

```javascript
export default function useMyHook(options = {}) {
    const { param = DEFAULT_VALUE } = options;

    const ref = useRef(null);

    useEffect(() => {
        // setup
        return () => { /* cleanup */ };
    }, [param]);

    return ref.current; // or { value, handler }
}
````

### Conventions

- Always export hooks as `export default function useMyHook`
- Exception: context consumer hooks use named `export function` (since the file also default-exports the provider)
- Accept a single options object with destructured defaults from config constants
- Always clean up listeners, observers, and animation frames in effect returns
- Use a `mounted` guard flag for async cleanup (RAF loops, fetch):

```javascript
useEffect(() => {
    let mounted = true;
    function raf(time) {
        if (!mounted) return;
        instance.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => {
        mounted = false;
        instance.destroy();
    };
}, [deps]);
```

### Return Values

- Single value → return directly
- Multiple values → return an object (not an array):

```javascript
return { quality, fps };
```

## State Management

### Context Pattern

Define context, provider, and consumer hook in the same file. Throw on misuse:

```javascript
const WorkContext = createContext(null);

export function useWorkItems() {
    const context = useContext(WorkContext);
    if (!context) throw new Error('useWorkItems must be used within App');
    return context;
}
```

### Provider Nesting

Wrap providers from outermost (least-changing) to innermost (most-changing):

```
QualityProvider → WorkContext.Provider → PageTransitionProvider → ErrorBoundary → Outlet
```

### Refs for Non-Render State

Use `useRef` for values that change frequently but should not trigger re-renders — scroll accumulators, timestamps, navigation guards, animation state:

```javascript
const scrollAccumulator = useRef(0);
const lastScrollTime = useRef(Date.now());
const hasNavigated = useRef(false);
```

## Effect Patterns

### Event Listeners

Always add and remove in the same effect. Use passive listeners where appropriate:

```javascript
useEffect(() => {
    const handleWheel = (e) => {
        /* ... */
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
}, [deps]);
```

### Observers

Disconnect ResizeObserver / IntersectionObserver in cleanup:

```javascript
useEffect(() => {
    const observer = new ResizeObserver(calculate);
    observer.observe(el);
    return () => observer.disconnect();
}, [deps]);
```

### Dependencies

Always supply a complete dependency array. Never suppress the exhaustive-deps lint rule.

## Config & Constants

### File Conventions

- One exported object per concern: `EASING`, `REVEAL`, `SPRING_CONFIG`, `CAROUSEL_CONFIG`
- Keys in `UPPER_SNAKE_CASE`
- Nest related sub-config as objects:

```javascript
export const CAROUSEL_CONFIG = {
    RADIUS: 3,
    LERP_SPEED: 0.12,
    CAMERA: {
        POSITION: [0, 0, 8],
        FOV: 50,
    },
};
```

- Never hardcode timing, easing, or threshold values in components — always import from config

### Parametric Config Pattern

For values that scale with a dynamic input (e.g., scroll progress), use `base` + `scale`:

```javascript
export const LASER_PARAMS = {
    fogIntensity: { base: 0.2, scale: 0.2 },
};
// Usage: fogIntensity.base + fogIntensity.scale * progress
```

## Utility Functions

- Pure functions only — no side effects, no DOM access (except `cssUtils.js`)
- Named exports, no default export:

```javascript
export function calculateCardPosition(index) {
    /* ... */
}
export function calculateCardRotation(index) {
    /* ... */
}
```

- Import config dependencies at the top:

```javascript
import { CAROUSEL_CONFIG } from '@config/carousel.config';
```

- Cache expensive computations in module-level variables when appropriate:

```javascript
let cachedTier = null;
export function getDeviceTier() {
    if (cachedTier) return cachedTier;
    cachedTier = detect();
    return cachedTier;
}
```

## File & Folder Organization

### Co-located Components

Each component gets its own directory with an `index.js` barrel:

```
GridOverlay/
├── GridOverlay.jsx
├── GridOverlay.module.css
└── index.js          → export { default } from './GridOverlay';
```

### Route Pages

Route components co-locate sub-components and data files:

```
About/
├── About.jsx
├── About.module.css
├── about.data.js
└── components/
    ├── EduSection.jsx
    ├── ExpSection.jsx
    └── ListSection.jsx
```

### Canvas Structure

Mirror the route structure — one canvas wrapper + scene per page:

```
canvas/
├── home/
│   ├── HomeCanvas.jsx    ← Canvas wrapper (configures renderer)
│   └── HomeScene.jsx     ← Scene graph (camera, lights, meshes, post-processing)
├── work/
│   ├── WorkCanvas.jsx
│   ├── WorkScene.jsx
│   └── WorkCard.jsx
└── shared/               ← Cross-scene resources
    ├── camera/
    ├── materials/
    ├── meshes/
    └── shaders/
```

## Error Handling

- Wrap route outlets in `<ErrorBoundary>` at the app shell level
- Wrap individual canvas components in `<ErrorBoundary>` where 3D failures should not crash the page
- Guard refs before dereferencing: `if (!ref.current) return;`
- Context hooks throw on misuse rather than returning undefined

## Performance

- `useMemo` for expensive derived values (grid calculations, post-processing settings, variant objects)
- `useCallback` for handlers passed as props to child components
- Refs over state for high-frequency values (scroll position, hover state in useFrame, frame counters)
- Conditional rendering for quality tiers:

```javascript
{
    !isLowQuality && (
        <mesh position={[0, 0, 0.002]}>
            <pixelOverlayMaterial ref={materialRef} transparent depthWrite={false} />
        </mesh>
    );
}
```
