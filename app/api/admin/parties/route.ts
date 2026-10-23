import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi, slugify } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
const partySelect = "id, slug, name, abbreviation, symbol, colors, slogan, status, coalition_id, certificate_serial_no, certificate_issue_date, certificate_date, postal_address, head_office_location, previous_names, changes";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { data, error } = await auth.supabase.from("political_parties").select(partySelect).order("name");
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
  const slug = slugify(String(body.slug || name)) || `party-${Date.now()}`;
  const { data, error } = await auth.supabase.from("political_parties").insert({
    name, slug,
    abbreviation: String(body.abbreviation || "").trim() || null,
    slogan: String(body.slogan || "").trim() || null,
    colors: String(body.colors || "").trim() || null,
    symbol: String(body.symbol || "").trim() || null,
    status: String(body.status || "active"),
    coalition_id: String(body.coalition_id || "").trim() || null,
    certificate_serial_no: String(body.certificate_serial_no || "").trim() || null,
    certificate_issue_date: String(body.certificate_issue_date || "").trim() || null,
    certificate_date: String(body.certificate_date || "").trim() || null,
    postal_address: String(body.postal_address || "").trim() || null,
    head_office_location: String(body.head_office_location || "").trim() || null,
    previous_names: String(body.previous_names || "").trim() || null,
    changes: String(body.changes || "").trim() || null,
  }).select(partySelect).single();
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
  const { data, error } = await auth.supabase.from("political_parties").update({
    name,
    slug: slugify(String(body.slug || name)),
    abbreviation: String(body.abbreviation || "").trim() || null,
    slogan: String(body.slogan || "").trim() || null,
    colors: String(body.colors || "").trim() || null,
    symbol: String(body.symbol || "").trim() || null,
    status: String(body.status || "active"),
    coalition_id: String(body.coalition_id || "").trim() || null,
  }).eq("id", id).select(partySelect).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });
  const { error } = await auth.supabase.from("political_parties").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
