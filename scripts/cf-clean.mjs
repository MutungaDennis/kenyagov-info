/**
 * Clean Next/OpenNext outputs before Cloudflare build.
 * Windows-safe: EBUSY/EPERM is common (Explorer, antivirus, wrangler, next dev).
 *
 * Critical dirs (.next, .open-next): must be cleared or renamed, else exit 1.
 * Optional dirs (.wrangler*): warn and continue — they do not block OpenNext build.
 */
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const root = process.cwd();

/** @type {{ name: string, required: boolean }[]} */
const dirs = [
  { name: ".open-next", required: true },
  { name: ".wrangler", required: false },
  { name: ".wrangler-dry", required: false },
];

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* spin */
  }
}

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function tryRm(p) {
  const target = path.resolve(p);
  if (!target.startsWith(root + path.sep) || fs.lstatSync(target, { throwIfNoEntry: false })?.isSymbolicLink()) {
    throw new Error(`Refusing to recursively remove an unsafe build path: ${target}`);
  }
  fs.rmSync(p, {
    recursive: true,
    force: true,
    maxRetries: 8,
    retryDelay: 250,
  });
}

function windowsPurge(p) {
  if (process.platform !== "win32") return false;
  const empty = path.join(root, `.cf-clean-empty-${Date.now()}`);
  try {
    fs.mkdirSync(empty, { recursive: true });
    const purge = spawnSync("robocopy", [empty, p, "/MIR", "/R:0", "/W:0", "/NFL", "/NDL", "/NJH", "/NJS", "/nc", "/ns", "/np"], {
      stdio: "ignore",
      windowsHide: true,
      timeout: 30_000,
    });
    tryRm(empty);
    // Robocopy uses 0-7 for success and 8+ for failures. Never wait on
    // its default million retries when a generated file remains locked.
    if (purge.error || purge.status === null || purge.status >= 8) return false;
    tryRm(p);
    return !exists(p);
  } catch {
    try {
      if (exists(empty)) tryRm(empty);
    } catch {
      /* ignore */
    }
    return false;
  }
}

/**
 * @param {string} label
 * @param {boolean} required
 */
function removeDir(label, required) {
  const p = path.join(root, label);
  if (!exists(p)) return;
  if (!path.resolve(p).startsWith(root + path.sep) || fs.lstatSync(p).isSymbolicLink()) {
    throw new Error(`Refusing to clean an unsafe build path: ${p}`);
  }

  for (let i = 1; i <= 4; i++) {
    try {
      tryRm(p);
      if (!exists(p)) {
        console.log("removed", label);
        return;
      }
    } catch (err) {
      console.warn(`rm ${label} attempt ${i}: ${err.code || err.message}`);
      sleep(300 * i);
    }
  }

  if (windowsPurge(p)) {
    console.log("removed", label, "(robocopy purge)");
    return;
  }

  const stamp = Date.now();
  const trash = path.join(root, `${label}.trash-${stamp}`);
  try {
    fs.renameSync(p, trash);
    console.warn(
      `renamed locked ${label} → ${path.basename(trash)} (build can continue)`,
    );
    for (let i = 1; i <= 3; i++) {
      sleep(400 * i);
      try {
        tryRm(trash);
        if (!exists(trash)) {
          console.log("removed trash", path.basename(trash));
          return;
        }
      } catch {
        /* still locked */
      }
    }
    if (windowsPurge(trash)) {
      console.log("removed trash", path.basename(trash), "(robocopy)");
      return;
    }
    console.warn(
      `left ${path.basename(trash)} — delete later when unlocked`,
    );
  } catch (err) {
    if (!required) {
      console.warn(
        `skip locked ${label} (${err.code || err.message}) — not required for build`,
      );
      return;
    }
    console.error(
      `\nFATAL: cannot remove or rename ${label} (${err.code || err.message}).\n` +
        `Close next dev / wrangler / File Explorer, then:\n` +
        `  Stop the development server or preview process for this project.\n` +
        `  Remove-Item -LiteralPath "${p}" -Recurse -Force\n` +
        `  pnpm run deploy\n`,
    );
    process.exit(1);
  }
}

for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
  if (
    ent.isDirectory() &&
    (/^\.open-next\.trash-/.test(ent.name) ||
      /^\.next\.trash-/.test(ent.name) ||
      /^\.wrangler\.trash-/.test(ent.name) ||
      /^\.cf-clean-empty-/.test(ent.name))
  ) {
    try {
      tryRm(path.join(root, ent.name));
      console.log("removed old trash", ent.name);
    } catch {
      /* leave */
    }
  }
}

// Retain the framework cache restored by Cloudflare. Also leave the isolated
// Next 16 development output alone when building alongside a dev server.
const nextDir = path.join(root, ".next");
if (exists(nextDir)) {
  if (fs.lstatSync(nextDir).isSymbolicLink()) throw new Error(".next must not be a symlink");
  for (const entry of fs.readdirSync(nextDir)) {
    if (entry !== "cache" && entry !== "dev") removeDir(path.join(".next", entry), true);
  }
}
for (const dir of dirs) {
  removeDir(dir.name, dir.required);
}
