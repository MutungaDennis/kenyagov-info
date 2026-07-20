/**
 * Display helpers for leaders + roles (public & admin).
 */

import {
  formatNameTitlesPrefix,
  formatNationalHonoursSuffix,
  parseNameTitles,
  parseNationalHonours,
} from "@/lib/leaders/titles-social";

export type LeaderRoleLike = {
  id?: string;
  title?: string | null;
  organization?: string | null;
  constituency?: string | null;
  county?: string | null;
  ward?: string | null;
  party?: string | null;
  level?: string | null;
  term_start_date?: string | null;
  term_end_date?: string | null;
  status?: string | null;
  entry_type?: string | null;
  official_email?: string | null;
  office_location?: string | null;
  committees?: unknown;
  position_id?: string | number | null;
  institution_id?: string | number | null;
  party_id?: string | number | null;
  county_id?: string | number | null;
  constituency_id?: string | number | null;
  ward_id?: string | number | null;
  government_level_id?: string | number | null;
};

export type LeaderNameParts = {
  first_name?: string | null;
  other_names?: string | null;
  surname?: string | null;
  full_name?: string | null;
  /** Job title (MP, CS) — not honorifics */
  title?: string | null;
  /** Honorifics: Hon., Dr., Prof. — jsonb array or string (before name) */
  name_titles?: unknown;
  honorifics?: unknown;
  /** National awards post-nominals: E.G.H., O.G.W. — after name */
  national_honours?: unknown;
  awards?: unknown;
};

export type AcademicQualification = {
  degree?: string;
  field?: string;
  institution?: string;
  year?: string | number;
  notes?: string;
};

/** full_name is often a generated column — never write it; write name parts. */
export function splitFullName(full: string): {
  first_name: string;
  other_names: string | null;
  surname: string;
} {
  const parts = full
    .trim()
    .replace(/^(the\s+)?(hon\.?|rt\.?\s*hon\.?|dr\.?|prof\.?|eng\.?)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) {
    return { first_name: "Unknown", other_names: null, surname: "Leader" };
  }
  if (parts.length === 1) {
    return { first_name: parts[0], other_names: null, surname: parts[0] };
  }
  if (parts.length === 2) {
    return { first_name: parts[0], other_names: null, surname: parts[1] };
  }
  return {
    first_name: parts[0],
    other_names: parts.slice(1, -1).join(" "),
    surname: parts[parts.length - 1],
  };
}

/** Plain name without honorifics (search, slug basis). */
export function displayName(person: LeaderNameParts): string {
  const fromParts = [person.first_name, person.other_names, person.surname]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fromParts) return fromParts;
  if (person.full_name?.trim()) {
    // Strip common honorifics from generated full_name if present
    return person.full_name
      .trim()
      .replace(
        /^(h\.?e\.?|rt\.?\s*hon\.?|hon\.?|sen\.?|prof\.?|dr\.?|eng\.?|rev\.?|mr\.?|mrs\.?|ms\.?|miss|amb\.?)\s+/gi,
        "",
      )
      .trim();
  }
  return "Unknown";
}

/**
 * Public-facing name with honorifics before and national honours after:
 * "Hon. Prof. Jane Wanjiku Doe, E.G.H., O.G.W."
 */
export function displayNameWithTitles(person: LeaderNameParts): string {
  const base = displayName(person);
  const titles = parseNameTitles(person.name_titles ?? person.honorifics);
  const prefix = formatNameTitlesPrefix(titles);
  const withTitles = prefix ? `${prefix} ${base}`.trim() : base;
  const honours = parseNationalHonours(
    person.national_honours ?? person.awards,
  );
  const suffix = formatNationalHonoursSuffix(honours);
  if (!suffix) return withTitles;
  return `${withTitles}, ${suffix}`;
}

/** Slug should never include honorifics or awards — name parts only. */
export function nameForSlug(person: LeaderNameParts): string {
  return displayName(person);
}

function statusIsActive(status?: string | null): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === "active" || s === "current" || s === "serving";
}

function isOpenEnded(role: LeaderRoleLike): boolean {
  return !role.term_end_date;
}

function isRoleCurrent(role: LeaderRoleLike): boolean {
  // End date is the strongest signal: filled end date ⇒ not current
  if (role.term_end_date) return false;
  if (statusIsEnded(role.status)) return false;
  // Open-ended (no end date) and not marked ended ⇒ current
  return true;
}

function statusIsEnded(status?: string | null): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return (
    s === "ended" ||
    s === "former" ||
    s === "inactive" ||
    s === "completed" ||
    s === "suspended"
  );
}

/** Current role (open-ended term preferred), or most recently ended role. */
export function resolvePrimaryRole(roles: LeaderRoleLike[] | null | undefined): {
  role: LeaderRoleLike | null;
  isCurrent: boolean;
  label: string;
} {
  const list = [...(roles || [])];
  if (!list.length) {
    return { role: null, isCurrent: false, label: "Position not recorded" };
  }

  const current = list
    .filter(isRoleCurrent)
    .sort((a, b) =>
      String(b.term_start_date || "").localeCompare(
        String(a.term_start_date || ""),
      ),
    );
  if (current.length) {
    return {
      role: current[0],
      isCurrent: true,
      label: formatRoleHeadline(current[0]),
    };
  }

  // Most recent by term_end, then term_start
  list.sort((a, b) => {
    const ae = a.term_end_date || a.term_start_date || "";
    const be = b.term_end_date || b.term_start_date || "";
    return be.localeCompare(ae);
  });
  const last = list[0];
  return {
    role: last,
    isCurrent: false,
    label: formatRoleHeadline(last),
  };
}

export function formatRoleHeadline(role: LeaderRoleLike | null): string {
  if (!role) return "Government official";
  const title = role.title || "Official";
  if (role.organization) return `${title}, ${role.organization}`;
  if (role.constituency) return `${title} for ${role.constituency}`;
  return title;
}

export function formatTermRange(
  start?: string | null,
  end?: string | null,
): string {
  const fmt = (d: string) =>
    new Date(d.slice(0, 10) + "T12:00:00").toLocaleDateString("en-KE", {
      month: "short",
      year: "numeric",
    });
  if (!start && !end) return "";
  if (start && !end) return `${fmt(start)} – present`;
  if (!start && end) return `until ${fmt(end)}`;
  return `${fmt(start!)} – ${fmt(end!)}`;
}

export function sortRolesChronologically(
  roles: LeaderRoleLike[] | null | undefined,
): LeaderRoleLike[] {
  return [...(roles || [])].sort((a, b) => {
    const aActive = isRoleCurrent(a);
    const bActive = isRoleCurrent(b);
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    const as = a.term_start_date || "";
    const bs = b.term_start_date || "";
    return bs.localeCompare(as);
  });
}

export function parseAcademicQualifications(
  raw: unknown,
): AcademicQualification[] {
  if (!raw) return [];
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return [];
    try {
      const parsed = JSON.parse(t);
      return parseAcademicQualifications(parsed);
    } catch {
      // Plain text lines
      return t
        .split(/\n|;/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => ({ degree: line }));
    }
  }
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (typeof item === "string") return { degree: item };
        if (item && typeof item === "object") {
          const o = item as Record<string, unknown>;
          return {
            degree: o.degree ? String(o.degree) : o.title ? String(o.title) : undefined,
            field: o.field ? String(o.field) : o.subject ? String(o.subject) : undefined,
            institution: o.institution
              ? String(o.institution)
              : o.school
                ? String(o.school)
                : undefined,
            year: o.year != null ? o.year : o.graduated,
            notes: o.notes ? String(o.notes) : undefined,
          } as AcademicQualification;
        }
        return null;
      })
      .filter((x): x is AcademicQualification => Boolean(x?.degree || x?.institution));
  }
  return [];
}

export function formatQualification(q: AcademicQualification): string {
  const bits = [
    q.degree,
    q.field ? `in ${q.field}` : null,
    q.institution ? `(${q.institution})` : null,
    q.year != null ? String(q.year) : null,
  ].filter(Boolean);
  return bits.join(" ");
}

function normRoleText(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/**
 * Hansard is for elected assembly members only:
 * MPs, Senators, Women Representatives, MCAs (and nominated MPs in the House).
 */
export function isHansardEligibleRole(titleOrCode?: string | null): boolean {
  if (!titleOrCode?.trim()) return false;
  const t = normRoleText(titleOrCode);
  if (
    /\b(member of parliament|member of the national assembly|\bmp\b|nominated mp|women rep|woman rep|senator|mca|county assembly|member of the county assembly)\b/.test(
      t,
    )
  ) {
    return true;
  }
  if (
    t === "mp" ||
    t === "nominated_mp" ||
    t === "senator" ||
    t === "mca" ||
    t === "women_rep" ||
    t === "county_women_rep"
  ) {
    return true;
  }
  return false;
}

export function isHansardEligible(
  roles: LeaderRoleLike[] | null | undefined,
  jobTitle?: string | null,
): boolean {
  if (isHansardEligibleRole(jobTitle)) return true;
  return (roles || []).some((r) => isHansardEligibleRole(r.title));
}

export type RelatedLink = {
  label: string;
  href: string;
  external?: boolean;
};

function slugifyPath(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Role-aware links for the public profile sidebar / footer.
 */
export function relatedLinksForLeader(opts: {
  slug: string;
  roles?: LeaderRoleLike[] | null;
  jobTitle?: string | null;
  organization?: string | null;
  county?: string | null;
  constituency?: string | null;
}): RelatedLink[] {
  const links: RelatedLink[] = [];
  const primary = resolvePrimaryRole(opts.roles);
  const roleTitle =
    primary.role?.title || opts.jobTitle || "";
  const org =
    primary.role?.organization || opts.organization || null;
  const county = primary.role?.county || opts.county || null;
  const constituency =
    primary.role?.constituency || opts.constituency || null;
  const t = normRoleText(roleTitle);

  if (isHansardEligible(opts.roles, opts.jobTitle || roleTitle)) {
    links.push({
      label: "Parliamentary contributions (Hansard)",
      href: `/government/legislature/hansard/member/${opts.slug}`,
    });
    links.push({
      label: "Parliament Hansard",
      href: "/government/legislature/hansard",
    });
  }

  if (/\b(cabinet secretary|prime cabinet|minister|president|deputy president)\b/.test(t)) {
    links.push({
      label: "The Cabinet",
      href: "/government/cabinet",
    });
  }

  if (/\bgovernor\b/.test(t) && county) {
    links.push({
      label: `${county} County`,
      href: `/government/counties/${slugifyPath(county)}`,
    });
  }

  if (/\b(judge|justice|chief justice|magistrate)\b/.test(t)) {
    links.push({
      label: "The Judiciary",
      href: "/government/judiciary",
    });
  }

  if (org) {
    links.push({
      label: org,
      href: `/government/institutions/${slugifyPath(org)}`,
    });
  }

  if (constituency && isHansardEligibleRole(roleTitle)) {
    // Seat context — directory filter stays on people for now
    links.push({
      label: "All government officials",
      href: "/government/people",
    });
  } else {
    links.push({
      label: "All government officials",
      href: "/government/people",
    });
  }

  // Dedupe by href
  const seen = new Set<string>();
  return links.filter((l) => {
    if (seen.has(l.href)) return false;
    seen.add(l.href);
    return true;
  });
}
