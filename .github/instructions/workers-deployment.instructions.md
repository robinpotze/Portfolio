---
description: 'Use when working with Cloudflare Workers, the contact form backend, deployment, wrangler, environment secrets, or build/deploy pipelines.'
applyTo: 'workers/**'
---

# Workers & Deployment

## Architecture

The project has two deployable artifacts:

| Artifact         | Stack             | Hosting                            | Directory               |
| ---------------- | ----------------- | ---------------------------------- | ----------------------- |
| Frontend (SPA)   | Vite + React      | Cloudflare Workers (static assets) | `/` (root)              |
| Contact Form API | Cloudflare Worker | Cloudflare Workers                 | `workers/contact-form/` |

They deploy separately (separate Worker names, routes and secrets) but share the repo's single `package.json`, lockfile and wrangler version. The worker directory holds only `wrangler.toml` and `src/`.

## Frontend Build & Deploy

The frontend is an assets-only Worker configured in the root `wrangler.jsonc` (`not_found_handling: "single-page-application"` serves `index.html` for client routes). `@cloudflare/vite-plugin` runs dev and preview inside the Workers runtime and writes the deploy config to `dist/`.

```bash
npm run build          # outputs to dist/
npm run start          # vite preview (Workers runtime) on built output
npm run deploy         # build + wrangler deploy
```

CI (`.github/workflows/deploy.yml`) lints, format-checks, builds and deploys on every push to `master` via `cloudflare/wrangler-action`. It needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.

## Contact Form Worker

### Local Development

```bash
npm run worker:dev     # wrangler dev -c workers/contact-form/wrangler.toml — port 8787
```

### Configuration (`wrangler.toml`)

```toml
name = "contact-form"
main = "src/index.js"
compatibility_date = "2024-12-01"
```

### Environment Secrets

The worker uses three secrets (set via `npx wrangler secret put <NAME>`):

| Secret           | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `RESEND_API_KEY` | API key for Resend email service               |
| `FROM_EMAIL`     | Sender address (must be verified in Resend)    |
| `TO_EMAIL`       | Recipient address for contact form submissions |

**Never commit secrets.** They exist only in Cloudflare's encrypted secret store.

### Deploy

```bash
npm run worker:deploy  # wrangler deploy -c workers/contact-form/wrangler.toml
```

CI deploys it from `.github/workflows/deploy-worker.yml` on pushes to `master` that touch `workers/contact-form/**`. It uses the same `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets as the frontend.

### Worker Code Conventions

- Single `fetch` handler exported as default
- CORS headers defined once as a constant, spread into all responses
- Validate all input fields before processing
- Return JSON responses with consistent shape: `{ success: true }` or `{ error: "message" }`
- Use appropriate HTTP status codes (400 for validation, 405 for wrong method, 502 for upstream failure)
- Log errors with `console.error` (visible in Cloudflare dashboard)

### Adding a New Worker

1. Create `workers/<name>/` with a `wrangler.toml` and `src/` — no separate `package.json`
2. Add `<name>:dev` and `<name>:deploy` scripts to the root `package.json` passing `-c workers/<name>/wrangler.toml`
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
