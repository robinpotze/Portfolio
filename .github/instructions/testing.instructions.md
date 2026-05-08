---
description: "Use when writing tests, setting up test infrastructure, creating test utilities, or deciding what to test in this project."
---
# Testing

## Setup

This project uses **Vitest** (built into Vite) for unit and integration tests. Test files live next to the code they test:

```
src/utils/workUtils.js
src/utils/workUtils.test.js
```

Run tests:
```bash
npm test            # watch mode
npm run test:ci     # single run (CI)
```

## What to Test

### Always test
- **Utility functions** (`src/utils/`) — pure transforms, sorting, normalization
- **Config derivations** — computed values from config constants
- **Data validation** — schema checks, required fields, edge cases
- **Custom hooks with logic** — scroll thresholds, navigation guards, state machines

### Test when complex
- **Components with conditional rendering** — phase-based UIs, error states
- **Async flows** — form submission, fetch error handling

### Don't test
- Trivial pass-through components (a wrapper that just adds a className)
- CSS module class names
- Third-party library behavior (Three.js rendering, motion animation physics)
- Pixel-perfect layout (use visual regression tools instead)

## File Conventions

- Test file: `<module>.test.js` or `<module>.test.jsx`
- Co-locate with source file — not in a separate `__tests__/` directory
- One `describe` block per exported function/component
- Test names describe behavior, not implementation: "returns sorted items by date descending"

## Patterns

### Pure utility test

```javascript
import { describe, expect, it } from 'vitest';
import { sortItems } from './workUtils';

describe('sortItems', () => {
    it('sorts by year descending', () => {
        const items = [
            { id: 1, year: 2023 },
            { id: 2, year: 2025 },
        ];
        const result = sortItems(items);
        expect(result[0].year).toBe(2025);
    });

    it('breaks ties by id ascending', () => {
        const items = [
            { id: 3, year: 2024 },
            { id: 1, year: 2024 },
        ];
        const result = sortItems(items);
        expect(result[0].id).toBe(1);
    });
});
```

### Hook test (with @testing-library/react)

```javascript
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import useMyHook from './useMyHook';

describe('useMyHook', () => {
    it('returns initial state', () => {
        const { result } = renderHook(() => useMyHook());
        expect(result.current.value).toBe(0);
    });
});
```

### Async / fetch mock

```javascript
import { afterEach, describe, expect, it, vi } from 'vitest';

describe('submitForm', () => {
    afterEach(() => vi.restoreAllMocks());

    it('handles server error gracefully', async () => {
        vi.spyOn(globalThis, 'fetch').mockResolvedValue({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: 'Server error' }),
        });

        const result = await submitForm(data);
        expect(result.error).toBeDefined();
    });
});
```

## Conventions

- Use `vi.fn()` and `vi.spyOn()` — never install separate mocking libraries
- Clean up mocks in `afterEach` — never let state leak between tests
- Prefer testing public API over internal implementation
- One assertion per `it` block where practical (makes failures clear)
- Don't mock what you don't own unless you have to (prefer integration over unit for components)
