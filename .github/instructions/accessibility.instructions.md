---
description: "Use when adding interactive elements, keyboard handlers, aria attributes, focus management, or screen reader support to components."
applyTo: "src/components/**"
---
# Accessibility

## Semantic HTML First

Use native HTML elements (`<button>`, `<a>`, `<nav>`, `<aside>`) instead of `<div onClick>`. Native elements provide keyboard interaction and screen reader support for free.

## ARIA Attributes

### Interactive Elements

Toggle buttons must communicate their state:

```jsx
<button
    aria-label={open ? 'Close menu' : 'Open menu'}
    aria-expanded={open}
    onClick={toggle}
>
```

### Hidden Decorative Content

Mark purely visual elements as decorative:

```jsx
<span aria-hidden="true">{/* glitch duplicate text */}</span>
<canvas aria-hidden="true" />  {/* decorative animation */}
```

### Panels & Overlays

Hidden panels must be removed from the accessibility tree:

```jsx
<aside aria-hidden={!open} inert={!open}>
    {/* Menu panel content */}
</aside>
```

Use `inert` to prevent keyboard/pointer interaction with hidden panels — this is preferred over manual focus trapping for slide-out panels.

## Keyboard Handling

### Escape to Close

All overlays and panels must close on Escape:

```javascript
useEffect(() => {
    const onKeyDown = (e) => {
        if (e.key === 'Escape' && open) {
            onClose();
        }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
}, [open, onClose]);
```

### Focus-Aware Animations

When components trigger visual effects on focus/blur, guard against internal focus shifts:

```javascript
const onFocus = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    onAnimate('appear');
};
const onBlur = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    onAnimate('disappear');
};
```

### Conditional Tab Participation

Use `tabIndex` to include or exclude elements from the tab order:

```jsx
<div tabIndex={noFocus ? -1 : 0} onFocus={onFocus} onBlur={onBlur}>
```

## Reduced Motion

Respect `prefers-reduced-motion` for non-essential animations. Essential transitions (page navigation curtain) can still animate but should reduce intensity.

## Checklist for New Interactive Components

- [ ] Is the element a native `<button>` or `<a>`? If not, does it have `role` and `tabIndex`?
- [ ] Does it have an `aria-label` if there's no visible text?
- [ ] If it toggles state, does it have `aria-expanded` or `aria-pressed`?
- [ ] Can it be activated with Enter/Space (buttons) or Enter (links)?
- [ ] If it opens an overlay, does Escape close it?
- [ ] Are decorative children marked `aria-hidden="true"`?
