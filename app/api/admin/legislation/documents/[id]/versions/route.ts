import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { data, error } = await auth.supabase
    .from("legislation_versions")
    .select("*")
    .eq("legislation_document_id", id)
    .order("version_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

export async function POST(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const body = await request.json();

  if (!body.version_date) {
    return NextResponse.json({ error: "Version date is required." }, { status: 400 });
  }

  if (body.is_current) {
    await auth.supabase
      .from("legislation_versions")
      .update({ is_current: false })
      .eq("legislation_document_id", id);
  }

  const { data, error } = await auth.supabase
    .from("legislation_versions")
    .insert({
      legislation_document_id: id,
      version_date: body.version_date,
      version_label: body.version_label || null,
      is_current: Boolean(body.is_current),
      version_type: body.version_type || "consolidated",
      source_url: body.source_url || null,
      pdf_url: body.pdf_url || null,
      pdf_file_name: body.pdf_file_name || null,
      pdf_page_count: body.pdf_page_count ? Number(body.pdf_page_count) : null,
      pdf_accessibility: body.pdf_accessibility || "Unknown",
      html_available: body.html_available !== false,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await auth.supabase.from("legislation_admin_activity").insert({
    legislation_document_id: id,
    action: "version_added",
    summary: `Version ${body.version_date} added.`,
  });

  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const versionId = request.nextUrl.searchParams.get("id");

  if (!versionId) {
    return NextResponse.json({ error: "Version id is required." }, { status: 400 });
  }

  const { error } = await auth.supabase
    .from("legislation_versions")
    .delete()
    .eq("id", versionId)
    .eq("legislation_document_id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
