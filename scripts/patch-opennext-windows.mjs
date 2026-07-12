/**
 * OpenNext on Windows: symlink creation often fails with EPERM unless
 * Developer Mode is enabled. Patch copyTracedFiles.js to fall back to copy.
 * Safe no-op on Linux/macOS (Cloudflare CI).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

if (process.platform !== "win32") {
  process.exit(0);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pnpmDir = path.join(root, "node_modules", ".pnpm");

function findTargets(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name.startsWith("@opennextjs+aws@") || ent.name === "node_modules") {
        findTargets(p, out);
      }
    } else if (ent.name === "copyTracedFiles.js" && p.includes("@opennextjs+aws")) {
      out.push(p);
    }
  }
  return out;
}

const needle = `if (e.code !== "EEXIST") {
                    throw e;
                }`;

const replacement = `if (e.code === "EEXIST") {
                    // already present
                }
                else if (e.code === "EPERM" || e.code === "EACCES") {
                    // Windows without Developer Mode / admin: fall back to real file copy
                    try {
                        const resolved = path.isAbsolute(symlink)
                            ? symlink
                            : path.resolve(path.dirname(from), symlink);
                        copyFileAndMakeOwnerWritable(resolved, to);
                    }
                    catch (copyErr) {
                        logger.debug("Error copying symlinked file:", copyErr);
                        erroredFiles.push(to);
                    }
                }
                else {
                    throw e;
                }`;

const targets = findTargets(pnpmDir);
let patched = 0;
for (const file of targets) {
  let src = fs.readFileSync(file, "utf8");
  if (src.includes("Windows without Developer Mode")) {
    console.log("already patched:", file);
    continue;
  }
  if (!src.includes(needle)) {
    console.log("skip (pattern not found):", file);
    continue;
  }
  src = src.replace(needle, replacement);
  fs.writeFileSync(file, src);
  patched++;
  console.log("patched:", file);
}
console.log(`done, patched ${patched} file(s)`);
