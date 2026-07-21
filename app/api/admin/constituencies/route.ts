import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/constituencies — add a constituency (including former/abolished).
 *
 * Body:
 * - name (required)
 * - county_id (required by DB — use the modern county that covers the area)
 * - is_active (default false for historical seats)
 * - notes / description optional if column exists
 *
 * Example: Eldoret North (former) → county Uasin Gishu, is_active: false
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const countyId = body.county_id ? String(body.county_id).trim() : "";
  if (!countyId) {
    return NextResponse.json(
      {
        error: "county_id is required",
        hint: "Link former seats to the modern county that covers the area (e.g. Uasin Gishu for Eldoret North).",
      },
      { status: 400 },
    );
  }

  // Reuse if same name under same county
  const { data: existing } = await auth.supabase
    .from("constituencies")
    .select("id, name, county_id, is_active, slug")
    .eq("county_id", countyId)
    .ilike("name", name)
    .limit(3);

  if (existing?.length) {
    return NextResponse.json({
      data: existing[0],
      existing: true,
      message: "Constituency already exists for that county — reusing it.",
    });
  }

  // county_code is NOT NULL on this project — copy from counties
  const { data: countyRow } = await auth.supabase
    .from("counties")
    .select("id, name, code")
    .eq("id", countyId)
    .maybeSingle();
  if (!countyRow) {
    return NextResponse.json(
      { error: "county_id not found in counties table" },
      { status: 400 },
    );
  }

  let slug =
    String(body.slug || "").trim() ||
    slugify(`${countyRow.name || ""}-${name}`) ||
    slugify(name) ||
    `constituency-${Date.now()}`;
  slug = slugify(slug) || slug;

  const isActive = body.is_active === true || body.is_active === "true";
  // Synthetic codes for historical seats (must be unique if constrained)
  const constituencyCode =
    String(body.constituency_code || "").trim() ||
    `HIST-${Date.now().toString(36).toUpperCase()}`;

  const row: Record<string, unknown> = {
    name,
    county_id: countyId,
    county_code: countyRow.code,
    constituency_code: constituencyCode,
    slug,
    is_active: isActive,
  };

  let { data, error } = await auth.supabase
    .from("constituencies")
    .insert(row)
    .select("id, name, county_id, is_active, slug")
    .single();

  if (error && /slug|unique|duplicate/i.test(error.message)) {
    row.slug = `${slug}-${Date.now().toString(36)}`;
    const retry = await auth.supabase
      .from("constituencies")
      .insert(row)
      .select("id, name, county_id, is_active, slug")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error && /is_active/i.test(error.message)) {
    delete row.is_active;
    const retry = await auth.supabase
      .from("constituencies")
      .insert(row)
      .select("id, name, county_id, slug")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    return NextResponse.json(
      {
        error: error?.message || "Failed to create constituency",
        hint: "constituencies.county_id is required. Pick the current county for former seats.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ data, existing: false }, { status: 201 });
}
