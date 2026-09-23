const fs = require("fs");
const src = fs.readFileSync(".open-next/server-functions/default/handler.mjs", "utf8");
const i = src.indexOf("getMiddlewareManifest");
const j = src.indexOf("getPagesManifest");
console.log("--- getMiddlewareManifest context ---");
console.log(src.slice(Math.max(0, i - 80), i + 400));
console.log("\n--- getPagesManifest context ---");
console.log(src.slice(Math.max(0, j - 80), j + 400));
console.log("\n--- middlewareManifestPath occurrences ---");
let n = 0, pos = 0;
while ((pos = src.indexOf("middlewareManifestPath", pos)) !== -1) {
  console.log(src.slice(Math.max(0, pos - 60), pos + 80).replace(/\n/g, " "));
  pos += 1; n++;
}
console.log("count:", n);
