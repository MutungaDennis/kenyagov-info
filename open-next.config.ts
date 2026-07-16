import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/**
 * OpenNext Cloudflare adapter config.
 *
 * package.json "build" is `opennextjs-cloudflare build` (what Cloudflare CI runs).
 * OpenNext would recurse if it called `pnpm run build` again, so we point it at
 * `build:next` for the actual Next.js compile step.
 *
 * ISR: R2 incremental cache stores regenerated HTML so Free-tier Workers
 * do not re-render on every visit after revalidate.
 *
 * @see https://opennext.js.org/cloudflare/caching
 */
export default {
  ...defineCloudflareConfig({
    incrementalCache: r2IncrementalCache,
  }),
  buildCommand: "pnpm run build:next",
};
