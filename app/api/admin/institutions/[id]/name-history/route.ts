import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { data, error } = await auth.supabase
    .from("institution_name_history")
    .select("*")
    .eq("institution_id", id)
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

export async function PUT(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  let body: { names?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = Array.isArray(body.names) ? body.names : [];
  const rows: Record<string, unknown>[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const n = item as Record<string, unknown>;
    const name = String(n.name || "").trim();
    if (!name) continue;
    rows.push({
      institution_id: id,
      name,
      name_kind: String(n.name_kind || "official").trim() || "official",
      start_date: n.start_date ? String(n.start_date) : null,
      end_date: n.end_date ? String(n.end_date) : null,
      notes: n.notes ? String(n.notes).trim() || null : null,
      updated_at: new Date().toISOString(),
    });
  }

  const { error: delError } = await auth.supabase
    .from("institution_name_history")
    .delete()
    .eq("institution_id", id);

  if (delError) {
    const msg = String(delError.message || "");
    if (/does not exist|schema cache/i.test(msg)) {
      return NextResponse.json(
        {
          error: "Name history table is missing.",
          hint: "Run lib/supabase/migrations/enhance_institutions_lineage_segments.sql in Supabase.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (rows.length > 0) {
    const { error: insError } = await auth.supabase
      .from("institution_name_history")
      .insert(rows);
    if (insError) {
      return NextResponse.json({ error: insError.message }, { status: 500 });
    }
  }

  const { data } = await auth.supabase
    .from("institution_name_history")
    .select("*")
    .eq("institution_id", id)
    .order("start_date", { ascending: true });

  return NextResponse.json({ data: data || [] });
}
