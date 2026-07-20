/**
 * Lightweight aggregates for open-data pages.
 * Never load full polling-station or multi-MB tables for HTML.
 */

import { createPublicClient } from "@/lib/supabase/public";
import { createSanityClient } from "@/lib/sanity/createSanityClient";
import type { ChartSpec } from "@/components/open-data/charts/types";

export type NamedCount = { label: string; count: number };

export type DatasetSummary = {
  slug: string;
  total: number;
  /** ISO date string when we last computed (request time for live counts) */
  computedAt: string;
  /** Key–value stats for summary list */
  stats: { key: string; value: string }[];
  /** Mixed chart types for variety (bar, column, line, donut, ranking) */
  charts: ChartSpec[];
  /** Small preview table */
  preview?: {
    caption: string;
    headers: string[];
    rows: string[][];
  };
  notes?: string[];
};

function countMap(
  rows: Record<string, unknown>[] | null,
  key: string,
): NamedCount[] {
  const map = new Map<string, number>();
  for (const row of rows || []) {
    const raw = row[key];
    const label = (raw == null || raw === "" ? "Not stated" : String(raw)).trim();
    map.set(label, (map.get(label) || 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function topN(items: NamedCount[], n: number): NamedCount[] {
  return items.slice(0, n);
}

function sumField(
  rows: Record<string, unknown>[] | null,
  key: string,
): number {
  let s = 0;
  for (const row of rows || []) {
    const v = Number(row[key]);
    if (!Number.isNaN(v)) s += v;
  }
  return s;
}

async function countTable(
  table: string,
  activeOnly = true,
): Promise<number> {
  const supabase = createPublicClient();
  let q = supabase.from(table).select("id", { count: "exact", head: true });
  if (activeOnly) {
    // Some tables use is_active; ignore filter errors by retrying without
    const withActive = await q.eq("is_active", true);
    if (!withActive.error) return withActive.count ?? 0;
  }
  const res = await supabase.from(table).select("id", { count: "exact", head: true });
  return res.count ?? 0;
}

export async function getHubCounts(): Promise<Record<string, number>> {
  const [
    counties,
    wards,
    constituencies,
    institutions,
    leaders,
    polling,
    parties,
    coalitions,
    mcas,
  ] = await Promise.all([
    countTable("counties"),
    countTable("wards"),
    countTable("constituencies"),
    countTable("institutions"),
    countTable("leaders", false),
    countTable("polling_stations_2022"),
    countTable("political_parties", false),
    countTable("coalitions", false),
    countTable("mcas", false),
  ]);

  let hansard = 0;
  try {
    const sanity = createSanityClient({ useCdn: true, token: null });
    hansard = await sanity.fetch(
      `count(*[_type == "hansardSitting" && isActive != false])`,
    );
  } catch {
    hansard = 0;
  }

  return {
    counties,
    wards,
    constituencies,
    institutions,
    leaders,
    polling,
    parties,
    coalitions,
    mcas,
    hansard,
  };
}

export async function getDatasetSummary(
  slug: string,
): Promise<DatasetSummary | null> {
  const computedAt = new Date().toISOString();
  const supabase = createPublicClient();

  switch (slug) {
    case "counties": {
      const { data, count } = await supabase
        .from("counties")
        .select(
          "name, region, population, area_km2, poverty_rate, code",
          { count: "exact" },
        )
        .eq("is_active", true)
        .order("population", { ascending: false });

      const rows = data || [];
      const byRegion = countMap(rows as Record<string, unknown>[], "region");
      const topPop = rows.slice(0, 10).map((c) => ({
        label: c.name || "—",
        count: Number(c.population) || 0,
      }));

      return {
        slug,
        total: count ?? rows.length,
        computedAt,
        stats: [
          { key: "Counties", value: String(count ?? rows.length) },
          {
            key: "Total population (sum of held figures)",
            value: sumField(rows as Record<string, unknown>[], "population").toLocaleString(),
          },
          {
            key: "Regions represented",
            value: String(byRegion.filter((r) => r.label !== "Not stated").length),
          },
        ],
        charts: [
          {
            id: "by-region",
            type: "donut",
            title: "Counties by region",
            caption: "Share of counties in each region label held in our database.",
            items: topN(byRegion, 8),
          },
          {
            id: "top-population",
            type: "ranking",
            title: "Largest counties by population figure",
            caption: "Top 10 using the population field we store (not a live census API).",
            items: topPop,
          },
        ],
        preview: {
          caption: "Sample — ten counties by population figure",
          headers: ["County", "Region", "Population", "Area (km²)"],
          rows: rows.slice(0, 10).map((c) => [
            c.name || "—",
            c.region || "—",
            c.population != null ? Number(c.population).toLocaleString() : "—",
            c.area_km2 != null ? String(c.area_km2) : "—",
          ]),
        },
        notes: [
          "Population and socio-economic fields are compilations and may not match the latest KNBS release.",
        ],
      };
    }

    case "constituencies": {
      const { data, count } = await supabase
        .from("constituencies")
        .select(
          "name, registered_voters_2022, number_of_wards, county_code, population_2019",
          { count: "exact" },
        )
        .eq("is_active", true)
        .order("registered_voters_2022", { ascending: false });

      const rows = data || [];
      const topVoters = rows.slice(0, 12).map((c) => ({
        label: c.name || "—",
        count: Number(c.registered_voters_2022) || 0,
      }));

      return {
        slug,
        total: count ?? rows.length,
        computedAt,
        stats: [
          { key: "Constituencies", value: String(count ?? rows.length) },
          {
            key: "Registered voters 2022 (sum)",
            value: sumField(
              rows as Record<string, unknown>[],
              "registered_voters_2022",
            ).toLocaleString(),
          },
        ],
        charts: [
          {
            id: "top-voters",
            type: "column",
            title: "Highest registered voters (2022)",
            caption: "Top constituencies by registered_voters_2022.",
            items: topVoters,
          },
        ],
        preview: {
          caption: "Sample — top constituencies by 2022 registration",
          headers: ["Constituency", "Registered voters (2022)", "Wards"],
          rows: rows.slice(0, 10).map((c) => [
            c.name || "—",
            c.registered_voters_2022 != null
              ? Number(c.registered_voters_2022).toLocaleString()
              : "—",
            c.number_of_wards != null ? String(c.number_of_wards) : "—",
          ]),
        },
      };
    }

    case "wards": {
      // Light columns only — ~1.4k rows is acceptable for aggregate page
      const { data, count } = await supabase
        .from("wards")
        .select("name, county_name, registered_voters_2022", { count: "exact" })
        .eq("is_active", true);

      const rows = (data || []) as Record<string, unknown>[];
      const byCountyVoters = new Map<string, number>();
      for (const w of rows) {
        const county = String(w.county_name || "Not stated");
        const v = Number(w.registered_voters_2022) || 0;
        byCountyVoters.set(county, (byCountyVoters.get(county) || 0) + v);
      }
      const countyItems = Array.from(byCountyVoters.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

      return {
        slug,
        total: count ?? rows.length,
        computedAt,
        stats: [
          { key: "Wards", value: String(count ?? rows.length) },
          {
            key: "Registered voters 2022 (sum of ward figures)",
            value: sumField(rows, "registered_voters_2022").toLocaleString(),
          },
        ],
        charts: [
          {
            id: "voters-by-county",
            type: "bar",
            title: "Registered voters by county (ward totals)",
            caption: "Top 15 counties by summed ward registered_voters_2022.",
            items: topN(countyItems, 15),
          },
        ],
        preview: {
          caption: "Sample wards",
          headers: ["Ward", "County", "Registered voters (2022)"],
          rows: rows.slice(0, 8).map((w) => [
            String(w.name || "—"),
            String(w.county_name || "—"),
            w.registered_voters_2022 != null
              ? Number(w.registered_voters_2022).toLocaleString()
              : "—",
          ]),
        },
        notes: [
          "Full ward list is available as CSV/JSON. Filter exports with ?county= or ?constituency=.",
        ],
      };
    }

    case "polling-stations": {
      // Count only — do not select all station rows for the HTML page
      const total = await countTable("polling_stations_2022");

      // Proxy insight from wards (light) rather than scanning all stations
      const { data: wardRows } = await supabase
        .from("wards")
        .select("county_name, registered_voters_2022")
        .eq("is_active", true);

      const byCounty = new Map<string, number>();
      for (const w of wardRows || []) {
        const county = String(w.county_name || "Not stated");
        const v = Number(w.registered_voters_2022) || 0;
        byCounty.set(county, (byCounty.get(county) || 0) + v);
      }
      const countyItems = Array.from(byCounty.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count);

      return {
        slug,
        total,
        computedAt,
        stats: [
          { key: "Polling stations (active rows)", value: total.toLocaleString() },
          {
            key: "Election cycle",
            value: "2022 general election snapshot",
          },
        ],
        charts: [
          {
            id: "registration-context",
            type: "bar",
            title: "Registration context by county (from wards)",
            caption:
              "We do not load every polling station into this page. Chart uses ward-level 2022 registration totals as a lightweight geographic view. Download the polling-station export for station-level counts.",
            items: topN(countyItems, 15),
          },
        ],
        notes: [
          "Full station-level data is only via download or the polling stations explorer — keeping this page fast.",
          "Source: IEBC public 2022 materials as compiled in polling_stations_2022.",
        ],
      };
    }

    case "institutions": {
      const { data, count } = await supabase
        .from("institutions")
        .select("name, institution_type, government_level, arm_of_government", {
          count: "exact",
        })
        .eq("is_active", true);

      const rows = (data || []) as Record<string, unknown>[];
      const byArm = countMap(rows, "arm_of_government");
      const byType = countMap(rows, "institution_type");
      const byLevel = countMap(rows, "government_level");

      return {
        slug,
        total: count ?? rows.length,
        computedAt,
        stats: [
          { key: "Institutions", value: String(count ?? rows.length) },
          {
            key: "Arms / categories used",
            value: String(byArm.length),
          },
        ],
        charts: [
          {
            id: "by-arm",
            type: "donut",
            title: "Institutions by arm of government",
            items: topN(byArm, 8),
          },
          {
            id: "by-type",
            type: "bar",
            title: "Institutions by type",
            caption: "Top types in our classification field.",
            items: topN(byType, 12),
          },
          {
            id: "by-level",
            type: "column",
            title: "National vs county level",
            items: byLevel,
          },
        ],
        preview: {
          caption: "Sample institutions",
          headers: ["Name", "Type", "Level", "Arm"],
          rows: rows.slice(0, 10).map((i) => [
            String(i.name || "—"),
            String(i.institution_type || "—"),
            String(i.government_level || "—"),
            String(i.arm_of_government || "—"),
          ]),
        },
      };
    }

    case "leaders": {
      const { data, count } = await supabase
        .from("leaders")
        .select(
          "full_name, title, current_party, current_constituency, current_organization, current_county",
          { count: "exact" },
        );

      const rows = (data || []) as Record<string, unknown>[];
      const byParty = countMap(rows, "current_party");
      const byCounty = countMap(rows, "current_county");

      return {
        slug,
        total: count ?? rows.length,
        computedAt,
        stats: [
          { key: "Leader records", value: String(count ?? rows.length) },
          {
            key: "Parties represented (non-empty)",
            value: String(byParty.filter((p) => p.label !== "Not stated").length),
          },
        ],
        charts: [
          {
            id: "by-party",
            type: "bar",
            title: "Leaders by party (where recorded)",
            items: topN(byParty, 12),
          },
          {
            id: "by-county",
            type: "ranking",
            title: "Leaders by county field (where recorded)",
            caption: "Uses current_county when present — not every role is county-bound.",
            items: topN(
              byCounty.filter((c) => c.label !== "Not stated"),
              12,
            ),
          },
        ],
        preview: {
          caption: "Sample leader records",
          headers: ["Name", "Party", "Constituency", "Organisation"],
          rows: rows.slice(0, 10).map((l) => [
            String(l.full_name || "—"),
            String(l.current_party || "—"),
            String(l.current_constituency || "—"),
            String(l.current_organization || "—"),
          ]),
        },
        notes: [
          "Directory data changes with appointments. Confirm against Gazette and official sites for formal use.",
        ],
      };
    }

    case "political-parties": {
      const { data, count } = await supabase
        .from("political_parties")
        .select("name, abbreviation, status", { count: "exact" });

      const rows = (data || []) as Record<string, unknown>[];
      const byStatus = countMap(rows, "status");

      return {
        slug,
        total: count ?? rows.length,
        computedAt,
        stats: [{ key: "Party records", value: String(count ?? rows.length) }],
        charts: [
          {
            id: "by-status",
            type: "donut",
            title: "Parties by status label",
            items: byStatus,
          },
        ],
        preview: {
          caption: "Sample parties",
          headers: ["Name", "Abbreviation", "Status"],
          rows: rows.slice(0, 12).map((p) => [
            String(p.name || "—"),
            String(p.abbreviation || "—"),
            String(p.status || "—"),
          ]),
        },
        notes: [
          "Not a substitute for the official Registrar of Political Parties register.",
        ],
      };
    }

    case "coalitions": {
      const { data, count } = await supabase
        .from("coalitions")
        .select("name, abbreviation, status, formed_date, leader_name", {
          count: "exact",
        });

      const rows = (data || []) as Record<string, unknown>[];
      const byStatus = countMap(rows, "status");

      return {
        slug,
        total: count ?? rows.length,
        computedAt,
        stats: [{ key: "Coalition records", value: String(count ?? rows.length) }],
        charts: [
          {
            id: "by-status",
            type: "column",
            title: "Coalitions by status",
            items: byStatus,
          },
        ],
        preview: {
          caption: "Coalitions",
          headers: ["Name", "Abbreviation", "Leader", "Status"],
          rows: rows.slice(0, 15).map((c) => [
            String(c.name || "—"),
            String(c.abbreviation || "—"),
            String(c.leader_name || "—"),
            String(c.status || "—"),
          ]),
        },
      };
    }

    case "mcas": {
      const total = await countTable("mcas", false);
      // Try a light column for breakdown — fail soft
      const { data } = await supabase.from("mcas").select("county_name").limit(5000);
      const byCounty = countMap((data || []) as Record<string, unknown>[], "county_name");

      return {
        slug,
        total,
        computedAt,
        stats: [{ key: "MCA records", value: total.toLocaleString() }],
        charts:
          byCounty.length > 0
            ? [
                {
                  id: "by-county",
                  type: "ranking" as const,
                  title: "MCA records by county (sample field)",
                  caption:
                    byCounty.some((c) => c.label === "Not stated") && byCounty.length <= 2
                      ? "County field may be sparse in this table — treat chart as indicative."
                      : "Top counties by count of MCA rows returned.",
                  items: topN(
                    byCounty.filter((c) => c.label !== "Not stated"),
                    15,
                  ),
                },
              ]
            : [],
        notes: [
          "Schema for MCAs may vary; download is not yet a dedicated export — contact us if you need a bulk extract.",
        ],
      };
    }

    case "hansard-sittings": {
      const sanity = createSanityClient({ useCdn: true, token: null });
      let total = 0;
      let byHouse: NamedCount[] = [];
      let byMonth: NamedCount[] = [];
      let recent: { date: string; title: string; house: string; n: number }[] = [];

      try {
        total = await sanity.fetch(
          `count(*[_type == "hansardSitting" && isActive != false])`,
        );
        const houses: string[] = ["national-assembly", "senate", "county-assembly"];
        byHouse = await Promise.all(
          houses.map(async (h) => ({
            label:
              h === "national-assembly"
                ? "National Assembly"
                : h === "senate"
                  ? "Senate"
                  : "County assembly",
            count: await sanity.fetch(
              `count(*[_type == "hansardSitting" && isActive != false && houseType == $h])`,
              { h },
            ),
          })),
        );
        const dateRows: { date: string }[] = await sanity.fetch(
          `*[_type == "hansardSitting" && isActive != false && defined(sittingDate)]{ "date": sittingDate }`,
        );
        const monthMap = new Map<string, number>();
        for (const row of dateRows || []) {
          const d = String(row.date || "").slice(0, 7); // YYYY-MM
          if (!/^\d{4}-\d{2}$/.test(d)) continue;
          monthMap.set(d, (monthMap.get(d) || 0) + 1);
        }
        byMonth = Array.from(monthMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-18)
          .map(([label, count]) => ({ label, count }));

        recent = await sanity.fetch(
          `*[_type == "hansardSitting" && isActive != false] | order(sittingDate desc) [0...8] {
            "date": sittingDate,
            title,
            "house": houseType,
            "n": count(contributions)
          }`,
        );
      } catch {
        /* empty */
      }

      return {
        slug,
        total,
        computedAt,
        stats: [
          { key: "Published sittings", value: String(total) },
        ],
        charts: [
          {
            id: "by-house",
            type: "column",
            title: "Sittings by house",
            items: byHouse.filter((h) => h.count > 0),
          },
          ...(byMonth.length >= 2
            ? [
                {
                  id: "by-month",
                  type: "line" as const,
                  title: "Sittings published over time",
                  caption: "Number of sitting records by month (YYYY-MM), last 18 months with data.",
                  items: byMonth,
                },
              ]
            : []),
        ],
        preview: {
          caption: "Most recent sittings on this site",
          headers: ["Date", "House", "Title", "Contributions"],
          rows: (recent || []).map((r) => [
            r.date || "—",
            r.house || "—",
            r.title || "—",
            r.n != null ? String(r.n) : "—",
          ]),
        },
        notes: [
          "Structured HTML coverage only — official PDFs remain authoritative.",
        ],
      };
    }

    case "epra-fuel-prices": {
      const { data, count } = await supabase
        .from("epra_price_cycles")
        .select("*", { count: "exact" })
        .order("id", { ascending: false })
        .limit(20);

      const rows = data || [];
      // Build a generic preview from whatever columns exist
      const keys = rows[0] ? Object.keys(rows[0]).slice(0, 5) : [];

      return {
        slug,
        total: count ?? rows.length,
        computedAt,
        stats: [
          {
            key: "Price cycle records (sample table)",
            value: String(count ?? rows.length),
          },
        ],
        charts: [],
        preview: {
          caption: "Recent EPRA price cycle rows (fields vary)",
          headers: keys.length ? keys : ["id"],
          rows: rows.slice(0, 8).map((r) =>
            (keys.length ? keys : ["id"]).map((k) => {
              const v = (r as Record<string, unknown>)[k];
              return v == null ? "—" : String(v);
            }),
          ),
        },
        notes: [
          "Confirm tariffs on the official EPRA site before commercial use.",
          "Related tables: epra_town_prices, epra_lpg_prices, epra_nairobi_breakdown (public read).",
        ],
      };
    }

    case "census-indicators": {
      const years = await supabase
        .from("census_years")
        .select("census_year, is_active", { count: "exact" })
        .order("census_year", { ascending: false });

      const eth = await supabase
        .from("knbs_ethnicity_census")
        .select("id", { count: "exact", head: true });
      const rel = await supabase
        .from("knbs_religion_census")
        .select("id", { count: "exact", head: true });

      const yearRows = years.data || [];

      return {
        slug,
        total: years.count ?? yearRows.length,
        computedAt,
        stats: [
          { key: "Census years listed", value: String(years.count ?? yearRows.length) },
          {
            key: "Ethnicity matrix rows",
            value: String(eth.count ?? 0),
          },
          {
            key: "Religion matrix rows",
            value: String(rel.count ?? 0),
          },
        ],
        charts: [
          {
            id: "years",
            type: "line",
            title: "Census years held (active flag)",
            caption: "1 = marked active in our reference table; 0 = listed but inactive.",
            items: [...yearRows]
              .sort((a, b) => Number(a.census_year) - Number(b.census_year))
              .map((y) => ({
                label: String(y.census_year),
                count: y.is_active ? 1 : 0,
              })),
          },
          {
            id: "matrix-sizes",
            type: "column",
            title: "Related matrix row counts",
            items: [
              { label: "Ethnicity matrix", count: eth.count ?? 0 },
              { label: "Religion matrix", count: rel.count ?? 0 },
            ],
          },
        ],
        preview: {
          caption: "Census years",
          headers: ["Year", "Active flag"],
          rows: yearRows.map((y) => [
            String(y.census_year),
            y.is_active ? "Yes" : "No",
          ]),
        },
        notes: [
          "Demographic matrices are sensitive; interpret with KNBS definitions.",
          "This page emphasises transparency of what we hold, not raw bulk dumps of identity data.",
        ],
      };
    }

    default:
      return null;
  }
}
