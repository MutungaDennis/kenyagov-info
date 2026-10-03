/** Read-only by default. --apply copies missing records; never deletes Sanity data.
 * Existing Supabase IDs are skipped so reruns cannot overwrite admin edits.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { createClient as createSanityClient } from "@sanity/client";
import { createClient } from "@supabase/supabase-js";
async function main() {
const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve("next/package.json"));
nextRequire("@next/env").loadEnvConfig(process.cwd(), false);
const apply = process.argv.includes("--apply");
const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "egkekbgr",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2025-02-19", useCdn: false, perspective: "raw",
  token: process.env.SANITY_API_TOKEN,
});
const types = ["governmentService", "governmentCategory", "governmentMinistry", "serviceLinkPhrase"];
const documents = [];
let after = "";
for (;;) {
  const batch = await sanity.fetch(`*[_type in $types && _id > $after] | order(_id asc) [0...100]{
    ...,
    downloadableResources[]{..., "fileUrl": fileUpload.asset->url, "fileSize": fileUpload.asset->size}
  }`, { types, after });
  documents.push(...batch);
  if (batch.length < 100) break;
  after = batch.at(-1)._id;
}
const report = { mode: apply ? "copy missing records" : "read-only inventory", authenticatedSanityRead: !!process.env.SANITY_API_TOKEN,
  counts: Object.fromEntries(types.map(t => [t, documents.filter(d => d._type === t).length])),
  drafts: documents.filter(d => d._id.startsWith("drafts.")).length,
  fileUrls: documents.flatMap(d => d.downloadableResources || []).filter(r => r.fileUrl).length,
};
console.log(JSON.stringify(report, null, 2));
if (!apply) process.exit(0);
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for transfer");
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const directory = path.join(process.cwd(), ".content-migration", new Date().toISOString().replace(/[:.]/g, "-"));
await fs.mkdir(directory, { recursive: true });
await fs.writeFile(path.join(directory, "sanity-backup.json"), JSON.stringify(documents, null, 2));
const results = { copied: 0, skipped: 0, links: 0, draftRevisions: 0 };
const tableFor = { governmentService: "government_services", governmentCategory: "service_categories", governmentMinistry: "service_providers", serviceLinkPhrase: "service_link_phrases" };
const failures = [];
const createdCategories = new Set();
const publishedIds = new Set(documents.filter(d => !d._id.startsWith("drafts.")).map(d => d._id));
for (const type of ["governmentMinistry", "governmentService", "governmentCategory", "serviceLinkPhrase"]) {
  for (const source of documents.filter(d => d._type === type)) {
    const doc = structuredClone(source);
    const draft = doc._id.startsWith("drafts.");
    // Unpublished edits of an existing published record stay in the backup, not
    // a second public record with the same URL. Standalone drafts are imported.
    if (draft && publishedIds.has(doc._id.slice(7))) { results.draftRevisions++; continue; }
    const table = tableFor[type];
    const { data: existing, error: lookupError } = await db.from(table).select("id").eq("id", doc._id).maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) { results.skipped++; continue; }
    if (type === "governmentService") doc.status = draft || doc.status === "draft" ? "draft" : "published";
    let error;
      ({ error } = await db.from(table).insert({ id: doc._id, content: doc,
        created_at: doc._createdAt || new Date().toISOString(), updated_at: doc._updatedAt || new Date().toISOString(),
        ...(type === "governmentService" ? { is_published: doc.status === "published" } : {}),
      }));
    if (error) { failures.push({ id: doc._id, type, error: error.message }); continue; }
    results.copied++;
    if (type === "governmentCategory") createdCategories.add(doc._id);
  }
}
for (const category of documents.filter(d => d._type === "governmentCategory" && createdCategories.has(d._id))) {
  for (const topic of category.subTopics || []) {
    for (const [position, ref] of (topic.services || []).entries()) {
      const { error } = await db.from("service_category_links").upsert({ category_id: category._id, service_id: ref._ref, heading: topic.heading || "General", position });
      if (error) failures.push({ id: category._id, reference: ref._ref, error: error.message }); else results.links++;
    }
  }
}
await fs.writeFile(path.join(directory, "report.json"), JSON.stringify({ ...report, results, failures }, null, 2));
console.log(JSON.stringify({ ...results, failed: failures.length, backup: path.relative(process.cwd(), directory), note: "Sanity originals retained. Download URLs retained; file bytes have not been copied." }, null, 2));
if (failures.length) { console.error(JSON.stringify(failures, null, 2)); process.exitCode = 1; }

}
main().catch(error => { console.error("Transfer failed:", error instanceof Error ? error.message : "Unknown error"); process.exitCode = 1; });
