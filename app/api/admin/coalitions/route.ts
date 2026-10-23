import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

const coalitionSelect = "id, name, abbreviation, slogan, colors, symbol";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("coalitions").select(coalitionSelect).order("name");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  const row = {
    name,
    abbreviation: String(body.abbreviation || "").trim() || null,
    slogan: String(body.slogan || "").trim() || null,
    colors: String(body.colors || "").trim() || null,
    symbol: String(body.symbol || "").trim() || null,
  };
  const { data, error } = await auth.supabase.from("coalitions").insert(row).select(coalitionSelect).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const id = String(body.id || "");
  const name = String(body.name || "").trim();
  if (!id || !name) return NextResponse.json({ error: "id and name are required" }, { status: 400 });
  const { data, error } = await auth.supabase.from("coalitions").update({
    name,
    abbreviation: String(body.abbreviation || "").trim() || null,
    slogan: String(body.slogan || "").trim() || null,
    colors: String(body.colors || "").trim() || null,
    symbol: String(body.symbol || "").trim() || null,
  }).eq("id", id).select(coalitionSelect).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const { error } = await auth.supabase.from("coalitions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
