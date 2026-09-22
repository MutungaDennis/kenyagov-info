/**
 * Validate the Worker using Wrangler's actual dry-run bundle measurement.
 * Since 2026-09-04 both plans allow 64 MiB uncompressed (gzip is informational).
 * https://developers.cloudflare.com/changelog/post/2026-09-04-increased-worker-size-limit/
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const LIMIT = 64 * 1024 * 1024;
const root = process.cwd();
if (!fs.existsSync(path.join(root, ".open-next", "worker.js"))) {
  console.error("check-worker-size: build .open-next/worker.js first");
  process.exit(1);
}
const dry = spawnSync(process.execPath, [
  path.join(root, "node_modules", "wrangler", "bin", "wrangler.js"),
  "deploy", "--dry-run", "--outdir=.wrangler-dry",
], { encoding: "utf8", cwd: root, maxBuffer: 20 * 1024 * 1024 });
const output = `${dry.stdout || ""}\n${dry.stderr || ""}`;
if (dry.status !== 0) {
  console.error("Wrangler could not package the Worker. A size estimate cannot validate deployment.");
  console.error(dry.error?.message || output.slice(-3000));
  process.exit(1);
}
const match = output.match(/Total Upload:\s*([\d.]+)\s*KiB\s*\/\s*gzip:\s*([\d.]+)\s*KiB/i);
if (!match) {
  console.error("Could not read Wrangler's bundle size. Check its output format before deploying.");
  process.exit(1);
}
const bytes = Number(match[1]) * 1024;
console.log(`Wrangler dry-run: ${match[1]} KiB uncompressed / ${match[2]} KiB gzip`);
console.log(`Worker size: ${(bytes / 1024 / 1024).toFixed(3)} MiB; limit: 64 MiB uncompressed`);
if (bytes > LIMIT) {
  console.error("Worker exceeds Cloudflare's 64 MiB uncompressed bundle limit.");
  process.exit(1);
}
console.log("OK: Wrangler packaged the Worker within the current size limit. No deployment was performed.");
