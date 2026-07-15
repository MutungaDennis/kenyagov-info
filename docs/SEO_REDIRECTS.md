# SEO redirects (CitizenGuide.KE)

Search engines and bookmarks should keep working when URLs change. Prefer **HTTP 301/308 permanent** redirects so ranking signals transfer to the new URL.

## Where redirects live

| Mechanism | File | Status |
|-----------|------|--------|
| Next.js `redirects()` | `next.config.ts` | **308** when `permanent: true` |
| Edge middleware | `middleware.ts` | Service `?category=` → clean path (308) |
| Rewrites (not redirects) | `next.config.ts` `rewrites()` | Pretty path still serves content |
| Soft App Router | `permanentRedirect()` | Use sparingly; prefer config |

## Service categories

- **Canonical share URL:** `/services/categories/{slug}`
- **Rewrite (internal):** → `/services?category={slug}`
- **Legacy query URL:** `/services?category={slug}` → middleware **308** to `/services/categories/{slug}`

## Major historical renames (already in `next.config.ts`)

- `/politics/*` → `/elections/*`
- `/institutions/*` → `/government/institutions/*`
- `/officials/*`, `/leaders/*` → `/government/people/*`
- `/counties/*` → `/government/counties/*`
- `/browse` → `/topics`

## Adding a new redirect

When you rename or remove a public path:

1. Add `{ source, destination, permanent: true }` in `next.config.ts` `redirects()`.
2. Put the **new** URL in `app/sitemap.ts` (and HTML sitemap if needed).
3. Prefer internal links to the **new** path only.
4. Deploy; verify with `curl -I https://www.citizenguide.ke/old-path` → `308`/`301` and `Location: /new-path`.

Do **not** remove permanent redirects for years after a rename — Google may keep old URLs in results for a long time.
