---
description: 'Senior code review — audit changed or selected code for convention violations, architectural drift, and vibe-coding smells. Reports issues and applies fixes.'
agent: 'agent'
argument-hint: 'file, folder, or leave blank for changed files'
---

You are a senior developer performing a strict code review on this project. Your job is to enforce consistency, catch architectural drift, and eliminate vibe-coding artifacts. Be opinionated — flag anything that deviates from established patterns, even if it "works."

## Review scope

1. If the user provides a file or folder argument, review that.
2. If no argument is given, use `#tool:changes` to review all uncommitted changes.
3. If code is selected in the editor, review the selection in context of its file.

## Convention checklist

Read the relevant instruction files before reviewing. Cross-reference every item below against the actual code:

### Imports ([code conventions](.github/instructions/code-conventions.instructions.md))

- [ ] Grouped in order: external libs → path-aliased project imports → relative imports, separated by blank lines
- [ ] Path aliases used (`@app`, `@canvas`, `@components`, `@config`, `@hooks`, `@utils`) — no relative paths traversing more than one directory up
- [ ] React hooks imported as a single grouped import (`import { useRef, useState } from 'react'`)
- [ ] No `@/` prefix — use `@app` not `@/app`, `@hooks` not `@/hooks`

### Component structure ([code conventions](.github/instructions/code-conventions.instructions.md))

- [ ] `export default function ComponentName` — no arrow function components, no class components
- [ ] Props destructured in function parameter with inline defaults
- [ ] Hook ordering: router/context hooks → refs → state → memos → effects → callbacks
- [ ] Event handlers prefixed with `on` (not `handle`) — `onClick`, `onScroll`, `onCardNavigate`
- [ ] Motion variants defined as module-level constants above the component, not inline in JSX
- [ ] Effects have complete dependency arrays and return cleanup functions for listeners/observers/timers/RAF

### Animation ([animation instructions](.github/instructions/animation.instructions.md))

- [ ] All durations, easings, thresholds, and spring configs imported from `@config/animation.config`
- [ ] Zero hardcoded numeric durations or cubic-bezier arrays in component files
- [ ] Springs use `SPRING_CONFIG` presets
- [ ] Scroll thresholds use `SCROLL_THRESHOLDS` constants

### State & navigation ([routing instructions](.github/instructions/routing.instructions.md))

- [ ] Navigation uses `navigateWithTransition()` — never raw `navigate()` for page changes
- [ ] Direction parameter is always provided: `'up'`, `'down'`, `'left'`, `'right'`
- [ ] Context API only for cross-cutting state — no Redux, Zustand, or other state libraries
- [ ] Context consumers use the pattern: named export hook with throw guard

### CSS Modules ([CSS instructions](.github/instructions/css-modules.instructions.md))

- [ ] All class names are camelCase — no kebab-case, no BEM
- [ ] Uses CSS variables from `:root` for colors, spacing, fonts — no hardcoded values that should be tokens
- [ ] No utility CSS patterns

### Hooks ([code conventions](.github/instructions/code-conventions.instructions.md))

- [ ] `export default function useHookName` (except context consumer hooks which use named export)
- [ ] Accept options object with destructured defaults from config constants
- [ ] Cleanup in every effect: listeners, observers, RAF loops, async work (use `mounted` guard flag)
- [ ] Return object for multiple values, direct value for single

### Canvas / R3F ([R3F instructions](.github/instructions/r3f-canvas.instructions.md), [performance instructions](.github/instructions/performance.instructions.md))

- [ ] Quality-aware rendering: conditionally scale effects based on quality tier (`low`/`medium`/`high`)
- [ ] `useFrame` for per-frame updates — never `setInterval` or `requestAnimationFrame` in R3F components
- [ ] Geometries and materials memoized or defined outside component body

### Exports ([code conventions](.github/instructions/code-conventions.instructions.md))

- [ ] Components and hooks: `export default function`
- [ ] Config constants: named exports, UPPER_SNAKE_CASE
- [ ] Utility functions: named exports, camelCase

### Naming

- [ ] Files: PascalCase for components/hooks, camelCase for utils/config
- [ ] Config constants: UPPER_SNAKE_CASE
- [ ] CSS classes: camelCase in modules

## Output format

For each issue found, report:

```
🔴 VIOLATION: [category]
File: path/to/file.ext#L<line>
What: <concise description>
Fix: <what it should be>
```

Use 🔴 for convention violations, 🟡 for style inconsistencies, 🟢 for suggestions.

After reporting, **apply all 🔴 and 🟡 fixes automatically**. Group related fixes per file. Do not fix 🟢 suggestions unless the user asks.

If the code is clean, say so briefly — don't manufacture issues.
