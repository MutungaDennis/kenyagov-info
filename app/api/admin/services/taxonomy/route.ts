import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdminApi, slugify } from "@/lib/admin-api";
import { deleteContent, getContent, saveContent } from "@/lib/content/store";
import { refreshServices } from "@/lib/content/revalidate";

type Category = { _id: string; title: string; slug?: { current?: string } | string; description?: string; subTopics?: Array<{ heading?: string; description?: string; parentHeading?: string; services?: Array<{ _ref: string }>; serviceIds?: string[] }> };

function normaliseTopics(category: Category) {
  return (category.subTopics || []).map((topic) => ({
    heading: topic.heading || "General",
    description: topic.description || "",
    parentHeading: topic.parentHeading || "",
    services: topic.services || (topic.serviceIds || []).map((_ref) => ({ _ref })),
  }));
}

async function moveLinks(supabase: SupabaseClient,  fromCategoryId: string, heading?: string, toCategoryId?: string, targetHeading = "General") {
  let query = supabase.from("service_category_links").select("service_id,position").eq("category_id", fromCategoryId);
  if (heading) query = query.eq("heading", heading);
  const { data, error } = await query;
  if (error) throw error;
  if (!data?.length) return;
  if (toCategoryId) {
    const rows = data.map((row: { service_id: string; position: number }) => ({ category_id: toCategoryId, service_id: row.service_id, heading: targetHeading, position: row.position || 0 }));
    const inserted = await supabase.from("service_category_links").upsert(rows, { onConflict: "category_id,service_id" });
    if (inserted.error) throw inserted.error;
  }
  let remove = supabase.from("service_category_links").delete().eq("category_id", fromCategoryId);
  if (heading) remove = remove.eq("heading", heading);
  const removed = await remove;
  if (removed.error) throw removed.error;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const name = String(body.name || body.title || "").trim();
    const slug = slugify(name);
    if (!slug || !["ministry", "category"].includes(body.kind)) return NextResponse.json({ error: "Valid name and kind (ministry or category) are required" }, { status: 400 });
    const table = body.kind === "ministry" ? "service_providers" : "service_categories";
    const existing = await getContent(table, "slug", slug, auth.supabase);
    if (existing) return NextResponse.json({ success: true, created: false, data: { ...existing, slug } });
    const document = { _id: crypto.randomUUID(), slug: { current: slug }, ...(body.kind === "ministry" ? { name } : { title: name, description: String(body.description || ""), subTopics: [] }) };
    await saveContent(table, document, auth.supabase);
    refreshServices();
    return NextResponse.json({ success: true, created: true, data: { ...document, slug } });
  } catch (error) {
    console.error("Service taxonomy save failed", error);
    return NextResponse.json({ error: "Could not save taxonomy" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const categoryId = String(body.categoryId || body.id || "");
    const category = await getContent<Category>("service_categories", "id", categoryId, auth.supabase);
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
    if (body.kind === "category") {
      const title = String(body.name || "").trim();
      if (!title) return NextResponse.json({ error: "Category name is required" }, { status: 400 });
      await saveContent("service_categories", { ...category, title, description: String(body.description || ""), slug: { current: slugify(title) }, subTopics: normaliseTopics(category) }, auth.supabase);
    } else {
      const heading = String(body.heading || body.id || "").trim();
      const title = String(body.name || "").trim();
      const topics = normaliseTopics(category);
      const index = topics.findIndex((topic) => topic.heading === heading);
      if (index < 0 || !title) return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
      topics[index] = { ...topics[index], heading: title, description: String(body.description || ""), parentHeading: String(body.parentHeading || "") };
      const links = await auth.supabase.from("service_category_links").update({ heading: title }).eq("category_id", categoryId).eq("heading", heading);
      if (links.error) throw links.error;
      await saveContent("service_categories", { ...category, subTopics: topics }, auth.supabase);
    }
    refreshServices();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Service taxonomy update failed", error);
    return NextResponse.json({ error: "Could not update taxonomy" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const categoryId = String(body.categoryId || "");
    if (body.kind === "subcategory") {
      const category = await getContent<Category>("service_categories", "id", categoryId, auth.supabase);
      if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });
      const heading = String(body.heading || "").trim();
      const topics = normaliseTopics(category).filter((topic) => topic.heading !== heading && topic.parentHeading !== heading);
      await moveLinks(auth.supabase, categoryId, heading, categoryId);
      await saveContent("service_categories", { ...category, subTopics: topics }, auth.supabase);
    } else {
      const general = await getContent<Category>("service_categories", "slug", "general", auth.supabase) || { _id: crypto.randomUUID(), title: "General", slug: { current: "general" }, description: "Services not yet assigned to a category", subTopics: [] };
      await saveContent("service_categories", { ...general, subTopics: normaliseTopics(general) }, auth.supabase);
      await moveLinks(auth.supabase, categoryId, undefined, general._id);
      await deleteContent("service_categories", categoryId, auth.supabase);
    }
    refreshServices();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Service taxonomy delete failed", error);
    return NextResponse.json({ error: "Could not remove taxonomy" }, { status: 500 });
  }
}
