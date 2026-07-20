import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";
import {
  insertRoleWithFallback,
  prepareRoleInsert,
} from "@/lib/leaders/resolve-refs";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** List roles for a leader */
export async function GET(_request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;

  const { data, error } = await auth.supabase
    .from("leader_roles")
    .select("*")
    .eq("leader_id", id)
    .order("term_start_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data || [] });
}

/**
 * Create a time-bound position.
 * Requires: title, level (enum), seat_type (enum), term_start_date.
 * Status: Active | Former | Suspended (Ended → Former).
 */
export async function POST(request: NextRequest, context: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id: leaderId } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  let row: Record<string, unknown>;
  try {
    row = await prepareRoleInsert(auth.supabase, leaderId, body);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Invalid role payload" },
      { status: 400 },
    );
  }

  const { data, error, dropped } = await insertRoleWithFallback(
    auth.supabase,
    row,
  );

  if (error || !data) {
    return NextResponse.json(
      {
        error: error?.message || "Failed to create role",
        dropped,
        hint:
          "Required: title, term_start_date, level (national|county|ward), seat_type (Elected|Nominated|Ex-Officio|Appointed). Status must be Active, Former, or Suspended.",
      },
      { status: 500 },
    );
  }

  const status = String(data.status || "");
  const term_end_date = data.term_end_date;
  const isCurrent =
    body.set_as_current === true ||
    (status === "Active" && !term_end_date);

  if (isCurrent && body.set_as_current !== false) {
    await syncLeaderCurrentFields(auth.supabase, leaderId, data);
  }

  return NextResponse.json(
    { data, dropped: dropped?.length ? dropped : undefined },
    { status: 201 },
  );
}

async function syncLeaderCurrentFields(
  supabase: {
    from: (t: string) => {
      update: (v: Record<string, unknown>) => {
        eq: (
          col: string,
          val: string,
        ) => PromiseLike<{ error: { message: string } | null }>;
      };
    };
  },
  leaderId: string,
  role: Record<string, unknown> | null,
) {
  if (!role) return;
  // Do not overwrite honorific-style leaders.title if role title is job office —
  // still sync job snapshot fields used on list pages
  await supabase
    .from("leaders")
    .update({
      title: role.title || null,
      current_party: role.party || null,
      current_constituency: role.constituency || null,
      current_county: role.county || null,
      current_organization: role.organization || null,
      level: role.level || null,
    })
    .eq("id", leaderId);
}
