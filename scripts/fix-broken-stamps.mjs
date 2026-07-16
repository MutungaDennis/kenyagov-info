import fs from "fs";
import path from "path";

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "admin" || ent.name === "api" || ent.name === "_archive") continue;
      walk(p, out);
    } else if (ent.name.endsWith(".tsx") || ent.name.endsWith(".ts")) {
      out.push(p);
    }
  }
  return out;
}

const files = walk("app");
let fixed = 0;

for (const file of files) {
  let c = fs.readFileSync(file, "utf8");
  if (!c.includes("export const revalidate") && !c.includes("force-static")) continue;

  // Detect revalidate stuck inside an import { ... }
  if (!/import\s*\{[\s\S]*?export const revalidate/.test(c)) continue;

  // Extract cache exports that were wrongly injected
  const cacheLines = [];
  c = c.replace(
    /\nexport const revalidate = \d+;\n(?:export const dynamic = ["']force-static["'];\n)?/g,
    (m) => {
      cacheLines.push(m.trim());
      return "\n";
    },
  );

  if (!cacheLines.length) continue;

  // Place after last import line (including multi-line import blocks)
  const lines = c.split("\n");
  let lastImportEnd = -1;
  let inImport = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^import\b/.test(line)) {
      inImport = true;
      lastImportEnd = i;
      if (/;/.test(line) || /from\s+["'][^"']+["']\s*;?\s*$/.test(line)) {
        // single-line import may still continue if no from yet
        if (/from\s+["']/.test(line) || /^import\s+["']/.test(line)) {
          inImport = !/;/.test(line) ? true : false;
          if (/;/.test(line)) lastImportEnd = i;
        }
      }
    } else if (inImport) {
      lastImportEnd = i;
      if (/from\s+["'][^"']+["']\s*;?\s*$/.test(line) || /;/.test(line)) {
        inImport = false;
      }
    }
  }

  if (lastImportEnd < 0) continue;

  const block = "\n" + [...new Set(cacheLines)].join("\n") + "\n";
  lines.splice(lastImportEnd + 1, 0, block);
  fs.writeFileSync(file, lines.join("\n").replace(/\n{3,}/g, "\n\n"));
  fixed++;
  console.log("fixed", file);
}

console.log("total fixed", fixed);
