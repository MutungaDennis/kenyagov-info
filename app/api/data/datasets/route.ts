import { NextResponse } from "next/server";

export async function GET() {
  const datasets = [
    {
      id: "counties",
      name: "Counties of Kenya",
      description: "Names, codes, regions, headquarters, population and area for all 47 counties.",
      formats: ["csv", "json"],
      endpoint: "/api/data/exports/counties",
      updated: new Date().toISOString().slice(0, 10),
    },
    {
      id: "wards",
      name: "Wards, Constituencies and Counties",
      description: "Complete mapping of all wards to constituencies and counties with 2022 voter numbers.",
      formats: ["csv", "json"],
      endpoint: "/api/data/exports/wards",
      updated: new Date().toISOString().slice(0, 10),
    },
    {
      id: "institutions",
      name: "Government Institutions and Agencies",
      description: "National and county institutions, ministries and agencies.",
      formats: ["csv", "json"],
      endpoint: "/api/data/exports/institutions",
      updated: new Date().toISOString().slice(0, 10),
    },
    {
      id: "leaders",
      name: "National and County Leaders",
      description: "Key leaders with roles and organizations.",
      formats: ["csv", "json"],
      endpoint: "/api/data/exports/leaders",
      updated: new Date().toISOString().slice(0, 10),
    },
    {
      id: "polling-stations",
      name: "Polling Stations (IEBC 2022)",
      description: "Official polling station data with codes and voter numbers.",
      formats: ["csv", "json"],
      endpoint: "/api/data/exports/polling-stations",
      updated: new Date().toISOString().slice(0, 10),
    },
  ];

  return NextResponse.json({
    licence: "Open Government Licence v3.0 (adapted)",
    source: "CitizenGuide.KE – aggregated from public records",
    datasets,
  });
}
