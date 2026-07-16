# Deploy CitizenGuide.KE on Cloudflare (OpenNext)

This app is a **Next.js 16 App Router** project. On Cloudflare we use the official
**[OpenNext Cloudflare](https://opennext.js.org/cloudflare)** adapter.

> **Note on “Pages” vs “Workers”**  
> Cloudflare’s current path for full Next.js (SSR, Server Actions, Route Handlers)
> is a **Worker with static assets**, not classic static-only Pages.  
> In the dashboard this still supports **Git-connected automatic deploys** and
> custom domains—same developer experience as Pages, better Next.js support.  
> `@cloudflare/next-on-pages` is legacy; do **not** use it for this project.

Package manager: **pnpm** (repo already uses `pnpm-lock.yaml`).

---

## 1. What was added to this repo

| File | Purpose |
|------|---------|
| `wrangler.jsonc` | Worker name, `nodejs_compat`, assets, self-binding |
| `open-next.config.ts` | OpenNext Cloudflare adapter config |
| `public/_headers` | Long-cache for `/_next/static/*` |
| `.dev.vars.example` | Local Workers env template |
| `.env.example` | Next.js env var checklist |
| `package.json` scripts | `cf:build`, `preview`, `deploy`, `upload` |

---

## 2. One-time setup

### 2.1 Install dependencies (if not already)

```bash
pnpm install
```

Required packages:

- `@opennextjs/cloudflare` (dependency)
- `wrangler` (devDependency)

### 2.2 Cloudflare account

1. Create/login at [dash.cloudflare.com](https://dash.cloudflare.com)
2. Install Wrangler auth:

```bash
pnpm exec wrangler login
```

### 2.3 Environment variables

**Local Next.js:** copy `.env.example` → `.env.local` (you likely already have this).

**Local Workers preview:** copy `.dev.vars.example` → `.dev.vars` and fill secrets.

**Production (Cloudflare):** set the same keys in the Worker settings:

- Dashboard → Workers & Pages → `kenyagov-info` → Settings → Variables  
  **or**

```bash
# Public (plain text is fine)
pnpm exec wrangler secret put NEXT_PUBLIC_SUPABASE_URL
# …or use dashboard Environment Variables for NEXT_PUBLIC_* 

# Secrets
pnpm exec wrangler secret put SANITY_API_TOKEN
pnpm exec wrangler secret put SUPABASE_SERVICE_ROLE_KEY
pnpm exec wrangler secret put TURNSTILE_SECRET_KEY
pnpm exec wrangler secret put XAI_API_KEY
pnpm exec wrangler secret put OPENROUTER_API_KEY
pnpm exec wrangler secret put LLAMA_CLOUD_API_KEY
pnpm exec wrangler secret put HANSARD_XAI_MODEL
pnpm exec wrangler secret put HANSARD_OPENROUTER_MODEL
```

Also set as **plain environment variables** (not secrets) so the browser can read them:

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Yes |
| `NEXT_PUBLIC_SANITY_DATASET` | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Yes |

> **Build-time note:** `NEXT_PUBLIC_*` values are inlined at **build** time.  
> Set them as Cloudflare **build environment variables** (Git integration) **and**
> as runtime vars. For CLI builds, export them in your shell or `.env.production`
> before `pnpm run deploy`.

### 2.4 R2 incremental cache (required for solid ISR)

OpenNext stores regenerated HTML in R2 so Free-tier Workers do not re-render
on every visit after `revalidate`.

**One-time** (if the bucket does not exist yet):

```bash
pnpm exec wrangler r2 bucket create kenyagov-info-next-cache
```

Repo config (already wired):

- `wrangler.jsonc` → `r2_buckets` binding `NEXT_INC_CACHE_R2_BUCKET`
- `open-next.config.ts` → `incrementalCache: r2IncrementalCache`

If deploy fails with “bucket not found”, create the bucket once with the
command above, then redeploy.

### 2.5 Flattened URLs (301s)

Short paths live at:

| New URL | Was |
|---------|-----|
| `/national-events` | `/society-and-culture/national-events` |
| `/national-events/*` | `/society-and-culture/national-events/*` |
| `/national-symbols` | `/society-and-culture/national-symbols` |
| `/religion-and-faith` | `/society-and-culture/religion-and-faith` |

**Next.js** has permanent redirects as a backup (see `next.config.ts`).

**Prefer Cloudflare Redirect Rules** (0 Worker CPU). Dashboard → Rules →
Redirect Rules → Create:

1. **National events hub**  
   When: URI Path equals `/society-and-culture/national-events`  
   Then: Dynamic redirect `concat("https://www.citizenguide.ke/national-events", …)` or Static to `https://www.citizenguide.ke/national-events` (301)

2. **National events children**  
   When: URI Path starts with `/society-and-culture/national-events/`  
   Then: Dynamic  
   `concat("https://www.citizenguide.ke/national-events/", substring(http.request.uri.path, 36))`  
   (adjust substring length if needed:  
   `len("/society-and-culture/national-events/")` = 36)

3. **National symbols**  
   Path equals `/society-and-culture/national-symbols` → `/national-symbols` (301)

4. **Religion**  
   Path equals `/society-and-culture/religion-and-faith` → `/religion-and-faith` (301)

### 2.6 Cache Rules (HTML)

Caching → Cache Rules → Create rule **Cache public HTML**:

- When: URI Path starts with `/topics/` OR `/national-events` OR `/constitution` OR `/national-symbols` OR `/religion-and-faith` OR `/society-and-culture`
- Then: Eligible for cache · Edge TTL 1 hour (or 24h for constitution)  
- Bypass: admin path, `/api/*`, `/search*`

Also enable **Tiered Cache → Smart** under Caching → Configuration.

---

## 3. Scripts (pnpm)

| Command | What it does |
|---------|----------------|
| `pnpm dev` | Local Next.js (Node) — day-to-day development |
| `pnpm run cf:build` | `next build` + OpenNext Cloudflare bundle |
| `pnpm run preview` | Build + run in **local Workers runtime** |
| `pnpm run deploy` | Build + deploy to Cloudflare |
| `pnpm run upload` | Build + upload a new version (no instant promote) |
| `pnpm run cf-typegen` | Generate `cloudflare-env.d.ts` binding types |

---

## 4. Deploy from your machine

```bash
# Ensure production public env is available for the build
# (from .env.local or exported in the shell)

pnpm run deploy
```

First deploy creates Worker `kenyagov-info`.  
Custom domain: Workers & Pages → your worker → **Domains & Routes** → add `www.citizenguide.ke`.

---

## 5. Deploy from Git (automatic)

1. Push this repo to GitHub/GitLab.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Import repository**.
3. Framework preset: **Next.js** (OpenNext) if offered, otherwise **None**.
4. Build settings:

| Setting | Value |
|---------|--------|
| **Build command** | `pnpm run build` (runs OpenNext; same as `pnpm run cf:build`) |
| **Deploy command** | `npx wrangler deploy` |
| **Root directory** | `/` (repo root) |
| **Package manager** | `pnpm` (enable if asked) |

> **Important:** Deploy needs the OpenNext worker under `.open-next/`.  
> A plain `next build` only is **not** enough — `pnpm run build` must be the  
> OpenNext build (configured in this repo). If you only run Next, wrangler fails with  
> `Could not find compiled Open Next config`.

### Worker size limits (critical)

| Plan | Max Worker size (gzip) |
|------|-------------------------|
| Workers **Free** | **3 MiB** |
| Workers **Paid** (~$5/mo) | **10 MiB** |

This repo is tuned for **Workers Free** after stripping Studio / PDF / AI packages
from the production dependency graph. `pnpm run build` runs a size gate
(`scripts/check-worker-size.mjs`) and fails if gzip would exceed 3 MiB.

**If deploy still fails with code 10027:** enable
[Workers Paid](https://dash.cloudflare.com/?to=/:account/workers/plans) (10 MiB).

### Production dependency policy (size)

**Not installed in production** (removed from `package.json` so they cannot bloat
the Worker): `sanity`, `@sanity/vision`, `next-sanity`, `pdf-parse*`, `ai` / AI
SDKs, `next-auth`, `styled-components`, `sass`.

Content still uses `@sanity/client` + `@portabletext/react` only.

| Feature | On Cloudflare | Alternative |
|---------|---------------|-------------|
| Sanity Studio | **Not in Worker** — `/studio` redirects to managed Studio | `npx sanity@latest deploy` → `*.sanity.studio` |
| Content reads | `@sanity/client` in the Worker | Same project/dataset |
| IEBC PDF bulk upload | HTTP 501 | Local admin / separate job |
| Hansard AI PDF process | HTTP 501 | `scripts/local/hansard-processor.ts` offline |

### Sanity managed Studio (required architecture)

Self-hosting Studio inside Next is what blew past the free Worker size limit.
Use Sanity’s free managed host instead:

```bash
# From repo root (needs network; one-time / when schema changes)
pnpm run studio:deploy
# → e.g. https://your-name.sanity.studio
```

Then set on Cloudflare (Build + Runtime):

```text
NEXT_PUBLIC_SANITY_STUDIO_URL=https://your-name.sanity.studio
```

Also in [Sanity Manage → API → CORS origins](https://www.sanity.io/manage): add
`https://www.citizenguide.ke` and your `*.workers.dev` preview host if needed.

`/studio` on the main site redirects to that URL. Admin “Edit in Studio” links use it too.

### Best-practice CF settings

| Setting | Value |
|---------|--------|
| Build command | `pnpm run build` |
| Deploy command | `npx wrangler deploy` |
| Node | 20 or 22 |
| Clear build cache | After dependency-slimming commits, clear CF build cache once |

Required env (Build **and** Runtime for `NEXT_PUBLIC_*`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_ADMIN_BASE_PATH` — secret admin URL prefix (see below)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (login captcha)
- Secrets at runtime: `SUPABASE_SERVICE_ROLE_KEY`, `SANITY_API_TOKEN`, `TURNSTILE_SECRET_KEY`, etc.

### Secret admin URL (production default)

Production **never** uses well-known `/admin`. The baked-in path is:

```text
/cg-ke-a5wkqciyjpg940u3
```

- Login: `https://www.citizenguide.ke/cg-ke-a5wkqciyjpg940u3/login`
- Dashboard: `https://www.citizenguide.ke/cg-ke-a5wkqciyjpg940u3`
- Visiting `/admin` shows a not-found page (no login form)

Optional override on Cloudflare (Build + Runtime):

```text
NEXT_PUBLIC_ADMIN_BASE_PATH=/your-new-secret-path
```

Local `pnpm dev` still uses `/admin` unless you set the env var.

Also set for Turnstile on login:

```text
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```

5. Add **all** env vars from section 2.3 (especially every `NEXT_PUBLIC_*` for the build).
6. Node version: **20** or **22** (set in dashboard or `.nvmrc`).

If the dashboard still labels the product “Pages”, that is fine as long as the
deploy command uses Wrangler/OpenNext—not `next export` or static-only output.

---

## 6. Local verification checklist

```bash
# 1) Normal Next app still works
pnpm dev

# 2) Cloudflare-shaped production build + local Workers runtime
pnpm run preview
```

Open the URL Wrangler prints and check:

- [ ] Homepage + search
- [ ] Constitution / government pages (Sanity + Supabase)
- [ ] Services hub
- [ ] Contact / feedback (Turnstile)
- [ ] Admin login (if you use it)
- [ ] OG image: `/og-image.webp` loads
- [ ] `/robots.txt`, `/sitemap.xml`, `/llms.txt`

---

## 7. Differences from Vercel (watch list)

| Area | On Cloudflare |
|------|----------------|
| **Runtime** | Workers (V8 + `nodejs_compat`), not Node servers |
| **Edge runtime** | Do **not** use `export const runtime = "edge"` with OpenNext Cloudflare |
| **Cold starts / limits** | Worker CPU time limits; heavy PDF parsing (`pdf-parse`) may need tuning |
| **ISR / revalidate** | Works best with R2 incremental cache |
| **File system** | No durable local disk; use R2/KV/D1 if you need storage |
| **OG generation** | Keep static `/og-image.webp` (already done—avoids large Edge bundles) |
| **Sanity Studio** (`/studio`) | Large client app; usually fine, but first load is heavy |
| **Cron / queues** | Use Cloudflare Cron Triggers / Queues if you replace Vercel cron |

### Known heavy paths in this codebase

- `app/api/upload-iebc` + `pdf-parse-fork` — Node-ish PDF work; test under `pnpm preview`
- Admin Hansard AI routes (xAI / OpenRouter) — need API keys as secrets
- `force-dynamic` pages (open-data, admin) — always SSR on the Worker

---

## 8. DNS cutover from Vercel

1. Deploy on Cloudflare and confirm the `*.workers.dev` URL works.
2. In Cloudflare DNS for `citizenguide.ke`, point `www` (and apex) to the Worker.
3. Remove the domain from the Vercel project.
4. Keep Vercel paused until you are sure.
5. Re-check Search Console / Bing that `sitemap.xml` and HTTPS still resolve.

---

## 9. Middleware note (Next.js 16 + OpenNext)

Next.js 16 prefers `proxy.ts` (Node runtime). **OpenNext Cloudflare does not support Node middleware yet.**

This project uses classic **`middleware.ts`** (Edge) for Supabase admin session protection.  
That is intentional for Cloudflare. You may see a deprecation warning from Next.js; ignore it until OpenNext supports Node Proxy.

Do **not** reintroduce root `proxy.ts` until OpenNext documents Node middleware support.

---

## 10. Troubleshooting

**Build fails with missing `NEXT_PUBLIC_*`**  
Export them in CI/build env; public vars are compile-time.

**`nodejs_compat` errors**  
Confirm `wrangler.jsonc` has `compatibility_flags: ["nodejs_compat"]` and a recent `compatibility_date`.

**Redirect loops / asset 404**  
Do not change `main` or `assets.directory` away from `.open-next/*` unless you know why.

**pnpm on Cloudflare CI**  
Ensure `packageManager` or lockfile is detected; this repo has `pnpm-lock.yaml` and `pnpm-workspace.yaml`.

**Preview works, production missing data**  
Secrets set only in `.dev.vars` are local—add them in the Cloudflare dashboard for production.

**Windows: `EPERM: operation not permitted, symlink`**  
OpenNext creates symlinks while bundling. On Windows this needs either:

1. **Windows Developer Mode** (Settings → Privacy & security → For developers → Developer Mode), then rebuild, or  
2. The repo `postinstall` patch (`scripts/patch-opennext-windows.mjs`) which falls back to file copy, or  
3. Build on **Cloudflare Git CI** (Linux) / WSL — preferred for production deploys.

**Windows warning from OpenNext**  
OpenNext recommends WSL for local builds. Cloudflare’s own build machines are Linux and do not have this issue.

---

## 10. Quick command summary

```bash
pnpm install
pnpm exec wrangler login

# copy env
cp .env.example .env.local   # fill values
cp .dev.vars.example .dev.vars

pnpm run preview   # test Workers runtime locally
pnpm run deploy    # ship to Cloudflare
```

That’s the full package for moving off Vercel free limits while keeping the same Next.js app and **pnpm** workflow.
