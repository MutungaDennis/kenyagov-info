import "server-only";
import { createPublicClient } from "@/lib/supabase/public";
import { collectExportRows, rowsToCsv } from "./export-format";

// Only the five previously published exports. Never accept a table/column from the URL.
const EXPORTS = {
  counties: { table: "counties", fields: ["code", "name", "region", "headquarters", "population", "area_km2", "governor_name", "senator_name"] },
  institutions: { table: "institutions", fields: ["name", "short_name", "institution_type", "government_level", "arm_of_government", "description", "slug", "status"] },
  leaders: { table: "leaders", fields: ["full_name", "title", "current_party", "current_constituency", "current_county", "current_organization"] },
  wards: { table: "wards", fields: ["ward_code", "name", "constituency_name", "county_name", "registered_voters_2022"] },
  "polling-stations": { table: "polling_stations_2022", fields: ["polling_station_code", "name", "reg_centre_code", "reg_centre_name", "registered_voters_2022", "county_code", "constituency_code", "ward_code"] },
} as const;
export type ExportDataset = keyof typeof EXPORTS;

export async function datasetExport(request: Request, dataset: ExportDataset) {
  const params = new URL(request.url).searchParams;
  const format = (params.get("format") || "csv").toLowerCase();
  if (format !== "csv" && format !== "json") return Response.json({ error: "Choose format=csv or format=json." }, { status: 400 });
  const filterable = dataset === "wards" || dataset === "polling-stations";
  const allowed = new Set(["format", ...(filterable ? ["county", "constituency", "q"] : []), ...(dataset === "polling-stations" ? ["ward"] : [])]);
  if ([...params.keys()].some(key => !allowed.has(key))) return Response.json({ error: "Unsupported filter. See /open-data/standards for export parameters." }, { status: 400 });
  const config = EXPORTS[dataset];
  const db = createPublicClient();
  try {
    const filters: [string, string | number][] = [];
    for (const key of ["county", "constituency", "ward"] as const) {
      const value = params.get(key)?.trim();
      if (!value) continue;
      if (value.length > 150) return Response.json({ error: "Filter is too long." }, { status: 400 });
      if (dataset === "wards") { filters.push([`${key}_name`, value]); continue; }
      const table = key === "county" ? "counties" : key === "constituency" ? "constituencies" : "wards";
      const code = key === "county" ? "code" : `${key}_code`;
      let lookup = db.from(table).select(code).eq("name", value);
      for (const [column, resolved] of filters) lookup = lookup.eq(column, resolved);
      const found = await lookup.limit(2);
      if (found.error) throw new Error("Filter lookup failed");
      if (found.data?.length !== 1) return Response.json({ error: `Unknown or ambiguous ${key}. Use exact names and include its county/constituency.` }, { status: 400 });
      filters.push([`${key}_code`, (found.data[0] as unknown as Record<string, string | number>)[code]]);
    }
    const rawQuery = params.get("q")?.trim() || "";
    const term = rawQuery.replace(/[^\p{L}\p{N}\s-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 120);
    if (rawQuery && !term) return Response.json({ error: "Enter a name or code to search." }, { status: 400 });
    const rows = await collectExportRows(async (from, to) => {
      let query = db.from(config.table).select(config.fields.join(",")).eq("is_active", true).order("id").range(from, to);
      for (const [column, value] of filters) query = query.eq(column, value);
      if (term) {
        const columns = dataset === "wards" ? ["name", "constituency_name", "county_name"] : ["name", "polling_station_code"];
        query = query.or(columns.map(column => `${column}.ilike.%${term}%`).join(","));
      }
      const result = await query;
      return { data: result.data as Record<string, unknown>[] | null, error: result.error };
    });
    const generated = new Date().toISOString();
    const headers = {
      "Content-Type": format === "csv" ? "text/csv; charset=utf-8" : "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="kenya-${dataset}-${generated.slice(0, 10)}.${format}"`,
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Expose-Headers": "Content-Disposition, X-Total-Count, X-Generated-At, Link",
      "X-Content-Type-Options": "nosniff",
      "X-Total-Count": String(rows.length),
      "X-Generated-At": generated,
      "Link": `</open-data/${dataset}>; rel="describedby", </open-data/standards>; rel="license"`,
    };
    return new Response(format === "csv" ? rowsToCsv(rows, config.fields) : JSON.stringify(rows), { headers });
  } catch {
    return Response.json({ error: "The complete export could not be generated. Please try again or use a county/constituency filter for polling stations." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
