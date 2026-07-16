import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export async function GET(request: Request) {
  const supabase = createPublicClient();
  const { searchParams } = new URL(request.url);

  const county = searchParams.get("county") || "";
  const constituency = searchParams.get("constituency") || "";
  const ward = searchParams.get("ward") || "";
  const q = searchParams.get("q") || "";

  // Resolve target filter code arrays to execute structural constraints
  let baseQuery = supabase
    .from("polling_stations_2022")
    .select(`
      polling_station_code,
      name,
      reg_centre_code,
      reg_centre_name,
      registered_voters_2022,
      county_code,
      constituency_code,
      ward_code
    `)
    .eq("is_active", true);

  // Re-apply matching administrative filtering layers
  if (county) {
    const { data: c } = await supabase.from("counties").select("code").eq("name", county).single();
    if (c) baseQuery = baseQuery.eq("county_code", c.code);
  }
  if (constituency) {
    const { data: cn } = await supabase.from("constituencies").select("constituency_code").eq("name", constituency).single();
    if (cn) baseQuery = baseQuery.eq("constituency_code", cn.constituency_code);
  }
  if (ward) {
    const { data: wd } = await supabase.from("wards").select("ward_code").eq("name", ward).single();
    if (wd) baseQuery = baseQuery.eq("ward_code", wd.ward_code);
  }
  if (q) {
    baseQuery = baseQuery.or(`name.ilike.%${q}%,polling_station_code.ilike.%${q}%`);
  }

  const { data: stations, error } = await baseQuery.order("polling_station_code", { ascending: true });

  if (error || !stations) {
    return new Response("Database records fetch generation failed", { status: 500 });
  }

  // Compile structured CSV rows with clean text qualifiers
  const csvHeaders = "IEBC Polling Station Code,Stream Name,Registration Centre Code,Registration Centre Name,Registered Voters 2022,County Code,Constituency Code,Ward Code\n";
  const csvRows = stations.map(s => 
    `="${s.polling_station_code}","${s.name?.replace(/"/g, '""')}","${s.reg_centre_code}","${s.reg_centre_name?.replace(/"/g, '""')}",${s.registered_voters_2022 || 0},${s.county_code},"${s.constituency_code}","${s.ward_code}"`
  ).join("\n");

  const csvContent = csvHeaders + csvRows;

  const format = new URL(request.url).searchParams.get("format");
  if (format === "json") {
    return Response.json(stations || [], {
      headers: { "Content-Disposition": `attachment; filename="filtered-kenya-polling-stations-2022.json"` }
    });
  }

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="filtered-kenya-polling-stations-2022.csv"`,
    },
  });
}
