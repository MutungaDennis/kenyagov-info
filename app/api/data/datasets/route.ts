import { NextResponse } from "next/server";
import { OPEN_DATASETS, getDatasetMetadata } from "@/lib/open-data/catalogue";
import { DATA_COLLECTIONS } from "@/lib/open-data/collections";

export const revalidate = 3600;

export async function GET() {
  const datasets = OPEN_DATASETS.map((d) => {
    const meta = getDatasetMetadata(d);
    return {
      id: d.slug,
      name: d.title,
      description: d.shortDescription,
      theme: d.theme,
      themeLabel: d.themeLabel,
      publisher: d.publisher,
      compiler: d.compiler,
      temporalCoverage: d.temporalCoverage,
      geographicCoverage: d.geographicCoverage,
      updateFrequency: d.updateFrequency,
      licence: d.licence,
      formats: d.formats,
      endpoint: d.exportEndpoint || null,
      page: `/open-data/${d.slug}`,
      sourceSystem: d.sourceSystem,
      table: d.tableName || null,
      sources: d.sources,
      sourceUrls: d.sourceUrls || [],
      hasVisualSummary: d.hasVisualSummary,
      collections: meta.collections,
      qualityNotes: meta.qualityNotes,
    };
  });

  const collections = DATA_COLLECTIONS.map((c) => ({
    id: c.slug,
    name: c.title,
    description: c.shortDescription,
    featured: Boolean(c.featured),
    page: `/open-data/collections/${c.slug}`,
    datasets: c.datasetSlugs,
  }));

  return NextResponse.json(
    {
      name: "CitizenGuide.KE Open Data",
      mission:
        "Find, understand and reuse public information about Kenyan government, elections, counties and services.",
      licence:
        "Reuse permitted with credit — see /open-data/standards. Not a substitute for official statistics.",
      publisher: "CitizenGuide.KE",
      notice:
        "Independent compilation of public information. Private feedback, analytics and account tables are not exposed.",
      pages: {
        home: "/open-data",
        catalogue: "/open-data/datasets",
        portals: "/open-data/portals",
        standards: "/open-data/standards",
        suggest: "/open-data/suggest",
      },
      collections,
      datasets,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
