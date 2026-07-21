/**
 * Kenya geography helpers for historical (pre-devolution) and modern seats.
 */

/** First general election under the 2010 Constitution / county governments */
export const DEVOLUTION_START_DATE = "2013-03-04";

/** The eight former provinces (pre-2010 / pre-county structure) */
export const FORMER_PROVINCES = [
  "Central",
  "Coast",
  "Eastern",
  "Nairobi",
  "North Eastern",
  "Nyanza",
  "Rift Valley",
  "Western",
] as const;

export type FormerProvince = (typeof FORMER_PROVINCES)[number];

/** True when the role term began before county governments took office */
export function isPreDevolutionTerm(termStart?: string | null): boolean {
  if (!termStart) return false;
  const d = String(termStart).slice(0, 10);
  return d.length >= 10 && d < DEVOLUTION_START_DATE;
}

/**
 * Soften geographic requirements for historical national seats.
 * Pre-2013: counties did not exist; province free-text is enough.
 */
export function geographicRequirementsForTerm(
  base: {
    countyRequired: boolean;
    constituencyRequired: boolean;
  },
  termStart?: string | null,
): {
  countyRequired: boolean;
  constituencyRequired: boolean;
  showProvince: boolean;
  preDevolution: boolean;
} {
  const preDevolution = isPreDevolutionTerm(termStart);
  if (!preDevolution) {
    return {
      countyRequired: base.countyRequired,
      constituencyRequired: base.constituencyRequired,
      showProvince: false,
      preDevolution: false,
    };
  }
  return {
    countyRequired: false,
    // Seat identity still useful for elected MPs, but free text / former const OK
    constituencyRequired: base.constituencyRequired,
    showProvince: true,
    preDevolution: true,
  };
}
