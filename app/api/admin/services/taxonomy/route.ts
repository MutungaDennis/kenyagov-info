import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdminApi, slugify } from "@/lib/admin-api";
import { deleteContent, getContent, saveContent } from "@/lib/content/store";
import { refreshServices } from "@/lib/content/revalidate";

type Category = { _id: string; title: string; slug?: { current?: string } | string; description?: string; priority?: number; subTopics?: Array<{ heading?: string; description?: string; parentHeading?: string; slug?: string; priority?: number; services?: Array<{ _ref: string }>; serviceIds?: string[] }> };

function normaliseTopics(category: Category) {
  return (category.subTopics || []).map((topic) => ({
    heading: topic.heading || "General",
    slug: topic.slug || slugify(topic.heading || "General"),
    description: topic.description || "",
    parentHeading: topic.parentHeading || "",
    priority: Math.max(1, Number(topic.priority) || 100),
    services: topic.services || (topic.serviceIds || []).map((_ref) => ({ _ref })),
  }));
}

async function moveLinks(supabase: SupabaseClient, fromCategoryId: string, heading?: string, toCategoryId?: string, targetHeading = "General") {
  let query = supabase.from("service_category_links").select("service_id,position").eq("category_id", fromCategoryId);
  if (heading) query = query.eq("heading", heading);
  const { data, error } = await query;
  if (error) throw error;
  if (!data?.length) return;

  // When the destination is the same category, update in place. Upserting and
  // then deleting by category would delete the rows we just moved.
  if (toCategoryId === fromCategoryId) {
    const updated = await supabase
      .from("service_category_links")
      .update({ heading: targetHeading })
      .eq("category_id", fromCategoryId)
      .in("service_id", data.map((row: { service_id: string }) => row.service_id));
    if (updated.error) throw updated.error;
    return;
  }

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
    const kind = String(body.kind || "");
    const slug = slugify(String(body.slug || name));
    if (!slug || !["ministry", "category", "subcategory", "subsubcategory"].includes(kind)) {
      return NextResponse.json({ error: "Valid name and kind are required" }, { status: 400 });
    }

    if (kind === "subcategory" || kind === "subsubcategory") {
      const categoryId = String(body.categoryId || "");
      const category = await getContent<Category>("service_categories", "id", categoryId, auth.supabase);
      if (!category) return NextResponse.json({ error: "Choose a valid main category first" }, { status: 400 });
      const parentHeading = kind === "subsubcategory" ? String(body.parentHeading || "").trim() : "";
      if (kind === "subsubcategory" && !parentHeading) return NextResponse.json({ error: "Choose a parent subcategory first" }, { status: 400 });
      const topics = normaliseTopics(category);
      if (topics.some((topic) => topic.heading.toLowerCase() === name.toLowerCase() && topic.parentHeading === parentHeading)) {
        return NextResponse.json({ error: "A browse path with this name already exists here" }, { status: 409 });
      }
      const topicSlug = slugify(String(body.slug || name));
      if (topics.some((topic) => slugify(String(topic.slug || topic.heading)) === topicSlug)) return NextResponse.json({ error: "This URL is already in use in this category" }, { status: 409 });
      const topic = { heading: name, slug: topicSlug, description: String(body.description || ""), parentHeading, priority: Math.max(1, Number(body.priority) || 100), services: [] };
      await saveContent("service_categories", { ...category, subTopics: [...topics, topic] }, auth.supabase);
      refreshServices();
      return NextResponse.json({ success: true, created: true, data: topic });
    }

    const table = kind === "ministry" ? "service_providers" : "service_categories";
    const existing = await getContent(table, "slug", slug, auth.supabase);
    if (existing) return NextResponse.json({ error: "This URL is already in use. Choose a different name or URL." }, { status: 409 });
    const document = { _id: crypto.randomUUID(), slug: { current: slug }, ...(kind === "ministry" ? { name } : { title: name, description: String(body.description || ""), priority: Math.max(1, Number(body.priority) || 100), subTopics: [] }) };
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
      const nextSlug = slugify(String(body.slug || title));
      if (!title || !nextSlug) return NextResponse.json({ error: "Category name and URL are required" }, { status: 400 });
      const duplicate = await getContent<Category>("service_categories", "slug", nextSlug, auth.supabase);
      if (duplicate && duplicate._id !== category._id) return NextResponse.json({ error: "This URL is already in use" }, { status: 409 });
      await saveContent("service_categories", { ...category, title, description: String(body.description || ""), priority: Math.max(1, Number(body.priority) || 100), slug: { current: nextSlug }, subTopics: normaliseTopics(category) }, auth.supabase);
    } else {
      const heading = String(body.heading || "").trim();
      const title = String(body.name || "").trim();
      const topics = normaliseTopics(category);
      const index = topics.findIndex((topic) => topic.heading === heading);
      if (index < 0 || !title) return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
      const topicSlug = slugify(String(body.slug || title));
      if (topics.some((topic, topicIndex) => topicIndex !== index && slugify(String(topic.slug || topic.heading)) === topicSlug)) return NextResponse.json({ error: "This URL is already in use in this category" }, { status: 409 });
      topics[index] = { ...topics[index], heading: title, slug: topicSlug, description: String(body.description || ""), parentHeading: String(body.parentHeading || ""), priority: Math.max(1, Number(body.priority) || 100) };
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
      const allTopics = normaliseTopics(category);
      const headingsToMove = new Set<string>([heading]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const topic of allTopics) {
          if (topic.parentHeading && headingsToMove.has(topic.parentHeading) && !headingsToMove.has(topic.heading)) {
            headingsToMove.add(topic.heading);
            changed = true;
          }
        }
      }
      const topics = allTopics.filter((topic) => !headingsToMove.has(topic.heading));
      if (!topics.some((topic) => topic.heading.toLowerCase() === "general")) {
        topics.push({ heading: "General", slug: "general", description: "Services not yet assigned to a more specific browse path", parentHeading: "", priority: 999, services: [] });
      }
      for (const headingToMove of headingsToMove) {
        await moveLinks(auth.supabase, categoryId, headingToMove, categoryId);
      }
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
