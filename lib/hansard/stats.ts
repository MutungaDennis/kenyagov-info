/**
 * Chair / presiding interventions should not inflate an MP's speaking stats.
 *
 * Admin sets the sitting-level `presidingOfficer` (Speaker / Deputy / Temporary).
 * Any spoken contribution by that linked Member in that sitting is treated as
 * chairing (moderating), not floor debate — even if each row was not individually
 * tagged "Speaking as Chair".
 */

export type PresidingRole =
  | "speaker"
  | "deputy-speaker"
  | "temporary-speaker";

export type PresidingOfficerRef = {
  role?: string | null;
  displayName?: string | null;
  supabaseLeaderId?: string | null;
};

export const PRESIDING_ROLE_LABELS: Record<PresidingRole, string> = {
  speaker: "The Speaker",
  "deputy-speaker": "The Deputy Speaker",
  "temporary-speaker": "The Temporary Speaker",
};

export const PRESIDING_ROLE_SHORT: Record<PresidingRole, string> = {
  speaker: "Speaker",
  "deputy-speaker": "Deputy Speaker",
  "temporary-speaker": "Temporary Speaker",
};

export function presidingRoleLabel(role?: string | null): string {
  if (!role) return "Presiding officer";
  if (role in PRESIDING_ROLE_LABELS) {
    return PRESIDING_ROLE_LABELS[role as PresidingRole];
  }
  return role;
}

export function toPresidingRole(role?: string | null): PresidingRole | null {
  if (role === "speaker" || role === "deputy-speaker" || role === "temporary-speaker") {
    return role;
  }
  return null;
}

function normalizePersonName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(hon\.?|rt\.?\s*hon\.?|the|mr\.?|mrs\.?|ms\.?|dr\.?|prof\.?)\b/g, "")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** True when this contribution is by the person recorded as in the Chair for the sitting. */
export function isPresidingOfficerContribution(
  c: {
    supabaseLeaderId?: string | null;
    speakerName?: string | null;
  },
  presiding?: PresidingOfficerRef | null,
): boolean {
  if (!presiding) return false;

  if (
    presiding.supabaseLeaderId &&
    c.supabaseLeaderId &&
    presiding.supabaseLeaderId === c.supabaseLeaderId
  ) {
    return true;
  }

  // Fallback: names match when admin set display name but some rows lack leader id
  if (presiding.displayName && c.speakerName) {
    const a = normalizePersonName(presiding.displayName);
    const b = normalizePersonName(c.speakerName);
    if (!a || !b) return false;
    if (a === b) return true;
    // "Martha Wanjira" vs "Martha Wangari Wanjira"
    if (a.includes(b) || b.includes(a)) return true;
    const aParts = a.split(" ").filter((p) => p.length > 2);
    const bParts = new Set(b.split(" ").filter((p) => p.length > 2));
    const overlap = aParts.filter((p) => bParts.has(p));
    if (overlap.length >= 2) return true;
  }

  return false;
}

function roleFromTitleText(blob: string): PresidingRole | null {
  if (
    /\btemporary\s+speaker\b/.test(blob) ||
    /\bacting\s+speaker\b/.test(blob)
  ) {
    return "temporary-speaker";
  }
  if (/\bdeputy\s+speaker\b/.test(blob)) {
    return "deputy-speaker";
  }
  if (
    /\bthe\s+speaker\b/.test(blob) ||
    /\b(mr|mrs|ms|madam)\.?\s+speaker\b/.test(blob)
  ) {
    return "speaker";
  }
  return null;
}

export type ChairContext = {
  isChairContribution?: boolean | null;
  speakerTitle?: string | null;
  role?: string | null;
  speakerName?: string | null;
  supabaseLeaderId?: string | null;
  /** Sitting-level presiding officer (from admin “Presiding officer”) */
  presidingOfficer?: PresidingOfficerRef | null;
};

/**
 * Resolve whether a contribution is in the chair, and which label to show.
 * Priority: title text → sitting presiding officer match → explicit row flag.
 */
export function resolveChairRole(c: ChairContext): PresidingRole | null {
  const blob = `${c.speakerTitle || ""} ${c.role || ""}`.toLowerCase();
  const fromTitle = roleFromTitleText(blob);
  if (fromTitle) return fromTitle;

  // Sitting-level: linked Temporary/Deputy/Speaker for this sitting
  if (isPresidingOfficerContribution(c, c.presidingOfficer)) {
    return (
      toPresidingRole(c.presidingOfficer?.role) || "temporary-speaker"
    );
  }

  if (c.isChairContribution === true) {
    return (
      toPresidingRole(c.presidingOfficer?.role) ||
      roleFromTitleText(blob) ||
      "speaker"
    );
  }

  return null;
}

export function chairRoleDisplayLabel(
  role: PresidingRole | null,
): string | null {
  if (!role) return null;
  return PRESIDING_ROLE_LABELS[role];
}

export function isChairContribution(c: ChairContext): boolean {
  return resolveChairRole(c) !== null;
}

/** Member-facing stats: only floor speeches, not chair / moderating interventions. */
export function countsTowardMemberStats(c: ChairContext & { type?: string }): boolean {
  if (c.type && c.type !== "spoken") return false;
  return !isChairContribution(c);
}
