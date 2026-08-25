import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import { PRIMARY_SUCCESSOR_TYPES } from "@/lib/institutions/lineage";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const SELECT = `
  id, from_institution_id, to_institution_id, relationship_type,
  effective_date, end_date, legal_instrument, notes, is_primary,
  from_institution:institutions!institution_relationships_from_institution_id_fkey ( id, name, slug, short_name ),
  to_institution:institutions!institution_relationships_to_institution_id_fkey ( id, name, slug, short_name )
`;

/** Fallback without embed aliases if FK names differ */
const SELECT_SIMPLE = `
  id, from_institution_id, to_institution_id, relationship_type,
  effective_date, end_date, legal_instrument, notes, is_primary
`;

export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { data, error } = await auth.supabase
    .from("institution_relationships")
    .select(SELECT)
    .or(`from_institution_id.eq.${id},to_institution_id.eq.${id}`)
    .order("effective_date", { ascending: true, nullsFirst: false });

  if (error) {
    // Table missing or FK alias mismatch
    const simple = await auth.supabase
      .from("institution_relationships")
      .select(SELECT_SIMPLE)
      .or(`from_institution_id.eq.${id},to_institution_id.eq.${id}`)
      .order("effective_date", { ascending: true });

    if (simple.error) {
      const msg = String(simple.error.message || "");
      if (/does not exist|schema cache|Could not find/i.test(msg)) {
        return NextResponse.json({
          data: [],
          hint: "Run lib/supabase/migrations/enhance_institutions_lineage_segments.sql in Supabase.",
        });
      }
      return NextResponse.json({ error: msg }, { status: 500 });
    }
    return NextResponse.json({ data: simple.data || [] });
  }

  return NextResponse.json({ data: data || [] });
}

/**
 * Replace all relationships that touch this institution with the provided list.
 * Body: { relationships: Array<...> }
 */
export async function PUT(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  let body: { relationships?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = Array.isArray(body.relationships) ? body.relationships : [];
  const rows: Record<string, unknown>[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const fromId = String(r.from_institution_id || "").trim();
    const toId = String(r.to_institution_id || "").trim();
    const type = String(r.relationship_type || "").trim();
    if (!fromId || !toId || !type) continue;
    if (fromId === toId) {
      return NextResponse.json(
        { error: "A relationship cannot link an institution to itself." },
        { status: 400 },
      );
    }
    // Ensure this institution is on one side
    if (fromId !== id && toId !== id) continue;

    rows.push({
      from_institution_id: fromId,
      to_institution_id: toId,
      relationship_type: type,
      effective_date: r.effective_date ? String(r.effective_date) : null,
      end_date: r.end_date ? String(r.end_date) : null,
      legal_instrument: r.legal_instrument
        ? String(r.legal_instrument).trim() || null
        : null,
      notes: r.notes ? String(r.notes).trim() || null : null,
      is_primary: Boolean(r.is_primary),
      updated_at: new Date().toISOString(),
    });
  }

  // Delete existing links involving this institution, then insert
  const { error: delError } = await auth.supabase
    .from("institution_relationships")
    .delete()
    .or(`from_institution_id.eq.${id},to_institution_id.eq.${id}`);

  if (delError) {
    const msg = String(delError.message || "");
    if (/does not exist|schema cache/i.test(msg)) {
      return NextResponse.json(
        {
          error: "Lineage tables are missing.",
          hint: "Run lib/supabase/migrations/enhance_institutions_lineage_segments.sql in Supabase.",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  if (rows.length > 0) {
    const { error: insError } = await auth.supabase
      .from("institution_relationships")
      .insert(rows);
    if (insError) {
      return NextResponse.json(
        { error: insError.message },
        { status: 500 },
      );
    }
  }

  // Sync primary successor / predecessor columns on this institution
  const primaryOut = rows.find(
    (r) =>
      r.from_institution_id === id &&
      r.is_primary &&
      PRIMARY_SUCCESSOR_TYPES.has(String(r.relationship_type)),
  );
  const primaryIn = rows.find(
    (r) =>
      r.to_institution_id === id &&
      r.is_primary &&
      (r.relationship_type === "RENAME" ||
        r.relationship_type === "SPLIT_FROM" ||
        r.relationship_type === "SUCCESSION" ||
        r.relationship_type === "CONTINUATION" ||
        r.relationship_type === "BIRTH"),
  );

  const patch: Record<string, unknown> = {};
  if (primaryOut) {
    patch.successor_institution_id = primaryOut.to_institution_id;
  }
  if (primaryIn) {
    patch.predecessor_institution_id = primaryIn.from_institution_id;
  }
  if (Object.keys(patch).length) {
    await auth.supabase.from("institutions").update(patch).eq("id", id);
  }

  // Re-fetch
  const { data } = await auth.supabase
    .from("institution_relationships")
    .select(SELECT_SIMPLE)
    .or(`from_institution_id.eq.${id},to_institution_id.eq.${id}`)
    .order("effective_date", { ascending: true });

  return NextResponse.json({ data: data || [] });
}
