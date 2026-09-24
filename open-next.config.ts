import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

export default {
  ...defineCloudflareConfig({
    incrementalCache: r2IncrementalCache,
    queue: doQueue,
    // Serve cached public pages before loading the Next.js server and route code.
    enableCacheInterception: true,
    routePreloadingBehavior: "none",
  }),
  buildCommand: "pnpm run build:next",
};
