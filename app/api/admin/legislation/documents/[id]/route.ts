import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

type Ctx = { params: Promise<{ id: string }> };

const LEGAL_KEYS = ["title","short_title","citation","slug","year","source_url"];
const LEGISLATION_KEYS = [
  "category","legislation_kind","status","act_number","cap_number","bill_reference",
  "long_title","legislature_name","originating_chamber","assent_date","publication_date",
  "commencement_date","last_amended_date","current_version_date","repeal_date",
  "review_status","relationship_review_status","admin_notes"
];

const clean = (value: any) => (value === "" ? null : value);

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { data, error } = await auth.supabase
    .from("legislation_documents")
    .select(`*,legal:legal_documents!legislation_documents_legal_document_id_fkey!inner(*)`)
    .eq("id", id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Legislation not found." }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const body = await request.json();

  const { data: existing, error: existingError } = await auth.supabase
    .from("legislation_documents")
    .select("id,legal_document_id")
    .eq("id", id)
    .maybeSingle();

  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
  if (!existing) return NextResponse.json({ error: "Legislation not found." }, { status: 404 });

  const legalPatch: any = Object.fromEntries(
    LEGAL_KEYS.filter((key) => key in body).map((key) => [key, clean(body[key])]),
  );
  if (legalPatch.year != null) legalPatch.year = Number(legalPatch.year);

  const legislationPatch = Object.fromEntries(
    LEGISLATION_KEYS.filter((key) => key in body).map((key) => [key, clean(body[key])]),
  );

  if (Object.keys(legalPatch).length) {
    const { error } = await auth.supabase
      .from("legal_documents")
      .update({ ...legalPatch, updated_at: new Date().toISOString() })
      .eq("id", existing.legal_document_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (Object.keys(legislationPatch).length) {
    const { error } = await auth.supabase
      .from("legislation_documents")
      .update({ ...legislationPatch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await auth.supabase.from("legislation_admin_activity").insert({
    legislation_document_id: id,
    action: "metadata_updated",
    summary: "Legislation metadata updated.",
  });

  return NextResponse.json({ ok: true });
}
