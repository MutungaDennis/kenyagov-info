/** OpenNext #1380: use its inlined loader, preserving middleware semantics. */
import fs from "node:fs";
import { patchManifestSource } from "./worker-manifest-patch.mjs";
const file = ".open-next/server-functions/default/handler.mjs";
const source = fs.readFileSync(file, "utf8");
const patched = patchManifestSource(source);
if (patched !== source) fs.writeFileSync(file, patched);
console.log(patched === source ? "Worker manifest loader already compatible." : "Worker middleware manifest now uses OpenNext's inlined loader.");
