/**
 * Shared editorial verification status for institutions, leaders, and MCAs.
 * Default for new records: Unverified until double-checked against an official source.
 */

export const VERIFICATION_STATUS_OPTIONS = [
  "Unverified",
  "Verified",
  "Pending",
  "Needs review",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUS_OPTIONS)[number];

export const DEFAULT_VERIFICATION_STATUS: VerificationStatus = "Unverified";

export function isVerificationStatus(value: unknown): value is VerificationStatus {
  return (
    typeof value === "string" &&
    (VERIFICATION_STATUS_OPTIONS as readonly string[]).includes(value)
  );
}

/** Coerce free-text / null to a known status. Unknown → Unverified. */
export function normalizeVerificationStatus(
  value: unknown,
): VerificationStatus {
  if (isVerificationStatus(value)) return value;
  const s = String(value ?? "").trim();
  if (!s) return DEFAULT_VERIFICATION_STATUS;
  // Case-insensitive match
  const hit = VERIFICATION_STATUS_OPTIONS.find(
    (o) => o.toLowerCase() === s.toLowerCase(),
  );
  return hit ?? DEFAULT_VERIFICATION_STATUS;
}

/** GOV.UK tag colour for admin list badges */
export function verificationTagClass(status: unknown): string {
  const s = normalizeVerificationStatus(status);
  if (s === "Verified") return "govuk-tag--green";
  if (s === "Pending") return "govuk-tag--blue";
  if (s === "Needs review") return "govuk-tag--yellow";
  return "govuk-tag--grey"; // Unverified
}

export const VERIFICATION_FIELD_HINT =
  "Default Unverified. Mark Verified when double-checked against an official source (Gazette, commission site, Parliament, etc.). Use Needs review when facts may have changed.";
