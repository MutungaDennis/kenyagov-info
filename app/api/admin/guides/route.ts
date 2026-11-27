import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";

const TABLES = {
  glossary: "guide_glossary_terms",
  acronym: "guide_acronyms",
} as const;
type EntryKind = keyof typeof TABLES;
type EntryFilter = EntryKind | "all";

function entryKind(value: unknown): EntryKind | null {
  return value === "glossary" || value === "acronym" ? value : null;
}

function entryFilter(value: string | null): EntryFilter | null {
  if (!value || value === "all") return "all";
  return entryKind(value);
}

const responseHeaders = { "Cache-Control": "no-store" };

function revalidateEntries(kind: EntryKind) {
  const listPath = kind === "glossary" ? "/guides/glossary-of-terms" : "/guides/acronyms";
  revalidatePath(listPath);
  revalidatePath(`${listPath}/[slug]`, "page");
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const filter = entryFilter(request.nextUrl.searchParams.get("kind"));
  if (!filter) return NextResponse.json({ error: "A valid entry kind is required." }, { status: 400, headers: responseHeaders });

  const queries = filter === "all" ? (["glossary", "acronym"] as const) : [filter];
  const results = await Promise.all(queries.map(async (kind) => {
    if (kind === "glossary") {
      const { data, error } = await auth.supabase
        .from("guide_glossary_terms")
        .select("id,term,slug,short_meaning,details,sort_order,is_published")
        .order("sort_order")
        .order("term");
      return { kind, data, error };
    }
    const { data, error } = await auth.supabase
      .from("guide_acronyms")
      .select("id,acronym,full_form,slug,short_meaning,details,sort_order,is_published")
      .order("sort_order")
      .order("acronym");
    return { kind, data, error };
  }));
  const failed = results.find((result) => result.error);
  if (failed) {
    console.error("[admin/guides] Could not load entries", failed.error);
    return NextResponse.json({ error: "Could not load guide entries. Check that the guide schema migration has been applied." }, { status: 500, headers: responseHeaders });
  }
  const data = results.flatMap((result) => result.data?.map((entry) => ({ ...entry, kind: result.kind })) || []);
  return NextResponse.json({ data }, { headers: responseHeaders });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const kind = entryKind(body.kind);
    if (!kind) return NextResponse.json({ error: "A valid entry kind is required." }, { status: 400, headers: responseHeaders });

    const term = String(kind === "glossary" ? body.term || "" : body.acronym || "").trim();
    const fullForm = String(body.full_form || "").trim();
    const shortMeaning = String(body.short_meaning || "").trim();
    const details = String(body.details || "").trim();
    const slug = slugify(String(body.slug || term));

    if (!term || !slug || !shortMeaning || !details || (kind === "acronym" && !fullForm)) {
      return NextResponse.json({ error: "Complete the title, slug, short meaning, full details, and acronym full form where applicable." }, { status: 400, headers: responseHeaders });
    }
    if ((kind === "glossary" && term.length > 200) || (kind === "acronym" && (term.length > 30 || fullForm.length > 300))) {
      return NextResponse.json({ error: "The title or full form exceeds the allowed length." }, { status: 400, headers: responseHeaders });
    }
    if (slug.length > 200 || shortMeaning.length > 300 || details.length > 5000) {
      return NextResponse.json({ error: "The slug, short meaning, or details exceed the allowed length." }, { status: 400, headers: responseHeaders });
    }

    const legacyMeaning = details;
    const record = kind === "glossary"
      ? { term, slug, short_meaning: shortMeaning, details, meaning: legacyMeaning }
      : { acronym: term.toUpperCase(), full_form: fullForm, slug, short_meaning: shortMeaning, details, meaning: legacyMeaning };
    const sortOrder = Number(body.sort_order);
    const payload = {
      ...record,
      sort_order: Number.isInteger(sortOrder) ? sortOrder : 0,
      is_published: body.is_published !== false,
      updated_at: new Date().toISOString(),
    };

    const result = body.id
      ? await auth.supabase.from(TABLES[kind]).update(payload as never).eq("id", String(body.id)).select("id").maybeSingle()
      : await auth.supabase.from(TABLES[kind]).insert(payload as never).select("id").maybeSingle();
    if (result.error) {
      console.error("[admin/guides] Could not save entry", result.error);
      const duplicate = result.error.code === "23505";
      return NextResponse.json({ error: duplicate ? "That slug or entry already exists. Choose a different slug." : "Could not save the entry. Check that the guide schema migration has been applied." }, { status: duplicate ? 409 : 500, headers: responseHeaders });
    }
    if (!result.data) return NextResponse.json({ error: "The entry was not found." }, { status: 404, headers: responseHeaders });
    revalidateEntries(kind);
    return NextResponse.json({ success: true, id: result.data.id }, { headers: responseHeaders });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400, headers: responseHeaders });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const kind = entryKind(request.nextUrl.searchParams.get("kind"));
  const id = request.nextUrl.searchParams.get("id");
  if (!kind || !id) return NextResponse.json({ error: "Entry type and ID are required." }, { status: 400, headers: responseHeaders });
  const { data, error } = await auth.supabase.from(TABLES[kind]).delete().eq("id", id).select("id").maybeSingle();
  if (error) {
    console.error("[admin/guides] Could not delete entry", error);
    return NextResponse.json({ error: "Could not delete the entry." }, { status: 500, headers: responseHeaders });
  }
  if (!data) return NextResponse.json({ error: "The entry was not found." }, { status: 404, headers: responseHeaders });
  revalidateEntries(kind);
  return NextResponse.json({ success: true }, { headers: responseHeaders });
}
