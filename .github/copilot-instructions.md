# Project Guidelines

## Tech Stack

- **React 19** with functional components and hooks only (no class components)
- **React Router 7** — see `src/app/routes.jsx` for route definitions
- **Three.js + @react-three/fiber + @react-three/drei** — 3D scenes live in `src/canvas/`
- **Framer Motion** — DOM transitions and spring animations
- **Lenis** — smooth scrolling via `useLenisScroll` hook
- **Vite 7** with `vite-plugin-glsl` for shader imports
- **CSS Modules** — all component styles; no utility CSS frameworks

## Project Structure

```
src/
├── app/          # App shell, routing, context providers
├── canvas/       # Three.js/R3F scenes (home/, work/, shared/)
├── components/   # React components (decoration/, effects/, layout/, ui/)
├── config/       # Centralized animation & carousel constants
├── hooks/        # Custom React hooks
├── routes/       # Page-level route components
└── utils/        # Pure utility functions
```

### Path Aliases

Always use path aliases for imports — never use relative paths that traverse more than one level up:

```javascript
import { useAdaptiveQuality } from '@hooks/useAdaptiveQuality';
import HomeScene from '@canvas/home/HomeScene';
import { ANIMATION_TIMING } from '@config/animation.config';
```

| Alias | Path |
|-------|------|
| `@` | `/src` |
| `@app` | `/src/app` |
| `@canvas` | `/src/canvas` |
| `@components` | `/src/components` |
| `@config` | `/src/config` |
| `@hooks` | `/src/hooks` |
| `@routes` | `/src/routes` |
| `@utils` | `/src/utils` |

## Naming Conventions

- **Components & files**: PascalCase — `HomeScene.jsx`, `GridOverlay.jsx`
- **Hooks**: `use` prefix, camelCase — `useLenisScroll`, `useAdaptiveQuality`
- **Config constants**: UPPER_SNAKE_CASE — `ANIMATION_TIMING`, `SCROLL_THRESHOLDS`
- **CSS classes**: camelCase in modules — `styles.workCard`, `styles.heroTitle`
- **Exports**: default export for components and hooks; named exports for configs and utilities

## Component Patterns

Use this hook ordering inside functional components:

```javascript
export default function MyComponent({ prop1, prop2 }) {
    // 1. Refs
    const ref = useRef(null);

    // 2. State
    const [value, setValue] = useState(initial);

    // 3. Memoized values
    const config = useMemo(() => ({ ... }), [deps]);

    // 4. Effects
    useEffect(() => { ... }, [deps]);

    // 5. Callbacks
    const handleClick = useCallback(() => { ... }, [deps]);

    return <JSX />;
}
```

- Always clean up listeners and subscriptions in effect return functions
- Use `useMemo` for derived/computed values, `useCallback` for event handlers passed as props
- Prefer composition over prop-drilling — use Context for cross-cutting concerns

## State Management

Context API only — no Redux, Zustand, or other state libraries:

- **`WorkContext`** (`src/app/App.jsx`) — provides sorted work/project items
- **`PageTransitionContext`** (`src/hooks/usePageTransition.jsx`) — manages curtain transition + navigation

Access via hooks: `useWorkItems()`, `usePageTransition()`.

## Routing & Navigation

Use `navigateWithTransition()` from `usePageTransition` instead of raw `navigate()`. This coordinates the curtain transition animation before the actual route change.

```javascript
const { navigateWithTransition } = usePageTransition();
navigateWithTransition('/work', 'Work', 'up');
```

## Animation

Import timing and easing values from `src/config/animation.config.js` — never hardcode durations or easing curves. See the animation-specific instructions for detailed patterns.

## Reference Documentation

`ACTIVETHEORY_FRAMEWORK_DOCS.md` documents the Active Theory / Hydra framework for reference. This project does **not** use the Hydra framework — do not follow Hydra patterns (custom Class system, `AppState`, `Element` API, etc.) when writing code here.
