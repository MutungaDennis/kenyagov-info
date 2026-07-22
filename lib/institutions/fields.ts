/**
 * Institutions admin — aligned with live Supabase schema (user-provided columns).
 * USER-DEFINED enums use values observed in production data.
 */

export const INSTITUTION_WRITABLE_FIELDS = [
  // Identity
  "name",
  "short_name",
  "official_name",
  "slug",
  "former_names",
  "aliases",
  "common_misspellings",
  // Classification
  "institution_category",
  "institution_type",
  "institution_subtype",
  "institution_nature",
  "government_level",
  "arm_of_government",
  "constitutional_status",
  "mtef_sector",
  "jurisdiction_scope",
  "operational_model",
  "cofog_division",
  "cofog_group",
  // Legal / history
  "legal_basis_type",
  "legal_basis_name",
  "legal_basis_reference",
  "establishment_act",
  "established_date",
  "operational_date",
  "status_effective_date",
  "lifecycle_change_reason",
  "appointing_authority",
  // Hierarchy
  "parent_institution_id",
  "supervising_ministry_id",
  "reports_to_institution_id",
  "predecessor_institution_id",
  "successor_institution_id",
  "county_id",
  // Funding / flags
  "funding_model",
  "is_exchequer_funded",
  "generates_own_revenue",
  "receives_donor_funding",
  "is_commercial_entity",
  "is_regulator",
  "regulated_sectors",
  "offers_public_services",
  "service_delivery_modes",
  "has_online_services",
  "ecitizen_integrated",
  "api_available",
  "open_data_available",
  "publishes_annual_reports",
  "publishes_budget",
  // Contact
  "headquarters",
  "physical_address",
  "postal_address",
  "website_url",
  "portal_url",
  "email",
  "phone",
  "fax",
  "toll_free",
  "whatsapp",
  "social_media",
  "latitude",
  "longitude",
  // Leadership
  "current_head_id",
  "current_head",
  "head_title",
  "head_appointment_date",
  "board_chair",
  // Content
  "description",
  "mandate",
  "vision",
  "mission",
  "functions",
  "core_services",
  "keywords",
  "target_population",
  "key_performance_indicators",
  // Media / transparency
  "logo_url",
  "cover_image_url",
  "citizen_charter_url",
  "complaints_mechanism_url",
  "procurement_portal_url",
  "last_annual_report_year",
  "last_audit_opinion",
  "transparency_score",
  "number_of_employees",
  "annual_budget_estimate",
  // Status / provenance
  "status",
  "is_active",
  "verification_status",
  "data_source",
  "source_url",
  "source_document",
] as const;

export type InstitutionWritableField =
  (typeof INSTITUTION_WRITABLE_FIELDS)[number];

const BOOLEAN_FIELDS = new Set<string>([
  "is_exchequer_funded",
  "generates_own_revenue",
  "receives_donor_funding",
  "is_commercial_entity",
  "is_regulator",
  "offers_public_services",
  "has_online_services",
  "ecitizen_integrated",
  "api_available",
  "open_data_available",
  "publishes_annual_reports",
  "publishes_budget",
  "is_active",
]);

/** Postgres ARRAY columns */
const ARRAY_FIELDS = new Set<string>([
  "former_names",
  "aliases",
  "common_misspellings",
  "service_delivery_modes",
  "regulated_sectors",
  "functions",
  "keywords",
]);

/** jsonb columns */
const JSON_FIELDS = new Set<string>([
  "social_media",
  "core_services",
  "key_performance_indicators",
]);

const DATE_FIELDS = new Set<string>([
  "established_date",
  "operational_date",
  "status_effective_date",
  "head_appointment_date",
]);

const NUMBER_FIELDS = new Set<string>([
  "latitude",
  "longitude",
  "last_annual_report_year",
  "transparency_score",
  "number_of_employees",
  "annual_budget_estimate",
]);

// —— Enum options (from live distinct values + safe extensions) ——

export const INSTITUTION_CATEGORY_OPTIONS = [
  "Constitutional Commission",
  "County Government",
  "Diplomatic Liaison Office",
  "Embassy",
  "Executive",
  "High Commission",
  "Honorary Consulate",
  "Independent Office",
  "Intergovernmental",
  "International Cooperation Mission",
  "Judiciary",
  "Labour Organization",
  "Legislature",
  "Permanent Mission",
  "Public Fund",
  "Public University",
  "Regulator",
  "Research",
  "Security",
  "Stakeholder Body",
  "State Corporation",
  "Tribunal",
] as const;

export const INSTITUTION_NATURE_OPTIONS = [
  "Statutory Authority",
  "Statutory Council",
  "Service delivery agency",
  "Regulatory body",
  "Policy department",
  "Military service",
  "Security agency",
  "Constitutional body",
  "State corporation",
  "Fund",
  "Commission",
  "Other",
] as const;

export const GOVERNMENT_LEVEL_OPTIONS = [
  "National",
  "County",
  "Intergovernmental",
] as const;

export const ARM_OF_GOVERNMENT_OPTIONS = [
  "Executive",
  "Legislature",
  "Judiciary",
  "Independent",
  "County Executive",
  "Intergovernmental",
] as const;

export const CONSTITUTIONAL_STATUS_OPTIONS = [
  "Constitutional",
  "Statutory",
  "Executive",
  "County Legislative",
  "International",
] as const;

export const LEGAL_BASIS_TYPE_OPTIONS = [
  "Act of Parliament",
  "Constitution",
  "Executive Order",
  "Presidential Decree",
  "Gazette Notice",
  "Treaty",
  "Regulation",
  "Cabinet Decision",
  "Other",
] as const;

export const OPERATIONAL_MODEL_OPTIONS = [
  "State Corporation",
  "Regulatory Council",
  "Department",
  "Directorate",
  "Service",
  "Agency",
  "Military service",
  "Command",
  "Fund",
  "Semi-Autonomous Government Agency",
  "Other",
] as const;

export const FUNDING_MODEL_OPTIONS = [
  "Exchequer Funded",
  "Exchequer & Appropriation In Aid",
  "Exchequer & Filing Fees",
  "Exchequer & Levy Funded",
  "Exchequer & Permit Fees",
] as const;

/** Multi-value text fields stored as "A | B | C" (single text column, no schema change) */
export const MULTI_VALUE_SEP = " | ";

export function parseMultiValueField(raw: unknown): string[] {
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean);
  }
  const s = String(raw).trim();
  if (!s) return [];
  // Prefer pipe separator; also accept semicolon / comma lists
  if (s.includes("|")) {
    return s
      .split("|")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  if (s.includes(";") && !s.includes("Act of Parliament")) {
    return s
      .split(";")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  // Don't split on commas inside legal labels like "Exchequer & Appropriation In Aid"
  return [s];
}

export function joinMultiValueField(values: string[]): string {
  const uniq: string[] = [];
  const seen = new Set<string>();
  for (const v of values) {
    const t = v.trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    uniq.push(t);
  }
  return uniq.join(MULTI_VALUE_SEP);
}

/** Funding model text implies treasury/exchequer support */
export function fundingModelImpliesExchequer(model: string): boolean {
  const s = model.toLowerCase();
  return s.includes("exchequer") || s.includes("consolidated fund");
}

/**
 * Lifecycle / organisational status (not the same as is_active publish flag).
 * is_active controls public directory visibility; status describes real-world state.
 * Historical bodies (Former, Merged, Renamed, …) should usually stay Published
 * so citizens can follow renames and successions.
 */
export const INSTITUTION_STATUS_OPTIONS = [
  "Active",
  "Inactive",
  "Former",
  "Renamed",
  "Restructured",
  "Merged",
  "Succeeded",
  "Dissolved",
  "Abolished",
  "Suspended",
  "Earmarked for change",
  "Proposed",
] as const;

/** Still operating, but a rename/merge/restructure is planned or announced */
export const INSTITUTION_STATUS_EARMARKED = "Earmarked for change";

/** Default for new records: Unverified until an admin marks Verified */
export const VERIFICATION_STATUS_OPTIONS = [
  "Unverified",
  "Verified",
  "Pending",
  "Needs review",
] as const;

/**
 * Statuses that mean the organisation no longer operates under this identity.
 * Used for public banners, past-tense location labels, and successor UI hints.
 * Does NOT auto-unpublish — historical records should remain publicly viewable.
 */
export const INSTITUTION_STATUS_IMPLIES_INACTIVE = new Set([
  "Inactive",
  "Former",
  "Renamed",
  "Dissolved",
  "Abolished",
  "Merged",
  "Succeeded",
  "Restructured",
]);

/** Statuses where linking a successor institution is strongly recommended */
export const INSTITUTION_STATUS_NEEDS_SUCCESSOR = new Set([
  "Renamed",
  "Merged",
  "Succeeded",
  "Restructured",
  "Former",
]);

/** Statuses where a predecessor link is useful (this body replaced another) */
export const INSTITUTION_STATUS_MAY_HAVE_PREDECESSOR = new Set([
  "Active",
  "Restructured",
  "Succeeded",
  "Former",
  "Renamed",
]);

/** Normalise status for comparisons */
export function normalizeInstitutionStatus(status: unknown): string {
  return String(status || "")
    .trim()
    .toLowerCase();
}

/** True when the body is still current but scheduled / announced for change */
export function isInstitutionEarmarked(status: unknown): boolean {
  const s = String(status || "").trim().toLowerCase();
  if (!s) return false;
  if (s === INSTITUTION_STATUS_EARMARKED.toLowerCase()) return true;
  return /earmark|scheduled for change|pending restructur|pending renam|pending merg|announced restructur/i.test(
    s,
  );
}

/** True when the org is not currently operating under this record */
export function isInstitutionHistorical(status: unknown): boolean {
  const s = String(status || "").trim();
  if (!s || s.toLowerCase() === "active") return false;
  // Still live — planned change only
  if (isInstitutionEarmarked(s)) return false;
  if (INSTITUTION_STATUS_IMPLIES_INACTIVE.has(s)) return true;
  for (const x of INSTITUTION_STATUS_IMPLIES_INACTIVE) {
    if (x.toLowerCase() === s.toLowerCase()) return true;
  }
  // Custom free-text statuses that look historical
  if (
    /former|dissolv|abolis|merg|renam|succeed|restructur|defunct|closed|wound.?up/i.test(
      s,
    )
  ) {
    return true;
  }
  return false;
}

/** Any lifecycle status that is not plain Active (historical or earmarked) */
export function isInstitutionLifecycleNoted(status: unknown): boolean {
  const s = String(status || "").trim();
  if (!s || s.toLowerCase() === "active") return false;
  return (
    isInstitutionHistorical(s) ||
    isInstitutionEarmarked(s) ||
    s === "Proposed" ||
    s === "Suspended" ||
    s === "Inactive"
  );
}

/**
 * Label for the status_effective_date field, aligned with Status.
 * e.g. Dissolved → "Dissolved on", Renamed → "Renamed on"
 */
export function statusEffectiveDateLabel(status: unknown): string {
  const s = String(status || "").trim();
  const map: Record<string, string> = {
    Dissolved: "Dissolved on",
    Abolished: "Abolished on",
    Merged: "Merged on",
    Renamed: "Renamed on",
    Succeeded: "Succeeded on",
    Restructured: "Restructured on",
    Former: "Ceased / former from",
    Inactive: "Inactive from",
    Suspended: "Suspended on",
    Proposed: "Proposed on",
    [INSTITUTION_STATUS_EARMARKED]: "Planned / effective from",
    Active: "Status effective from",
  };
  if (map[s]) return map[s];
  if (isInstitutionEarmarked(s)) return "Planned / effective from";
  if (s) return `${s} on / from`;
  return "Status effective date";
}

/** Public-facing phrase for the lifecycle event */
export function statusLifecyclePhrase(status: unknown): string {
  const s = String(status || "").trim();
  if (isInstitutionEarmarked(s)) {
    return "is earmarked for organisational change";
  }
  const map: Record<string, string> = {
    Dissolved: "was dissolved",
    Abolished: "was abolished",
    Merged: "was merged",
    Renamed: "was renamed",
    Succeeded: "was succeeded",
    Restructured: "was restructured",
    Former: "is a former institution",
    Inactive: "is inactive",
    Suspended: "is suspended",
    Proposed: "is proposed (not yet operational)",
  };
  return map[s] || (s ? `has status “${s}”` : "is no longer active");
}

/** Label for successor link by status */
export function successorLinkLabel(status: unknown): string {
  const s = String(status || "").trim();
  if (s === "Renamed") return "Renamed to";
  if (s === "Merged") return "Merged into";
  if (s === "Succeeded") return "Succeeded by";
  if (s === "Restructured") return "Continued as / restructured into";
  if (s === "Former" || s === "Dissolved" || s === "Abolished") {
    return "Functions continued by";
  }
  return "Successor institution";
}

/** Label for predecessor link */
export function predecessorLinkLabel(status: unknown): string {
  const s = String(status || "").trim();
  if (s === "Renamed" || s === "Active") return "Previously known as / renamed from";
  if (s === "Merged" || s === "Restructured") return "Formed from / predecessor";
  return "Predecessor institution";
}

/**
 * Natures of organisational change (excludes Active / Proposed).
 * Used when admin ticks “has undergone change” then picks what happened.
 */
export const INSTITUTION_CHANGE_NATURE_OPTIONS = [
  {
    value: INSTITUTION_STATUS_EARMARKED,
    label: "Earmarked for change (upcoming)",
    hint: "Still operating now; rename, merge or restructure is planned or announced",
  },
  {
    value: "Renamed",
    label: "Renamed",
    hint: "Same body continued under a new official name",
  },
  {
    value: "Merged",
    label: "Merged into another institution",
    hint: "This body was absorbed into, or combined with, another organisation",
  },
  {
    value: "Restructured",
    label: "Restructured / reorganised",
    hint: "Mandates, structure or identity changed significantly",
  },
  {
    value: "Succeeded",
    label: "Succeeded by another institution",
    hint: "A new body took over its role or mandate",
  },
  {
    value: "Dissolved",
    label: "Dissolved",
    hint: "Formally wound up; may or may not have a successor",
  },
  {
    value: "Abolished",
    label: "Abolished",
    hint: "Abolished by law or policy",
  },
  {
    value: "Former",
    label: "Former (no longer exists under this identity)",
    hint: "Historical record — functions may have moved elsewhere",
  },
  {
    value: "Inactive",
    label: "Inactive",
    hint: "Not currently operating, but not necessarily dissolved",
  },
  {
    value: "Suspended",
    label: "Suspended",
    hint: "Temporarily suspended",
  },
] as const;

export type LifecycleChangeUi = {
  showSuccessor: boolean;
  showPredecessor: boolean;
  successorRequired: boolean;
  successorLabel: string;
  successorHint: string;
  predecessorLabel: string;
  predecessorHint: string;
  dateLabel: string;
  summary: string;
};

/**
 * Which link fields to show for a given change nature / status.
 * Guides admins so renamed vs merged vs dissolved collect the right links.
 */
export function lifecycleChangeUi(status: unknown): LifecycleChangeUi {
  const s = String(status || "").trim();
  const dateLabel = statusEffectiveDateLabel(s || "Active");

  const base: LifecycleChangeUi = {
    showSuccessor: false,
    showPredecessor: false,
    successorRequired: false,
    successorLabel: successorLinkLabel(s),
    successorHint: "Search and select the related institution",
    predecessorLabel: predecessorLinkLabel(s),
    predecessorHint: "Search the body this institution replaced or came from",
    dateLabel,
    summary: s ? `Change type: ${s}` : "Select the nature of the change",
  };

  switch (s) {
    case INSTITUTION_STATUS_EARMARKED:
      return {
        ...base,
        showSuccessor: true,
        showPredecessor: false,
        successorRequired: false,
        successorLabel: "Planned successor / merge target (if known)",
        successorHint:
          "Optional: search the institution this body is expected to become or merge into",
        dateLabel: "Planned change date",
        summary:
          "This body is still current. Record why change is planned and the expected date so citizens are not surprised when it happens.",
      };
    case "Renamed":
      return {
        ...base,
        showSuccessor: true,
        showPredecessor: true,
        successorRequired: true,
        successorLabel: "Renamed to",
        successorHint:
          "Search the institution that continues under the new name (required)",
        predecessorLabel: "Previous name / renamed from (optional)",
        predecessorHint:
          "If another record holds an older name, link it here",
        summary:
          "Record the new name as the successor so citizens can follow the rename.",
      };
    case "Merged":
      return {
        ...base,
        showSuccessor: true,
        showPredecessor: true,
        successorRequired: true,
        successorLabel: "Merged into",
        successorHint:
          "Search the surviving institution this body was merged into (required)",
        predecessorLabel: "Also formed from / other body in the merger (optional)",
        predecessorHint:
          "If this record is the survivor, link a body that was merged in. For each dissolved body, set its own “Merged into” link instead.",
        summary:
          "Link the organisation this one was merged into. Keep this record published as a historical trail.",
      };
    case "Restructured":
      return {
        ...base,
        showSuccessor: true,
        showPredecessor: true,
        successorRequired: false,
        successorLabel: "Continued as / restructured into",
        successorHint:
          "Search the body that resulted from the restructure (if different from this record)",
        predecessorLabel: "Restructured from",
        predecessorHint: "Previous organisational form, if recorded separately",
        summary: "Link the body that resulted from the restructure when it is a separate record.",
      };
    case "Succeeded":
      return {
        ...base,
        showSuccessor: true,
        showPredecessor: false,
        successorRequired: true,
        successorLabel: "Succeeded by",
        successorHint:
          "Search the institution that took over this body’s role (required)",
        summary: "Link the successor institution that took over the mandate.",
      };
    case "Dissolved":
    case "Abolished":
      return {
        ...base,
        showSuccessor: true,
        showPredecessor: false,
        successorRequired: false,
        successorLabel: "Functions continued by (if any)",
        successorHint:
          "Optional: search the body that took on remaining functions after dissolution",
        summary:
          "Set the date of dissolution. Link a successor only if another body continued the work.",
      };
    case "Former":
      return {
        ...base,
        showSuccessor: true,
        showPredecessor: true,
        successorRequired: false,
        successorLabel: "Functions continued by / became",
        successorHint:
          "Search the current institution if this former body lives on under another name",
        predecessorLabel: "Earlier form of this body",
        predecessorHint: "Optional link to an even earlier record",
        summary:
          "Mark as former and link where citizens should go for the current body.",
      };
    case "Inactive":
    case "Suspended":
      return {
        ...base,
        showSuccessor: true,
        showPredecessor: false,
        successorRequired: false,
        successorLabel: "Related / covering institution (optional)",
        successorHint: "If another body covers its functions while inactive",
        summary: "Record when it became inactive or suspended.",
      };
    default:
      // Custom / free-text statuses (including “Other”) still get link fields
      if (!s || s === "Active" || s === "Proposed") return base;
      return {
        ...base,
        showSuccessor: true,
        showPredecessor: true,
        successorRequired: false,
        successorLabel: "Became / linked to",
        successorHint:
          "Search the related current or successor institution where useful",
        predecessorLabel: "Came from / earlier body",
        predecessorHint: "Optional link to a previous institutional record",
        summary:
          s === "Other"
            ? "Enter a custom status, the date of change, and link related institutions so citizens can follow the trail."
            : `Custom status “${s}” — set the date and link related institutions where useful.`,
      };
  }
}

/** Whether the form should treat this row as having organisational change history */
export function formHasOrganisationalChange(data: {
  status?: unknown;
  status_effective_date?: unknown;
  successor_institution_id?: unknown;
  predecessor_institution_id?: unknown;
  lifecycle_change_reason?: unknown;
}): boolean {
  if (isInstitutionLifecycleNoted(data.status)) return true;
  if (data.status_effective_date) return true;
  if (data.successor_institution_id) return true;
  if (data.predecessor_institution_id) return true;
  if (String(data.lifecycle_change_reason || "").trim()) return true;
  return false;
}

/** Map legacy form field names → live column names */
export function mapLegacyInstitutionFields(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...body };
  if ("current_head_name" in out && !("current_head" in out)) {
    out.current_head = out.current_head_name;
  }
  if ("current_head_title" in out && !("head_title" in out)) {
    out.head_title = out.current_head_title;
  }
  delete out.board_type;
  delete out.has_board;
  delete out.current_head_name;
  delete out.current_head_title;
  return out;
}

/** Parse comma/newline text into string array for Postgres ARRAY columns */
export function parseTextArray(val: unknown): string[] | null {
  if (val == null || val === "") return null;
  if (Array.isArray(val)) {
    return val.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof val === "string") {
    const parts = val
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length ? parts : null;
  }
  return null;
}

export function formatTextArray(val: unknown): string {
  if (!val) return "";
  if (Array.isArray(val)) return val.map(String).join(", ");
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      if (Array.isArray(p)) return p.map(String).join(", ");
    } catch {
      return val;
    }
  }
  return String(val);
}

export function buildInstitutionRow(
  body: Record<string, unknown>,
  opts?: { defaults?: boolean },
): Record<string, unknown> {
  const src = mapLegacyInstitutionFields(body);
  const row: Record<string, unknown> = {};

  for (const key of INSTITUTION_WRITABLE_FIELDS) {
    if (!(key in src)) continue;
    const val = src[key];

    if (BOOLEAN_FIELDS.has(key)) {
      row[key] = val === true || val === "true" || val === 1 || val === "1";
      continue;
    }

    if (val === "" || val === undefined) {
      row[key] = null;
      continue;
    }

    if (ARRAY_FIELDS.has(key)) {
      row[key] = parseTextArray(val);
      continue;
    }

    if (JSON_FIELDS.has(key)) {
      if (key === "social_media") {
        row[key] = normalizeSocialMedia(val);
        continue;
      }
      if (typeof val === "string") {
        try {
          row[key] = JSON.parse(val);
        } catch {
          row[key] = parseTextArray(val);
        }
      } else {
        row[key] = val;
      }
      continue;
    }

    // UUID FKs — empty string must become null (Postgres rejects '')
    if (
      key === "current_head_id" ||
      key === "parent_institution_id" ||
      key === "supervising_ministry_id" ||
      key === "reports_to_institution_id" ||
      key === "predecessor_institution_id" ||
      key === "successor_institution_id" ||
      key === "county_id"
    ) {
      const id = val == null || val === "" ? null : String(val).trim();
      row[key] = id || null;
      continue;
    }

    if (DATE_FIELDS.has(key)) {
      const d = String(val).slice(0, 10);
      row[key] = d || null;
      continue;
    }

    if (NUMBER_FIELDS.has(key)) {
      const n = Number(val);
      row[key] = Number.isFinite(n) ? n : null;
      continue;
    }

    row[key] = val;
  }

  if (opts?.defaults) {
    if (row.is_active === undefined) row.is_active = true;
    if (!row.status) row.status = "Active";
    if (!row.government_level) row.government_level = "National";
    if (!row.arm_of_government) row.arm_of_government = "Executive";
    if (!row.verification_status) row.verification_status = "Unverified";
    if (row.social_media === undefined) row.social_media = {};
  }

  return row;
}

/** Accept array of {platform,url}, record, or JSON string → platform→url object */
export function normalizeSocialMedia(val: unknown): Record<string, string> {
  if (val == null || val === "") return {};
  if (typeof val === "string") {
    try {
      return normalizeSocialMedia(JSON.parse(val));
    } catch {
      return {};
    }
  }
  if (Array.isArray(val)) {
    const out: Record<string, string> = {};
    for (const item of val) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const platform = String(o.platform || o.network || "")
        .trim()
        .toLowerCase();
      let url = String(o.url || o.href || o.link || "").trim();
      if (!platform || !url) continue;
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
      out[platform] = url;
    }
    return out;
  }
  if (typeof val === "object") {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (v == null || v === "") continue;
      let url = String(v).trim();
      if (!url) continue;
      if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
      out[k.toLowerCase()] = url;
    }
    return out;
  }
  return {};
}

export function missingColumnFromError(message: string): string | null {
  const m =
    message.match(/Could not find the '([^']+)' column/i) ||
    message.match(/column ["']?([a-z0-9_]+)["']? .*does not exist/i) ||
    message.match(/invalid input value for enum \w+: "([^"]+)"/i);
  // For enum errors, the match is the bad value not column — handle separately
  if (message.includes("invalid input value for enum")) {
    return null;
  }
  return m?.[1] || null;
}

export function enumErrorFromMessage(message: string): string | null {
  const m = message.match(
    /invalid input value for enum (\w+): "([^"]+)"/i,
  );
  if (!m) return null;
  return `Invalid value "${m[2]}" for ${m[1]}. Choose a value from the dropdown.`;
}
