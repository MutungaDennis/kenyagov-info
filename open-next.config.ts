import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * OpenNext Cloudflare adapter — no R2 required.
 *
 * Uses Workers Static Assets for the incremental cache so deploy works
 * without enabling R2 on the Cloudflare account.
 *
 * After changing this file you MUST rebuild before deploy:
 *   pnpm run deploy
 *
 * Do not run only `npx wrangler deploy` after a config change — that reuses
 * the last `.open-next` output (which may still reference R2).
 *
 * @see https://opennext.js.org/cloudflare/caching
 */
export default {
  ...defineCloudflareConfig({
    incrementalCache: staticAssetsIncrementalCache,
    // Read-only static assets cache cannot write ISR revalidations.
    // Cache interception + force-static caused widespread 500s on public
    // routes (about, elections, constitution, etc.) while client pages worked.
    enableCacheInterception: false,
  }),
  // Avoid recursive `pnpm run build` → opennext → build → …
  buildCommand: "pnpm run build:next",
};
