import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/parties — create a political party for reuse on leader roles.
 * Body: { name: string, abbreviation?: string }
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

  const abbreviation = body.abbreviation
    ? String(body.abbreviation).trim()
    : null;
  let slug =
    String(body.slug || "").trim() ||
    slugify(abbreviation || name) ||
    `party-${Date.now()}`;
  slug = slugify(slug) || slug;

  // Avoid duplicates by name / abbreviation (case-insensitive)
  const { data: byName } = await auth.supabase
    .from("political_parties")
    .select("id, name, abbreviation, slug")
    .ilike("name", name)
    .limit(5);
  let existing = byName || [];
  if (abbreviation && !existing.length) {
    const { data: byAbbr } = await auth.supabase
      .from("political_parties")
      .select("id, name, abbreviation, slug")
      .ilike("abbreviation", abbreviation)
      .limit(5);
    existing = byAbbr || [];
  }

  if (existing.length) {
    return NextResponse.json({
      data: existing[0],
      existing: true,
      message: "Party already exists — reusing it.",
    });
  }

  const row: Record<string, unknown> = {
    name,
    abbreviation: abbreviation || null,
    slug,
    status: body.status ? String(body.status) : "active",
  };

  let { data, error } = await auth.supabase
    .from("political_parties")
    .insert(row)
    .select("id, name, abbreviation, slug, status")
    .single();

  // Soft-drop optional columns / unique slug collision
  if (error) {
    if (/slug|unique|duplicate/i.test(error.message)) {
      row.slug = `${slug}-${Date.now().toString(36)}`;
      const retry = await auth.supabase
        .from("political_parties")
        .insert(row)
        .select("id, name, abbreviation, slug, status")
        .single();
      data = retry.data;
      error = retry.error;
    }
  }
  if (error && /column|status|code/i.test(error.message)) {
    delete row.status;
    const retry = await auth.supabase
      .from("political_parties")
      .insert({ name, abbreviation: abbreviation || null, slug: row.slug })
      .select("id, name, abbreviation, slug")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    return NextResponse.json(
      {
        error: error?.message || "Failed to create party",
        hint: "Check political_parties table columns (name, abbreviation, slug).",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ data, existing: false }, { status: 201 });
}
