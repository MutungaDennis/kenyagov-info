/**
 * Which reference fields apply to a given government position.
 * Non-political offices hide party; geographic seats show county/constituency/ward.
 */

export type RoleFieldVisibility = {
  showParty: boolean;
  showConstituency: boolean;
  showCounty: boolean;
  showWard: boolean;
  showOrganization: boolean;
  showLevel: boolean;
  /** Nominated Senator / nominated NA — special interest category (like MCA nomination_category) */
  showNominationCategory: boolean;
  partyRequired: boolean;
  constituencyRequired: boolean;
  countyRequired: boolean;
  organizationRequired: boolean;
  nominationCategoryRequired: boolean;
};

const DEFAULT: RoleFieldVisibility = {
  showParty: true,
  showConstituency: false,
  showCounty: true,
  showWard: false,
  showOrganization: true,
  showLevel: true,
  showNominationCategory: false,
  partyRequired: false,
  constituencyRequired: false,
  countyRequired: false,
  organizationRequired: false,
  nominationCategoryRequired: false,
};

/** Special interest options for nominated Senators (aligned with MCA categories + workers) */
export const SENATE_NOMINATION_CATEGORIES = [
  "Gender Top-up",
  "PWD",
  "Youth",
  "Marginalized",
  "Workers",
  "Other",
] as const;

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Infer field visibility from position title or code (e.g. "Member of Parliament", "MP", "CABINET_SECRETARY").
 * Optional seatOrEntry: "Nominated" / "Elected" etc. so "Senator" + Nominated does not require a county.
 */
export function fieldsForPosition(
  titleOrCode?: string | null,
  seatOrEntry?: string | null,
): RoleFieldVisibility {
  if (!titleOrCode?.trim()) return { ...DEFAULT };

  const t = norm(titleOrCode);
  const seat = norm(seatOrEntry || "");
  const markedNominated =
    seat.includes("nominat") || t.includes("nominated");

  // Judiciary / technocratic — no party
  if (
    /\b(judge|justice|magistrate|chief justice|deputy chief justice|attorney general|solicitor|auditor general|controller of budget|principal secretary|ps\b|commissioner|commission chair|director of public|dpp)\b/.test(
      t,
    )
  ) {
    return {
      ...DEFAULT,
      showParty: false,
      showConstituency: false,
      showCounty: false,
      showWard: false,
      showOrganization: true,
      organizationRequired: true,
      partyRequired: false,
    };
  }

  // Cabinet / ministry
  if (
    /\b(cabinet secretary|cs\b|prime cabinet|minister)\b/.test(t) ||
    t.includes("cabinet_secretary") ||
    t === "pm cs"
  ) {
    return {
      ...DEFAULT,
      showParty: true,
      partyRequired: false,
      showConstituency: false,
      showCounty: false,
      showWard: false,
      showOrganization: true,
      organizationRequired: true,
    };
  }

  // MP / National Assembly seat
  if (
    /\b(member of parliament|member of the national assembly|\bmp\b|nominated mp)\b/.test(
      t,
    ) ||
    t === "mp" ||
    t === "nominated_mp"
  ) {
    const nominated = markedNominated;
    return {
      ...DEFAULT,
      showParty: true,
      partyRequired: true,
      showConstituency: !nominated,
      constituencyRequired: !nominated,
      showCounty: !nominated,
      countyRequired: false,
      showWard: false,
      showOrganization: true,
      organizationRequired: false,
      showNominationCategory: nominated,
      nominationCategoryRequired: nominated,
    };
  }

  // Women representative (county seat)
  if (/\bwomen\b/.test(t) && /\brep/.test(t)) {
    return {
      ...DEFAULT,
      showParty: true,
      partyRequired: true,
      showConstituency: false,
      showCounty: true,
      countyRequired: true,
      showWard: false,
      showOrganization: true,
    };
  }

  // Senator — elected represent a county; nominated represent special interests (no county)
  if (/\bsenator\b/.test(t) || t === "senator") {
    const nominated = markedNominated;
    return {
      ...DEFAULT,
      showParty: true,
      partyRequired: true,
      showConstituency: false,
      showCounty: !nominated,
      countyRequired: !nominated,
      showWard: false,
      showOrganization: true,
      showNominationCategory: nominated,
      nominationCategoryRequired: nominated,
    };
  }

  // Governor / deputy governor
  if (/\bgovernor\b/.test(t)) {
    return {
      ...DEFAULT,
      showParty: true,
      partyRequired: true,
      showConstituency: false,
      showCounty: true,
      countyRequired: true,
      showWard: false,
      showOrganization: true,
    };
  }

  // MCA
  if (
    /\b(mca|county assembly|member of the county assembly)\b/.test(t) ||
    t === "mca"
  ) {
    return {
      ...DEFAULT,
      showParty: true,
      partyRequired: false,
      showConstituency: true,
      showCounty: true,
      countyRequired: true,
      showWard: true,
      showOrganization: true,
    };
  }

  // President / DP — political, national
  if (/\b(president|deputy president)\b/.test(t)) {
    return {
      ...DEFAULT,
      showParty: true,
      partyRequired: false,
      showConstituency: false,
      showCounty: false,
      showWard: false,
      showOrganization: true,
      organizationRequired: false,
    };
  }

  return { ...DEFAULT };
}

/** Human labels for entry types */
export const ENTRY_TYPES = [
  "Elected",
  "Nominated",
  "Appointed",
  "Ex officio",
  "Acting",
  "Other",
] as const;
