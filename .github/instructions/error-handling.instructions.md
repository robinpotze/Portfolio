---
description: "Use when adding error handling, try/catch blocks, error boundaries, fetch calls, async operations, or user-facing error states."
---
# Error Handling

## Principles

- **Fail visibly** — never swallow errors silently. Either show the user a recovery UI or log for debugging.
- **Fail gracefully** — degrade to a usable state rather than crashing the page.
- **Handle at boundaries** — catch errors at the closest meaningful boundary, not deep in utility code.

## Render Errors — ErrorBoundary

Wrap page-level components and independent widget trees in `<ErrorBoundary>`:

```javascript
import ErrorBoundary from '@components/ErrorBoundary';

<ErrorBoundary>
    <MyPage />
</ErrorBoundary>
```

- Each route already wraps its content in an ErrorBoundary.
- Canvas components that may fail (WebGL context loss, shader compile) should have their own boundary.
- ErrorBoundary exposes a reset callback — wire it to a retry button where recovery is possible.

## Async Operations — try/catch

All `fetch` calls and async operations must be wrapped in try/catch. Return structured error objects — never throw raw strings:

```javascript
try {
    const res = await fetch(url, options);
    const payload = await res.json().catch(() => null);

    if (!res.ok) {
        throw Object.assign(new Error(payload?.error ?? 'Request failed'), { status: res.status });
    }
    return payload;
} catch (err) {
    // Handle: set error state, show status message, or rethrow for boundary
}
```

### Error state pattern

```javascript
const [error, setError] = useState(null);

const onSubmit = useCallback(async () => {
    setError(null);
    try {
        await sendData(formData);
    } catch (err) {
        setError({ status: err.status, message: getUserMessage(err) });
    }
}, [formData]);
```

## User-Facing Error Messages

Never expose raw error messages or stack traces. Map errors to user-friendly messages:

```javascript
const ERROR_MESSAGES = {
    400: 'Invalid input — please check your data.',
    429: 'Too many requests — please wait a moment.',
    500: 'Server error — please try again later.',
    default: 'Something went wrong. Please try again.',
};

function getUserMessage(err) {
    return ERROR_MESSAGES[err.status] ?? ERROR_MESSAGES.default;
}
```

## WebGL / Three.js Errors

- Wrap canvas scenes in their own ErrorBoundary — a shader compile failure shouldn't crash the entire page.
- Handle WebGL context loss with an event listener on the canvas element:

```javascript
useEffect(() => {
    const canvas = gl.domElement;
    const onLost = (e) => { e.preventDefault(); /* show fallback UI */ };
    canvas.addEventListener('webglcontextlost', onLost);
    return () => canvas.removeEventListener('webglcontextlost', onLost);
}, [gl]);
```

## What NOT to Do

- Don't use `console.error` as the only error handling — it's invisible to users.
- Don't catch errors just to re-throw them unchanged — let them propagate.
- Don't add try/catch around synchronous code that can't throw.
- Don't show technical details (status codes, stack traces) in production UI.
