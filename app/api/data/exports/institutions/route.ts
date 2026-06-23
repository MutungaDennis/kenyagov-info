import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") || "csv").toLowerCase();

  const { data: institutions, error } = await supabase
    .from("institutions")
    .select("name, short_name, institution_type, government_level, arm_of_government, description")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error || !institutions) {
    return new NextResponse("Failed to generate institutions export", { status: 500 });
  }

  if (format === "json") {
    return Response.json(institutions, {
      headers: {
        "Content-Disposition": `attachment; filename="kenya-institutions-${new Date().toISOString().slice(0,10)}.json"`,
      },
    });
  }

  const csvHeaders = "Institution Name,Short Name,Type,Government Level,Arm of Government,Description\n";

  const csvRows = institutions.map(i => 
    `"${(i.name || '').replace(/"/g, '""')}","${(i.short_name || '').replace(/"/g, '""')}","${i.institution_type || ''}","${i.government_level || ''}","${i.arm_of_government || ''}","${(i.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
  ).join("\n");

  const csvContent = csvHeaders + csvRows;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kenya-institutions-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  });
}
