/**
 * Chair / presiding interventions — detected PER CONTRIBUTION.
 *
 * Speakership can rotate mid-sitting. Labels and stats must come from each
 * contribution's own fields (isChairContribution, speakerTitle), never from
 * "who is Temporary Speaker on the sitting right now". That sitting-level field
 * is only for the public header / admin metadata.
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
  if (
    role === "speaker" ||
    role === "deputy-speaker" ||
    role === "temporary-speaker"
  ) {
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

/**
 * Whether a contribution belongs to the sitting's designated presiding officer.
 * Used only for soft hints / admin tools — NOT for public role labels or stats.
 */
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

  if (presiding.displayName && c.speakerName) {
    const a = normalizePersonName(presiding.displayName);
    const b = normalizePersonName(c.speakerName);
    if (!a || !b) return false;
    if (a === b) return true;
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
  /** Explicit per-contribution flag (preferred) */
  isChairContribution?: boolean | null;
  /** e.g. "The Temporary Speaker", "The Deputy Speaker" */
  speakerTitle?: string | null;
  role?: string | null;
  speakerName?: string | null;
  supabaseLeaderId?: string | null;
  /** Sitting metadata only — not used for per-speech labeling */
  presidingOfficer?: PresidingOfficerRef | null;
};

/**
 * Chair role for a single contribution — from THAT contribution's fields only.
 * Never infers chair status from "who is Temporary Speaker on the sitting".
 */
export function resolveChairRole(c: ChairContext): PresidingRole | null {
  const blob = `${c.speakerTitle || ""} ${c.role || ""}`.toLowerCase();
  const fromTitle = roleFromTitleText(blob);
  if (fromTitle) return fromTitle;

  // Flag set without a recognizable title — default Temporary Speaker
  // (most common elected stand-in). Permanent Speaker should have title set by admin UI.
  if (c.isChairContribution === true) {
    return "temporary-speaker";
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

/** Member-facing stats: only floor speeches, not chair interventions. */
export function countsTowardMemberStats(
  c: ChairContext & { type?: string },
): boolean {
  if (c.type && c.type !== "spoken") return false;
  return !isChairContribution(c);
}
