/**
 * Sitting-level roles for Hansard admin roster.
 * Chair roles affect public stats (excluded as moderating).
 * Party leadership roles are floor titles only — still count as contributions.
 */

import type { PresidingRole } from "@/lib/hansard/stats";
import { PRESIDING_ROLE_LABELS } from "@/lib/hansard/stats";

/** Party leadership & house management (floor, not the Chair) */
export type PartyLeadershipRole =
  | "majority-leader"
  | "minority-leader"
  | "majority-whip"
  | "minority-whip"
  | "deputy-majority-leader"
  | "deputy-minority-leader"
  | "deputy-majority-whip"
  | "deputy-minority-whip";

export type FloorCapacity = "member" | PartyLeadershipRole;

/** Full roster capacity used in admin session speakers */
export type RosterCapacity = FloorCapacity | PresidingRole;

export const PARTY_LEADERSHIP_LABELS: Record<PartyLeadershipRole, string> = {
  "majority-leader": "Leader of the Majority Party",
  "minority-leader": "Leader of the Minority Party",
  "majority-whip": "Majority Whip",
  "minority-whip": "Minority Whip",
  "deputy-majority-leader": "Deputy Leader of the Majority Party",
  "deputy-minority-leader": "Deputy Leader of the Minority Party",
  "deputy-majority-whip": "Deputy Majority Whip",
  "deputy-minority-whip": "Deputy Minority Whip",
};

export function isChairCapacity(capacity: RosterCapacity): boolean {
  return (
    capacity === "speaker" ||
    capacity === "deputy-speaker" ||
    capacity === "temporary-speaker"
  );
}

export function isPartyLeadershipCapacity(
  capacity: RosterCapacity,
): capacity is PartyLeadershipRole {
  return Object.prototype.hasOwnProperty.call(PARTY_LEADERSHIP_LABELS, capacity);
}

/** Full title applied when this roster capacity is selected for a contribution */
export function rosterCapacityTitle(
  capacity: RosterCapacity,
  fallbackMemberTitle?: string,
): string {
  if (capacity === "member") return fallbackMemberTitle || "";
  if (isChairCapacity(capacity)) {
    return PRESIDING_ROLE_LABELS[capacity as PresidingRole];
  }
  if (isPartyLeadershipCapacity(capacity)) {
    return PARTY_LEADERSHIP_LABELS[capacity];
  }
  return fallbackMemberTitle || "";
}

/**
 * Public-facing Hansard role label for a spoken contribution.
 * Prefer saved speakerTitle/role (from admin roster); fall back to capacity inference.
 * Returns null for ordinary members (no special house role).
 */
export function resolveHansardRoleLabel(c: {
  speakerTitle?: string | null;
  role?: string | null;
  isChairContribution?: boolean | null;
}): string | null {
  const capacity = capacityFromTitleText(
    c.speakerTitle || undefined,
    c.role || undefined,
    Boolean(c.isChairContribution),
  );
  if (capacity === "member") return null;
  return rosterCapacityTitle(capacity) || null;
}

/** Short label for chips / compact UI */
export function rosterCapacityShortLabel(capacity: RosterCapacity): string {
  if (capacity === "member") return "Member";
  if (capacity === "speaker") return "Speaker";
  if (capacity === "deputy-speaker") return "Deputy Speaker";
  if (capacity === "temporary-speaker") return "Temp. Speaker";
  if (capacity === "majority-leader") return "Maj. Leader";
  if (capacity === "minority-leader") return "Min. Leader";
  if (capacity === "majority-whip") return "Maj. Whip";
  if (capacity === "minority-whip") return "Min. Whip";
  if (capacity === "deputy-majority-leader") return "Dep. Maj. Leader";
  if (capacity === "deputy-minority-leader") return "Dep. Min. Leader";
  if (capacity === "deputy-majority-whip") return "Dep. Maj. Whip";
  if (capacity === "deputy-minority-whip") return "Dep. Min. Whip";
  return String(capacity);
}

/** Longer label for “Add as” dropdown */
export function rosterCapacitySelectLabel(capacity: RosterCapacity): string {
  if (capacity === "member") return "Member";
  if (isChairCapacity(capacity)) {
    return PRESIDING_ROLE_LABELS[capacity as PresidingRole];
  }
  if (isPartyLeadershipCapacity(capacity)) {
    return PARTY_LEADERSHIP_LABELS[capacity];
  }
  return String(capacity);
}

/** Infer capacity from saved contribution title / role text */
export function capacityFromTitleText(
  speakerTitle?: string,
  role?: string,
  isChairContribution?: boolean,
): RosterCapacity {
  const t = `${speakerTitle || ""} ${role || ""}`.toLowerCase();

  // Chair first
  if (/\btemporary\s+speaker\b/.test(t) || /\bacting\s+speaker\b/.test(t)) {
    return "temporary-speaker";
  }
  if (/\bdeputy\s+speaker\b/.test(t)) return "deputy-speaker";

  // Party leadership (deputy before full titles)
  if (
    /\bdeputy\s+leader of the majority\b/.test(t) ||
    /\bdeputy\s+majority\s+leader\b/.test(t)
  ) {
    return "deputy-majority-leader";
  }
  if (
    /\bdeputy\s+leader of the minority\b/.test(t) ||
    /\bdeputy\s+minority\s+leader\b/.test(t)
  ) {
    return "deputy-minority-leader";
  }
  if (/\bdeputy\s+majority\s+whip\b/.test(t)) return "deputy-majority-whip";
  if (/\bdeputy\s+minority\s+whip\b/.test(t)) return "deputy-minority-whip";

  if (/\bleader of the majority\b/.test(t) || /\bmajority\s+leader\b/.test(t)) {
    return "majority-leader";
  }
  if (/\bleader of the minority\b/.test(t) || /\bminority\s+leader\b/.test(t)) {
    return "minority-leader";
  }
  if (/\bmajority\s+whip\b/.test(t)) return "majority-whip";
  if (/\bminority\s+whip\b/.test(t)) return "minority-whip";

  if (/\bthe\s+speaker\b/.test(t)) return "speaker";

  if (isChairContribution) return "speaker";

  return "member";
}

/** Shared select options for admin “Add as” / chip role change */
export const ROSTER_CAPACITY_OPTIONS: Array<{
  value: RosterCapacity;
  label: string;
  group: "floor" | "chair" | "party";
}> = [
  { value: "member", label: "Member", group: "floor" },
  {
    value: "majority-leader",
    label: "Leader of the Majority Party",
    group: "party",
  },
  {
    value: "minority-leader",
    label: "Leader of the Minority Party",
    group: "party",
  },
  { value: "majority-whip", label: "Majority Whip", group: "party" },
  { value: "minority-whip", label: "Minority Whip", group: "party" },
  {
    value: "deputy-majority-leader",
    label: "Deputy Leader of the Majority Party",
    group: "party",
  },
  {
    value: "deputy-minority-leader",
    label: "Deputy Leader of the Minority Party",
    group: "party",
  },
  {
    value: "deputy-majority-whip",
    label: "Deputy Majority Whip",
    group: "party",
  },
  {
    value: "deputy-minority-whip",
    label: "Deputy Minority Whip",
    group: "party",
  },
  { value: "speaker", label: "The Speaker (Chair)", group: "chair" },
  {
    value: "deputy-speaker",
    label: "The Deputy Speaker (Chair)",
    group: "chair",
  },
  {
    value: "temporary-speaker",
    label: "The Temporary Speaker (Chair)",
    group: "chair",
  },
];
