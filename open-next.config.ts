import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * OpenNext Cloudflare adapter config.
 *
 * package.json "build" is `opennextjs-cloudflare build` (what Cloudflare CI runs).
 * OpenNext would recurse if it called `pnpm run build` again, so we point it at
 * `build:next` for the actual Next.js compile step.
 *
 * Caching: start without R2; enable r2IncrementalCache when you create a bucket.
 *
 * @see https://opennext.js.org/cloudflare
 */
export default {
  ...defineCloudflareConfig({
    // Uncomment after creating R2 bucket + binding NEXT_INC_CACHE_R2_BUCKET in wrangler.jsonc:
    // incrementalCache: r2IncrementalCache,
  }),
  buildCommand: "pnpm run build:next",
};
