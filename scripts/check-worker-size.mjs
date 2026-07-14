/**
 * Fail the build if the Cloudflare Worker would exceed the Free plan
 * gzip limit (3 MiB). Paid plan allows 10 MiB.
 *
 * Measures the main OpenNext entry modules (what Wrangler uploads),
 * not the entire traced node_modules tree.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import zlib from "zlib";

const FREE_LIMIT = 3 * 1024 * 1024;
const WARN_LIMIT = 2.7 * 1024 * 1024;
const root = process.cwd();
const openNext = path.join(root, ".open-next");

if (!fs.existsSync(openNext)) {
  console.error("check-worker-size: .open-next missing");
  process.exit(1);
}

const candidates = [
  "worker.js",
  "middleware/handler.mjs",
  "middleware/open-next.config.mjs",
  "server-functions/default/handler.mjs",
  "server-functions/default/index.mjs",
  "server-functions/default/open-next.config.mjs",
  "server-functions/default/cache.cjs",
  "server-functions/default/composable-cache.cjs",
  "server-functions/default/patchedAsyncStorage.cjs",
  "cloudflare/images.js",
  "cloudflare/init.js",
  "cloudflare/skew-protection.js",
  "cloudflare/next-env.mjs",
  ".build/durable-objects/queue.js",
  ".build/durable-objects/sharded-tag-cache.js",
  ".build/durable-objects/bucket-cache-purge.js",
  ".build/open-next.config.mjs",
  ".build/open-next.config.edge.mjs",
  ".build/cache.cjs",
  ".build/composable-cache.cjs",
];

const buffers = [];
let raw = 0;
console.log("Primary Worker modules:");
for (const rel of candidates) {
  const p = path.join(openNext, rel);
  if (!fs.existsSync(p)) continue;
  const buf = fs.readFileSync(p);
  raw += buf.length;
  buffers.push(buf);
  const g = zlib.gzipSync(buf, { level: 9 });
  console.log(
    `  ${rel}: ${(buf.length / 1024).toFixed(1)} KiB raw / ${(g.length / 1024).toFixed(1)} KiB gzip`,
  );
}

const combined = Buffer.concat(buffers);
const gzApprox = zlib.gzipSync(combined, { level: 9 });

console.log(`\nApprox combined: ${(raw / 1024).toFixed(1)} KiB raw / ${(gzApprox.length / 1024).toFixed(1)} KiB gzip`);

// Prefer Wrangler's own measurement when available
let wranglerGzip = null;
const dry = spawnSync(
  "pnpm",
  ["exec", "wrangler", "deploy", "--dry-run", "--outdir=.wrangler-dry"],
  { encoding: "utf8", cwd: root, shell: true, maxBuffer: 20 * 1024 * 1024 },
);
const out = `${dry.stdout || ""}\n${dry.stderr || ""}`;
const m = out.match(/Total Upload:\s*([\d.]+)\s*KiB\s*\/\s*gzip:\s*([\d.]+)\s*KiB/i);
if (m) {
  wranglerGzip = parseFloat(m[2]) * 1024;
  console.log(`\nWrangler dry-run: ${m[1]} KiB raw / ${m[2]} KiB gzip`);
} else {
  console.warn("\nWARN: could not parse wrangler dry-run; using approx gzip");
  if (dry.status !== 0) {
    console.warn(out.slice(-1500));
  }
}

const measured = wranglerGzip ?? gzApprox.length;
const gzMiB = (measured / 1024 / 1024).toFixed(3);

console.log(`\nMeasured gzip: ${gzMiB} MiB (limit free=${(FREE_LIMIT / 1024 / 1024).toFixed(0)} MiB)`);

if (measured > FREE_LIMIT) {
  console.error(
    `\nERROR: Worker gzip ${gzMiB} MiB exceeds Cloudflare Free plan (3 MiB).\n` +
      `Enable Workers Paid (10 MiB) or reduce the bundle further. See CLOUDFLARE.md.\n`,
  );
  process.exit(1);
}

if (measured > WARN_LIMIT) {
  console.warn(`\nWARN: close to free limit (${gzMiB} MiB). Consider Workers Paid for headroom.\n`);
} else {
  console.log("\nOK: under free plan Worker size limit.");
}
