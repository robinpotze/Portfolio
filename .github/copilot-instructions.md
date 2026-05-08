# Project Guidelines

## Tech Stack

- **React 19** with functional components and hooks only (no class components)
- **React Router 7** — see `src/app/routes.jsx` for route definitions
- **Three.js + @react-three/fiber + @react-three/drei** — 3D scenes live in `src/canvas/`
- **Motion** (`motion` package) — DOM transitions and spring animations
- **Lenis** — smooth scrolling via `useLenisScroll` hook
- **Vite 7** with `vite-plugin-glsl` for shader imports
- **CSS Modules** — all component styles; no utility CSS frameworks

## Project Structure

```
src/
├── app/          # App shell, routing, context providers
├── canvas/       # Three.js/R3F scenes (home/, work/)
├── components/   # Shared React components (navigation/, sections/, ui/)
├── config/       # Centralized animation & carousel constants
├── hooks/        # Custom React hooks
├── routes/       # Page-level route components
└── utils/        # Pure utility functions
workers/
└── contact-form/ # Cloudflare Worker (Resend email API)
```

### Path Aliases

Always use path aliases for imports — never traverse more than one level up:

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

## Key Conventions (details in instruction files)

- **Naming**: PascalCase components, `use`-prefix hooks, UPPER_SNAKE_CASE configs, camelCase CSS classes
- **Exports**: default export for components/hooks; named exports for configs/utilities
- **State**: Context API only — `useWorkItems()`, `usePageTransition()`
- **Navigation**: Always use `navigateWithTransition()` — never raw `navigate()`
- **Animation**: Import from `@config/animation.config` — never hardcode durations/easing
- **Errors**: Wrap pages in `<ErrorBoundary>`, use try/catch for async operations

## Keeping Instructions Up to Date

When you make changes to the codebase that affect patterns, conventions, or APIs documented in `.github/instructions/*.instructions.md` or this file, **update the relevant instruction files in the same edit session**. This includes:

- Renaming or moving files/exports referenced in instructions
- Changing hook signatures, context providers, or config structures
- Adding new patterns that supersede or extend documented ones
- Removing features or utilities that instructions reference

Before finishing a task, verify that no instruction file references stale names, paths, or patterns introduced by your changes. Outdated instructions cause regressions when followed in future sessions.

## Reference Documentation

`ACTIVETHEORY_FRAMEWORK_DOCS.md` documents the Active Theory / Hydra framework for reference. This project does **not** use the Hydra framework — do not follow Hydra patterns (custom Class system, `AppState`, `Element` API, etc.) when writing code here.
