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
  
  const slugBase = `${body.first_name || ""}-${body.surname || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const slug =
    typeof body.slug === "string" && body.slug.trim().length >= 3
      ? body.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-")
      : slugBase;

  const verification_status = body.verification_status
    ? normalizeVerificationStatus(body.verification_status)
    : DEFAULT_VERIFICATION_STATUS;

  // Whitelist only mcas columns — never spread term-only fields into insert
  const row: Record<string, unknown> = {
    first_name: body.first_name,
    other_names: body.other_names ?? null,
    surname: body.surname,
    gender: body.gender ?? null,
    seat_type: body.seat_type,
    nomination_category: body.nomination_category ?? "N/A",
    county_id: body.county_id ?? null,
    ward_id: body.ward_id ?? null,
    party_id: body.party_id ?? null,
    status: body.status || "Active",
    slug,
    assembly_role: body.assembly_role || "Member of the County Assembly",
    term_count: body.term_count ?? 1,
    term_start_date: body.term_start_date
      ? String(body.term_start_date).slice(0, 10)
      : null,
    term_end_date: body.term_end_date
      ? String(body.term_end_date).slice(0, 10)
      : null,
    verification_status,
    ...(verification_status === "Verified"
      ? { verified_at: new Date().toISOString() }
      : {}),
  };

  // ==========================================
  // ENFORCE chk_nominated_properties CONSTRAINT
  // ==========================================
  if (row.seat_type === "Elected") {
    if (!row.ward_id) {
      return NextResponse.json(
        { error: "Elected MCAs must have a Ward selected." }, 
        { status: 400 }
      );
    }
    // Force nomination_category to 'N/A' for elected MCAs to satisfy the DB constraint
    row.nomination_category = "N/A";
  } 
  else if (row.seat_type === "Nominated") {
    if (row.ward_id) {
      return NextResponse.json(
        { error: "Nominated MCAs cannot have a Ward assigned." }, 
        { status: 400 }
      );
    }
    if (!row.nomination_category || row.nomination_category === "N/A") {
      return NextResponse.json(
        { error: "Nominated MCAs must have a valid Nomination Category (e.g., 'Gender Top-up', 'Youth', 'PWD', 'Marginalized')." }, 
        { status: 400 }
      );
    }
    row.ward_id = null;
  }

  let working = { ...row };
  let { data, error } = await supabase.from("mcas").insert([working]).select().single();
  
  // Drop optional columns that may not exist on older schemas and retry
  if (error && /verification_status|verified_at|term_start_date|term_end_date|party_id/i.test(error.message)) {
    const dropKeys = [
      "verification_status",
      "verified_at",
      "term_start_date",
      "term_end_date",
    ];
    for (const k of dropKeys) {
      if (new RegExp(k, "i").test(error.message)) delete working[k];
    }
    const res2 = await supabase.from("mcas").insert([working]).select().single();
    data = res2.data;
    error = res2.error;
  }

  if (error) {
    return NextResponse.json(
      { error: error.message, hint: error.hint }, 
      { status: 400 }
    );
  }
  
  return NextResponse.json({ data });
}