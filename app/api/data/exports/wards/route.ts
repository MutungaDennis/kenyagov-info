import { NextRequest, NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export async function GET(request: NextRequest) {
  const supabase = createPublicClient();

  // Parse filtering parameters directly out of the search url string context
  const { searchParams } = new URL(request.url);
  const county = searchParams.get("county") || "";
  const constituency = searchParams.get("constituency") || "";
  const q = searchParams.get("q")?.trim() || "";

  try {
    // Build an optimized query stack to fetch matching datasets from the database view
    let baseQuery = supabase
      .from("wards")
      .select("ward_code, name, constituency_name, county_name, registered_voters_2022")
      .eq("is_active", true);

    if (county) baseQuery = baseQuery.eq("county_name", county);
    if (constituency) baseQuery = baseQuery.eq("constituency_name", constituency);

    if (q) {
      const formattedQuery = `%${q}%`;
      baseQuery = baseQuery.or(
        `name.ilike."${formattedQuery}",constituency_name.ilike."${formattedQuery}",county_name.ilike."${formattedQuery}"`
      );
    }

    // Sort entries logically by county, constituency, and ward alphabetical order lines
    const { data: wards, error } = await baseQuery
      .order("county_name", { ascending: true })
      .order("constituency_name", { ascending: true })
      .order("name", { ascending: true })
      .limit(1500); // Caps query footprint to safeguard server runtime thresholds

    if (error) throw error;

    // Define and structure the open-data tabular spreadsheet headers block
    const csvHeaders = ["Ward Code", "Ward Name", "Constituency Name", "County Name", "Registered Voters (2022)"];
    
    // Process database field rows safely wrapping text parameters containing special commas inside quotes
    const csvRows = (wards || []).map((ward) => [
      `="${ward.ward_code || ''}"`, // Formats the numeric strings to protect leading text zeros in Excel layout grids
      `"${(ward.name || '').replace(/"/g, '""')}"`,
      `"${(ward.constituency_name || '').replace(/"/g, '""')}"`,
      `"${(ward.county_name || '').replace(/"/g, '""')}"`,
      ward.registered_voters_2022 ? ward.registered_voters_2022.toString() : "0"
    ]);

    // Join the collected header arrays and matching row string blocks into a standard layout footprint
    const csvContent = [csvHeaders.join(","), ...csvRows.map((row) => row.join(","))].join("\n");

    // Return the generated data payload spreadsheet specifying explicit text attachment properties
    const format = new URL(request.url).searchParams.get("format");
    if (format === "json") {
      return Response.json(wards || [], {
        headers: { "Content-Disposition": `attachment; filename="citizen_guide_wards_${new Date().toISOString().slice(0,10)}.json"` }
      });
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="citizen_guide_wards_export_${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store, max-age=0"
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: "An issue occurred streaming files from the database registry.", details: error.message || error },
      { status: 500 }
    );
  }
}
