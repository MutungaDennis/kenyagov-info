/**
 * Post-OpenNext: re-minify server + middleware handlers for a few more KiB gzip.
 * Safe no-op if esbuild is unavailable.
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const root = process.cwd();
const openNext = path.join(root, ".open-next");

if (!fs.existsSync(openNext)) {
  console.log("minify-worker: .open-next missing, skip");
  process.exit(0);
}

let esbuildBin = null;
try {
  const require = createRequire(import.meta.url);
  esbuildBin = require.resolve("esbuild/bin/esbuild");
} catch {
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

const targets = [
  path.join(openNext, "server-functions", "default", "handler.mjs"),
  path.join(openNext, "middleware", "handler.mjs"),
].filter((f) => fs.existsSync(f));

if (targets.length === 0) {
  console.log("minify-worker: no handler files, skip");
  process.exit(0);
}

for (const file of targets) {
  const beforeSize = fs.statSync(file).size;
  const out = file + ".min.mjs";
  const r = spawnSync(
    process.execPath,
    [
      esbuildBin,
      file,
      "--minify",
      "--tree-shaking=true",
      "--legal-comments=none",
      "--target=es2022",
      "--log-level=error",
      `--outfile=${out}`,
    ],
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 },
  );

  if (r.status !== 0) {
    console.warn(`minify-worker: failed for ${path.basename(file)}`);
    if (r.stderr) console.warn(String(r.stderr).slice(0, 400));
    if (fs.existsSync(out)) fs.unlinkSync(out);
    continue;
  }

  const afterSize = fs.statSync(out).size;
  if (afterSize > 0 && afterSize <= beforeSize) {
    fs.renameSync(out, file);
    console.log(
      `minify-worker: ${path.relative(root, file)} ${Math.round(beforeSize / 1024)} → ${Math.round(afterSize / 1024)} KiB raw`,
    );
  } else {
    if (fs.existsSync(out)) fs.unlinkSync(out);
    console.log(`minify-worker: no gain for ${path.basename(file)}`);
  }
}
