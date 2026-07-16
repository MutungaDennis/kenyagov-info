/**
 * Clean Next/OpenNext outputs before Cloudflare build.
 * Windows-safe: EBUSY/EPERM on .open-next is common (Explorer, antivirus,
 * leftover wrangler/preview). Strategy:
 *  1) try fs.rmSync with retries
 *  2) rename out of the way (unlocks most locks)
 *  3) best-effort delete of the renamed folder
 *  4) never fail the build solely because a stale rename leftover remains
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const root = process.cwd();
const dirs = [".next", ".open-next", ".wrangler", ".wrangler-dry"];

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
  fs.rmSync(p, {
    recursive: true,
    force: true,
    maxRetries: 8,
    retryDelay: 250,
  });
}

/** Windows: empty a tree via robocopy /MIR then rmdir (often works when rm fails). */
function windowsPurge(p) {
  if (process.platform !== "win32") return false;
  const empty = path.join(root, `.cf-clean-empty-${Date.now()}`);
  try {
    fs.mkdirSync(empty, { recursive: true });
    execSync(`robocopy "${empty}" "${p}" /MIR /NFL /NDL /NJH /NJS /nc /ns /np`, {
      stdio: "ignore",
      windowsHide: true,
    });
    // robocopy exit codes 0–7 are success-ish
    tryRm(empty);
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

function removeDir(label) {
  const p = path.join(root, label);
  if (!exists(p)) return;

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

  // Last resort: rename so OpenNext can write a fresh .open-next
  const stamp = Date.now();
  const trash = path.join(root, `${label}.trash-${stamp}`);
  try {
    fs.renameSync(p, trash);
    console.warn(
      `renamed locked ${label} → ${path.basename(trash)} (build can continue)`,
    );
    // Best-effort background-ish cleanup of trash
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
      `left ${path.basename(trash)} — delete it later when nothing is locking it`,
    );
  } catch (err) {
    console.error(
      `\nFATAL: cannot remove or rename ${label} (${err.code || err.message}).\n` +
        `Close:\n` +
        `  - any "pnpm run preview" / wrangler / next dev terminals\n` +
        `  - File Explorer windows inside ${label}\n` +
        `Then run in PowerShell:\n` +
        `  Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force\n` +
        `  Remove-Item -LiteralPath "${p}" -Recurse -Force\n` +
        `  pnpm run deploy\n`,
    );
    process.exit(1);
  }
}

// Drop old trash folders from previous failed cleans
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
      /* leave for next run */
    }
  }
}

for (const dir of dirs) {
  removeDir(dir);
}
