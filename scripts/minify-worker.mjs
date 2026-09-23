/** Use Wrangler's declared esbuild dependency through its cross-platform API. */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const wranglerRequire = createRequire(require.resolve("wrangler/package.json"));
const { transformSync } = wranglerRequire("esbuild");
for (const relative of ["server-functions/default/handler.mjs", "middleware/handler.mjs"]) {
  const file = path.join(".open-next", relative);
  const source = fs.readFileSync(file, "utf8");
  const result = transformSync(source, { minify: true, treeShaking: true, legalComments: "none", target: "es2022", sourcefile: file });
  if (Buffer.byteLength(result.code) <= Buffer.byteLength(source)) fs.writeFileSync(file, result.code);
  console.log(`minify-worker: ${relative} ${Math.round(Buffer.byteLength(source) / 1024)} -> ${Math.round(fs.statSync(file).size / 1024)} KiB`);
}
