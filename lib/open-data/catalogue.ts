/**
 * Public open-data catalogue — Kenya-first civic open data.
 * Never includes feedback, page_views, profiles, search logs, or leaders_old.
 */

import { collectionsForDataset } from "@/lib/open-data/collections";

export type DatasetTheme =
  | "geography"
  | "elections"
  | "government"
  | "leadership"
  | "parliament"
  | "energy"
  | "society";

export type OpenDataset = {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  theme: DatasetTheme;
  themeLabel: string;
  /** Original public authority / source class */
  publisher: string;
  /** Who structures and hosts this extract */
  compiler: string;
  sources: string[];
  sourceUrls?: { label: string; href: string }[];
  sourceSystem: "supabase" | "sanity";
  tableName?: string;
  exportEndpoint?: string;
  formats: ("csv" | "json")[];
  temporalCoverage: string;
  geographicCoverage: string;
  updateFrequency: string;
  licence: string;
  relatedHrefs: { href: string; label: string }[];
  fields: { name: string; description: string }[];
  scaleNote?: string;
  hasVisualSummary: boolean;
  qualityNotes?: string[];
};

export const OPEN_DATA_LICENCE =
  "Free to reuse for any purpose with credit to CitizenGuide.KE as compiler and to the original publisher where known. Not an official Government of Kenya statistics release.";

export const OPEN_DATA_MISSION = {
  title: "CitizenGuide Open Data",
  tagline:
    "Find, understand and reuse public information about Kenyan government, elections, counties and services.",
  principle:
    "Publicly useful public information should be findable, understandable and reusable.",
  role: "We are an independent compiler and guide — not KNBS, IEBC or any ministry. Official producers remain the source of truth for formal statistics. Our open-data pages use GDS-inspired structure for clarity; we are not a government open-data portal.",
};

export const DATASET_THEMES: {
  id: DatasetTheme | "all";
  label: string;
  description: string;
}[] = [
  { id: "all", label: "All themes", description: "Every dataset we publish." },
  {
    id: "geography",
    label: "Geography & counties",
    description: "Counties, regions and place-based profiles.",
  },
  {
    id: "elections",
    label: "Elections & democracy",
    description: "Boundaries, registration, parties and polling geography.",
  },
  {
    id: "government",
    label: "Government structure",
    description: "Institutions, arms and levels of government.",
  },
  {
    id: "leadership",
    label: "Leadership",
    description: "Office holders and county assembly members.",
  },
  {
    id: "parliament",
    label: "Parliament",
    description: "Structured Hansard coverage on this site.",
  },
  {
    id: "energy",
    label: "Energy",
    description: "EPRA-related price data used in public tools.",
  },
  {
    id: "society",
    label: "Society & census",
    description: "Census year indicators and related reference tables.",
  },
];

const DEFAULT_COMPILER = "CitizenGuide.KE";

export const OPEN_DATASETS: OpenDataset[] = [
  {
    slug: "counties",
    title: "Counties of Kenya",
    shortDescription:
      "All 47 counties with codes, regions, population, area and leadership names.",
    description:
      "Structured records for Kenya’s 47 county governments. Use this for maps, comparisons and downloads. Figures such as population are compiled from public sources and may lag official revisions.",
    theme: "geography",
    themeLabel: "Geography & counties",
    publisher: "Multiple public sources (CRA, KNBS-based figures, county profiles)",
    compiler: DEFAULT_COMPILER,
    sources: [
      "Commission on Revenue Allocation (CRA) and related public county profiles",
      "Kenya National Bureau of Statistics (census-based population where cited)",
      "Public records of county leadership",
    ],
    sourceUrls: [
      { label: "KNBS", href: "https://www.knbs.or.ke/" },
      { label: "CRA", href: "https://www.crakenya.org/" },
    ],
    sourceSystem: "supabase",
    tableName: "counties",
    exportEndpoint: "/api/data/exports/counties",
    formats: ["csv", "json"],
    temporalCoverage: "Ongoing snapshot (fields vary by last compile)",
    geographicCoverage: "National — 47 counties",
    updateFrequency: "Updated when we refresh county records",
    licence: OPEN_DATA_LICENCE,
    relatedHrefs: [
      { href: "/government/counties", label: "County governments" },
      { href: "/government/counties/devolution", label: "Devolution" },
    ],
    fields: [
      { name: "code", description: "Official county code" },
      { name: "name", description: "County name" },
      { name: "region", description: "Broader region label" },
      { name: "headquarters", description: "County headquarters" },
      { name: "population", description: "Population figure held in our database" },
      { name: "area_km2", description: "Area in square kilometres" },
      { name: "governor_name", description: "Governor name (where recorded)" },
      { name: "senator_name", description: "Senator name (where recorded)" },
    ],
    scaleNote: "47 rows",
    hasVisualSummary: true,
    qualityNotes: [
      "Population and socio-economic fields may not match the latest KNBS release.",
    ],
  },
  {
    slug: "constituencies",
    title: "Constituencies",
    shortDescription:
      "National Assembly constituencies with county links and 2022 registered voters.",
    description:
      "Constituency-level geography used for National Assembly representation. Includes codes, county linkage, area and 2022 registered voter figures where available.",
    theme: "elections",
    themeLabel: "Elections & democracy",
    publisher: "Independent Electoral and Boundaries Commission (IEBC) — public materials",
    compiler: DEFAULT_COMPILER,
    sources: [
      "Independent Electoral and Boundaries Commission (IEBC)",
      "Public boundary and registration publications",
    ],
    sourceUrls: [{ label: "IEBC", href: "https://www.iebc.or.ke/" }],
    sourceSystem: "supabase",
    tableName: "constituencies",
    formats: [],
    temporalCoverage: "Primarily 2022 registration context",
    geographicCoverage: "National — constituencies",
    updateFrequency: "Updated when boundary or registration data is refreshed",
    licence: OPEN_DATA_LICENCE,
    relatedHrefs: [
      { href: "/elections", label: "Elections" },
      { href: "/find-your-representatives", label: "Find your representatives" },
    ],
    fields: [
      { name: "constituency_code", description: "Constituency code" },
      { name: "name", description: "Constituency name" },
      { name: "county_code", description: "Parent county code" },
      { name: "registered_voters_2022", description: "Registered voters (2022)" },
      { name: "number_of_wards", description: "Number of wards" },
      { name: "population_2019", description: "Population (2019 figure where held)" },
    ],
    scaleNote: "About 290 rows",
    hasVisualSummary: true,
  },
  {
    slug: "wards",
    title: "Wards",
    shortDescription:
      "Wards linked to constituencies and counties, with 2022 voter registration.",
    description:
      "Ward-level units used in county assembly representation and IEBC registration. Downloads can be filtered by county or constituency on the export API.",
    theme: "elections",
    themeLabel: "Elections & democracy",
    publisher: "Independent Electoral and Boundaries Commission (IEBC) — public materials",
    compiler: DEFAULT_COMPILER,
    sources: ["Independent Electoral and Boundaries Commission (IEBC)"],
    sourceUrls: [{ label: "IEBC", href: "https://www.iebc.or.ke/" }],
    sourceSystem: "supabase",
    tableName: "wards",
    exportEndpoint: "/api/data/exports/wards",
    formats: ["csv", "json"],
    temporalCoverage: "2022 registration figures where present",
    geographicCoverage: "National — wards",
    updateFrequency: "Updated when ward records are refreshed",
    licence: OPEN_DATA_LICENCE,
    relatedHrefs: [
      { href: "/government/counties/wards", label: "Wards directory" },
      { href: "/elections", label: "Elections" },
    ],
    fields: [
      { name: "ward_code", description: "Official ward code" },
      { name: "name", description: "Ward name" },
      { name: "constituency_name", description: "Parent constituency" },
      { name: "county_name", description: "Parent county" },
      { name: "registered_voters_2022", description: "Registered voters (2022)" },
    ],
    scaleNote: "About 1,450 rows",
    hasVisualSummary: true,
  },
  {
    slug: "polling-stations",
    title: "Polling stations (IEBC 2022)",
    shortDescription:
      "2022 general election polling stations with codes, locations and registered voters.",
    description:
      "Snapshot of polling stations for the 2022 general election cycle. This is a large table: the public page only shows lightweight totals. Download the full file for station-level research.",
    theme: "elections",
    themeLabel: "Elections & democracy",
    publisher: "Independent Electoral and Boundaries Commission (IEBC)",
    compiler: DEFAULT_COMPILER,
    sources: ["Independent Electoral and Boundaries Commission (IEBC)"],
    sourceUrls: [{ label: "IEBC", href: "https://www.iebc.or.ke/" }],
    sourceSystem: "supabase",
    tableName: "polling_stations_2022",
    exportEndpoint: "/api/data/exports/polling-stations",
    formats: ["csv", "json"],
    temporalCoverage: "2022 general election snapshot",
    geographicCoverage: "National — polling stations",
    updateFrequency: "Static snapshot unless we import a new electoral cycle",
    licence: OPEN_DATA_LICENCE,
    relatedHrefs: [
      { href: "/elections/polling-stations", label: "Polling stations explorer" },
      { href: "/elections", label: "Elections" },
    ],
    fields: [
      { name: "code / name", description: "Station identifiers" },
      { name: "ward / county linkage", description: "Location hierarchy" },
      { name: "registered voters", description: "Registration figures for 2022" },
    ],
    scaleNote: "Tens of thousands of rows — download only for full detail",
    hasVisualSummary: true,
    qualityNotes: [
      "HTML pages never load the full station table — only counts and light geographic context.",
    ],
  },
  {
    slug: "institutions",
    title: "Government institutions",
    shortDescription:
      "Ministries, agencies and bodies with type, level and arm of government.",
    description:
      "Directory-style records of public institutions compiled for citizen navigation. Classification fields support filtering and charts without loading document attachments.",
    theme: "government",
    themeLabel: "Government structure",
    publisher: "Multiple public sources (Gazette, official websites)",
    compiler: DEFAULT_COMPILER,
    sources: [
      "Kenya Gazette and official appointments",
      "Official institutional websites",
    ],
    sourceUrls: [{ label: "Kenya Law", href: "https://www.kenyalaw.org/" }],
    sourceSystem: "supabase",
    tableName: "institutions",
    exportEndpoint: "/api/data/exports/institutions",
    formats: ["csv", "json"],
    temporalCoverage: "Ongoing directory snapshot",
    geographicCoverage: "National and county institutions where recorded",
    updateFrequency: "Updated when institutional records change",
    licence: OPEN_DATA_LICENCE,
    relatedHrefs: [
      { href: "/government/institutions", label: "Institutions hub" },
      { href: "/government", label: "Government" },
    ],
    fields: [
      { name: "name", description: "Official name" },
      { name: "short_name", description: "Abbreviation" },
      { name: "institution_type", description: "Type (ministry, commission, etc.)" },
      { name: "government_level", description: "National or county" },
      { name: "arm_of_government", description: "Executive, Legislature, Judiciary, Independent, etc." },
    ],
    scaleNote: "Hundreds of rows",
    hasVisualSummary: true,
  },
  {
    slug: "leaders",
    title: "Leaders and office holders",
    shortDescription:
      "Current leaders linked to roles, parties and constituencies where recorded.",
    description:
      "Compiled list of public office holders used across CitizenGuide (including Hansard speaker matching). Treat as a living directory: appointments change; verify against official sources for legal use.",
    theme: "leadership",
    themeLabel: "Leadership",
    publisher: "Multiple public sources (Gazette, Parliament, counties)",
    compiler: DEFAULT_COMPILER,
    sources: [
      "Kenya Gazette and official announcements",
      "Parliamentary and county public records",
    ],
    sourceSystem: "supabase",
    tableName: "leaders",
    exportEndpoint: "/api/data/exports/leaders",
    formats: ["csv", "json"],
    temporalCoverage: "Ongoing — current office holders as held",
    geographicCoverage: "National and county roles where recorded",
    updateFrequency: "Updated when leadership records are edited",
    licence: OPEN_DATA_LICENCE,
    relatedHrefs: [
      { href: "/government/people", label: "Government officials" },
      { href: "/find-your-representatives", label: "Find your representatives" },
    ],
    fields: [
      { name: "full_name", description: "Person’s name" },
      { name: "title", description: "Honorific or office title" },
      { name: "current_party", description: "Party where recorded" },
      { name: "current_constituency", description: "Constituency where recorded" },
      { name: "current_organization", description: "Organisation or role context" },
    ],
    scaleNote: "Hundreds to thousands of rows",
    hasVisualSummary: true,
    qualityNotes: [
      "Not a substitute for Kenya Gazette notices of appointment.",
    ],
  },
  {
    slug: "political-parties",
    title: "Political parties",
    shortDescription: "Political parties held in our elections data.",
    description:
      "Party records used on elections pages. Not a substitute for the Registrar of Political Parties’ official register.",
    theme: "elections",
    themeLabel: "Elections & democracy",
    publisher: "Public party registration information (ORPP and related)",
    compiler: DEFAULT_COMPILER,
    sources: [
      "Office of the Registrar of Political Parties (public information)",
      "IEBC and party public materials",
    ],
    sourceUrls: [{ label: "ORPP", href: "https://www.orpp.or.ke/" }],
    sourceSystem: "supabase",
    tableName: "political_parties",
    formats: [],
    temporalCoverage: "Ongoing directory snapshot",
    geographicCoverage: "National",
    updateFrequency: "Updated when party records change",
    licence: OPEN_DATA_LICENCE,
    relatedHrefs: [
      { href: "/elections/political-parties", label: "Political parties" },
      { href: "/elections/coalitions", label: "Coalitions" },
    ],
    fields: [
      { name: "name", description: "Party name" },
      { name: "abbreviation", description: "Short name" },
      { name: "status", description: "Status label where held" },
    ],
    scaleNote: "Dozens to low hundreds of rows",
    hasVisualSummary: true,
  },
  {
    slug: "coalitions",
    title: "Political coalitions",
    shortDescription: "Named coalitions and alliances with formation metadata.",
    description:
      "Coalition records for context on elections and government formation. Check official notices for precision on dates and membership.",
    theme: "elections",
    themeLabel: "Elections & democracy",
    publisher: "Public announcements and secondary public records",
    compiler: DEFAULT_COMPILER,
    sources: ["Public party and coalition announcements", "Media and Gazette notices"],
    sourceSystem: "supabase",
    tableName: "coalitions",
    formats: [],
    temporalCoverage: "Historical and current coalitions as held",
    geographicCoverage: "National",
    updateFrequency: "Updated when coalition records change",
    licence: OPEN_DATA_LICENCE,
    relatedHrefs: [
      { href: "/elections/coalitions", label: "Coalitions" },
      { href: "/elections", label: "Elections" },
    ],
    fields: [
      { name: "name", description: "Coalition name" },
      { name: "abbreviation", description: "Short name" },
      { name: "formed_date", description: "Formation date where known" },
      { name: "status", description: "Status label" },
      { name: "leader_name", description: "Named leader where recorded" },
    ],
    scaleNote: "Small table",
    hasVisualSummary: true,
  },
  {
    slug: "mcas",
    title: "Members of County Assemblies (MCAs)",
    shortDescription: "County assembly members held for ward-level representation.",
    description:
      "MCA records supporting ward and county pages. Completeness varies by county.",
    theme: "leadership",
    themeLabel: "Leadership",
    publisher: "County assemblies and public election outcomes",
    compiler: DEFAULT_COMPILER,
    sources: ["County assembly public lists", "IEBC election outcomes (public)"],
    sourceSystem: "supabase",
    tableName: "mcas",
    formats: [],
    temporalCoverage: "Post-election terms as held",
    geographicCoverage: "County assemblies",
    updateFrequency: "Updated when MCA records are maintained",
    licence: OPEN_DATA_LICENCE,
    relatedHrefs: [
      { href: "/government/counties", label: "Counties" },
      { href: "/find-your-representatives", label: "Find your representatives" },
    ],
    fields: [
      { name: "name / ward / county fields", description: "As stored for public directory use" },
    ],
    scaleNote: "Thousands of rows possible",
    hasVisualSummary: true,
  },
  {
    slug: "hansard-sittings",
    title: "Hansard sittings (structured)",
    shortDescription:
      "Counts of structured National Assembly and Senate sittings published on this site.",
    description:
      "Metadata about Hansard sitting pages we publish, not the full official PDF archive. Use for transparency on coverage.",
    theme: "parliament",
    themeLabel: "Parliament",
    publisher: "Parliament of Kenya (source Hansard); structured by CitizenGuide",
    compiler: DEFAULT_COMPILER,
    sources: [
      "CitizenGuide structured Hansard (compiled from public Hansard text)",
      "Parliament of Kenya official Hansard for authoritative PDFs",
    ],
    sourceUrls: [
      { label: "Parliament of Kenya", href: "http://www.parliament.go.ke/" },
    ],
    sourceSystem: "sanity",
    formats: [],
    temporalCoverage: "Sittings published on this site (growing archive)",
    geographicCoverage: "National Parliament (and county assembly if published)",
    updateFrequency: "Grows when new sittings are published",
    licence: OPEN_DATA_LICENCE,
    relatedHrefs: [
      {
        href: "/government/legislature/hansard/national-assembly",
        label: "National Assembly Hansard",
      },
      { href: "/government/legislature/hansard/senate", label: "Senate Hansard" },
    ],
    fields: [
      { name: "houseType", description: "national-assembly | senate | county-assembly" },
      { name: "sittingDate", description: "Date of sitting" },
      { name: "contributionCount", description: "Number of structured contributions" },
    ],
    scaleNote: "Grows with each published sitting",
    hasVisualSummary: true,
    qualityNotes: [
      "Official Hansard PDFs remain authoritative for legal citation.",
    ],
  },
  {
    slug: "epra-fuel-prices",
    title: "EPRA fuel price cycles",
    shortDescription:
      "Published fuel price cycle records used by our energy tools.",
    description:
      "Price-cycle metadata powering citizen tools. Confirm tariffs on the EPRA site before commercial use.",
    theme: "energy",
    themeLabel: "Energy",
    publisher: "Energy and Petroleum Regulatory Authority (EPRA)",
    compiler: DEFAULT_COMPILER,
    sources: ["Energy and Petroleum Regulatory Authority (EPRA) public notices"],
    sourceUrls: [{ label: "EPRA", href: "https://www.epra.go.ke/" }],
    sourceSystem: "supabase",
    tableName: "epra_price_cycles",
    formats: [],
    temporalCoverage: "Price cycles held in our tools database",
    geographicCoverage: "National (regulated pump prices)",
    updateFrequency: "Aligned with EPRA cycle publications we ingest",
    licence: OPEN_DATA_LICENCE,
    relatedHrefs: [{ href: "/government/institutions", label: "Institutions" }],
    fields: [
      { name: "cycle fields", description: "As published for price periods" },
    ],
    scaleNote: "Small time-series tables",
    hasVisualSummary: true,
  },
  {
    slug: "census-indicators",
    title: "Census year indicators (KNBS-derived)",
    shortDescription:
      "Census year list and related matrices we hold for reference tools.",
    description:
      "Selected census-related tables for public reference. Demographic data can be sensitive; interpret with KNBS methodology.",
    theme: "society",
    themeLabel: "Society & census",
    publisher: "Kenya National Bureau of Statistics (KNBS)",
    compiler: DEFAULT_COMPILER,
    sources: ["Kenya National Bureau of Statistics (KNBS) public census products"],
    sourceUrls: [{ label: "KNBS", href: "https://www.knbs.or.ke/" }],
    sourceSystem: "supabase",
    tableName: "census_years",
    formats: [],
    temporalCoverage: "Census years listed in our database",
    geographicCoverage: "National",
    updateFrequency: "When census reference tables are updated",
    licence: OPEN_DATA_LICENCE,
    relatedHrefs: [
      { href: "/society-and-culture", label: "Society and culture" },
    ],
    fields: [
      { name: "census_year", description: "Census year" },
      { name: "related matrices", description: "Ethnicity and religion tables (public read)" },
    ],
    scaleNote: "Small dimension tables + matrices",
    hasVisualSummary: true,
    qualityNotes: [
      "We emphasise transparency of holdings, not bulk identity microdata dumps.",
    ],
  },
];

export function getDataset(slug: string): OpenDataset | undefined {
  return OPEN_DATASETS.find((d) => d.slug === slug);
}

export function getAllDatasetSlugs(): string[] {
  return OPEN_DATASETS.map((d) => d.slug);
}

export function getDatasetsByTheme(theme: DatasetTheme | "all"): OpenDataset[] {
  if (theme === "all") return OPEN_DATASETS;
  return OPEN_DATASETS.filter((d) => d.theme === theme);
}

export function themeLabel(theme: DatasetTheme | "all"): string {
  return DATASET_THEMES.find((t) => t.id === theme)?.label || theme;
}

export function searchDatasets(query: string): OpenDataset[] {
  const q = query.trim().toLowerCase();
  if (!q) return OPEN_DATASETS;
  return OPEN_DATASETS.filter(
    (d) =>
      d.title.toLowerCase().includes(q) ||
      d.shortDescription.toLowerCase().includes(q) ||
      d.publisher.toLowerCase().includes(q) ||
      d.themeLabel.toLowerCase().includes(q) ||
      d.tableName?.toLowerCase().includes(q),
  );
}

/** Metadata block for dataset pages and API */
export function getDatasetMetadata(ds: OpenDataset) {
  const collections = collectionsForDataset(ds.slug).map((c) => ({
    slug: c.slug,
    title: c.title,
    href: `/open-data/collections/${c.slug}`,
  }));
  return {
    publisher: ds.publisher,
    compiler: ds.compiler,
    temporalCoverage: ds.temporalCoverage,
    geographicCoverage: ds.geographicCoverage,
    updateFrequency: ds.updateFrequency,
    licence: ds.licence,
    formats: ds.formats,
    sourceSystem: ds.sourceSystem,
    tableName: ds.tableName || null,
    collections,
    sourceUrls: ds.sourceUrls || [],
    qualityNotes: ds.qualityNotes || [],
  };
}
