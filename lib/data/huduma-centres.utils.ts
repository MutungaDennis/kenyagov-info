// lib/data/huduma-centres.utils.ts
// Helpers — centre rows loaded via loadHudumaCentres() (not embedded in Worker)

import {
  HUDUMA_REGIONS,
  loadHudumaCentres,
  type HudumaCentre,
  type HudumaRegion,
} from "./huduma-centres";

export async function getAllHudumaCentres(): Promise<HudumaCentre[]> {
  const centres = await loadHudumaCentres();
  return [...centres].sort(
    (a, b) =>
      a.region.localeCompare(b.region) ||
      a.county.localeCompare(b.county) ||
      a.name.localeCompare(b.name),
  );
}

export async function countiesWithHuduma(): Promise<string[]> {
  const centres = await loadHudumaCentres();
  return Array.from(new Set(centres.map((c) => c.county))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export async function regionsWithHuduma(): Promise<HudumaRegion[]> {
  const centres = await loadHudumaCentres();
  const present = new Set(centres.map((c) => c.region));
  return HUDUMA_REGIONS.filter((r) => present.has(r));
}

export async function getCentresByRegion(
  region: HudumaRegion,
): Promise<HudumaCentre[]> {
  const all = await getAllHudumaCentres();
  return all.filter((c) => c.region === region);
}

export async function getCentresByCounty(county: string): Promise<HudumaCentre[]> {
  const all = await getAllHudumaCentres();
  return all.filter((c) => c.county.toLowerCase() === county.toLowerCase());
}

export async function getExtendedHoursCentres(): Promise<HudumaCentre[]> {
  const all = await getAllHudumaCentres();
  return all.filter((c) => c.extendedHours);
}

export async function getStandardHoursCentres(): Promise<HudumaCentre[]> {
  const all = await getAllHudumaCentres();
  return all.filter((c) => !c.extendedHours);
}

export function formatHudumaTime(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const suffix = h >= 12 ? "pm" : "am";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return m === "00" ? `${h}:00 ${suffix}` : `${h}:${m} ${suffix}`;
}

export function formatHudumaHours(centre: HudumaCentre): string {
  return `${formatHudumaTime(centre.opens)} to ${formatHudumaTime(centre.closes)}`;
}

export type HudumaFilter = {
  q?: string;
  region?: string;
  county?: string;
  /** "extended" | "standard" | "" */
  hours?: string;
};

export function filterHudumaCentres(
  filters: HudumaFilter = {},
  list: HudumaCentre[],
): HudumaCentre[] {
  const q = filters.q?.trim().toLowerCase() || "";
  const region = filters.region?.trim() || "";
  const county = filters.county?.trim() || "";
  const hours = filters.hours?.trim().toLowerCase() || "";

  return list
    .filter((c) => {
      if (region && c.region !== region) return false;
      if (county && c.county !== county) return false;
      if (hours === "extended" && !c.extendedHours) return false;
      if (hours === "standard" && c.extendedHours) return false;
      if (q) {
        const hay =
          `${c.name} ${c.county} ${c.cityOrTown} ${c.address} ${c.region}`.toLowerCase();
        const tokens = q.split(/\s+/).filter(Boolean);
        if (!tokens.every((t) => hay.includes(t))) return false;
      }
      return true;
    })
    .sort(
      (a, b) =>
        a.region.localeCompare(b.region) ||
        a.county.localeCompare(b.county) ||
        a.name.localeCompare(b.name),
    );
}

export function groupCentresByRegion(
  list: HudumaCentre[],
): { region: HudumaRegion; centres: HudumaCentre[] }[] {
  const map = new Map<HudumaRegion, HudumaCentre[]>();
  for (const c of list) {
    const arr = map.get(c.region) ?? [];
    arr.push(c);
    map.set(c.region, arr);
  }
  const order = HUDUMA_REGIONS.filter((r) => map.has(r));
  return order.map((region) => ({
    region,
    centres: map.get(region)!,
  }));
}

export function groupCentresByCounty(
  list: HudumaCentre[],
): { county: string; centres: HudumaCentre[] }[] {
  const map = new Map<string, HudumaCentre[]>();
  for (const c of list) {
    const arr = map.get(c.county) ?? [];
    arr.push(c);
    map.set(c.county, arr);
  }
  return Array.from(map.keys())
    .sort((a, b) => a.localeCompare(b))
    .map((county) => ({
      county,
      centres: map.get(county)!,
    }));
}

export function regionAnchor(region: string): string {
  return `region-${region.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export function countyAnchor(county: string): string {
  return `county-${county.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export async function hudumaStats() {
  const all = await loadHudumaCentres();
  const counties = Array.from(new Set(all.map((c) => c.county)));
  const regions = new Set(all.map((c) => c.region));
  return {
    total: all.length,
    extended: all.filter((c) => c.extendedHours).length,
    standard: all.filter((c) => !c.extendedHours).length,
    counties: counties.length,
    regions: regions.size,
  };
}
