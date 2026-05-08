---
description: "Use when writing or editing CSS Module stylesheets. Covers class naming, CSS variables, font stack, and design tokens."
applyTo: "**/*.module.css"
---
# CSS Module Conventions

## Class Naming

Use **camelCase** for all class names. Import as `styles`:

```jsx
import styles from './MyComponent.module.css';
// ...
<div className={styles.heroTitle}>
```

## Design Tokens (CSS Variables)

All design tokens are defined in `src/index.css` on `:root`. Always use these variables — never hardcode colors, fonts, or shadows.

### Colors

| Variable       | Value                    | Use                  |
|----------------|--------------------------|----------------------|
| `--c-brnd_100` | `#2ad0d5`                | Brand cyan           |
| `--c-brnd_20`  | `rgba(42,208,213,0.2)` | Translucent brand    |
| `--c-brnd_-100`| `#D40322`                | Contrasted brand     |
| `--c-brnd_-20` | `rgba(212,3,34,0.2)`   | Translucent contrast |
| `--c-drk_100`  | `#0a0a0a`                | Dark background      |
| `--c-drk_40`   | `rgba(17,17,17,0.4)`   | Translucent dark     |
| `--c-lght_100` | `#eee`                   | Light text           |
| `--c-lght_60`  | `rgba(238,238,238,0.6)`| Mid-opacity light    |
| `--c-lght_40`  | `rgba(238,238,238,0.4)`| Translucent light    |
| `--c-ok_100`   | `#69d52a`                | Success green        |
| `--c-ok_40`    | `rgba(105,213,42,0.4)` | Translucent success  |
| `--c-warn_100` | `#d5b32a`                | Warning yellow       |
| `--c-warn_40`  | `rgba(213,179,42,0.4)` | Translucent warning  |
| `--c-error_100`| `#d40322`                | Error red            |
| `--c-error_40` | `rgba(212,3,34,0.4)`   | Translucent error    |
| `--c-blue`     | `#3d06eb`                | Accent blue          |
| `--c-0`        | `rgba(0,0,0,0)`        | Transparent          |

### Fonts

| Variable               | Stack                           | Use                   |
|------------------------|---------------------------------|-----------------------|
| `--f-TITLE`            | `4em 'Kode Mono', monospace`    | Page titles           |
| `--f-HEADER`           | `3rem 'Orbitron', sans-serif`   | Section headers       |
| `--f-H3`               | `1.5rem 'Orbitron', sans-serif` | Subheaders            |
| `--f-PARAGRAPH`        | `1rem 'Alata', sans-serif`      | Body text             |
| `--f-FUNCTIONAL`       | `1rem 'Kode Mono', monospace`   | UI labels, navigation |
| `--f-FUNCTIONAL_SMALL` | `0.75rem 'Kode Mono', monospace`| Small UI text         |
| `--f-DECORATIONAL`     | `2rem 'Kode Mono', monospace`   | Decorative text       |

### Spacing

| Variable     | Value         | Use                           |
|--------------|---------------|-------------------------------|
| `--s-xs`     | `8px`         | Extra small spacing           |
| `--s-s`      | `16px`        | Small spacing                 |
| `--s-m`      | `32px`        | Medium spacing                |
| `--s-l`      | `48px`        | Large spacing                 |
| `--s-xl`     | `64px`        | Extra large spacing           |

### Decoration



## Style Guidelines

- Use semantic class names that describe the element's role — no utility-style classes
- Keep each `.module.css` file scoped to its component; avoid deep nesting
- Use `text-transform: uppercase` for headings (applied globally to `h1`, `h2`, `h3`)
- Prefer `transform` and `opacity` for animated properties (GPU-accelerated)
- Add `will-change` only for properties that will actually animate

## Responsive Design

### Breakpoints

Use desktop-first `max-width` media queries with these standardized breakpoints:

| Breakpoint | Target           |
|------------|------------------|
| `1024px`   | Tablet           |
| `768px`    | Large mobile     |
| `375px`    | Small mobile     |

```css
@media (max-width: 1024px) { /* tablet */ }
@media (max-width: 768px)  { /* mobile */ }
@media (max-width: 375px)  { /* small mobile */ }
```

### Content Width

Use `var(--content-max-width)` instead of hardcoding `max-width: 60%`. This variable scales automatically across breakpoints: `60%` → `75%` → `90%` → `95%`.

```css
.wrapper {
    max-width: var(--content-max-width);
    margin: 0 auto;
}
```

### Guidelines

- Use `clamp()` for font sizes that need fluid scaling — heading font variables already use `clamp()`
- Prefer `width: 100%` over `width: 100vw` to avoid scrollbar-induced overflow
- Ensure interactive elements have a minimum tap target of `44px` on mobile
- Stack flex/grid layouts vertically at `≤768px` using `flex-direction: column` or grid template changes
- Use `100dvh` with `100vh` fallback for full-height sections to handle mobile browser chrome
