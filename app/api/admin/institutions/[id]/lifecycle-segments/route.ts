import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { data, error } = await auth.supabase
    .from("institution_lifecycle_segments")
    .select("*")
    .eq("institution_id", id)
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: true, nullsFirst: true });

  if (error) {
    const msg = String(error.message || "");
    if (/does not exist|schema cache|Could not find/i.test(msg)) {
      return NextResponse.json({
        data: [],
        hint: "Run lib/supabase/migrations/enhance_institutions_lineage_segments.sql in Supabase.",
      });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

/**
 * Replace all lifecycle segments for this institution.
 * Body: { segments: Array<...> }
 */
export async function PUT(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  let body: { segments?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = Array.isArray(body.segments) ? body.segments : [];
  const rows: Record<string, unknown>[] = [];

  raw.forEach((item, index) => {
    if (!item || typeof item !== "object") return;
    const s = item as Record<string, unknown>;
    const status = String(s.segment_status || "Active").trim() || "Active";
    rows.push({
      institution_id: id,
      label: s.label ? String(s.label).trim() || null : null,
      start_date: s.start_date ? String(s.start_date) : null,
      end_date: s.end_date ? String(s.end_date) : null,
      segment_status: status,
      legal_basis_type: s.legal_basis_type
        ? String(s.legal_basis_type).trim() || null
        : null,
      legal_basis_name: s.legal_basis_name
        ? String(s.legal_basis_name).trim() || null
        : null,
      legal_basis_reference: s.legal_basis_reference
        ? String(s.legal_basis_reference).trim() || null
        : null,
      notes: s.notes ? String(s.notes).trim() || null : null,
      sort_order:
        typeof s.sort_order === "number" ? s.sort_order : index,
      updated_at: new Date().toISOString(),
    });
  });

  const { error: delError } = await auth.supabase
    .from("institution_lifecycle_segments")
    .delete()
    .eq("institution_id", id);

  if (delError) {
    const msg = String(delError.message || "");
    if (/does not exist|schema cache/i.test(msg)) {
      return NextResponse.json(
        {
          error: "Lifecycle segment table is missing.",
          hint: "Run lib/supabase/migrations/enhance_institutions_lineage_segments.sql in Supabase.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (rows.length > 0) {
    const { error: insError } = await auth.supabase
      .from("institution_lifecycle_segments")
      .insert(rows);
    if (insError) {
      return NextResponse.json({ error: insError.message }, { status: 500 });
    }
  }

  const { data } = await auth.supabase
    .from("institution_lifecycle_segments")
    .select("*")
    .eq("institution_id", id)
    .order("sort_order", { ascending: true })
    .order("start_date", { ascending: true });

  return NextResponse.json({ data: data || [] });
}
