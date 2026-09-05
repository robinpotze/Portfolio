---
description: 'Scaffold or implement code that strictly follows project conventions — components, hooks, utils, canvas scenes, or CSS modules.'
agent: 'agent'
argument-hint: "what to build (e.g., 'carousel hook', 'project detail page', 'glass shader')"
---

You are a senior developer implementing code for this project. Every line you write must be consistent with established patterns — no shortcuts, no "we'll fix it later," no vibe coding. When in doubt, match what existing code does, not what seems easiest.

## Before writing any code

1. Read the relevant instruction files for the type of code you're creating:
    - Components/hooks/utils → [code conventions](.github/instructions/code-conventions.instructions.md)
    - Animations/transitions → [animation instructions](.github/instructions/animation.instructions.md)
    - CSS Modules → [CSS instructions](.github/instructions/css-modules.instructions.md)
    - Canvas/R3F scenes → [R3F instructions](.github/instructions/r3f-canvas.instructions.md)
    - Shaders → [GLSL instructions](.github/instructions/glsl-shaders.instructions.md)
    - Routing/navigation → [routing instructions](.github/instructions/routing.instructions.md)
    - Performance/quality → [performance instructions](.github/instructions/performance.instructions.md)
    - Accessibility → [accessibility instructions](.github/instructions/accessibility.instructions.md)
    - Data/content → [data instructions](.github/instructions/data-content.instructions.md)

2. Find the closest existing example in the codebase and use it as a structural template. Match its patterns exactly — import ordering, hook ordering, export style, naming, everything.

## Mandatory patterns

### Component files

```javascript
// 1. External imports (grouped, alphabetical by package)
import { motion } from 'motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 2. Path-aliased project imports (alphabetical by alias)
import { EASING, REVEAL, STAGGER } from '@config/animation.config';
import { usePageTransition } from '@hooks/usePageTransition';

// 3. Relative imports (CSS modules, sibling files)
import styles from './MyComponent.module.css';

// Motion variants — module-level constants, never inline
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: STAGGER.DEFAULT,
            delayChildren: STAGGER.DELAY,
        },
    },
};

// Component — always `export default function`, never arrow or class
export default function MyComponent({ prop1, prop2 = 'default' }) {
    // 1. Router / context hooks
    const { navigateWithTransition } = usePageTransition();

    // 2. Refs
    const containerRef = useRef(null);

    // 3. State
    const [value, setValue] = useState(null);

    // 4. Derived / memoized values
    const derived = useMemo(() => computeExpensive(prop1), [prop1]);

    // 5. Effects — always with cleanup
    useEffect(() => {
        const handler = () => {
            /* ... */
        };
        window.addEventListener('resize', handler);
        return () => window.removeEventListener('resize', handler);
    }, []);

    // 6. Callbacks — prefixed with `on`, not `handle`
    const onClick = useCallback(() => {
        /* ... */
    }, []);

    return (
        <motion.div ref={containerRef} className={styles.container} variants={containerVariants} initial="hidden" animate="visible">
            {/* ... */}
        </motion.div>
    );
}
```

### Hook files

```javascript
import { useEffect, useRef } from 'react';

import { SOME_CONFIG } from '@config/animation.config';

export default function useMyHook(options = {}) {
    const { param = SOME_CONFIG.DEFAULT } = options;

    const ref = useRef(null);

    useEffect(() => {
        let mounted = true;
        // setup — check `mounted` before state updates
        return () => {
            mounted = false; /* teardown */
        };
    }, [param]);

    return ref; // single value: return directly; multiple: return object
}
```

### CSS Modules

```css
/* camelCase class names, CSS variables from :root, no hardcoded design tokens */
.container {
    display: flex;
    gap: var(--spacing-md);
    font-family: var(--font-body);
    color: var(--color-text-primary);
}

.titleText {
    font-size: var(--font-size-lg);
}
```

## Hard rules — never violate these

1. **No hardcoded animation values.** Every duration, easing, threshold, and spring config comes from `@config/animation.config`.
2. **No raw `navigate()`.** Always `navigateWithTransition(path, name, direction)`.
3. **No class components.** React 19 functional components only.
4. **No deep relative imports.** Max one level up (`../`). Use path aliases.
5. **No inline Motion variants.** Define as module-level constants.
6. **No `handle` prefix.** Use `on` prefix for event callbacks.
7. **No uncleaned effects.** Every `useEffect` with side effects returns a cleanup function.
8. **No state libraries.** Context API only for cross-cutting state.
9. **No `@/` prefix.** Use `@app`, `@hooks`, etc. — not `@/app`, `@/hooks`.

## After writing code

1. Self-review against the checklist above before presenting the result.
2. Verify every import alias resolves correctly.
3. Ensure animation values reference config exports, not magic numbers.
4. Confirm cleanup in every effect.
5. Format with the project's formatter (`npm run format`).
