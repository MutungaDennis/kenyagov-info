/**
 * External open-data portals — Kenya-first, then Africa, then global.
 * Discovery links only; we do not host their content.
 */

export type PortalRegion = "kenya" | "africa" | "global" | "standards";

export type ExternalPortal = {
  name: string;
  href: string;
  region: PortalRegion;
  description: string;
};

export const PORTAL_REGIONS: {
  id: PortalRegion;
  title: string;
  intro: string;
}[] = [
  {
    id: "kenya",
    title: "Kenya — official and public sources",
    intro:
      "Start here for authoritative Kenyan statistics and government data. Always prefer the original publisher for formal citation.",
  },
  {
    id: "africa",
    title: "Africa — regional and research",
    intro:
      "Continental and country portals useful for comparison and research context.",
  },
  {
    id: "global",
    title: "Global open-data platforms",
    intro:
      "International catalogues and research hubs. Useful for methodology and cross-country work.",
  },
  {
    id: "standards",
    title: "Standards and guidance",
    intro:
      "How open data should be published and reused. We use these as quality references, not as membership badges.",
  },
];

export const EXTERNAL_PORTALS: ExternalPortal[] = [
  // Kenya
  {
    name: "Kenya National Bureau of Statistics (KNBS)",
    href: "https://www.knbs.or.ke/",
    region: "kenya",
    description: "Official national statistics producer — census, economy, social indicators.",
  },
  {
    name: "Kenya Open Data (historical / government open data)",
    href: "https://www.opendata.go.ke/",
    region: "kenya",
    description:
      "Government open-data initiative portal. Availability of datasets can change — verify current content on the site.",
  },
  {
    name: "Independent Electoral and Boundaries Commission (IEBC)",
    href: "https://www.iebc.or.ke/",
    region: "kenya",
    description: "Elections, boundaries, registration and official electoral publications.",
  },
  {
    name: "The National Treasury",
    href: "https://www.treasury.go.ke/",
    region: "kenya",
    description: "Public finance, budget documents and related economic publications.",
  },
  {
    name: "Commission on Revenue Allocation (CRA)",
    href: "https://www.crakenya.org/",
    region: "kenya",
    description: "Revenue sharing, county resources and related devolution data.",
  },
  {
    name: "Energy and Petroleum Regulatory Authority (EPRA)",
    href: "https://www.epra.go.ke/",
    region: "kenya",
    description: "Fuel and energy regulatory notices and price publications.",
  },
  {
    name: "Parliament of Kenya",
    href: "http://www.parliament.go.ke/",
    region: "kenya",
    description: "Hansard, bills and parliamentary publications (authoritative PDFs).",
  },
  {
    name: "Kenya Law / National Council for Law Reporting",
    href: "https://www.kenyalaw.org/",
    region: "kenya",
    description: "Laws, Gazette notices and legal information.",
  },
  {
    name: "Office of the Registrar of Political Parties",
    href: "https://www.orpp.or.ke/",
    region: "kenya",
    description: "Official political party registration information.",
  },
  {
    name: "eCitizen",
    href: "https://www.ecitizen.go.ke/",
    region: "kenya",
    description:
      "Government service portal (transactions). Not a bulk open-data catalogue — use for services, not downloads.",
  },

  // Africa
  {
    name: "openAFRICA",
    href: "https://africaopendata.org/",
    region: "africa",
    description: "Continental open-data repository for African datasets.",
  },
  {
    name: "Afrobarometer",
    href: "https://www.afrobarometer.org/",
    region: "africa",
    description: "Public attitude surveys across African countries.",
  },
  {
    name: "Ghana Open Data Portal",
    href: "https://data.gov.gh/",
    region: "africa",
    description: "National open-data portal (Ghana).",
  },
  {
    name: "South Africa Open Data / data.gov.za",
    href: "https://www.data.gov.za/",
    region: "africa",
    description: "South African government open-data catalogue.",
  },
  {
    name: "Humanitarian Data Exchange (HDX) — Africa",
    href: "https://data.humdata.org/",
    region: "africa",
    description: "Humanitarian and development datasets, including Kenya crises and baselines.",
  },

  // Global
  {
    name: "data.gov.uk",
    href: "https://www.data.gov.uk/",
    region: "global",
    description: "UK public-sector open data (inspiration for catalogue design).",
  },
  {
    name: "data.europa.eu",
    href: "https://data.europa.eu/",
    region: "global",
    description: "European data portal aggregating EU and member-state catalogues.",
  },
  {
    name: "data.gov (United States)",
    href: "https://data.gov/",
    region: "global",
    description: "US federal open-data catalogue.",
  },
  {
    name: "World Bank Open Data",
    href: "https://data.worldbank.org/",
    region: "global",
    description: "International development indicators, including Kenya series.",
  },
  {
    name: "Google Dataset Search",
    href: "https://datasetsearch.research.google.com/",
    region: "global",
    description: "Search engine for datasets across the web.",
  },
  {
    name: "Humanitarian Data Exchange (HDX)",
    href: "https://data.humdata.org/",
    region: "global",
    description: "Global humanitarian open data.",
  },
  {
    name: "OpenStreetMap",
    href: "https://www.openstreetmap.org/",
    region: "global",
    description: "Collaborative geographic data (map features, not government stats).",
  },
  {
    name: "CKAN",
    href: "https://ckan.org/",
    region: "global",
    description: "Open-source data portal software used by many governments.",
  },
  {
    name: "Gapminder",
    href: "https://www.gapminder.org/data/",
    region: "global",
    description: "Global development statistics for teaching and exploration.",
  },
  {
    name: "Demographic and Health Surveys (DHS)",
    href: "https://dhsprogram.com/",
    region: "global",
    description: "Health and demographic survey programme data.",
  },
  {
    name: "Office for National Statistics (UK ONS)",
    href: "https://www.ons.gov.uk/",
    region: "global",
    description: "UK official statistics — reference for quality standards, not Kenya figures.",
  },
  {
    name: "House of Commons Library (UK)",
    href: "https://commonslibrary.parliament.uk/",
    region: "global",
    description: "Research briefings that explain data — model for plain-language data notes.",
  },

  // Standards
  {
    name: "Open Data Institute — Open Data Maturity Model",
    href: "https://theodi.org/",
    region: "standards",
    description: "Framework for assessing open-data practice in organisations.",
  },
  {
    name: "Open Government Licence (UK) — reference",
    href: "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/",
    region: "standards",
    description: "Widely cited open licence model for public-sector information.",
  },
  {
    name: "Five Stars of Open Data (Berners-Lee)",
    href: "https://5stardata.info/",
    region: "standards",
    description: "Simple ladder for open-data quality (from PDF to linked data).",
  },
  {
    name: "DCAT — Data Catalog Vocabulary",
    href: "https://www.w3.org/TR/vocab-dcat-3/",
    region: "standards",
    description: "W3C standard for interoperable data catalogues.",
  },
];

export function portalsByRegion(region: PortalRegion): ExternalPortal[] {
  return EXTERNAL_PORTALS.filter((p) => p.region === region);
}
