/**
 * Helpers for County Assembly institution URLs and display names.
 *
 * County government slugs already end in `-county` (e.g. `makueni-county`).
 * Assembly institution slugs append `-assembly` → `makueni-county-assembly`.
 */

export function assemblyInstitutionSlug(countySlug: string): string {
  const slug = (countySlug || "").trim().toLowerCase();
  if (!slug) return "";
  if (slug.endsWith("-county-assembly")) return slug;
  if (slug.endsWith("-assembly")) return slug;
  return `${slug}-assembly`;
}

export function assemblyDisplayName(countyName: string): string {
  const name = (countyName || "").trim();
  if (!name) return "County Assembly";
  if (/\bcounty\s+assembly\b/i.test(name)) return name;
  if (/\bcounty\b/i.test(name)) return `${name} Assembly`;
  return `${name} County Assembly`;
}

export function assemblyInstitutionHref(countySlug: string): string {
  return `/government/institutions/${assemblyInstitutionSlug(countySlug)}`;
}
