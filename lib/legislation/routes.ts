import type { LegislationCategory } from "./types";

export function legislationHref(input: {
  category: LegislationCategory;
  slug: string;
  countySlug?: string | null;
}) {
  if (input.category === "act") return `/legislation/acts/${input.slug}`;
  if (input.category === "county_act") {
    if (!input.countySlug) throw new Error("County legislation requires a county slug");
    return `/legislation/counties/${input.countySlug}/${input.slug}`;
  }
  if (input.category === "subsidiary") return `/legislation/subsidiary/${input.slug}`;
  return `/legislation/treaties/${input.slug}`;
}

export function chamberLabel(value?: string | null) {
  if (value === "national_assembly") return "National Assembly";
  if (value === "senate") return "Senate";
  if (value === "county_assembly") return "County Assembly";
  return null;
}
