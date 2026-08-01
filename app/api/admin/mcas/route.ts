import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit")) || 50;
  const offset = Number(searchParams.get("offset")) || 0;
  const q = searchParams.get("q") || "";
  const seat_type = searchParams.get("seat_type") || "";
  const status = searchParams.get("status") || "";

  let query = supabase.from("mcas").select(
    `id, slug, first_name, other_names, surname, seat_type, nomination_category, status, assembly_role,
     counties (name), wards (name), political_parties (name, abbreviation)`,
    { count: "exact" }
  );

  if (q) query = query.or(`first_name.ilike.%${q}%,surname.ilike.%${q}%,other_names.ilike.%${q}%`);
  if (seat_type) query = query.eq("seat_type", seat_type);
  if (status) query = query.eq("status", status);

  const { data, error, count } = await query.order("surname", { ascending: true }).range(offset, offset + limit - 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, total: count || 0 });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const slug = `${body.first_name}-${body.surname}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const { data, error } = await supabase.from("mcas").insert([{ ...body, slug }]).select().single();
  if (error) return NextResponse.json({ error: error.message, hint: error.hint }, { status: 400 });
  return NextResponse.json({ data });
}