import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

const TABLES = {
  glossary: "guide_glossary_terms",
  acronym: "guide_acronyms",
} as const;
type EntryKind = keyof typeof TABLES;

function entryKind(value: unknown): EntryKind | null {
  return value === "glossary" || value === "acronym" ? value : null;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const kind = entryKind(request.nextUrl.searchParams.get("kind"));
  if (!kind) return NextResponse.json({ error: "A valid entry kind is required." }, { status: 400 });
  const { data, error } = await auth.supabase.from(TABLES[kind]).select("*").order("sort_order").order(kind === "glossary" ? "term" : "acronym");
  if (error) return NextResponse.json({ error: "Could not load guide entries." }, { status: 500 });
  return NextResponse.json({ data: data || [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const kind = entryKind(body.kind);
    if (!kind) return NextResponse.json({ error: "A valid entry kind is required." }, { status: 400 });
    const term = String(kind === "glossary" ? body.term || "" : body.acronym || "").trim();
    const fullForm = String(body.full_form || "").trim();
    const category = String(body.category || "Other / unclassified").trim().slice(0, 100) || "Other / unclassified";
    const meaning = String(body.meaning || "").trim();
    const referenceLabel = String(body.reference_label || "").trim();
    const referenceUrl = String(body.reference_url || "").trim();
    if (!term || (kind === "glossary" && !meaning) || (kind === "acronym" && !fullForm)) {
      return NextResponse.json({ error: kind === "glossary" ? "Term and meaning are required." : "Acronym and full form are required." }, { status: 400 });
    }
    if (referenceUrl && !/^https?:\/\//i.test(referenceUrl)) {
      return NextResponse.json({ error: "Reference URL must begin with http:// or https://." }, { status: 400 });
    }
    const record = kind === "glossary"
      ? { term, slug: String(body.slug || term).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), meaning, reference_label: referenceLabel || null, reference_url: referenceUrl || null }
      : { acronym: term.toUpperCase(), full_form: fullForm, category, meaning: meaning || null, reference_label: referenceLabel || null, reference_url: referenceUrl || null };
    const sortOrder = Number(body.sort_order);
    const payload = { ...record, sort_order: Number.isInteger(sortOrder) ? sortOrder : 0, is_published: body.is_published !== false, updated_at: new Date().toISOString() };
    const query = body.id
      ? auth.supabase.from(TABLES[kind]).update(payload as never).eq("id", String(body.id))
      : auth.supabase.from(TABLES[kind]).insert(payload as never);
    const { error } = await query;
    if (error) {
      const message = error.code === "23505" ? "That entry already exists." : "Could not save the entry.";
      return NextResponse.json({ error: message }, { status: error.code === "23505" ? 409 : 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const kind = entryKind(request.nextUrl.searchParams.get("kind"));
  const id = request.nextUrl.searchParams.get("id");
  if (!kind || !id) return NextResponse.json({ error: "Entry type and ID are required." }, { status: 400 });
  const { error } = await auth.supabase.from(TABLES[kind]).delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Could not delete the entry." }, { status: 500 });
  return NextResponse.json({ success: true });
}
