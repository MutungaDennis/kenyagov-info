"use client";

import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  ARM_OF_GOVERNMENT_OPTIONS,
  CONSTITUTIONAL_STATUS_OPTIONS,
  FUNDING_MODEL_OPTIONS,
  GOVERNMENT_LEVEL_OPTIONS,
  INSTITUTION_CATEGORY_OPTIONS,
  INSTITUTION_NATURE_OPTIONS,
  INSTITUTION_STATUS_OPTIONS,
  LEGAL_BASIS_TYPE_OPTIONS,
  OPERATIONAL_MODEL_OPTIONS,
  VERIFICATION_STATUS_OPTIONS,
  formatTextArray,
} from "@/lib/institutions/fields";
import InstitutionLinkPicker from "@/components/admin/InstitutionLinkPicker";
import LeaderLinkPicker, {
  type LeaderPickResult,
} from "@/components/admin/LeaderLinkPicker";
import {
  SOCIAL_PLATFORM_OPTIONS,
  parseSocialLinks,
  type SocialLink,
} from "@/lib/leaders/titles-social";

export type InstitutionFormState = {
  name: string;
  short_name: string;
  official_name: string;
  slug: string;
  /** Hierarchy — UUIDs linking to other institutions */
  parent_institution_id: string;
  parent_institution_label: string;
  supervising_ministry_id: string;
  supervising_ministry_label: string;
  reports_to_institution_id: string;
  reports_to_institution_label: string;
  former_names: string;
  aliases: string;
  common_misspellings: string;
  institution_category: string;
  institution_type: string;
  institution_subtype: string;
  institution_nature: string;
  government_level: string;
  arm_of_government: string;
  constitutional_status: string;
  mtef_sector: string;
  jurisdiction_scope: string;
  operational_model: string;
  cofog_division: string;
  cofog_group: string;
  legal_basis_type: string;
  legal_basis_name: string;
  legal_basis_reference: string;
  establishment_act: string;
  established_date: string;
  operational_date: string;
  appointing_authority: string;
  funding_model: string;
  is_exchequer_funded: boolean;
  generates_own_revenue: boolean;
  receives_donor_funding: boolean;
  is_commercial_entity: boolean;
  is_regulator: boolean;
  regulated_sectors: string;
  offers_public_services: boolean;
  service_delivery_modes: string;
  has_online_services: boolean;
  ecitizen_integrated: boolean;
  api_available: boolean;
  open_data_available: boolean;
  publishes_annual_reports: boolean;
  publishes_budget: boolean;
  description: string;
  mandate: string;
  vision: string;
  mission: string;
  functions: string;
  keywords: string;
  target_population: string;
  headquarters: string;
  physical_address: string;
  postal_address: string;
  website_url: string;
  portal_url: string;
  email: string;
  phone: string;
  fax: string;
  toll_free: string;
  whatsapp: string;
  latitude: string;
  longitude: string;
  /** FK to leaders.id when head is linked from the directory */
  current_head_id: string;
  /** Display name snapshot (auto-filled when a leader is picked) */
  current_head: string;
  head_title: string;
  head_appointment_date: string;
  board_chair: string;
  /** Organisation social profiles (saved as social_media jsonb) */
  social_links: SocialLink[];
  logo_url: string;
  cover_image_url: string;
  citizen_charter_url: string;
  complaints_mechanism_url: string;
  procurement_portal_url: string;
  last_annual_report_year: string;
  last_audit_opinion: string;
  transparency_score: string;
  number_of_employees: string;
  annual_budget_estimate: string;
  status: string;
  verification_status: string;
  is_active: boolean;
  data_source: string;
  source_url: string;
};

export const emptyInstitutionForm = (): InstitutionFormState => ({
  name: "",
  short_name: "",
  official_name: "",
  slug: "",
  parent_institution_id: "",
  parent_institution_label: "",
  supervising_ministry_id: "",
  supervising_ministry_label: "",
  reports_to_institution_id: "",
  reports_to_institution_label: "",
  former_names: "",
  aliases: "",
  common_misspellings: "",
  institution_category: "",
  institution_type: "",
  institution_subtype: "",
  institution_nature: "",
  government_level: "National",
  arm_of_government: "Executive",
  constitutional_status: "",
  mtef_sector: "",
  jurisdiction_scope: "",
  operational_model: "",
  cofog_division: "",
  cofog_group: "",
  legal_basis_type: "",
  legal_basis_name: "",
  legal_basis_reference: "",
  establishment_act: "",
  established_date: "",
  operational_date: "",
  appointing_authority: "",
  funding_model: "",
  is_exchequer_funded: false,
  generates_own_revenue: false,
  receives_donor_funding: false,
  is_commercial_entity: false,
  is_regulator: false,
  regulated_sectors: "",
  offers_public_services: false,
  service_delivery_modes: "",
  has_online_services: false,
  ecitizen_integrated: false,
  api_available: false,
  open_data_available: false,
  publishes_annual_reports: false,
  publishes_budget: false,
  description: "",
  mandate: "",
  vision: "",
  mission: "",
  functions: "",
  keywords: "",
  target_population: "",
  headquarters: "",
  physical_address: "",
  postal_address: "",
  website_url: "",
  portal_url: "",
  email: "",
  phone: "",
  fax: "",
  toll_free: "",
  whatsapp: "",
  latitude: "",
  longitude: "",
  current_head_id: "",
  current_head: "",
  head_title: "",
  head_appointment_date: "",
  board_chair: "",
  social_links: [],
  logo_url: "",
  cover_image_url: "",
  citizen_charter_url: "",
  complaints_mechanism_url: "",
  procurement_portal_url: "",
  last_annual_report_year: "",
  last_audit_opinion: "",
  transparency_score: "",
  number_of_employees: "",
  annual_budget_estimate: "",
  status: "Active",
  verification_status: "Unverified",
  is_active: true,
  data_source: "",
  source_url: "",
});

export function institutionFormFromRow(
  data: Record<string, unknown>,
): InstitutionFormState {
  const s = (k: string) =>
    data[k] != null && data[k] !== "" ? String(data[k]) : "";
  const b = (k: string) => Boolean(data[k]);
  const d = (k: string) => {
    const v = data[k];
    if (!v) return "";
    return String(v).slice(0, 10);
  };
  const n = (k: string) =>
    data[k] != null && data[k] !== "" ? String(data[k]) : "";

  return {
    ...emptyInstitutionForm(),
    name: s("name"),
    short_name: s("short_name"),
    official_name: s("official_name"),
    slug: s("slug"),
    parent_institution_id: s("parent_institution_id"),
    parent_institution_label: s("parent_institution_label"),
    supervising_ministry_id: s("supervising_ministry_id"),
    supervising_ministry_label: s("supervising_ministry_label"),
    reports_to_institution_id: s("reports_to_institution_id"),
    reports_to_institution_label: s("reports_to_institution_label"),
    former_names: formatTextArray(data.former_names),
    aliases: formatTextArray(data.aliases),
    common_misspellings: formatTextArray(data.common_misspellings),
    institution_category: s("institution_category"),
    institution_type: s("institution_type"),
    institution_subtype: s("institution_subtype"),
    institution_nature: s("institution_nature"),
    government_level: s("government_level") || "National",
    arm_of_government: s("arm_of_government") || "Executive",
    constitutional_status: s("constitutional_status"),
    mtef_sector: s("mtef_sector"),
    jurisdiction_scope: s("jurisdiction_scope"),
    operational_model: s("operational_model"),
    cofog_division: s("cofog_division"),
    cofog_group: s("cofog_group"),
    legal_basis_type: s("legal_basis_type"),
    legal_basis_name: s("legal_basis_name"),
    legal_basis_reference: s("legal_basis_reference"),
    establishment_act: s("establishment_act"),
    established_date: d("established_date"),
    operational_date: d("operational_date"),
    appointing_authority: s("appointing_authority"),
    funding_model: s("funding_model"),
    is_exchequer_funded: b("is_exchequer_funded"),
    generates_own_revenue: b("generates_own_revenue"),
    receives_donor_funding: b("receives_donor_funding"),
    is_commercial_entity: b("is_commercial_entity"),
    is_regulator: b("is_regulator"),
    regulated_sectors: formatTextArray(data.regulated_sectors),
    offers_public_services: b("offers_public_services"),
    service_delivery_modes: formatTextArray(data.service_delivery_modes),
    has_online_services: b("has_online_services"),
    ecitizen_integrated: b("ecitizen_integrated"),
    api_available: b("api_available"),
    open_data_available: b("open_data_available"),
    publishes_annual_reports: b("publishes_annual_reports"),
    publishes_budget: b("publishes_budget"),
    description: s("description"),
    mandate: s("mandate"),
    vision: s("vision"),
    mission: s("mission"),
    functions: formatTextArray(data.functions),
    keywords: formatTextArray(data.keywords),
    target_population: s("target_population"),
    headquarters: s("headquarters"),
    physical_address: s("physical_address"),
    postal_address: s("postal_address"),
    website_url: s("website_url"),
    portal_url: s("portal_url"),
    email: s("email"),
    phone: s("phone"),
    fax: s("fax"),
    toll_free: s("toll_free"),
    whatsapp: s("whatsapp"),
    latitude: n("latitude"),
    longitude: n("longitude"),
    current_head_id: s("current_head_id"),
    current_head: s("current_head"),
    head_title: s("head_title"),
    head_appointment_date: d("head_appointment_date"),
    board_chair: s("board_chair"),
    social_links: parseSocialLinks(data.social_media),
    logo_url: s("logo_url"),
    cover_image_url: s("cover_image_url"),
    citizen_charter_url: s("citizen_charter_url"),
    complaints_mechanism_url: s("complaints_mechanism_url"),
    procurement_portal_url: s("procurement_portal_url"),
    last_annual_report_year: n("last_annual_report_year"),
    last_audit_opinion: s("last_audit_opinion"),
    transparency_score: n("transparency_score"),
    number_of_employees: n("number_of_employees"),
    annual_budget_estimate: n("annual_budget_estimate"),
    status: s("status") || "Active",
    verification_status: s("verification_status") || "Unverified",
    is_active: data.is_active !== false,
    data_source: s("data_source"),
    source_url: s("source_url"),
  };
}

type Props = {
  form: InstitutionFormState;
  onChange: (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => void;
  /** Update hierarchy UUID + display label fields */
  onHierarchyChange?: (
    field:
      | "parent_institution"
      | "supervising_ministry"
      | "reports_to_institution",
    pick: { id: string; label: string },
  ) => void;
  /** Link current head from leaders directory */
  onHeadLeaderChange?: (pick: LeaderPickResult) => void;
  /** Social media rows */
  onSocialLinksChange?: (links: SocialLink[]) => void;
  onSubmit: (e: FormEvent) => void;
  submitting: boolean;
  submitLabel: string;
  /** When false, Save is disabled (no unsaved changes) */
  canSave?: boolean;
  institutionTypes?: string[];
  mtefSectors?: string[];
  cancelHref: string;
  extraActions?: ReactNode;
  /** Exclude this institution when picking parents (edit mode) */
  excludeInstitutionId?: string;
};

function Field({
  id,
  label,
  children,
  hint,
}: {
  id?: string;
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <div className="govuk-form-group">
      <label className="govuk-label" htmlFor={id}>
        {label}
      </label>
      {hint && <div className="govuk-hint">{hint}</div>}
      {children}
    </div>
  );
}

export default function InstitutionForm({
  form,
  onChange,
  onHierarchyChange,
  onHeadLeaderChange,
  onSocialLinksChange,
  onSubmit,
  submitting,
  submitLabel,
  canSave = true,
  institutionTypes = [],
  mtefSectors = [],
  cancelHref,
  extraActions,
  excludeInstitutionId,
}: Props) {
  const saveEnabled = canSave && !submitting;

  return (
    <form onSubmit={onSubmit} className="govuk-!-margin-top-4">
      <h2 className="govuk-heading-m">Identity</h2>
      <Field id="name" label="Name *">
        <input
          className="govuk-input"
          id="name"
          name="name"
          value={form.name}
          onChange={onChange}
          required
        />
      </Field>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="short_name" label="Short name / acronym">
            <input
              className="govuk-input"
              id="short_name"
              name="short_name"
              value={form.short_name}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field id="official_name" label="Official name">
            <input
              className="govuk-input"
              id="official_name"
              name="official_name"
              value={form.official_name}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>
      <Field
        id="slug"
        label="URL slug *"
        hint="Public page: /government/institutions/{slug}"
      >
        <input
          className="govuk-input"
          id="slug"
          name="slug"
          value={form.slug}
          onChange={onChange}
          required
        />
      </Field>
      <Field
        id="former_names"
        label="Former names"
        hint="Comma-separated list"
      >
        <input
          className="govuk-input"
          id="former_names"
          name="former_names"
          value={form.former_names}
          onChange={onChange}
        />
      </Field>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="aliases" label="Aliases" hint="Comma-separated">
            <input
              className="govuk-input"
              id="aliases"
              name="aliases"
              value={form.aliases}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            id="common_misspellings"
            label="Common misspellings"
            hint="Comma-separated"
          >
            <input
              className="govuk-input"
              id="common_misspellings"
              name="common_misspellings"
              value={form.common_misspellings}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>

      <h2 className="govuk-heading-m">Government hierarchy</h2>
      <p className="govuk-body">
        Link this body to its parent so the structure is clear — e.g. Kenya Air
        Force under Kenya Defence Forces under the Ministry of Defence. Major
        parents (ministries, constitutional commissions) may have no parent.
      </p>
      <InstitutionLinkPicker
        id="parent_institution"
        label="Parent institution"
        hint="Direct organisational parent (e.g. KAF → KDF)"
        valueId={form.parent_institution_id}
        valueLabel={form.parent_institution_label}
        excludeId={excludeInstitutionId}
        onChange={(pick) => onHierarchyChange?.("parent_institution", pick)}
      />
      <InstitutionLinkPicker
        id="supervising_ministry"
        label="Supervising ministry / parent body"
        hint="Policy ministry or constitutional body that oversees this entity"
        valueId={form.supervising_ministry_id}
        valueLabel={form.supervising_ministry_label}
        excludeId={excludeInstitutionId}
        onChange={(pick) => onHierarchyChange?.("supervising_ministry", pick)}
      />
      <InstitutionLinkPicker
        id="reports_to"
        label="Reports to (if different)"
        hint="Optional: formal reporting line when not the same as parent"
        valueId={form.reports_to_institution_id}
        valueLabel={form.reports_to_institution_label}
        excludeId={excludeInstitutionId}
        onChange={(pick) =>
          onHierarchyChange?.("reports_to_institution", pick)
        }
      />

      <h2 className="govuk-heading-m">Classification</h2>
      <p className="govuk-hint">
        Enum fields use exact database values. Free-text type/sector use
        suggestions from existing institutions.
      </p>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="institution_category" label="Institution category">
            <select
              className="govuk-select"
              id="institution_category"
              name="institution_category"
              value={form.institution_category}
              onChange={onChange}
            >
              <option value="">— Select —</option>
              {INSTITUTION_CATEGORY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field id="institution_type" label="Institution type">
            <input
              className="govuk-input"
              id="institution_type"
              name="institution_type"
              list="itype-list"
              value={form.institution_type}
              onChange={onChange}
              placeholder="Ministry, State Corporation…"
            />
            <datalist id="itype-list">
              {institutionTypes.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </Field>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="institution_subtype" label="Subtype">
            <input
              className="govuk-input"
              id="institution_subtype"
              name="institution_subtype"
              value={form.institution_subtype}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            id="institution_nature"
            label="Nature"
            hint="Pick a suggestion or type a value not in the list"
          >
            <input
              className="govuk-input"
              id="institution_nature"
              name="institution_nature"
              list="nature-list"
              value={form.institution_nature}
              onChange={onChange}
              placeholder="e.g. Service delivery agency"
            />
            <datalist id="nature-list">
              {INSTITUTION_NATURE_OPTIONS.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </Field>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <Field id="government_level" label="Government level">
            <select
              className="govuk-select"
              id="government_level"
              name="government_level"
              value={form.government_level}
              onChange={onChange}
            >
              {GOVERNMENT_LEVEL_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="govuk-grid-column-one-third">
          <Field id="arm_of_government" label="Arm of government">
            <select
              className="govuk-select"
              id="arm_of_government"
              name="arm_of_government"
              value={form.arm_of_government}
              onChange={onChange}
            >
              {ARM_OF_GOVERNMENT_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="govuk-grid-column-one-third">
          <Field id="constitutional_status" label="Constitutional status">
            <select
              className="govuk-select"
              id="constitutional_status"
              name="constitutional_status"
              value={form.constitutional_status}
              onChange={onChange}
            >
              <option value="">— Select —</option>
              {CONSTITUTIONAL_STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="mtef_sector" label="MTEF sector">
            <input
              className="govuk-input"
              id="mtef_sector"
              name="mtef_sector"
              list="mtef-list"
              value={form.mtef_sector}
              onChange={onChange}
            />
            <datalist id="mtef-list">
              {mtefSectors.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            id="operational_model"
            label="Operational model"
            hint="Pick a suggestion or type a new model"
          >
            <input
              className="govuk-input"
              id="operational_model"
              name="operational_model"
              list="opmodel-list"
              value={form.operational_model}
              onChange={onChange}
              placeholder="e.g. Department, Service agency"
            />
            <datalist id="opmodel-list">
              {OPERATIONAL_MODEL_OPTIONS.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </Field>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="jurisdiction_scope" label="Jurisdiction scope">
            <input
              className="govuk-input"
              id="jurisdiction_scope"
              name="jurisdiction_scope"
              value={form.jurisdiction_scope}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <Field id="cofog_division" label="COFOG division">
            <input
              className="govuk-input"
              id="cofog_division"
              name="cofog_division"
              value={form.cofog_division}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <Field id="cofog_group" label="COFOG group">
            <input
              className="govuk-input"
              id="cofog_group"
              name="cofog_group"
              value={form.cofog_group}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>

      <h2 className="govuk-heading-m">Legal basis & history</h2>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <Field
            id="legal_basis_type"
            label="Legal basis type"
            hint="Suggestion or free text (e.g. Constitution, Executive Order)"
          >
            <input
              className="govuk-input"
              id="legal_basis_type"
              name="legal_basis_type"
              list="legal-basis-type-list"
              value={form.legal_basis_type}
              onChange={onChange}
              placeholder="e.g. Act of Parliament"
            />
            <datalist id="legal-basis-type-list">
              {LEGAL_BASIS_TYPE_OPTIONS.map((o) => (
                <option key={o} value={o} />
              ))}
              <option value="Constitution" />
              <option value="Executive Order" />
              <option value="Presidential Decree" />
              <option value="Gazette Notice" />
              <option value="Treaty" />
              <option value="Regulation" />
              <option value="Other" />
            </datalist>
          </Field>
        </div>
        <div className="govuk-grid-column-one-third">
          <Field id="legal_basis_name" label="Legal basis name">
            <input
              className="govuk-input"
              id="legal_basis_name"
              name="legal_basis_name"
              value={form.legal_basis_name}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-third">
          <Field id="establishment_act" label="Establishment act">
            <input
              className="govuk-input"
              id="establishment_act"
              name="establishment_act"
              value={form.establishment_act}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>
      <Field id="legal_basis_reference" label="Legal basis reference">
        <input
          className="govuk-input"
          id="legal_basis_reference"
          name="legal_basis_reference"
          value={form.legal_basis_reference}
          onChange={onChange}
        />
      </Field>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <Field id="established_date" label="Established date">
            <input
              className="govuk-input"
              id="established_date"
              name="established_date"
              type="date"
              value={form.established_date}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-third">
          <Field id="operational_date" label="Operational date">
            <input
              className="govuk-input"
              id="operational_date"
              name="operational_date"
              type="date"
              value={form.operational_date}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-third">
          <Field id="appointing_authority" label="Appointing authority">
            <input
              className="govuk-input"
              id="appointing_authority"
              name="appointing_authority"
              value={form.appointing_authority}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>

      <h2 className="govuk-heading-m">Funding & services</h2>
      <Field id="funding_model" label="Funding model">
        <select
          className="govuk-select"
          id="funding_model"
          name="funding_model"
          value={form.funding_model}
          onChange={onChange}
        >
          <option value="">— Select —</option>
          {FUNDING_MODEL_OPTIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>
      <div className="govuk-checkboxes govuk-!-margin-bottom-4">
        {(
          [
            ["is_exchequer_funded", "Exchequer funded"],
            ["generates_own_revenue", "Generates own revenue"],
            ["receives_donor_funding", "Receives donor funding"],
            ["is_commercial_entity", "Commercial entity"],
            ["is_regulator", "Regulator"],
            ["offers_public_services", "Offers public services"],
            ["has_online_services", "Has online services"],
            ["ecitizen_integrated", "eCitizen integrated"],
            ["api_available", "API available"],
            ["open_data_available", "Open data available"],
            ["publishes_annual_reports", "Publishes annual reports"],
            ["publishes_budget", "Publishes budget"],
          ] as const
        ).map(([name, label]) => (
          <div className="govuk-checkboxes__item" key={name}>
            <input
              className="govuk-checkboxes__input"
              id={name}
              name={name}
              type="checkbox"
              checked={form[name]}
              onChange={onChange}
            />
            <label
              className="govuk-label govuk-checkboxes__label"
              htmlFor={name}
            >
              {label}
            </label>
          </div>
        ))}
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            id="regulated_sectors"
            label="Regulated sectors"
            hint="Comma-separated"
          >
            <input
              className="govuk-input"
              id="regulated_sectors"
              name="regulated_sectors"
              value={form.regulated_sectors}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            id="service_delivery_modes"
            label="Service delivery modes"
            hint="Comma-separated"
          >
            <input
              className="govuk-input"
              id="service_delivery_modes"
              name="service_delivery_modes"
              value={form.service_delivery_modes}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>

      <h2 className="govuk-heading-m">Description & mandate</h2>
      <Field id="description" label="Description">
        <textarea
          className="govuk-textarea"
          id="description"
          name="description"
          rows={4}
          value={form.description}
          onChange={onChange}
        />
      </Field>
      <Field id="mandate" label="Mandate">
        <textarea
          className="govuk-textarea"
          id="mandate"
          name="mandate"
          rows={3}
          value={form.mandate}
          onChange={onChange}
        />
      </Field>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="vision" label="Vision">
            <textarea
              className="govuk-textarea"
              id="vision"
              name="vision"
              rows={2}
              value={form.vision}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field id="mission" label="Mission">
            <textarea
              className="govuk-textarea"
              id="mission"
              name="mission"
              rows={2}
              value={form.mission}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>
      <Field id="functions" label="Functions" hint="Comma-separated">
        <textarea
          className="govuk-textarea"
          id="functions"
          name="functions"
          rows={2}
          value={form.functions}
          onChange={onChange}
        />
      </Field>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="keywords" label="Keywords" hint="Comma-separated">
            <input
              className="govuk-input"
              id="keywords"
              name="keywords"
              value={form.keywords}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field id="target_population" label="Target population">
            <input
              className="govuk-input"
              id="target_population"
              name="target_population"
              value={form.target_population}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>

      <h2 className="govuk-heading-m">Leadership</h2>
      <p className="govuk-hint">
        Link the current head to an existing leader so the public page can open
        their profile. Fill head title and appointment date for this role at the
        institution.
      </p>
      {onHeadLeaderChange && (
        <LeaderLinkPicker
          id="current_head_leader"
          label="Current head (from leaders)"
          hint="Search the officials directory. Creates a proper link on the public site."
          valueId={form.current_head_id}
          valueLabel={form.current_head}
          onChange={onHeadLeaderChange}
        />
      )}
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field
            id="current_head"
            label="Current head name"
            hint="Auto-filled when you pick a leader; you can also type a name if they are not in the directory yet."
          >
            <input
              className="govuk-input"
              id="current_head"
              name="current_head"
              value={form.current_head}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            id="head_title"
            label="Head title"
            hint="Role at this institution (e.g. Cabinet Secretary, Chairperson, Director General)"
          >
            <input
              className="govuk-input"
              id="head_title"
              name="head_title"
              value={form.head_title}
              onChange={onChange}
              placeholder="e.g. Cabinet Secretary"
            />
          </Field>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="head_appointment_date" label="Head appointment date">
            <input
              className="govuk-input"
              id="head_appointment_date"
              name="head_appointment_date"
              type="date"
              value={form.head_appointment_date}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field id="board_chair" label="Board chair">
            <input
              className="govuk-input"
              id="board_chair"
              name="board_chair"
              value={form.board_chair}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>

      <h2 className="govuk-heading-m">Contact & location</h2>
      <Field id="headquarters" label="Headquarters">
        <input
          className="govuk-input"
          id="headquarters"
          name="headquarters"
          value={form.headquarters}
          onChange={onChange}
        />
      </Field>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="physical_address" label="Physical address">
            <textarea
              className="govuk-textarea"
              id="physical_address"
              name="physical_address"
              rows={2}
              value={form.physical_address}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field id="postal_address" label="Postal address">
            <textarea
              className="govuk-textarea"
              id="postal_address"
              name="postal_address"
              rows={2}
              value={form.postal_address}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="website_url" label="Website">
            <input
              className="govuk-input"
              id="website_url"
              name="website_url"
              type="url"
              value={form.website_url}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field id="portal_url" label="Service portal URL">
            <input
              className="govuk-input"
              id="portal_url"
              name="portal_url"
              type="url"
              value={form.portal_url}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <Field id="email" label="Email">
            <input
              className="govuk-input"
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <Field id="phone" label="Phone">
            <input
              className="govuk-input"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <Field id="toll_free" label="Toll free">
            <input
              className="govuk-input"
              id="toll_free"
              name="toll_free"
              value={form.toll_free}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <Field id="whatsapp" label="WhatsApp">
            <input
              className="govuk-input"
              id="whatsapp"
              name="whatsapp"
              value={form.whatsapp}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <Field id="fax" label="Fax">
            <input
              className="govuk-input"
              id="fax"
              name="fax"
              value={form.fax}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-third">
          <Field id="latitude" label="Latitude">
            <input
              className="govuk-input"
              id="latitude"
              name="latitude"
              value={form.latitude}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-third">
          <Field id="longitude" label="Longitude">
            <input
              className="govuk-input"
              id="longitude"
              name="longitude"
              value={form.longitude}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>

      <h2 className="govuk-heading-m">Social media</h2>
      <p className="govuk-hint">
        Organisation profiles (not the head’s personal accounts). Choose the
        platform, then paste the full profile URL.
      </p>
      {(form.social_links || []).map((link, i) => (
        <div
          key={i}
          className="govuk-grid-row govuk-!-margin-bottom-2"
          style={{ alignItems: "end" }}
        >
          <div className="govuk-grid-column-one-third">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor={`inst-soc-plat-${i}`}>
                Platform
              </label>
              <select
                id={`inst-soc-plat-${i}`}
                className="govuk-select"
                value={link.platform}
                onChange={(e) => {
                  if (!onSocialLinksChange) return;
                  const next = [...(form.social_links || [])];
                  next[i] = { ...next[i], platform: e.target.value };
                  onSocialLinksChange(next);
                }}
              >
                <option value="">— Select —</option>
                {SOCIAL_PLATFORM_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="govuk-grid-column-one-half">
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor={`inst-soc-url-${i}`}>
                Profile URL
              </label>
              <input
                id={`inst-soc-url-${i}`}
                className="govuk-input"
                type="url"
                value={link.url}
                onChange={(e) => {
                  if (!onSocialLinksChange) return;
                  const next = [...(form.social_links || [])];
                  next[i] = { ...next[i], url: e.target.value };
                  onSocialLinksChange(next);
                }}
                placeholder="https://x.com/…"
              />
            </div>
          </div>
          <div className="govuk-grid-column-one-sixth">
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={() => {
                if (!onSocialLinksChange) return;
                onSocialLinksChange(
                  (form.social_links || []).filter((_, j) => j !== i),
                );
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="govuk-button govuk-button--secondary govuk-!-margin-bottom-6"
        onClick={() => {
          if (!onSocialLinksChange) return;
          onSocialLinksChange([
            ...(form.social_links || []),
            { platform: "x", url: "" },
          ]);
        }}
      >
        Add social link
      </button>

      <h2 className="govuk-heading-m">Transparency & size</h2>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="citizen_charter_url" label="Citizen charter URL">
            <input
              className="govuk-input"
              id="citizen_charter_url"
              name="citizen_charter_url"
              type="url"
              value={form.citizen_charter_url}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field
            id="complaints_mechanism_url"
            label="Complaints mechanism URL"
          >
            <input
              className="govuk-input"
              id="complaints_mechanism_url"
              name="complaints_mechanism_url"
              type="url"
              value={form.complaints_mechanism_url}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="procurement_portal_url" label="Procurement portal URL">
            <input
              className="govuk-input"
              id="procurement_portal_url"
              name="procurement_portal_url"
              type="url"
              value={form.procurement_portal_url}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field id="logo_url" label="Logo URL">
            <input
              className="govuk-input"
              id="logo_url"
              name="logo_url"
              type="url"
              value={form.logo_url}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter">
          <Field id="last_annual_report_year" label="Last annual report year">
            <input
              className="govuk-input"
              id="last_annual_report_year"
              name="last_annual_report_year"
              value={form.last_annual_report_year}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <Field id="last_audit_opinion" label="Last audit opinion">
            <input
              className="govuk-input"
              id="last_audit_opinion"
              name="last_audit_opinion"
              value={form.last_audit_opinion}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <Field id="number_of_employees" label="Number of employees">
            <input
              className="govuk-input"
              id="number_of_employees"
              name="number_of_employees"
              value={form.number_of_employees}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <Field id="annual_budget_estimate" label="Annual budget estimate">
            <input
              className="govuk-input"
              id="annual_budget_estimate"
              name="annual_budget_estimate"
              value={form.annual_budget_estimate}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>

      <h2 className="govuk-heading-m">Status</h2>
      <p className="govuk-hint">
        <strong>Status</strong> is the organisation’s real-world lifecycle
        (active, former, restructured, etc.).{" "}
        <strong>Published on public site</strong> controls whether it appears in
        the public directory. New records default to Unverified until reviewed.
      </p>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">
          <Field
            id="status"
            label="Status"
            hint="Use Former / Dissolved / Merged for organisations that no longer exist as listed."
          >
            <select
              className="govuk-select"
              id="status"
              name="status"
              value={form.status}
              onChange={onChange}
            >
              {!INSTITUTION_STATUS_OPTIONS.includes(
                form.status as (typeof INSTITUTION_STATUS_OPTIONS)[number],
              ) &&
                form.status && (
                  <option value={form.status}>{form.status}</option>
                )}
              {INSTITUTION_STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="govuk-grid-column-one-third">
          <Field
            id="verification_status"
            label="Verification"
            hint="Default Unverified. Set Verified when facts are checked."
          >
            <select
              className="govuk-select"
              id="verification_status"
              name="verification_status"
              value={form.verification_status}
              onChange={onChange}
            >
              {!VERIFICATION_STATUS_OPTIONS.includes(
                form.verification_status as (typeof VERIFICATION_STATUS_OPTIONS)[number],
              ) &&
                form.verification_status && (
                  <option value={form.verification_status}>
                    {form.verification_status}
                  </option>
                )}
              {VERIFICATION_STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-checkboxes govuk-!-margin-top-6">
            <div className="govuk-checkboxes__item">
              <input
                className="govuk-checkboxes__input"
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={form.is_active}
                onChange={onChange}
              />
              <label
                className="govuk-label govuk-checkboxes__label"
                htmlFor="is_active"
              >
                Published on public site
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">
          <Field id="data_source" label="Data source">
            <input
              className="govuk-input"
              id="data_source"
              name="data_source"
              value={form.data_source}
              onChange={onChange}
            />
          </Field>
        </div>
        <div className="govuk-grid-column-one-half">
          <Field id="source_url" label="Source URL">
            <input
              className="govuk-input"
              id="source_url"
              name="source_url"
              type="url"
              value={form.source_url}
              onChange={onChange}
            />
          </Field>
        </div>
      </div>

      <div className="govuk-button-group govuk-!-margin-top-6">
        <button
          type="submit"
          className="govuk-button"
          disabled={!saveEnabled}
          aria-disabled={!saveEnabled}
        >
          {submitting ? "Saving…" : submitLabel}
        </button>
        <a href={cancelHref} className="govuk-button govuk-button--secondary">
          Cancel
        </a>
        {extraActions}
      </div>
      {!canSave && !submitting && (
        <p className="govuk-hint">No unsaved changes.</p>
      )}
    </form>
  );
}

/** Stable snapshot for dirty-checking (ignores label-only hierarchy fields). */
export function institutionFormSnapshot(form: InstitutionFormState): string {
  const {
    parent_institution_label: _p,
    supervising_ministry_label: _s,
    reports_to_institution_label: _r,
    social_links,
    ...rest
  } = form;
  return JSON.stringify({
    ...rest,
    social_links: (social_links || [])
      .map((l) => ({
        platform: (l.platform || "").trim().toLowerCase(),
        url: (l.url || "").trim(),
      }))
      .filter((l) => l.platform || l.url)
      .sort((a, b) => a.platform.localeCompare(b.platform)),
  });
}

/** Payload for create/update APIs (maps social_links → social_media). */
export function institutionFormToPayload(
  form: InstitutionFormState,
): Record<string, unknown> {
  const { social_links, parent_institution_label, supervising_ministry_label, reports_to_institution_label, ...rest } =
    form;
  void parent_institution_label;
  void supervising_ministry_label;
  void reports_to_institution_label;
  return {
    ...rest,
    social_media: (social_links || []).filter((l) => l.platform && l.url.trim()),
    current_head_id: form.current_head_id || null,
  };
}
