import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";

export async function GET(request: Request) {
  const supabase = createPublicClient();
  const { searchParams } = new URL(request.url);
  const format = (searchParams.get("format") || "csv").toLowerCase();

  // Modern leaders schema (full_name, current_*)
  const { data: leaders, error } = await supabase
    .from("leaders")
    .select(
      "full_name, title, current_party, current_constituency, current_county, current_organization",
    )
    .order("full_name", { ascending: true });

  if (error || !leaders) {
    return new NextResponse(
      `Failed to generate leaders export${error ? `: ${error.message}` : ""}`,
      { status: 500 },
    );
  }

  if (format === "json") {
    return Response.json(leaders, {
      headers: {
        "Content-Disposition": `attachment; filename="kenya-leaders-${new Date().toISOString().slice(0, 10)}.json"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const csvHeaders =
    "Full Name,Title,Party,Constituency,County,Organisation\n";
  const csvRows = leaders
    .map(
      (l) =>
        `"${(l.full_name || "").replace(/"/g, '""')}","${(l.title || "").replace(/"/g, '""')}","${(l.current_party || "").replace(/"/g, '""')}","${(l.current_constituency || "").replace(/"/g, '""')}","${(l.current_county || "").replace(/"/g, '""')}","${(l.current_organization || "").replace(/"/g, '""')}"`,
    )
    .join("\n");

  return new NextResponse(csvHeaders + csvRows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="kenya-leaders-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
