/**
 * Work around OpenNext #1380: Next's middleware manifest bypasses the adapter's
 * inlined manifest loader. Keep the actual loader and manifest semantics rather
 * than disabling middleware. Run after minification and before Wrangler.
 * https://github.com/opennextjs/opennextjs-cloudflare/issues/1380
 */
import fs from "node:fs";

const file = ".open-next/server-functions/default/handler.mjs";
let source = fs.readFileSync(file, "utf8");
const method = /getMiddlewareManifest\(\)\{return this\.minimalMode\?null:require\(this\.middlewareManifestPath\)\}/g;
const matches = [...source.matchAll(method)];
if (matches.length !== 1) {
  if (source.includes("/* citizen-guide: middleware manifest loader */")) {
    console.log("Worker manifest loader already patched.");
    process.exit(0);
  }
  throw new Error("OpenNext middleware manifest output changed. Review this compatibility patch before deploying.");
}
const loader = source.match(/getPagesManifest\(\)\{return\(0,([\w$]+)\.loadManifest\)/)?.[1];
if (!loader) throw new Error("Cannot locate OpenNext's inlined manifest loader.");
source = source.replace(method, () => `getMiddlewareManifest(){/* citizen-guide: middleware manifest loader */return this.minimalMode?null:(0,${loader}.loadManifest)(this.middlewareManifestPath)}`);
fs.writeFileSync(file, source);
console.log("Worker middleware manifest now uses OpenNext's inlined loader.");
