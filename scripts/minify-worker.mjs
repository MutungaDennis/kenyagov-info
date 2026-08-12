/**
 * Post-OpenNext: re-minify the main server handler for a few more KiB gzip.
 * Safe no-op if esbuild is unavailable.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const root = process.cwd();
const handler = path.join(
  root,
  ".open-next",
  "server-functions",
  "default",
  "handler.mjs",
);

if (!fs.existsSync(handler)) {
  console.log("minify-worker: no handler.mjs, skip");
  process.exit(0);
}

const before = fs.statSync(handler).size;
let esbuildBin = null;
try {
  const require = createRequire(import.meta.url);
  esbuildBin = require.resolve("esbuild/bin/esbuild");
} catch {
  // try pnpm path
  const candidates = [
    path.join(root, "node_modules", "esbuild", "bin", "esbuild"),
    path.join(root, "node_modules", "esbuild", "bin", "esbuild.js"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      esbuildBin = c;
      break;
    }
  }
}

if (!esbuildBin) {
  console.log("minify-worker: esbuild not found, skip");
  process.exit(0);
}

const tmp = handler + ".min.mjs";
const r = spawnSync(
  process.execPath,
  [
    esbuildBin,
    handler,
    "--minify",
    "--legal-comments=none",
    "--log-level=error",
    `--outfile=${tmp}`,
  ],
  { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 },
);

if (r.status !== 0) {
  console.warn("minify-worker: esbuild failed, keeping original");
  if (r.stderr) console.warn(r.stderr.slice(0, 500));
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  process.exit(0);
}

const after = fs.statSync(tmp).size;
if (after > 0 && after < before) {
  fs.renameSync(tmp, handler);
  console.log(
    `minify-worker: handler.mjs ${Math.round(before / 1024)} → ${Math.round(after / 1024)} KiB raw`,
  );
} else {
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  console.log("minify-worker: no improvement, keep original");
}
