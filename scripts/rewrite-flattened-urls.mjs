import fs from "fs";
import path from "path";

const roots = ["app", "lib", "components", "docs", "data"];
const skip = new Set(["node_modules", ".next", ".open-next", "dist"]);

/** Longest-first so nested paths rewrite correctly */
const replacements = [
  [
    "/society-and-culture/national-events/devolution-sensitisation-week",
    "/national-events/devolution-sensitisation-week",
  ],
  [
    "/society-and-culture/national-events/kenya-national-drama-and-film-festival",
    "/national-events/kenya-national-drama-and-film-festival",
  ],
  [
    "/society-and-culture/national-events/devolution-conference",
    "/national-events/devolution-conference",
  ],
  [
    "/society-and-culture/national-events/kenya-music-festival",
    "/national-events/kenya-music-festival",
  ],
  [
    "/society-and-culture/national-events/ask-shows",
    "/national-events/ask-shows",
  ],
  ["/society-and-culture/national-events", "/national-events"],
  ["/society-and-culture/national-symbols", "/national-symbols"],
  ["/society-and-culture/religion-and-faith", "/religion-and-faith"],
  // BASE constants / comments without leading path in code strings already covered
  [
    "const BASE = \"/national-events\"",
    "const BASE = \"/national-events\"",
  ], // no-op safety
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (/\.(tsx?|jsx?|md|mjs|jsonc?)$/.test(ent.name)) out.push(p);
  }
  return out;
}

let filesChanged = 0;
const files = roots.flatMap((r) => walk(r));
// also next.config and CLOUDFLARE
for (const extra of ["next.config.ts", "CLOUDFLARE.md", "README.md"]) {
  if (fs.existsSync(extra)) files.push(extra);
}

for (const file of files) {
  let c = fs.readFileSync(file, "utf8");
  const original = c;
  for (const [from, to] of replacements) {
    if (from === to) continue;
    c = c.split(from).join(to);
  }
  // Fix breadcrumbs that still say Society and culture with wrong href chains —
  // leave hub links to /society-and-culture as-is
  if (c !== original) {
    fs.writeFileSync(file, c);
    filesChanged++;
    console.log("updated", file);
  }
}

console.log("files changed:", filesChanged);
