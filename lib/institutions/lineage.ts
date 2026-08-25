/**
 * Institution lineage + lifecycle segments — types and display helpers.
 * Tables: institution_relationships, institution_lifecycle_segments, institution_name_history
 */

export const INSTITUTION_RELATIONSHIP_TYPES = [
  {
    value: "RENAME",
    label: "Renamed to",
    hint: "Same body continued under a new official name (from → to)",
    publicFromLabel: "Previously known as",
    publicToLabel: "Renamed to",
  },
  {
    value: "MERGE_INTO",
    label: "Merged into",
    hint: "This body (from) was absorbed into the survivor (to)",
    publicFromLabel: "Merged into",
    publicToLabel: "Formed by merger including",
  },
  {
    value: "SPLIT_FROM",
    label: "Split from (created from)",
    hint: "Descendant (to) was carved out of ancestor (from) — e.g. Telkom SPLIT_FROM KP&TC",
    publicFromLabel: "Split into",
    publicToLabel: "Created from split of",
  },
  {
    value: "SUCCESSION",
    label: "Succeeded by",
    hint: "Descendant (to) took over the mandate of (from)",
    publicFromLabel: "Succeeded by",
    publicToLabel: "Succeeded",
  },
  {
    value: "ABSORPTION",
    label: "Absorbed into (ministry / parent)",
    hint: "Mandate returned to a line ministry or parent (to)",
    publicFromLabel: "Absorbed into",
    publicToLabel: "Absorbed functions of",
  },
  {
    value: "BIRTH",
    label: "Created under / from context of",
    hint: "New office (to) created in the context of parent body (from)",
    publicFromLabel: "Led to creation of",
    publicToLabel: "Created under",
  },
  {
    value: "CONTINUATION",
    label: "Legal continuation (e.g. across 2010)",
    hint: "Same body across constitutional eras (pre/post-2010)",
    publicFromLabel: "Continued as",
    publicToLabel: "Continuation of",
  },
] as const;

export type InstitutionRelationshipType =
  (typeof INSTITUTION_RELATIONSHIP_TYPES)[number]["value"];

export const INSTITUTION_NAME_KINDS = [
  { value: "official", label: "Official name" },
  { value: "short", label: "Short name / acronym" },
  { value: "alias", label: "Alias" },
  { value: "informal", label: "Informal / common name" },
] as const;

export type InstitutionLifecycleSegment = {
  id?: string;
  institution_id?: string;
  label: string;
  start_date: string;
  end_date: string;
  segment_status: string;
  legal_basis_type: string;
  legal_basis_name: string;
  legal_basis_reference: string;
  notes: string;
  sort_order: number;
};

export type InstitutionRelationship = {
  id?: string;
  from_institution_id: string;
  to_institution_id: string;
  relationship_type: string;
  effective_date: string;
  end_date: string;
  legal_instrument: string;
  notes: string;
  is_primary: boolean;
  /** Joined for display */
  from_institution?: { id: string; name: string; slug: string; short_name?: string | null };
  to_institution?: { id: string; name: string; slug: string; short_name?: string | null };
};

export type InstitutionNameHistoryRow = {
  id?: string;
  institution_id?: string;
  name: string;
  name_kind: string;
  start_date: string;
  end_date: string;
  notes: string;
};

export function emptyLifecycleSegment(): InstitutionLifecycleSegment {
  return {
    label: "",
    start_date: "",
    end_date: "",
    segment_status: "Active",
    legal_basis_type: "",
    legal_basis_name: "",
    legal_basis_reference: "",
    notes: "",
    sort_order: 0,
  };
}

export function emptyRelationship(
  fromId = "",
): InstitutionRelationship {
  return {
    from_institution_id: fromId,
    to_institution_id: "",
    relationship_type: "SUCCESSION",
    effective_date: "",
    end_date: "",
    legal_instrument: "",
    notes: "",
    is_primary: false,
  };
}

export function emptyNameHistoryRow(): InstitutionNameHistoryRow {
  return {
    name: "",
    name_kind: "official",
    start_date: "",
    end_date: "",
    notes: "",
  };
}

export function relationshipTypeMeta(type: string) {
  return (
    INSTITUTION_RELATIONSHIP_TYPES.find((t) => t.value === type) || {
      value: type,
      label: type,
      hint: "",
      publicFromLabel: "Related to",
      publicToLabel: "Related to",
    }
  );
}

/** Types that typically set institutions.successor_institution_id on the "from" side */
export const PRIMARY_SUCCESSOR_TYPES = new Set([
  "RENAME",
  "MERGE_INTO",
  "SUCCESSION",
  "ABSORPTION",
  "CONTINUATION",
]);

/** Format a date range for public timeline */
export function formatSegmentRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string {
  const s = start?.trim() || null;
  const e = end?.trim() || null;
  if (!s && !e) return "Dates not recorded";
  if (s && !e) return `From ${s}`;
  if (!s && e) return `Until ${e}`;
  return `${s} – ${e}`;
}

export function isJudicialAnnulmentStatus(status: unknown): boolean {
  const s = String(status || "").trim().toLowerCase();
  return (
    s === "unconstitutional" ||
    s === "judiciously annulled" ||
    s === "annulled by court" ||
    /unconstitutional|annulled by court|judicially annul/.test(s)
  );
}
