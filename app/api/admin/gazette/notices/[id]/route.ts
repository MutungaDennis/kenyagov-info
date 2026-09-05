import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { REVIEW_STATUSES } from "@/lib/gazette/relationship-types";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { data, error } = await auth.supabase
    .from("gazette_notices")
    .select(`*, gazette_issues(id, year, volume, issue_number, date, official_source_url, is_special_issue)`)
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Notice not found" }, { status: 404 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const allowed = [
    "title","notice_type","act_referenced","content_html","source_page_start","source_page_end",
    "transcription_status","transcription_notes","relationship_review_status",
  ] as const;

  const patch: Record<string, unknown> = {};
  for (const key of allowed) if (key in body) patch[key] = body[key] === "" ? null : body[key];

  if (
    typeof patch.relationship_review_status === "string" &&
    !REVIEW_STATUSES.includes(patch.relationship_review_status as any)
  ) {
    return NextResponse.json({ error: "Invalid relationship_review_status" }, { status: 400 });
  }
  if (patch.relationship_review_status === "Reviewed") {
    patch.relationship_reviewed_at = new Date().toISOString();
  }

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("gazette_notices")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function DELETE(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { error } = await auth.supabase.from("gazette_notices").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
