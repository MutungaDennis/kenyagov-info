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

/**
 * Lifecycle / organisational status (not the same as is_active publish flag).
 * is_active controls public directory visibility; status describes real-world state.
 */
export const INSTITUTION_STATUS_OPTIONS = [
  "Active",
  "Inactive",
  "Former",
  "Restructured",
  "Merged",
  "Succeeded",
  "Dissolved",
  "Abolished",
  "Suspended",
  "Proposed",
] as const;

/** Default for new records: Unverified until an admin marks Verified */
export const VERIFICATION_STATUS_OPTIONS = [
  "Unverified",
  "Verified",
  "Pending",
  "Needs review",
] as const;

/** Statuses that usually mean the org should not appear as a live public listing */
export const INSTITUTION_STATUS_IMPLIES_INACTIVE = new Set([
  "Inactive",
  "Former",
  "Dissolved",
  "Abolished",
  "Merged",
  "Succeeded",
]);

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

    if (key === "current_head_id") {
      const id = val == null || val === "" ? null : String(val).trim();
      row[key] = id || null;
      continue;
    }

    if (DATE_FIELDS.has(key)) {
      row[key] = String(val).slice(0, 10);
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
