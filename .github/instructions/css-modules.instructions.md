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

| Variable | Value | Use |
|----------|-------|-----|
| `--c-BRND` | `#2ad0d5` | Brand cyan — accents, highlights |
| `--c-DRK` | `#0a0a0a` | Dark background |
| `--c-LGHT` | `#eee` | Light text |
| `--c-BRND_TRNS` | `rgba(42,208,213,0.15)` | Translucent brand |
| `--c-DRK_TRNS` | `rgba(17,17,17,0.6)` | Translucent dark |
| `--c-LGHT_TRNS` | `rgba(238,238,238,0.6)` | Translucent light |
| `--c-TRNS` | `rgba(0,0,0,0)` | Transparent |
| `--c-GOLD` | gradient | Gold gradient accent |

### Fonts

| Variable | Stack | Use |
|----------|-------|-----|
| `--f-TITLE` | `4em 'Kode Mono', monospace` | Page titles |
| `--f-HEADER` | `3rem 'Orbitron', sans-serif` | Section headers |
| `--f-H3` | `1.5rem 'Orbitron', sans-serif` | Subheaders |
| `--f-PARAGRAPH` | `1rem 'Alata', sans-serif` | Body text |
| `--f-FUNCTIONAL` | `1rem 'Kode Mono', monospace` | UI labels, navigation |
| `--f-FUNCTIONAL_SMALL` | `0.75rem 'Kode Mono', monospace` | Small UI text |
| `--f-DECORATIONAL` | `2rem 'Kode Mono', monospace` | Decorative text |

### Spacing & Shadows

| Variable | Value | Use |
|----------|-------|-----|
| `--sp-PAGE` | `64px` | Page-level horizontal padding |
| `--s-SHDW` | `0px 0px 20px var(--c-DRK_TRNS)` | Standard drop shadow |

## Style Guidelines

- Use semantic class names that describe the element's role — no utility-style classes
- Keep each `.module.css` file scoped to its component; avoid deep nesting
- Use `text-transform: uppercase` for headings (applied globally to `h1`, `h2`, `h3`)
- Prefer `transform` and `opacity` for animated properties (GPU-accelerated)
- Add `will-change` only for properties that will actually animate
