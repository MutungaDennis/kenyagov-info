import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export async function GET(request: Request) {
  const supabase = createPublicClient();
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") || "csv").toLowerCase();

  const { data: leaders, error } = await supabase
    .from("leaders")
    .select("name, title, category, county, organization, description")
    .order("name", { ascending: true });

  if (error || !leaders) {
    return new NextResponse("Failed to generate leaders export", { status: 500 });
  }

  if (format === "json") {
    return Response.json(leaders, {
      headers: {
        "Content-Disposition": `attachment; filename="kenya-leaders-${new Date().toISOString().slice(0,10)}.json"`,
      },
    });
  }

  const csvHeaders = "Name,Title,Category,County,Organization,Description\n";
  const csvRows = leaders.map(l =>
    `"${(l.name || '').replace(/"/g, '""')}","${(l.title || '').replace(/"/g, '""')}","${l.category || ''}","${l.county || ''}","${l.organization || ''}","${(l.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
  ).join("\n");

  const csvContent = csvHeaders + csvRows;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kenya-leaders-${new Date().toISOString().slice(0,10)}.csv"`,
    },
  });
}
