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
| `--c-lght_40`  | `rgba(238,238,238,0.4)`| Translucent light    |
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
| `--sp-PAGE`  | `64px`        | Page-level horizontal padding |

### Decoration



## Style Guidelines

- Use semantic class names that describe the element's role — no utility-style classes
- Keep each `.module.css` file scoped to its component; avoid deep nesting
- Use `text-transform: uppercase` for headings (applied globally to `h1`, `h2`, `h3`)
- Prefer `transform` and `opacity` for animated properties (GPU-accelerated)
- Add `will-change` only for properties that will actually animate
