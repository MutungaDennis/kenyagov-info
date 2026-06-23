import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") || "csv").toLowerCase();

  const { data: counties, error } = await supabase
    .from("counties")
    .select("code, name, region, headquarters, population, area_km2, governor_name, senator_name")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error || !counties) {
    return new NextResponse("Failed to generate counties export", { status: 500 });
  }

  if (format === "json") {
    return Response.json(counties, {
      headers: {
        "Content-Disposition": `attachment; filename="kenya-counties-${new Date().toISOString().slice(0,10)}.json"`,
      },
    });
  }

  // Default to CSV (GOV.UK preferred for tabular open data)
  const csvHeaders = "County Code,County Name,Region,Headquarters,Population (2019 est.),Area (km²),Governor,Senator\n";
  const csvRows = counties.map(c => 
    `${c.code},"${c.name?.replace(/"/g, '""')}","${c.region || ''}","${c.headquarters || ''}",${c.population || 0},${c.area_km2 || 0},"${c.governor_name || ''}","${c.senator_name || ''}"`
  ).join("\n");

  const csvContent = csvHeaders + csvRows;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kenya-counties-${new Date().toISOString().slice(0,10)}.csv"`,
      "Cache-Control": "public, max-age=3600"
    },
  });
}
