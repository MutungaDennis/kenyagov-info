// lib/data/huduma-centres.utils.ts
// Pure helpers — concurrent-safe (no I/O, no shared mutable state)

import {
  HUDUMA_REGIONS,
  hudumaCentres,
  type HudumaCentre,
  type HudumaRegion,
} from "./huduma-centres";

export function getAllHudumaCentres(): HudumaCentre[] {
  return [...hudumaCentres].sort(
    (a, b) =>
      a.region.localeCompare(b.region) ||
      a.county.localeCompare(b.county) ||
      a.name.localeCompare(b.name),
  );
}

export function countiesWithHuduma(): string[] {
  return Array.from(new Set(hudumaCentres.map((c) => c.county))).sort((a, b) =>
    a.localeCompare(b),
  );
}

export function regionsWithHuduma(): HudumaRegion[] {
  const present = new Set(hudumaCentres.map((c) => c.region));
  return HUDUMA_REGIONS.filter((r) => present.has(r));
}

export function getCentresByRegion(region: HudumaRegion): HudumaCentre[] {
  return getAllHudumaCentres().filter((c) => c.region === region);
}

export function getCentresByCounty(county: string): HudumaCentre[] {
  return getAllHudumaCentres().filter(
    (c) => c.county.toLowerCase() === county.toLowerCase(),
  );
}

export function getExtendedHoursCentres(): HudumaCentre[] {
  return getAllHudumaCentres().filter((c) => c.extendedHours);
}

export function getStandardHoursCentres(): HudumaCentre[] {
  return getAllHudumaCentres().filter((c) => !c.extendedHours);
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
  list: HudumaCentre[] = hudumaCentres,
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
        const hay = `${c.name} ${c.county} ${c.cityOrTown} ${c.address} ${c.region}`.toLowerCase();
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
  return regionsWithHuduma()
    .filter((r) => map.has(r))
    .map((region) => ({
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

export function hudumaStats() {
  const all = hudumaCentres;
  return {
    total: all.length,
    extended: all.filter((c) => c.extendedHours).length,
    standard: all.filter((c) => !c.extendedHours).length,
    counties: countiesWithHuduma().length,
    regions: regionsWithHuduma().length,
  };
}
