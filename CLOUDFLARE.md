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

- Dashboard → Workers & Pages → `citizenguide-ke` → Settings → Variables  
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

### 2.4 Optional: R2 cache (recommended later)

ISR / data cache works better with R2:

```bash
pnpm exec wrangler r2 bucket create citizenguide-ke-next-cache
```

Then uncomment `r2_buckets` in `wrangler.jsonc` and enable `r2IncrementalCache`
in `open-next.config.ts` (see comments in those files).

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

First deploy creates Worker `citizenguide-ke`.  
Custom domain: Workers & Pages → your worker → **Domains & Routes** → add `www.citizenguide.ke`.

---

## 5. Deploy from Git (automatic)

1. Push this repo to GitHub/GitLab.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Import repository**.
3. Framework preset: **Next.js** (OpenNext) if offered, otherwise **None**.
4. Build settings:

| Setting | Value |
|---------|--------|
| **Build command** | `pnpm run cf:build` |
| **Deploy command** | `npx wrangler deploy` |
| **Root directory** | `/` (repo root) |
| **Package manager** | `pnpm` (enable if asked) |

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
