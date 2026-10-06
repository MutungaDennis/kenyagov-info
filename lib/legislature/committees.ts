export type ParliamentaryChamber = "national_assembly" | "senate";
export type CommitteePosition = "chairperson" | "vice_chairperson" | "member";

export type ParliamentaryCommittee = {
  id: string;
  chamber: ParliamentaryChamber;
  category: string;
  name: string;
  slug: string;
  description: string | null;
  mandate: string | null;
  established_date: string | null;
  dissolved_date: string | null;
  is_active: boolean;
  is_published: boolean;
  sort_order: number;
};

export function chamberLabel(chamber: ParliamentaryChamber) {
  return chamber === "national_assembly" ? "National Assembly" : "Senate";
}

export function parliamentaryChamberForInstitution(
  slug: string | null | undefined,
  name: string | null | undefined,
): ParliamentaryChamber | null {
  const identity = `${slug || ""} ${name || ""}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (/\bsenate\b/.test(identity)) return "senate";
  if (/\bnational assembly\b/.test(identity)) return "national_assembly";
  return null;
}

export function committeePositionLabel(position: CommitteePosition | string) {
  if (position === "chairperson") return "Chairperson";
  if (position === "vice_chairperson") return "Vice-Chairperson";
  return "Member";
}

export function isCurrentParliamentaryTerm(
  term: {
    start: string | null | undefined;
    end: string | null | undefined;
    status: string | null | undefined;
  },
  today: string,
) {
  const status = (term.status || "").toLowerCase().trim();
  if (
    ["former", "ended", "inactive", "suspended", "vacant", "retired", "deceased"].includes(status) ||
    (term.start && term.start > today) ||
    (term.end && term.end < today)
  ) {
    return false;
  }
  return true;
}

export function committeeMembershipStatus(
  start: string | null | undefined,
  end: string | null | undefined,
  today: string,
): "upcoming" | "current" | "former" {
  if (start && start > today) return "upcoming";
  if (end && end < today) return "former";
  return "current";
}

export function isValidCommitteeDate(value: string | null | undefined) {
  if (value == null || value === "") return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000")) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

export function isCommitteeMemberTitle(
  chamber: ParliamentaryChamber,
  title: string | null | undefined,
) {
  const value = (title || "").toLowerCase();
  return chamber === "senate"
    ? value.includes("senator")
    : value.includes("member of parliament") ||
        value.includes("member of the national assembly") ||
    value.includes("member of national assembly") ||
    value.includes("nominated mp") ||
    /(^|\W)m\.?p\.?($|\W)/.test(value) ||
    value.includes("woman representative") ||
        value.includes("women representative");
}

export function isNationalAssemblySpeakerTitle(
  chamber: ParliamentaryChamber,
  title: string | null | undefined,
) {
  const value = title || "";
  if (!/(^|\W)speaker(\W|$)/i.test(value)) return false;
  // A Speaker belongs only to their own House.
  return chamber === "national_assembly" ? !/senate/i.test(value) : !/national\s+assembly/i.test(value);
}

const CATEGORY_ORDER: Record<ParliamentaryChamber, string[]> = {
  national_assembly: [
    "Departmental Committees",
    "Financial Audit and Appropriations Committees",
    "Housekeeping and Operational Committees",
    "Select and General Purpose Committees",
    "Joint and Statutory Committees",
  ],
  senate: ["Standing Committees", "Select Committees", "Other Committees"],
};

export function groupCommitteesByCategory<T extends { category: string; sort_order: number; name: string }>(
  chamber: ParliamentaryChamber,
  committees: T[],
) {
  const preferred = CATEGORY_ORDER[chamber];
  const groups = new Map<string, T[]>();
  for (const committee of committees) {
    const key = committee.category?.trim() || "Other Committees";
    groups.set(key, [...(groups.get(key) || []), committee]);
  }
  const rank = (name: string) => {
    const index = preferred.indexOf(name);
    return index === -1 ? preferred.length : index;
  };
  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
    .map(([category, rows]) => ({
      category,
      committees: [...rows].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    }));
}

export function representationLabel(role: {
  seat_type?: string | null;
  nomination_category?: string | null;
  county?: string | null;
  constituency?: string | null;
}) {
  const seat = (role.seat_type || "").toLowerCase();
  const category = role.nomination_category?.trim();
  if (seat.includes("nominated") || category) {
    return category ? `Nominated ? ${category}` : "Nominated";
  }
  const constituency = role.constituency?.trim();
  const county = role.county?.trim();
  const countyLabel = county ? (/county$/i.test(county) ? county : `${county} County`) : null;
  if (constituency && countyLabel) return `${constituency}, ${countyLabel}`;
  return constituency || countyLabel || null;
}
