import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const q = searchParams.get("q")?.trim() || "";
    const excludeId = searchParams.get("exclude") || "";
    const countyId = searchParams.get("county_id") || "";
    const limit = Number(searchParams.get("limit")) || 20;

    if (!q || q.length < 2) {
      return NextResponse.json({ data: [] });
    }

    let query = supabase
      .from("mcas")
      .select(`
        id,
        slug,
        first_name,
        other_names,
        surname,
        seat_type,
        status,
        counties (name),
        wards (name),
        political_parties (abbreviation)
      `)
      .or(`first_name.ilike.%${q}%,surname.ilike.%${q}%,other_names.ilike.%${q}%`)
      .order("surname", { ascending: true })
      .limit(limit);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    if (countyId) {
      query = query.eq("county_id", countyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json({ error: error.message, data: [] }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("Search crash:", err);
    return NextResponse.json({ error: "Server error", data: [] }, { status: 500 });
  }
}