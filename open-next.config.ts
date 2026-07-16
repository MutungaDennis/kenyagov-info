import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/**
 * OpenNext Cloudflare adapter config.
 *
 * ISR: R2 bucket `kenyagov-info-next-cache` (binding NEXT_INC_CACHE_R2_BUCKET)
 * stores regenerated HTML so Free-tier Workers do not re-render on every visit.
 *
 * @see https://opennext.js.org/cloudflare/caching
 */
export default {
  ...defineCloudflareConfig({
    incrementalCache: r2IncrementalCache,
  }),
  buildCommand: "pnpm run build:next",
};
