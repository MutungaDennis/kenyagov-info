import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * OpenNext Cloudflare adapter config.
 *
 * Incremental cache uses Workers Static Assets (build-time prerender data).
 * This does NOT require R2, so deploy succeeds even when R2 is not enabled
 * on the Cloudflare account.
 *
 * Trade-off: no runtime write-back for ISR revalidation into object storage.
 * Time-based revalidate still works by regenerating via the Worker when needed.
 *
 * To upgrade later (optional R2 ISR store):
 * 1. Enable R2 in the Cloudflare dashboard
 * 2. `pnpm exec wrangler r2 bucket create kenyagov-info-next-cache`
 * 3. Restore r2_buckets in wrangler.jsonc and r2IncrementalCache here
 *
 * @see https://opennext.js.org/cloudflare/caching
 */
export default {
  ...defineCloudflareConfig({
    incrementalCache: staticAssetsIncrementalCache,
    enableCacheInterception: true,
  }),
  buildCommand: "pnpm run build:next",
};
