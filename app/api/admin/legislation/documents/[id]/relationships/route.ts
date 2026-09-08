import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { data: doc, error: docError } = await auth.supabase
    .from("legislation_documents")
    .select("legal_document_id")
    .eq("id", id)
    .maybeSingle();

  if (docError) return NextResponse.json({ error: docError.message }, { status: 500 });
  if (!doc) return NextResponse.json({ error: "Legislation not found." }, { status: 404 });

  const { data: rows, error } = await auth.supabase
    .from("legal_document_relationships")
    .select("*")
    .or(`source_document_id.eq.${doc.legal_document_id},target_document_id.eq.${doc.legal_document_id}`)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = Array.from(
    new Set((rows || []).flatMap((row: any) => [row.source_document_id, row.target_document_id])),
  );

  const { data: docs } = ids.length
    ? await auth.supabase.from("legal_documents").select("id,title,citation,slug,document_type").in("id", ids)
    : { data: [] as any[] };

  const map = new Map((docs || []).map((row: any) => [row.id, row]));

  return NextResponse.json({
    data: (rows || []).map((row: any) => {
      const outgoing = row.source_document_id === doc.legal_document_id;
      const targetId = outgoing ? row.target_document_id : row.source_document_id;
      return { ...row, direction: outgoing ? "outgoing" : "incoming", target: map.get(targetId) || null };
    }),
  });
}

export async function POST(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const body = await request.json();

  if (!body.source_document_id || !body.target_document_id || !body.relationship_type) {
    return NextResponse.json({ error: "Source, target and relationship are required." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("legal_document_relationships")
    .upsert(
      {
        source_document_id: body.source_document_id,
        target_document_id: body.target_document_id,
        relationship_type: body.relationship_type,
        description: body.description || null,
        verification_status: "Verified",
      },
      { onConflict: "source_document_id,target_document_id,relationship_type" },
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await auth.supabase.from("legislation_admin_activity").insert({
    legislation_document_id: id,
    action: "document_relationship_saved",
    summary: body.relationship_type,
  });

  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const relationshipId = request.nextUrl.searchParams.get("id");
  if (!relationshipId) return NextResponse.json({ error: "Relationship id is required." }, { status: 400 });

  const { error } = await auth.supabase
    .from("legal_document_relationships")
    .delete()
    .eq("id", relationshipId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
