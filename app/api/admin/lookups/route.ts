import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const [counties, wards, parties] = await Promise.all([
    supabase.from("counties").select("id, name").order("name"),
    supabase.from("wards").select("id, name, county_id").order("name"),
    supabase.from("political_parties").select("id, name, abbreviation").order("name"),
  ]);

  return NextResponse.json({
    counties: counties.data || [],
    wards: wards.data || [],
    parties: parties.data || [],
  });
}