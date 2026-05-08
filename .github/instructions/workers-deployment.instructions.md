---
description: "Use when working with Cloudflare Workers, the contact form backend, deployment, wrangler, environment secrets, or build/deploy pipelines."
applyTo: "workers/**"
---
# Workers & Deployment

## Architecture

The project has two deployable artifacts:

| Artifact | Stack | Hosting | Directory |
|----------|-------|---------|-----------|
| Frontend (SPA) | Vite + React | Cloudflare Pages (or any static host) | `/` (root) |
| Contact Form API | Cloudflare Worker | Cloudflare Workers | `workers/contact-form/` |

These are independent — they have separate `package.json` files and deploy separately.

## Frontend Build & Deploy

```bash
# Build
npm run build          # outputs to dist/

# Preview locally
npm run start          # vite preview on built output
```

The Vite config splits vendor chunks aggressively (React, Three.js, R3F, Motion each get their own chunk). Keep `chunkSizeWarningLimit: 600` — if a chunk exceeds this, refactor the import rather than raising the limit.

## Contact Form Worker

### Local Development

```bash
cd workers/contact-form
npm install
npm run dev            # wrangler dev — runs locally on port 8787
```

### Configuration (`wrangler.toml`)

```toml
name = "contact-form"
main = "src/index.js"
compatibility_date = "2024-12-01"
```

### Environment Secrets

The worker uses three secrets (set via `npx wrangler secret put <NAME>`):

| Secret | Purpose |
|--------|---------|
| `RESEND_API_KEY` | API key for Resend email service |
| `FROM_EMAIL` | Sender address (must be verified in Resend) |
| `TO_EMAIL` | Recipient address for contact form submissions |

**Never commit secrets.** They exist only in Cloudflare's encrypted secret store.

### Deploy

```bash
cd workers/contact-form
npm run deploy         # wrangler deploy
```

### Worker Code Conventions

- Single `fetch` handler exported as default
- CORS headers defined once as a constant, spread into all responses
- Validate all input fields before processing
- Return JSON responses with consistent shape: `{ success: true }` or `{ error: "message" }`
- Use appropriate HTTP status codes (400 for validation, 405 for wrong method, 502 for upstream failure)
- Log errors with `console.error` (visible in Cloudflare dashboard)

### Adding a New Worker

1. Create `workers/<name>/` with its own `package.json` and `wrangler.toml`
2. Add `dev` and `deploy` scripts to the worker's `package.json`
3. Set `compatibility_date` to the current date
4. Add secrets via `npx wrangler secret put`
5. Document the worker's purpose and secrets in this instruction file

## Frontend ↔ Worker Integration

The frontend calls the worker URL directly via `fetch`:

```javascript
const CONTACT_FORM_URL = 'https://contact-form.robinpotze.workers.dev';
```

This URL is defined as a constant in the route's data file — not as an environment variable — since the frontend is a static SPA with no server-side rendering.

### CORS

The worker allows `*` origin with POST + OPTIONS methods. If you restrict CORS later, update both the worker and the frontend URL constant.
