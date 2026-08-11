import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

type Kind = "name_title" | "national_honour";

function tableFor(kind: Kind): string {
  return kind === "name_title"
    ? "leader_name_title_options"
    : "leader_national_honour_options";
}

function normalizeValue(raw: string): string {
  return raw.trim().replace(/\s+/g, " ");
}

/**
 * GET ?kind=name_title|national_honour
 * POST { kind, value, label? } — create custom option for reuse
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const kind = (request.nextUrl.searchParams.get("kind") ||
    "name_title") as Kind;
  if (kind !== "name_title" && kind !== "national_honour") {
    return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
  }

  const table = tableFor(kind);
  const { data, error } = await auth.supabase
    .from(table)
    .select("id, value, label, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  if (error) {
    // Table may not exist yet
    if (/does not exist|schema cache|PGRST/i.test(error.message)) {
      return NextResponse.json({ data: [], missing_table: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: (data || []).map((r: {
      value: string;
      label: string;
      sort_order?: number;
    }) => ({
      value: r.value,
      label: r.label,
      order: r.sort_order,
    })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const kind = String(body.kind || "") as Kind;
  if (kind !== "name_title" && kind !== "national_honour") {
    return NextResponse.json(
      { error: "kind must be name_title or national_honour" },
      { status: 400 },
    );
  }

  const value = normalizeValue(String(body.value || ""));
  if (!value || value.length < 1) {
    return NextResponse.json({ error: "value is required" }, { status: 400 });
  }
  if (value.length > 80) {
    return NextResponse.json(
      { error: "value must be 80 characters or fewer" },
      { status: 400 },
    );
  }

  const label = normalizeValue(String(body.label || value));
  const sort_order =
    typeof body.sort_order === "number" && Number.isFinite(body.sort_order)
      ? Math.floor(body.sort_order)
      : 100;

  const table = tableFor(kind);
  const row = {
    value,
    label: label || value,
    sort_order,
    is_active: true,
  };

  const { data, error } = await auth.supabase
    .from(table)
    .upsert(row, { onConflict: "value" })
    .select("id, value, label, sort_order, is_active")
    .single();

  if (error) {
    if (/does not exist|schema cache|PGRST/i.test(error.message)) {
      return NextResponse.json(
        {
          error:
            "Catalogue tables missing. Run lib/supabase/migrations/add_leader_title_honour_catalog.sql in Supabase.",
          hint: error.message,
        },
        { status: 503 },
      );
    }
    // Unique conflict without upsert support — try update
    if (/duplicate|unique/i.test(error.message)) {
      const up = await auth.supabase
        .from(table)
        .update({ label: row.label, is_active: true, sort_order })
        .eq("value", value)
        .select("id, value, label, sort_order, is_active")
        .single();
      if (up.error) {
        return NextResponse.json({ error: up.error.message }, { status: 400 });
      }
      return NextResponse.json({ data: up.data });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
