/**
 * Remove `export const dynamic = "force-static"` from app pages.
 * Safe with Windows paths that include [slug] brackets.
 */
import fs from "fs";
import path from "path";

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "_archive" || ent.name === "node_modules") continue;
      walk(p, out);
    } else if (
      ent.name === "page.tsx" ||
      ent.name === "page.ts" ||
      ent.name === "layout.tsx"
    ) {
      out.push(p);
    }
  }
  return out;
}

const re = /^export const dynamic = ["']force-static["'];\r?\n/gm;
const files = walk("app");
let changed = 0;

for (const f of files) {
  const c = fs.readFileSync(f, "utf8");
  if (!c.includes("force-static")) continue;
  const n = c.replace(re, "");
  if (n !== c) {
    fs.writeFileSync(f, n);
    changed += 1;
    console.log("stripped:", f.replace(/\\/g, "/"));
  }
}

console.log("DONE changed=", changed);
