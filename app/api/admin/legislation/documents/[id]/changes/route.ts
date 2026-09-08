import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { data, error } = await auth.supabase
    .from("legislation_changes")
    .select("*")
    .eq("legislation_document_id", id)
    .order("change_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

export async function POST(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const body = await request.json();

  if (!body.change_key || !body.change_type || !body.change_date) {
    return NextResponse.json(
      { error: "Change key, type and date are required." },
      { status: 400 },
    );
  }

  const { data, error } = await auth.supabase
    .from("legislation_changes")
    .insert({
      legislation_document_id: id,
      change_key: body.change_key,
      change_type: body.change_type,
      change_date: body.change_date,
      source_title: body.source_title || null,
      source_citation: body.source_citation || null,
      source_url: body.source_url || null,
      summary: body.summary || null,
      affects_whole_document: false,
      applied_to_current_text: true,
      verification_status: "Verified",
      review_status: "Imported",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await auth.supabase.from("legislation_admin_activity").insert({
    legislation_document_id: id,
    action: "change_added",
    summary: `${body.change_type} dated ${body.change_date} added.`,
  });

  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const changeId = request.nextUrl.searchParams.get("id");

  if (!changeId) {
    return NextResponse.json({ error: "Change id is required." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("legislation_changes")
    .delete()
    .eq("id", changeId)
    .eq("legislation_document_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
