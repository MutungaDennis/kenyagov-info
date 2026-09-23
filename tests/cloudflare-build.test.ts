import { describe, expect, it } from "vitest";
import { patchManifestSource } from "../scripts/worker-manifest-patch.mjs";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const pages = 'getPagesManifest() { return (0, loader.loadManifest)("pages"); }';
describe("Cloudflare build portability", () => {
  for (const [name, method] of [
    ["unminified Linux", `getMiddlewareManifest() {
      if (this.minimalMode) { return null; }
      else { const manifest = require(this.middlewareManifestPath); return manifest; }
    }`],
    ["minified", 'getMiddlewareManifest(){return this.minimalMode?null:require(this.middlewareManifestPath)}'],
    ["esbuild require shim", 'getMiddlewareManifest(){return this.minimalMode?null:__require(this.middlewareManifestPath)}'],
    ["already fixed upstream", 'getMiddlewareManifest(){return this.minimalMode?null:(0,loader.loadManifest)(this.middlewareManifestPath)}'],
  ]) {
    it(`preserves middleware behavior for ${name} output`, () => {
      const input = `class Server { ${pages} ${method} }`;
      const output = patchManifestSource(input);
      const manifest = { middleware: { "/": { name: "admin-session" } } };
      const Server = new Function("loader", `${output}; return Server;`)({ loadManifest: () => manifest });
      const instance = new Server();
      instance.middlewareManifestPath = "/.next/server/middleware-manifest.json";
      expect(instance.getMiddlewareManifest()).toBe(manifest);
      instance.minimalMode = true;
      expect(instance.getMiddlewareManifest()).toBeNull();
      expect(patchManifestSource(output)).toBe(output);
    });
  }
  it("uses the loader in the same class, ignoring unrelated readers", () => {
    const output = patchManifestSource(`class Other { getPagesManifest(){return other.loadManifest("other")} } class Server { ${pages} getMiddlewareManifest(){return require(this.middlewareManifestPath)} }`);
    expect(output).toContain("(0, loader.loadManifest)(this.middlewareManifestPath)");
  });
  it("rejects unexpected changes rather than disabling protection", () => {
    expect(() => patchManifestSource(`class Server { ${pages} getMiddlewareManifest(){return customLoader(this.middlewareManifestPath)} }`)).toThrow("Unexpected middleware loader");
    expect(() => patchManifestSource(`class Server { ${pages} getMiddlewareManifest(){return null} }`)).toThrow("Unexpected middleware manifest access");
  });
  it("preserves the restored cache and development output while clearing stale builds", () => {
    const root = mkdtempSync(path.join(tmpdir(), "citizenguide-build-test-"));
    try {
      for (const directory of [".next/cache", ".next/dev", ".next/server", ".open-next", ".wrangler-dry"]) {
        mkdirSync(path.join(root, directory), { recursive: true });
        writeFileSync(path.join(root, directory, "sentinel"), directory);
      }
      writeFileSync(path.join(root, ".next/BUILD_ID"), "old");
      execFileSync(process.execPath, [path.resolve("scripts/cf-clean.mjs")], { cwd: root });
      expect(readFileSync(path.join(root, ".next/cache/sentinel"), "utf8")).toBe(".next/cache");
      expect(existsSync(path.join(root, ".next/dev/sentinel"))).toBe(true);
      for (const stale of [".next/server", ".next/BUILD_ID", ".open-next", ".wrangler-dry"]) expect(existsSync(path.join(root, stale))).toBe(false);
    } finally {
      if (!root.startsWith(path.join(tmpdir(), "citizenguide-build-test-"))) throw new Error("Unexpected temporary directory");
      rmSync(root, { recursive: true, force: true });
    }
  });
});
