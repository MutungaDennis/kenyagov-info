import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";

export type ContentTable = "government_services" | "service_categories" | "service_providers" | "service_link_phrases";
export type ContentDocument = { _id: string; _createdAt?: string; _updatedAt?: string; [key: string]: unknown };
export async function listContent<T = ContentDocument>(table: ContentTable, db: SupabaseClient = createPublicClient()): Promise<T[]> {
  const rows: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await db.from(table).select("id,content,created_at,updated_at").order("id").range(offset, offset + 499);
    if (error) throw error;
    for (const row of data || []) rows.push({ ...row.content, _id: row.id, _createdAt: row.created_at, _updatedAt: row.updated_at } as T);
    if (!data || data.length < 500) return rows;
  }
}
export async function getContent<T = ContentDocument>(table: ContentTable, column: "id" | "slug", value: string, db: SupabaseClient = createPublicClient()): Promise<T | null> {
  const { data, error } = await db.from(table).select("id,content,created_at,updated_at").eq(column, value).maybeSingle();
  if (error) throw error;
  return data ? { ...data.content, _id: data.id, _createdAt: data.created_at, _updatedAt: data.updated_at } as T : null;
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
