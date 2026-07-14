/**
 * Clean Next/OpenNext outputs before Cloudflare build.
 * Prevents stale fat bundles from prior builds affecting deploy size.
 */
import fs from "fs";
import path from "path";

const root = process.cwd();
for (const dir of [".next", ".open-next", ".wrangler", ".wrangler-dry"]) {
  const p = path.join(root, dir);
  if (fs.existsSync(p)) {
    fs.rmSync(p, { recursive: true, force: true });
    console.log("removed", dir);
  }
}
