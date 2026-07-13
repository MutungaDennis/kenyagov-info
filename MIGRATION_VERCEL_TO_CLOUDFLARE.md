# Migrate from Vercel (GitHub) → Cloudflare

Use this order so the site stays online as long as possible.

**Repo is already prepared** for Cloudflare with OpenNext (`wrangler.jsonc`, `pnpm run deploy`, etc.).  
See also `CLOUDFLARE.md` for technical details.

---

## Golden rule

```
1. Deploy + test on Cloudflare FIRST (workers.dev URL)
2. Point the domain to Cloudflare SECOND
3. Disconnect / delete Vercel LAST
```

Do **not** remove the Vercel project or domain before Cloudflare serves a working build.

---

## Phase 0 — Inventory (10 minutes)

### 0.1 Copy every Vercel env var

1. Open [vercel.com](https://vercel.com) → your project → **Settings → Environment Variables**.
2. Copy **all** names and values into a password manager or temporary notes (Production + Preview if different).

You need at least:

| Name | Type on Cloudflare |
|------|--------------------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Variable (plain) |
| `NEXT_PUBLIC_SANITY_DATASET` | Variable (plain) |
| `NEXT_PUBLIC_SUPABASE_URL` | Variable (plain) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Variable (plain) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Variable (plain) |
| `SANITY_API_TOKEN` | Secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret |
| `TURNSTILE_SECRET_KEY` | Secret |
| `XAI_API_KEY` | Secret |
| `OPENROUTER_API_KEY` | Secret |
| `HANSARD_XAI_MODEL` | Variable or secret |
| `HANSARD_OPENROUTER_MODEL` | Variable or secret |
| `LLAMA_CLOUD_API_KEY` | Secret |

### 0.2 Note your domain setup

Write down:

- Production URL(s): e.g. `www.citizenguide.ke`, apex `citizenguide.ke`
- Where DNS is managed (Cloudflare DNS already? Vercel DNS? registrar?)
- Git branch used for production (usually `main`)

### 0.3 Push Cloudflare packaging to GitHub

On your machine (if not already committed):

```bash
pnpm install
git status
# Commit: wrangler.jsonc, open-next.config.ts, package.json, CLOUDFLARE.md, etc.
git add wrangler.jsonc open-next.config.ts package.json pnpm-lock.yaml pnpm-workspace.yaml public/_headers .env.example .dev.vars.example CLOUDFLARE.md MIGRATION_VERCEL_TO_CLOUDFLARE.md .nvmrc next.config.ts .gitignore
git commit -m "Add Cloudflare OpenNext deployment package"
git push origin main
```

Vercel may auto-deploy this commit — that is fine for now.

---

## Phase 1 — Deploy to Cloudflare (site still on Vercel)

### Option A — CLI first deploy (recommended smoke test)

```bash
pnpm install
pnpm exec wrangler login

# Ensure .env.local has production-like NEXT_PUBLIC_* and secrets for the build
pnpm run deploy
```

Wrangler will print a URL like:

`https://kenyagov-info.<your-subdomain>.workers.dev`

Test that URL thoroughly (home, constitution, services, contact, login).

### Option B — Connect GitHub in Cloudflare (for ongoing deploys)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**.
2. **Create** → **Import a repository** (or **Connect to Git**).
3. Authorize GitHub and select this repo.
4. Configure the project:

| Setting | Value |
|---------|--------|
| Project name | `kenyagov-info` (match `wrangler.jsonc` `name` if possible) |
| Production branch | `main` |
| Build command | `pnpm run cf:build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` (repo root) |
| Node version | `22` (from `.nvmrc`) |
| Package manager | **pnpm** |

5. **Before first build**, add **all** environment variables (Production):

   - Every `NEXT_PUBLIC_*` → **Text / Variable** (not encrypted if you need them at build; Cloudflare should expose them to the build environment).
   - Secrets → **Encrypted / Secret**.

6. Trigger a deploy (push to `main` or **Retry deployment**).

7. Open the successful deployment URL and test again.

> **Why not “static Pages only”?**  
> This Next app needs SSR, Server Actions, and API routes. OpenNext packages it as a **Worker + assets**. In the dashboard it may appear under **Workers & Pages**. That is correct. Do **not** choose a static export / empty Framework preset that only uploads `out/`.

---

## Phase 2 — Attach your domain on Cloudflare (cutover)

Only after Phase 1 looks good on `*.workers.dev`.

### 2.1 If the domain is already on Cloudflare DNS

1. Workers & Pages → `kenyagov-info` → **Settings → Domains & Routes** (or **Custom domains**).
2. Add:
   - `www.citizenguide.ke`
   - `citizenguide.ke` (apex), if you use it
3. Cloudflare will create/update the required DNS records for the Worker.

### 2.2 If DNS is still on Vercel / registrar only

1. Either:
   - **Move DNS to Cloudflare** (add site → change nameservers at registrar), **or**
   - Keep DNS elsewhere and add the CNAME/A records Cloudflare shows for the Worker.
2. Wait for DNS to propagate (often minutes; sometimes up to 24–48h).

### 2.3 Verify production on the real domain

Open:

- `https://www.citizenguide.ke`
- `/robots.txt`, `/sitemap.xml`, `/llms.txt`
- A few deep pages (constitution, government, elections)
- Share a link on WhatsApp/Telegram to check OG image

Optional: temporarily lower TTL on DNS before cutover for faster rollback.

---

## Phase 3 — Disconnect Vercel from GitHub (after DNS works)

Do this only when **production traffic** hits Cloudflare and the site works.

### 3.1 Remove domain from Vercel

1. Vercel → project → **Settings → Domains**
2. Remove `www.citizenguide.ke` and apex (if listed)
3. Confirm DNS no longer points at Vercel

### 3.2 Disconnect GitHub

1. Vercel → project → **Settings → Git**
2. **Disconnect** the GitHub repository  
   (stops auto-deploy on every push)

### 3.3 Pause or delete the Vercel project

- **Safer first step:** Project → **Settings → General → Pause project** (if available), or leave it idle with no domain.
- **Later:** Delete the project once you are confident (1–2 weeks).

You do **not** need to uninstall the Vercel GitHub App from the whole org unless this was the only project using it:

- GitHub → **Settings → Applications → Installed GitHub Apps → Vercel**  
  → Configure → remove only this repository, or uninstall if unused.

### 3.4 Clean optional Vercel bits in the repo (optional)

Already ignored: `.vercel` in `.gitignore`.

You can delete local `.vercel` folder if present:

```bash
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue
```

No `vercel.json` is required for Cloudflare.

---

## Phase 4 — Post-migration checklist

- [ ] Site loads on Cloudflare custom domain over HTTPS
- [ ] Env vars work (Sanity content, Supabase data, Turnstile forms)
- [ ] Admin login works (if used)
- [ ] `pnpm run deploy` or Git auto-deploy succeeds
- [ ] Google Search Console / Bing still see `https://www.citizenguide.ke/sitemap.xml`
- [ ] Vercel domain removed; no dual-host confusion
- [ ] GitHub connected only to Cloudflare for this app (or both intentionally)

---

## Rollback plan

If Cloudflare fails after DNS switch:

1. Re-add domain on Vercel **or** point DNS CNAME back to Vercel.
2. Re-enable Vercel Git connection if disconnected.
3. Fix Cloudflare build/env offline using `pnpm run preview` / `pnpm run deploy` on `workers.dev`.

---

## Common mistakes

| Mistake | Result |
|---------|--------|
| Delete Vercel before Cloudflare works | Downtime |
| Forget `NEXT_PUBLIC_*` on **build** env | Broken client Supabase/Sanity |
| Use static Pages export | No SSR / API |
| Change `wrangler.jsonc` `main` / `assets` paths | 404s |
| Domain still on Vercel + Cloudflare | Split traffic / SSL issues |

---

## Quick command card

```bash
# Local Workers-shaped test
pnpm run preview

# Ship
pnpm run deploy

# Login CLI
pnpm exec wrangler login
```

Dashboard: [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → `kenyagov-info`.
