---
description: 'Use when implementing page navigation, route transitions, curtain animations, scroll-to-navigate, or reading navigation state. Covers navigateWithTransition, route guards, and the full CurtainTransition lifecycle.'
applyTo: 'src/routes/**, src/app/routes.jsx, src/hooks/usePageTransition.jsx, src/hooks/useScrollNavigation.js, src/components/effects/CurtainTransition/**'
---

# Routing & Navigation

## Route Definitions

All routes are defined eagerly (no lazy loading) in `src/app/routes.jsx`, nested under the `App` layout:

| Path           | Component | Notes                                                        |
| -------------- | --------- | ------------------------------------------------------------ |
| `/`            | `Home`    | Landing with 3D scene + scroll-to-exit                       |
| `/work`        | `Work`    | 3D carousel with card navigation                             |
| `/work/:title` | `Entry`   | Dynamic project detail (param normalized via `normalizeKey`) |
| `/about`       | `About`   | Internal tab navigation only                                 |
| `/contact`     | `Contact` | Static page                                                  |

## Navigation Method

**Always use `navigateWithTransition`** — never call `navigate()` directly from React Router:

```javascript
const { navigateWithTransition } = usePageTransition();
navigateWithTransition('/work', 'Work', 'up');
```

### Signature

```javascript
navigateWithTransition(path, pageName, direction, state?)
```

| Param       | Type                                  | Description                                                     |
| ----------- | ------------------------------------- | --------------------------------------------------------------- |
| `path`      | `string`                              | Target route path                                               |
| `pageName`  | `string`                              | Label shown on curtain during transition                        |
| `direction` | `'up' \| 'down' \| 'left' \| 'right'` | Curtain slide direction                                         |
| `state`     | `object?`                             | Optional state merged into `{ fromNavigation: true, ...state }` |

## Transition Lifecycle

```
navigateWithTransition(path, name, dir)
    → CurtainTransition cover slides in (3 layers, ~640ms total)
    → onCoverComplete fires
    → navigate(path, { state: { fromNavigation: true } })
    → New route mounts
    → CurtainTransition reveal slides out
    → onRevealComplete fires → cleanup
```

## Navigation State Convention

The destination reads `location.state?.fromNavigation` to adjust behaviour (e.g., skip loading screen). Always clear the state after reading it:

```javascript
const location = useLocation();
const navigate = useNavigate();
const skipLoading = !!location.state?.fromNavigation;

useEffect(() => {
    if (location.state?.fromNavigation) {
        navigate('.', { replace: true, state: {} });
    }
}, [location.state?.fromNavigation, navigate]);
```

## Navigation Guards

Use a `useRef` guard to prevent double-navigation from scroll or rapid clicks:

```javascript
const hasNavigated = useRef(false);

const onCardNavigate = useCallback(
    (pageKey) => {
        if (hasNavigated.current) return;
        hasNavigated.current = true;
        navigateWithTransition(`/work/${pageKey}`, title, 'up');
    },
    [navigateWithTransition]
);
```

### All Guard Patterns

| Guard                       | Where                                   | Purpose                                           |
| --------------------------- | --------------------------------------- | ------------------------------------------------- |
| `pendingNavigation.current` | `usePageTransition`                     | Blocks concurrent transitions                     |
| `hasNavigated.current`      | Route components, `useScrollNavigation` | Prevents scroll/click firing twice                |
| `busy.current`              | `NavigationMenu`                        | Prevents rapid menu toggles                       |
| `transitionKey.current`     | `usePageTransition`                     | Forces `CurtainTransition` remount per transition |

## Scroll-to-Navigate

Use `useScrollNavigation` for scroll-driven page exits:

```javascript
const { scrollProgress, resetNavigation } = useScrollNavigation(containerRef, {
    threshold: SCROLL_THRESHOLDS.HOME_TRANSITION,
    targetPath: '/work',
    targetName: 'Work',
    direction: 'up',
});
```

The hook tracks `scrollProgress` (0–1) and fires `navigateWithTransition` when the threshold is reached.

## Menu Navigation

The menu uses a delayed transition to allow the close animation to complete:

```javascript
const navigateWithCurtain = useCallback(
    (path, name) => {
        setOpen(false);
        runGlitch('Menu');
        setTimeout(() => {
            navigateWithTransition(path, name);
        }, MENU_TIMING.CLOSE_NAV_DELAY_MS);
    },
    [navigateWithTransition, runGlitch]
);
```

## Curtain Directions

Direction follows the **origin of the interaction**, not the destination:

| Trigger                              | Direction             | Visual                                                  |
| ------------------------------------ | --------------------- | ------------------------------------------------------- |
| User scrolls **down** past threshold | `'up'`                | Curtain slides up from bottom of screen                 |
| User scrolls **up** past threshold   | `'down'`              | Curtain slides down from top of screen                  |
| Side menu link click                 | `'right'` or `'left'` | Curtain slides in from the side (matches menu position) |

The curtain always enters from the direction the user's input came from.
