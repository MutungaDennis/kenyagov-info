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
  partyRequired: boolean;
  constituencyRequired: boolean;
  countyRequired: boolean;
  organizationRequired: boolean;
};

const DEFAULT: RoleFieldVisibility = {
  showParty: true,
  showConstituency: false,
  showCounty: true,
  showWard: false,
  showOrganization: true,
  showLevel: true,
  partyRequired: false,
  constituencyRequired: false,
  countyRequired: false,
  organizationRequired: false,
};

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Infer field visibility from position title or code (e.g. "Member of Parliament", "MP", "CABINET_SECRETARY").
 */
export function fieldsForPosition(
  titleOrCode?: string | null,
): RoleFieldVisibility {
  if (!titleOrCode?.trim()) return { ...DEFAULT };

  const t = norm(titleOrCode);

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
    const nominated = t.includes("nominated");
    return {
      ...DEFAULT,
      showParty: true,
      partyRequired: true,
      showConstituency: !nominated,
      constituencyRequired: !nominated,
      showCounty: true,
      countyRequired: false,
      showWard: false,
      showOrganization: true,
      organizationRequired: false,
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

  // Senator
  if (/\bsenator\b/.test(t) || t === "senator") {
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
