import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const supabase = await createClient();

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

  // =========================================
  // 2. LEADERSHIP
  // =========================================

  const { data: leadership } = await supabase
    .from("ward_leadership")
    .select("*")
    .eq("ward_id", wardId)
    .maybeSingle();

  // =========================================
  // 3. SCHOOLS
  // =========================================

  const { data: schools } = await supabase
    .from("ward_schools")
    .select("*")
    .eq("ward_id", wardId)
    .order("name", { ascending: true });

  // =========================================
  // 4. HEALTH FACILITIES
  // =========================================

  const { data: healthFacilities } = await supabase
    .from("ward_health_facilities")
    .select("*")
    .eq("ward_id", wardId)
    .order("name", { ascending: true });

  // =========================================
  // 5. PROJECTS
  // =========================================

  const { data: projects } = await supabase
    .from("ward_projects")
    .select("*")
    .eq("ward_id", wardId)
    .order("created_at", { ascending: false });

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