import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mca_terms")
      .select(`
        *,
        political_parties (name, abbreviation),
        wards (name),
        counties (name)
      `)
      .eq("mca_id", id)
      .order("term_number", { ascending: true });

    if (error) {
      console.error("Terms fetch error:", error);
      return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("Terms API crash:", err);
    return NextResponse.json({ error: "Server error", data: [] }, { status: 500 });
  }
}

/** Normalize date fields for Postgres DATE columns */
function normalizeTermDates(body: Record<string, unknown>) {
  for (const key of ["start_date", "end_date"] as const) {
    if (!(key in body)) continue;
    const v = body[key];
    if (v == null || v === "" || v === "null") {
      body[key] = null;
      continue;
    }
    body[key] = String(v).slice(0, 10);
  }
  return body;
}

/** Mirror current term dates onto mcas for /government/people display */
async function syncMcaSnapshotFromTerms(
  supabase: Awaited<ReturnType<typeof createClient>>,
  mcaId: string,
) {
  const { data: terms } = await supabase
    .from("mca_terms")
    .select("start_date, end_date, term_number, party_id, ward_id, assembly_role")
    .eq("mca_id", mcaId)
    .order("term_number", { ascending: false });

  if (!terms?.length) return;

  // Prefer open term (no end_date), else highest term_number
  const current =
    terms.find((t) => !t.end_date) || terms[0];

  await supabase
    .from("mcas")
    .update({
      term_start_date: current.start_date
        ? String(current.start_date).slice(0, 10)
        : null,
      term_end_date: current.end_date
        ? String(current.end_date).slice(0, 10)
        : null,
      assembly_role: current.assembly_role || undefined,
      ward_id: current.ward_id || undefined,
      party_id: current.party_id || undefined,
    })
    .eq("id", mcaId);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const body = normalizeTermDates(await request.json());

    if (!body.start_date) {
      return NextResponse.json(
        { error: "Start date is required for each term" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("mca_terms")
      .insert([{ mca_id: id, ...body }])
      .select()
      .single();

    if (error) {
      console.error("Term insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    try {
      await syncMcaSnapshotFromTerms(supabase, id);
    } catch (syncErr) {
      console.error("Term snapshot sync failed:", syncErr);
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Term POST crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const body = await request.json();
    const { termId, ...rest } = body;
    const updateData = normalizeTermDates(rest);

    if (!termId) {
      return NextResponse.json({ error: "termId is required" }, { status: 400 });
    }

    if ("start_date" in updateData && !updateData.start_date) {
      return NextResponse.json(
        { error: "Start date is required" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("mca_terms")
      .update(updateData)
      .eq("id", termId)
      .eq("mca_id", id)
      .select()
      .single();

    if (error) {
      console.error("Term update error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    try {
      await syncMcaSnapshotFromTerms(supabase, id);
    } catch (syncErr) {
      console.error("Term snapshot sync failed:", syncErr);
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("Term PUT crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const termId = searchParams.get("termId");

  if (!termId) {
    return NextResponse.json({ error: "termId is required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("mca_terms")
      .delete()
      .eq("id", termId)
      .eq("mca_id", id);

    if (error) {
      console.error("Term delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      await syncMcaSnapshotFromTerms(supabase, id);
    } catch (syncErr) {
      console.error("Term snapshot sync failed:", syncErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Term DELETE crash:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}