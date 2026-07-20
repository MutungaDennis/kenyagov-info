import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

/** List positions for admin dropdowns */
export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(
    500,
    Math.max(1, parseInt(searchParams.get("limit") || "300", 10)),
  );

  let query = auth.supabase
    .from("positions")
    .select("id, title, code, level, rank_order, description")
    .order("title", { ascending: true })
    .limit(limit);

  if (q.length >= 2) {
    query = query.or(
      `title.ilike.%${q}%,code.ilike.%${q}%,description.ilike.%${q}%`,
    );
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data: data || [] });
}

/**
 * Create a new job title for continuous use in leader roles.
 * positions.id is integer; leader_roles.position_id is UUID — we resolve title only on role save.
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

  const title = String(body.title || "").trim();
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  // Unique-ish code for DB
  let code = String(body.code || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  if (!code) {
    code = slugify(title)
      .toUpperCase()
      .replace(/-/g, "_")
      .slice(0, 80);
  }
  if (!code) code = `POS_${Date.now()}`;

  const level = body.level
    ? String(body.level).trim()
    : "National";

  const row: Record<string, unknown> = {
    title,
    code,
    level,
    description: body.description ? String(body.description) : null,
  };

  if (body.rank_order != null && body.rank_order !== "") {
    const n = Number(body.rank_order);
    if (Number.isFinite(n)) row.rank_order = n;
  }

  let { data, error } = await auth.supabase
    .from("positions")
    .insert(row)
    .select("id, title, code, level, rank_order, description")
    .single();

  // Unique code collision — append suffix
  if (error && /unique|duplicate|code/i.test(error.message)) {
    row.code = `${code}_${Date.now().toString(36).toUpperCase()}`;
    const retry = await auth.supabase
      .from("positions")
      .insert(row)
      .select("id, title, code, level, rank_order, description")
      .single();
    data = retry.data;
    error = retry.error;
  }

  // Soft-drop optional columns
  if (error && /column|schema cache|rank_order|description/i.test(error.message)) {
    delete row.rank_order;
    delete row.description;
    const retry = await auth.supabase
      .from("positions")
      .insert(row)
      .select("id, title, code, level")
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return NextResponse.json(
      {
        error: error.message,
        hint: "positions requires title and unique code. Level is free text (e.g. National, County).",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ data }, { status: 201 });
}
