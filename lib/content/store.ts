import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";

export type ContentTable = "government_services" | "service_categories" | "service_providers" | "service_link_phrases";
export type ContentDocument = { _id: string; _createdAt?: string; _updatedAt?: string; [key: string]: unknown };

const SERVICE_EXTENSION_FIELDS = [
  "critical_blockers",
  "warnings",
  "edge_cases",
  "international_use_guidance",
  "gazette_reference",
] as const;

function rowToDocument(row: Record<string, unknown>): ContentDocument {
  const extensionFields: Record<string, unknown> = {};
  for (const field of SERVICE_EXTENSION_FIELDS) {
    const value = row[field];
    if (value !== null && value !== undefined) extensionFields[field] = value;
  }

  const content =
    row.content && typeof row.content === "object" && !Array.isArray(row.content)
      ? (row.content as Record<string, unknown>)
      : {};

  return {
    ...content,
    ...extensionFields,
    _id: String(row.id ?? ""),
    _createdAt: typeof row.created_at === "string" ? row.created_at : undefined,
    _updatedAt: typeof row.updated_at === "string" ? row.updated_at : undefined,
  };
}

export async function listContent<T = ContentDocument>(table: ContentTable, db: SupabaseClient = createPublicClient()): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db.from(table).select("*").order("id").range(offset, offset + 499);
    if (error) throw error;
    for (const row of data || []) rows.push(rowToDocument(row) as T);
    if (!data || data.length < 500) return rows;
  }
}
export async function getContent<T = ContentDocument>(table: ContentTable, column: "id" | "slug", value: string, db: SupabaseClient = createPublicClient()): Promise<T | null> {
  const { data, error } = await db.from(table).select("*").eq(column, value).maybeSingle();
  if (error) throw error;
  return data ? rowToDocument(data) as T : null;
}
export async function saveContent(table: ContentTable, document: Record<string, unknown>, db: SupabaseClient) {
  const id = String(document._id || crypto.randomUUID());
  const { error } = await db.from(table).upsert({ id, content: document, updated_at: new Date().toISOString(), ...(table === "government_services" ? { is_published: document.status === "published" } : {}) });
  if (error) throw error;
  return id;
}
export async function deleteContent(table: ContentTable, id: string, db: SupabaseClient) {
  const { error } = await db.from(table).delete().eq("id", id);
  if (error) throw error;
}
