import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_VERIFICATION_STATUS,
  normalizeVerificationStatus,
} from "@/lib/verification";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit")) || 50;
  const offset = Number(searchParams.get("offset")) || 0;
  const q = searchParams.get("q") || "";
  const seat_type = searchParams.get("seat_type") || "";
  const status = searchParams.get("status") || "";
  const verification = searchParams.get("verification") || "";

  let query = supabase.from("mcas").select(
    `id, slug, first_name, other_names, surname, seat_type, nomination_category, status, assembly_role,
     verification_status, verified_at,
     counties (name), wards (name), political_parties (name, abbreviation)`,
    { count: "exact" }
  );

  if (q) query = query.or(`first_name.ilike.%${q}%,surname.ilike.%${q}%,other_names.ilike.%${q}%`);
  if (seat_type) query = query.eq("seat_type", seat_type);
  if (status) query = query.eq("status", status);
  if (verification) {
    query = query.eq(
      "verification_status",
      normalizeVerificationStatus(verification),
    );
  }

  const { data, error, count } = await query.order("surname", { ascending: true }).range(offset, offset + limit - 1);
  if (error) {
    // Column may not exist until migration — retry without verification fields
    if (/verification_status|verified_at/i.test(error.message)) {
      let q2 = supabase.from("mcas").select(
        `id, slug, first_name, other_names, surname, seat_type, nomination_category, status, assembly_role,
         counties (name), wards (name), political_parties (name, abbreviation)`,
        { count: "exact" },
      );
      if (q) q2 = q2.or(`first_name.ilike.%${q}%,surname.ilike.%${q}%,other_names.ilike.%${q}%`);
      if (seat_type) q2 = q2.eq("seat_type", seat_type);
      if (status) q2 = q2.eq("status", status);
      const res2 = await q2.order("surname", { ascending: true }).range(offset, offset + limit - 1);
      if (res2.error) return NextResponse.json({ error: res2.error.message }, { status: 500 });
      return NextResponse.json({ data: res2.data, total: res2.count || 0 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ data, total: count || 0 });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  const slug = `${body.first_name}-${body.surname}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const verification_status = body.verification_status
    ? normalizeVerificationStatus(body.verification_status)
    : DEFAULT_VERIFICATION_STATUS;

  const row = {
    ...body,
    slug,
    verification_status,
    ...(verification_status === "Verified"
      ? { verified_at: new Date().toISOString() }
      : {}),
  };

  const { data, error } = await supabase.from("mcas").insert([row]).select().single();
  if (error) {
    if (/verification_status|verified_at/i.test(error.message)) {
      const { verification_status: _v, verified_at: _a, ...without } = row;
      const res2 = await supabase.from("mcas").insert([without]).select().single();
      if (res2.error) {
        return NextResponse.json(
          { error: res2.error.message, hint: res2.error.hint },
          { status: 400 },
        );
      }
      return NextResponse.json({ data: res2.data });
    }
    return NextResponse.json({ error: error.message, hint: error.hint }, { status: 400 });
  }
  return NextResponse.json({ data });
}