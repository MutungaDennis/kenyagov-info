# Security changes and production verification

## Application checks

- `pnpm test`: direct-handler authorization, proxy recovery, Turnstile failure cases and HTML sanitization.
- `pnpm typecheck`: full active TypeScript project, without incremental output.
- `pnpm lint`: ESLint CLI (Next.js 16 no longer provides `next lint`).
- `pnpm build:next`: Next.js production build.
- `pnpm cf:build`: complete Worker build and compressed size check. Build before deploying; do not reuse an older `.open-next` directory.

Use pnpm 11.1.3 and the pnpm lockfile. Legacy, unused Sanity Constitution panels are preserved under `components/_archive/constitution`; they reference removed helpers/endpoints and are excluded from active checks. The active Constitution admin pages use the database-backed components instead.

## Turnstile

Production always requires CAPTCHA. Missing or test keys fail closed. Development can explicitly opt out with `NEXT_PUBLIC_TURNSTILE_ENABLED=false`; otherwise local test keys still use Cloudflare siteverify.

Set these in the **deployed Cloudflare Worker**, not only in a local env file:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: the real widget's public site key.
- `TURNSTILE_SECRET_KEY`: matching secret, stored as a Worker secret.
- `TURNSTILE_ALLOWED_HOSTNAMES`: optional comma-separated exact hostnames; defaults to `citizenguide.ke,www.citizenguide.ke`. Add a staging hostname only when that environment is intentionally supported.

The widget must allow the production hostnames in Cloudflare. The browser loads the site key from `/api/public-env`, avoiding build/runtime drift. The endpoint never returns the secret.

Public forms verify tokens on the application server, including hostname and action. Supabase Auth must have **CAPTCHA protection enabled**, provider **Cloudflare Turnstile**, and the matching widget secret configured. Supabase verifies login/password-reset tokens; do not also consume those single-use tokens in application siteverify.

In Supabase Auth URL Configuration, allow `https://www.citizenguide.ke/auth/callback` (and the apex host if used), plus the local callback for development. Password recovery uses PKCE: request and open the link in the same browser. The callback exchanges the code and redirects only to the configured admin reset page. Successful password updates sign out the local session.

Before deployment, confirm real keys are bound, CAPTCHA protection is enabled in Supabase, then exercise login, wrong password/retry, reset email, expired recovery link, contact, feedback, problem report and support in a real browser. Tokens must refresh after failed requests. Automated mocks cannot certify real widget hostname settings or live key pairing.

## Database follow-up

`lib/supabase/migrations/20260921_rls_alignment.sql` was applied through Supabase MCP as `20260921124140_rls_alignment_and_access_regression`, with the full database regression suite passing before commit. It supersedes the pending `20260921_security_hardening.sql`: profile privilege protection and bounded analytics are now live. See [the RLS verification report](rls-alignment-20260921.md) for public-read checks and remaining PostGIS limitations. Do not rerun either migration or bulk replay the legacy directory against production.

Remaining database follow-up:

1. Establish a complete ordered schema baseline. The RLS before snapshot and applied migration history are captured, but the legacy directory is not a replayable schema baseline.
2. Generate Supabase TypeScript types from that verified schema and parameterize clients. Do not invent generated types from incomplete SQL.
3. Address analytics volume abuse and retention. Input bounds are not rate limits; direct anonymous Supabase inserts bypass Worker rate limits. A durable ingestion/rate-limit design requires a separate coordinated database change.

## Caching follow-up

The current OpenNext static-assets incremental cache is read-only. This patch does not provision R2 or change the hosting architecture. Runtime ISR updates are still not guaranteed: editorial changes may require a fresh build/deploy. A writable cache and an end-to-end revalidation test remain a separate deployment task.
