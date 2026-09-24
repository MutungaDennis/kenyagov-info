# Cloudflare deployment: September 2026

The attached build failed after Next.js compilation because OpenNext 1.20.1 does not support Next.js 16's Node-only `proxy.ts`. The application now uses `middleware.ts`, which preserves Supabase session checks using the supported Edge middleware convention. Next.js emits a deprecation warning; do not migrate this file back until the adapter supports Node middleware.

Worker preview also exposed [OpenNext issue #1380](https://github.com/opennextjs/opennextjs-cloudflare/issues/1380): Next's middleware manifest reader bypasses the adapter's bundled manifest loader and throws on every public request. `scripts/patch-worker-manifest.mjs` routes that one call through the existing loader, retaining the manifest and middleware behavior. Both build commands run this before minification. The patch uses the TypeScript JavaScript parser, so whitespace, minified names and require wrappers do not determine whether it works. It recognizes an already-fixed reader and preserves middleware semantics. The patch stops the build if the expected upstream code changes, so review it when upgrading Next/OpenNext. It does not edit dependencies or application middleware.

The compatibility date is `2026-07-15`, supported by the installed Wrangler runtime. A newer date initially prevented local Worker startup; only advance it together with a tested runtime update.

The build's size gate also used an obsolete 3 MiB gzip limit. Since [4 September 2026](https://developers.cloudflare.com/changelog/post/2026-09-04-increased-worker-size-limit/), Cloudflare allows 64 MiB uncompressed on both plans. The gate now validates Wrangler's uncompressed measurement and fails if packaging itself fails. The verified bundle is approximately 19.94 MiB uncompressed; no paid-plan upgrade is required for its size.

This application uses server rendering, authenticated administration and API routes. Deploy it as a **Cloudflare Worker with static assets**, using the existing OpenNext configuration. It is not a static Cloudflare Pages export. See [Cloudflare's OpenNext guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/opennext/).

In Cloudflare Workers Builds, connect this repository and use:

| Setting | Value |
| --- | --- |
| Root directory | repository root |
| Build command | `pnpm run build` |
| Deploy command | `pnpm run deploy:only` |
| Node version | 22 |

Do not set a Pages output directory. Wrangler already points to `.open-next/worker.js` and `.open-next/assets`.

Before rebuilding, configure public variables in **both build variables and Worker runtime variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- Any overrides used for `NEXT_PUBLIC_ADMIN_BASE_PATH` and `NEXT_PUBLIC_SANITY_STUDIO_URL`

The supplied log showed missing public Supabase build variables. `scripts/build-next.mjs` now loads Next's environment files and uses the public URL/key pair from `wrangler.jsonc` only when neither is supplied by CI. Complete CI overrides take precedence; partial overrides fail rather than mixing projects. Privileged keys are rejected. Only explicitly allowlisted public variables are copied. Runtime configuration alone does not repair data already prerendered during a build, so rebuild after changing public settings.

Store privileged values as encrypted Worker secrets, including `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY` and any required `SANITY_API_TOKEN`. Never add them to `wrangler.jsonc` or a `NEXT_PUBLIC_*` variable. A plaintext Supabase service-role credential was removed from `wrangler.jsonc`: rotate that credential in Supabase, update the encrypted Cloudflare secret and local untracked environment file, then redeploy. Removing the file entry does not invalidate the old credential or remove it from Git history.

Local `pnpm dev` skips Turnstile for `localhost`, `127.0.0.1` and `::1`. Authentication and administrator authorization remain required. Production builds always require Turnstile, even when accessed through a loopback hostname. A Supabase project-level CAPTCHA setting is independent of the local widget.

For local validation, run `pnpm test`, `pnpm typecheck` and `pnpm run build`. The build includes minification and a Worker size check. A build or Wrangler dry run does not publish the site. After deployment, verify the homepage, search, institution profiles, downloads and production admin login on the deployed hostname.

Use `pnpm run preview` (or `pnpm exec opennextjs-cloudflare preview` for an existing build), rather than calling `wrangler dev` directly: OpenNext first populates the static cache assets. Deploy with `pnpm run deploy:only` after building for the same reason. The writable R2 cache now persists ISR updates, with a Durable Object queue for background revalidation. Local secrets for OpenNext preview belong in untracked `.dev.vars`; production secrets belong in Cloudflare.

Validation completed: 125 unit tests passed (the admin-route test file passed on an isolated rerun after a resource-related timeout), TypeScript and targeted lint passed, Next generated 263 static pages, OpenNext built the Worker, and Wrangler's final dry run passed. Local workerd returned 200 for the homepage, institutions directory, Supreme Court profile with people, open-data page, county JSON export (47 records), public configuration and admin login. It returned 404 for `/admin`, a login redirect for the configured admin path, and 401 for an unauthenticated admin API request. Production-mode public configuration kept Turnstile enabled; development localhost disabled it. No production deployment or authenticated administrator login was performed.

The public build preflight was also checked with an empty CI environment and the committed Wrangler public defaults. OpenNext preview populated the static assets cache and returned 200 for the homepage, open-data page, institutions directory and public configuration without the earlier cache-write warnings.

The final build-preflight scripts passed syntax checks, unit tests and TypeScript. A repeat ESLint run stalled while loading the Next.js rule configuration on Windows and was stopped; the earlier application-file lint check passed.

## Linux CI follow-up: manifest patch and cache

The later failure occurred because pnpm did not expose esbuild as a top-level dependency in CI. Minification was skipped, while the original patch expected only minified text. The minifier now resolves Wrangler's declared esbuild dependency and uses its cross-platform JavaScript API; it no longer attempts to execute an esbuild native binary with Node. Failures stop the build instead of silently skipping a required step. The structural manifest patch runs before minification and is tested against both output formats.

Cleanup now retains `.next/cache` and `.next/dev` while removing stale production artifacts. In Cloudflare, enable **Settings > Build > Build cache**. Cloudflare automatically persists `.next/cache` for Next.js: [build-cache documentation](https://developers.cloudflare.com/workers/ci-cd/builds/build-caching/). A first build or cleared/expired cache can still show the no-cache warning; this is not a deployment failure.

Keep `middleware.ts`: the installed OpenNext adapter and its current compatibility documentation do not support Node middleware (`proxy.ts`). The deprecation warning is non-fatal and should not be hidden or fixed by changing to an unsupported runtime. A generic ?Compiled with warnings? line also does not fail the build; inspect the accompanying details if new warnings appear.


## Resource-limit mitigation (September 2026)

Public pages no longer match Edge authentication middleware. The matcher includes
`/admin`, `/api/admin`, and the configured `NEXT_PUBLIC_ADMIN_BASE_PATH`; common
asset extensions are excluded. Build/dev scripts generate literal matchers so
Next can statically analyze them. Middleware verifies JWT claims with the public
Supabase key; protected layouts and API handlers retain authoritative user and
administrator checks. No service-role helper is imported into middleware.

The homepage, government, topics and elections hubs retain daily ISR; open-data
retains hourly ISR. Services needs request-time category redirects, but its two
Sanity requests now have hourly data caching. R2 incremental cache and cache
interception avoid loading the Next server for cached public pages. The existing
bucket `kenyagov-info-next-cache` is bound as `NEXT_INC_CACHE_R2_BUCKET`; the
`NEXT_CACHE_DO_QUEUE` Durable Object handles background regeneration. CPU is set
to 30000 ms, and both existing production custom domains are preserved.

Deployment verification:

1. Stop this project's local Next dev server before building on Windows: its
   binding proxy may lock `.open-next`. Run `pnpm run build`.
2. Run `pnpm run deploy:only` to populate R2 and deploy the queue migration and
   Worker together. Use dashboard secrets for private credentials.
3. Request `/`, `/government`, `/topics`, and `/open-data` twice. Confirm 200
   responses, cache hits where exposed, and R2 cache objects. Check Worker logs
   for missing bindings, ISR errors and Error 1102.
4. Confirm logged-out admin pages redirect, admin APIs reject access, password
   recovery remains reachable, and a real administrator can sign in.
5. Compare production CPU time, 1102 rate and Supabase subrequests over comparable
   traffic windows. A successful build alone cannot establish production impact.

Keep `middleware.ts`: OpenNext does not support the replacement Node proxy yet.
Its Next.js deprecation notice is expected and is not a build failure.

Local validation completed: all 135 regression tests passed; the complete
`pnpm run build` passed, including manifest patch, minification and Wrangler dry
run (19.944 MiB uncompressed). OpenNext populated 268 local R2 cache entries.
The homepage, government, topics and open-data returned HTTP 200 with cache HIT
headers. The internal admin path returned 404, the configured admin path
redirected to login, and an unauthenticated admin API request returned 401.
Production deployment and comparative 1102/CPU metrics remain to be verified.
