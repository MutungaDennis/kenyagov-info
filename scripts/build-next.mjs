import fs from "node:fs";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import ts from "typescript";
import { syncMiddlewareMatcher } from "./sync-middleware-matcher.mjs";
import { publicBuildDefaults } from "./build-public-env.mjs";

const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve("next/package.json"));
nextRequire("@next/env").loadEnvConfig(process.cwd(), false);
const parsed = ts.parseConfigFileTextToJson("wrangler.jsonc", fs.readFileSync("wrangler.jsonc", "utf8"));
if (parsed.error) throw new Error("Cannot parse wrangler.jsonc for public build defaults.");
Object.assign(process.env, publicBuildDefaults(process.env, parsed.config.vars || {}));
syncMiddlewareMatcher(process.env);
console.log("Public build configuration validated. Runtime secrets are not copied from Wrangler.");
if (!process.argv.includes("--check")) {
  const result = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), "build", "--webpack"], { stdio: "inherit", env: process.env });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}
