/**
 * Curated open-data collections (data.gov.uk-style packs).
 */

export type DataCollection = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  /** Dataset slugs from catalogue */
  datasetSlugs: string[];
  featured?: boolean;
  relatedHrefs: { href: string; label: string }[];
};

export const DATA_COLLECTIONS: DataCollection[] = [
  {
    slug: "2022-election-geography",
    title: "2022 election geography",
    shortDescription:
      "Constituencies, wards, polling stations and registration context for the 2022 general election cycle.",
    description:
      "A curated pack of geographic and registration datasets for the 2022 general election. Use it to analyse boundaries, ward-level registration and polling-station coverage. Station-level detail is available as a download; summaries on each dataset page stay lightweight.",
    datasetSlugs: [
      "constituencies",
      "wards",
      "polling-stations",
      "political-parties",
      "coalitions",
    ],
    featured: true,
    relatedHrefs: [
      { href: "/elections", label: "Elections hub" },
      { href: "/elections/polling-stations", label: "Polling stations explorer" },
      { href: "/find-your-representatives", label: "Find your representatives" },
    ],
  },
  {
    slug: "who-runs-government",
    title: "Who runs government",
    shortDescription:
      "Institutions and leaders — structure of the public sector for citizens and researchers.",
    description:
      "Directory-style open data on public institutions and office holders. Designed for navigation and analysis of government structure, not as a substitute for Gazette notices of appointment.",
    datasetSlugs: ["institutions", "leaders", "mcas"],
    featured: true,
    relatedHrefs: [
      { href: "/government", label: "Government" },
      { href: "/government/institutions", label: "Institutions" },
      { href: "/government/people", label: "Officials" },
    ],
  },
  {
    slug: "county-snapshot",
    title: "County snapshot",
    shortDescription:
      "County profiles and devolution geography for all 47 counties.",
    description:
      "County-level open data for devolution research and civic education: names, codes, regions, population figures we hold, and links into county pages on CitizenGuide.",
    datasetSlugs: ["counties", "wards", "mcas"],
    featured: true,
    relatedHrefs: [
      { href: "/government/counties", label: "Counties" },
      { href: "/government/counties/devolution", label: "Devolution" },
    ],
  },
  {
    slug: "parliament-on-this-site",
    title: "Parliament on this site",
    shortDescription:
      "Coverage of structured Hansard sittings we publish as open HTML.",
    description:
      "Transparency dataset about which parliamentary sittings are available as structured contributions on CitizenGuide. Official Hansard PDFs from Parliament remain authoritative.",
    datasetSlugs: ["hansard-sittings"],
    featured: false,
    relatedHrefs: [
      {
        href: "/government/legislature/hansard/national-assembly",
        label: "National Assembly Hansard",
      },
      { href: "/government/legislature", label: "Parliament" },
    ],
  },
  {
    slug: "energy-prices",
    title: "Energy prices (EPRA)",
    shortDescription:
      "Fuel price cycle data used in public energy tools on this site.",
    description:
      "Open republication of EPRA-related price cycle records that power citizen tools. Confirm official tariffs on the EPRA website before commercial decisions.",
    datasetSlugs: ["epra-fuel-prices"],
    featured: false,
    relatedHrefs: [
      { href: "/government/institutions", label: "Institutions" },
    ],
  },
];

export function getCollection(slug: string): DataCollection | undefined {
  return DATA_COLLECTIONS.find((c) => c.slug === slug);
}

export function getAllCollectionSlugs(): string[] {
  return DATA_COLLECTIONS.map((c) => c.slug);
}

export function collectionsForDataset(datasetSlug: string): DataCollection[] {
  return DATA_COLLECTIONS.filter((c) => c.datasetSlugs.includes(datasetSlug));
}
