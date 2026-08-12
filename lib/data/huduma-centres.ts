/**
 * Huduma Service Centres — types + small constants.
 * Centre rows: public/data/huduma-centres.json (not embedded in Worker).
 */

import { loadStaticJson } from "@/lib/data/load-static-json";

export type HudumaRegion =
  | "North Rift"
  | "Western"
  | "Central & South Rift"
  | "Eastern"
  | "Nairobi and Central"
  | "Northern"
  | "Coast"
  | "Central";

export type HudumaCentre = {
  id: string;
  name: string;
  region: HudumaRegion;
  county: string;
  address: string;
  cityOrTown: string;
  opens: string;
  closes: string;
  extendedHours: boolean;
};

export const HUDUMA_SOURCE = {
  url: "https://hudumakenya.go.ke/centers",
  label: "Huduma Kenya centres list",
  siteUrl: "https://hudumakenya.go.ke",
  siteLabel: "Huduma Kenya",
} as const;

export const HUDUMA_REGIONS: HudumaRegion[] = [
  "Nairobi and Central",
  "Central",
  "Central & South Rift",
  "North Rift",
  "Western",
  "Eastern",
  "Coast",
  "Northern",
];

type Bundle = {
  source?: typeof HUDUMA_SOURCE;
  regions?: HudumaRegion[];
  centres: HudumaCentre[];
};

let centresCache: HudumaCentre[] | null = null;

export async function loadHudumaCentres(): Promise<HudumaCentre[]> {
  if (centresCache) return centresCache;
  const data = await loadStaticJson<Bundle>("data/huduma-centres.json");
  centresCache = data.centres ?? [];
  return centresCache;
}

/** Empty at module init — use loadHudumaCentres(). */
export const hudumaCentres: HudumaCentre[] = [];
