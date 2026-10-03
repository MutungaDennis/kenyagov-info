import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";
import { getContent, saveContent } from "@/lib/content/store";
import { refreshServices } from "@/lib/content/revalidate";

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
