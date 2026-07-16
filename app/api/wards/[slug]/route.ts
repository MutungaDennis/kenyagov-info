import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = createPublicClient();

  const { slug } = await params;

  // =========================================
  // 1. GET WARD CORE DATA
  // =========================================

  const { data: ward, error: wardError } =
    await supabase
      .from("wards")
      .select(`
        id,
        slug,
        name,
        ward_code,
        county_name,
        county_code,
        constituency_name,
        constituency_code,
        registered_voters_2022,
        population_estimate,
        land_area_km2,
        bordering_units,
        physical_features,
        climate_ecology,
        total_population,
        population_density_km2,
        male_population,
        female_population,
        intersex_population,
        urban_population_pct,
        rural_population_pct,
        children_population,
        youth_population,
        elderly_population,
        voter_registration_total,
        poverty_headcount_pct
      `)
      .eq("slug", slug)
      .single();

  if (wardError || !ward) {
    return NextResponse.json(
      {
        error: "Ward not found",
        details: wardError,
      },
      { status: 404 }
    );
  }

  const wardId = ward.id;

  // Parallel related reads (public, cookie-free) to stay under Worker CPU budget
  const [
    { data: leadership },
    { data: schools },
    { data: healthFacilities },
    { data: projects },
  ] = await Promise.all([
    supabase
      .from("ward_leadership")
      .select("*")
      .eq("ward_id", wardId)
      .maybeSingle(),
    supabase
      .from("ward_schools")
      .select("*")
      .eq("ward_id", wardId)
      .order("name", { ascending: true })
      .limit(100),
    supabase
      .from("ward_health_facilities")
      .select("*")
      .eq("ward_id", wardId)
      .order("name", { ascending: true })
      .limit(100),
    supabase
      .from("ward_projects")
      .select("*")
      .eq("ward_id", wardId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // =========================================
  // RESPONSE
  // =========================================

  return NextResponse.json({
    ward,
    leadership: leadership || null,
    schools: schools || [],
    health_facilities: healthFacilities || [],
    projects: projects || [],
  });
}