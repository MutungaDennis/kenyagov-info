import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdminApi();
    if (!auth.ok) return auth.response;
    const supabase = auth.supabase;
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