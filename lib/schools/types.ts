export const SCHOOL_LEVELS = {
  primary: "Primary schools (Grades 1–6)",
  junior: "Junior schools (Grades 7–9)",
  senior_secondary: "Senior secondary / high schools",
  ecde: "Early childhood education",
} as const;

export type SchoolLevel = keyof typeof SCHOOL_LEVELS;
export type SchoolSummary = {
  id: string;
  slug: string;
  official_name: string;
  short_name: string | null;
  ownership: string;
  main_tier: SchoolLevel | null;
  county: string | null;
  sub_county: string | null;
  county_code: number | null;
  moe_category: string | null;
  gender_type: string | null;
  accommodation_type: string | null;
  operational_status: string | null;
};

export function schoolLevelLabel(level: string | null): string {
  return SCHOOL_LEVELS[level as SchoolLevel] ?? "School — level not recorded";
}

export function schoolValue(value: unknown): string {
  if (value == null || value === "" || value === "unknown") return "Not recorded";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "Not recorded";
  if (typeof value === "number") return value.toLocaleString("en-KE");
  return String(value).replaceAll("_", " ");
}

export function safeSchoolWebsite(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

export function schoolSearchTerm(value: string): string {
  return value.replace(/[%_(),.\\"']/g, " ").replace(/\s+/g, " ").trim().slice(0,100);
}

export function schoolDirectorate(level: string | null): string | null {
  if (level === "primary" || level === "junior") return "directorate-primary-education";
  if (level === "senior_secondary") return "directorate-secondary-education";
  return null;
}
