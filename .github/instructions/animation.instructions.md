---
description: 'Use when implementing animations, transitions, scroll effects, motion variants, spring configs, or Lenis smooth scrolling.'
---

# Animation Patterns

## Centralized Configuration

All timing, easing, and threshold values live in `src/config/animation.config.js`. Always import from there — never hardcode durations or easing curves:

```javascript
import { ANIMATION_TIMING, ANIMATION_EASING, SCROLL_THRESHOLDS } from '@config/animation.config';
```

Key exports:

- `ANIMATION_TIMING` — durations in ms (DOM/CSS) or seconds (Three.js)
- `ANIMATION_EASING` — cubic-bezier arrays `[x1, y1, x2, y2]`
- `SCROLL_THRESHOLDS` — scroll progress trigger points (0–1)
- `FLOAT_CONFIG` — parameters for drei `<Float>` and custom float math
- `SPRING_CONFIG` — motion spring presets (`stiffness`, `damping`, `mass`)

## Motion (DOM)

### Variant Declarations

Define variants as **module-level constants** above the component — never inline inside JSX:

```javascript
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

const itemVariants = {
    hidden: { y: REVEAL.Y_OFFSET, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: REVEAL.DURATION, ease: EASING.EMPHASIZED },
    },
};

export default function MyPage() {
    return (
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.p variants={itemVariants}>Content</motion.p>
        </motion.div>
    );
}
```

### Variants with Stagger

```jsx
const container = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.015, delayChildren: 0.08 },
    },
};

const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: ANIMATION_TIMING.ENTRY_DURATION },
    },
};
```

### AnimatePresence for Exit Animations

Wrap route content or conditional elements in `<AnimatePresence>` for exit transitions.

### Springs

Use `SPRING_CONFIG` presets for consistent spring behavior:

```jsx
import { SPRING_CONFIG } from '@config/animation.config';
// ...
transition={{ type: 'spring', ...SPRING_CONFIG.BORDER_ANIMATION }}
```

## Scroll-Driven Animation

### Lenis Smooth Scrolling

Use the `useLenisScroll` hook — it reads `LENIS_LERP` and `LENIS_DURATION` from config automatically:

```javascript
const lenis = useLenisScroll(); // uses config defaults
```

### Scroll Progress

Page components track scroll position as a normalized 0–1 value and pass it to canvas scenes:

```javascript
const handleScroll = (e) => {
    const progress = e.target.scrollTop / (e.target.scrollHeight - e.target.clientHeight);
    setScrollProgress(Math.min(1, Math.max(0, progress)));
};
```

### Scroll Thresholds

Use `SCROLL_THRESHOLDS` to trigger actions at specific scroll positions:

```javascript
if (scrollProgress > SCROLL_THRESHOLDS.HOME_TRANSITION) {
    navigateWithTransition('/work', 'Work', 'up');
}
```

## Three.js Animation (Canvas)

### Per-Frame Updates

Use `useFrame` from `@react-three/fiber` for per-frame interpolation:

```jsx
useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.5;
    meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.1);
});
```

### Smooth Interpolation

Use Motion's `useSpring` for smooth value transitions that feed into `useFrame`:

```javascript
const springValue = useSpring(0, { stiffness: 100, damping: 30 });
```

## Page Transitions

Always use `navigateWithTransition()` from `usePageTransition` — never raw `navigate()`. This coordinates the curtain cover animation before the route change:

```javascript
const { navigateWithTransition } = usePageTransition();
navigateWithTransition('/work', 'Work', 'up');
```

Direction options: `'up'`, `'down'`, `'left'`, `'right'`.

## CSS Transitions

- Prefer `transform` and `opacity` for GPU-accelerated properties
- Add `will-change` only on elements that will actually animate
- Use `transition` shorthand with easing from config where possible
