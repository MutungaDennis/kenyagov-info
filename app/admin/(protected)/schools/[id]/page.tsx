"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import SchoolOfficialsEditor from "@/components/schools/SchoolOfficialsEditor";
import SchoolSourcesEditor from "@/components/schools/SchoolSourcesEditor";
import { SCHOOL_LEVELS } from "@/lib/schools/types";

type CountyOption = { id: string; code: number; name: string };
type SubCountyOption = { id: string; county_code: number; name: string };
type ConstituencyOption = { id: string; county_id: string; name: string };
type WardOption = { id: string; constituency_id: string; name: string };
type GeographyOptions = { counties: CountyOption[]; subCounties: SubCountyOption[]; constituencies: ConstituencyOption[]; wards: WardOption[] };

type Record = {
  official_name: string;
  ownership: string;
  main_tier: string | null;
  description: string | null;
  slug: string;
  county: string | null;
  county_code: number | null;
  sub_county: string | null;
  sub_county_id: string | null;
  constituency: string | null;
  constituency_id: string | null;
  ward: string | null;
  ward_id: string | null;
  is_published: boolean;
  short_name: string | null;
  operational_status: string | null;
  institution_type: string | null;
  moe_category: string | null;
  gender_type: string | null;
  accommodation_type: string | null;
  registration_status: string | null;
  sponsor_name: string | null;
  special_needs_status: string | null;
  sne_categories: string[] | null;
  physical_address: string | null;
  postal_address: string | null;
  latitude: number | null;
  longitude: number | null;
  public_phone: string | null;
  public_email: string | null;
  website_url: string | null;
  nemis_code: string | null;
  knec_code: string | null;
  tsc_code: string | null;
  total_enrollment: number | null;
  total_teachers: number | null;
  water_source: string | null;
  power_source: string | null;
  internet_connectivity: string | null;
  verification_status: string | null;
};

export default function SchoolEditor() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState("");
  const [savedName, setSavedName] = useState("");
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<Record | null>(null);
  const [geography, setGeography] = useState<GeographyOptions>({ counties: [], subCounties: [], constituencies: [], wards: [] });
  const [geographyLoading, setGeographyLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/schools/${id}`, { signal: controller.signal }).then(async response => {
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setSchool(body); setSavedName(body.official_name);
    }).catch(error => { if (error.name !== "AbortError") setMessage(error.message); });
    return () => controller.abort();
  }, [id]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/schools/lookups", { signal: controller.signal })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || "Could not load geographic options");
        setGeography(body);
      })
      .catch((error) => { if (error.name !== "AbortError") setMessage(error.message); })
      .finally(() => { if (!controller.signal.aborted) setGeographyLoading(false); });
    return () => controller.abort();
  }, []);
  const schoolCounty = school && (geography.counties.find((option) => option.code === school.county_code)
    ?? geography.counties.find((option) => option.name.trim().toLowerCase() === school.county?.trim().toLowerCase()));
  const selectedCountyCode = school?.county_code ?? schoolCounty?.code ?? null;
  const selectedSubCountyId = school?.sub_county_id ?? geography.subCounties.find((option) => option.county_code === selectedCountyCode && option.name.trim().toLowerCase() === school?.sub_county?.trim().toLowerCase())?.id ?? null;
  const schoolConstituency = school && (geography.constituencies.find((option) => option.id === school.constituency_id)
    ?? geography.constituencies.find((option) => option.county_id === schoolCounty?.id && option.name.trim().toLowerCase() === school.constituency?.trim().toLowerCase()));
  const selectedConstituencyId = school?.constituency_id ?? schoolConstituency?.id ?? null;
  const selectedWardId = school?.ward_id ?? geography.wards.find((option) => option.constituency_id === selectedConstituencyId && option.name.trim().toLowerCase() === school?.ward?.trim().toLowerCase())?.id ?? null;
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!school) return;
    setSaving(true); setMessage("");
    try {
      const { official_name, slug, ownership, main_tier, description, is_published, short_name, operational_status, institution_type, moe_category, gender_type, accommodation_type, registration_status, sponsor_name, special_needs_status, sne_categories, county, sub_county, constituency, ward, physical_address, postal_address, latitude, longitude, public_phone, public_email, website_url, nemis_code, knec_code, tsc_code, total_enrollment, total_teachers, water_source, power_source, internet_connectivity, verification_status } = school;
      const response = await fetch(`/api/admin/schools/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ official_name, slug, ownership, main_tier, description, is_published, short_name, operational_status, institution_type, moe_category, gender_type, accommodation_type, registration_status, sponsor_name, special_needs_status, sne_categories, county, county_code: selectedCountyCode, sub_county, sub_county_id: selectedSubCountyId, constituency, constituency_id: selectedConstituencyId, ward, ward_id: selectedWardId, physical_address, postal_address, latitude, longitude, public_phone, public_email, website_url, nemis_code, knec_code, tsc_code, total_enrollment, total_teachers, water_source, power_source, internet_connectivity, verification_status }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      setSchool(body); setSavedName(body.official_name); setMessage("School saved. Public visibility and government responsibility have been updated.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save school"); }
    finally { setSaving(false); }
  }
  async function deleteSchool() {
    if (confirmation !== savedName || saving) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch(`/api/admin/schools/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error);
      router.replace(adminPath("schools"));
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not delete school"); setSaving(false); }
  }
  return <div className="govuk-width-container">
    <Link className="govuk-back-link" href={adminPath("schools")}>Back to schools</Link>
    <h1 className="govuk-heading-xl">Manage school</h1>
    <p className="govuk-body" role="status">{message || (!school ? "Loading school…" : "Public primary and junior schools belong to DPE; public secondary schools belong to DSE. Both are supervised by MoE. Other ownership types are visible only to administrators.")}</p>
    {school && <form onSubmit={save}>
      <h2 className="govuk-heading-m">Publication</h2>
      <div className="govuk-checkboxes govuk-!-margin-bottom-5"><div className="govuk-checkboxes__item">
        <input className="govuk-checkboxes__input" id="school-published" type="checkbox" checked={school.is_published} onChange={e => setSchool({ ...school, is_published: e.target.checked })} />
        <label className="govuk-label govuk-checkboxes__label" htmlFor="school-published">Published</label>
        <div className="govuk-hint govuk-checkboxes__hint">Clear this and save to hide the school from public profiles, counts and search. Private schools stay admin-only even when published.</div>
      </div></div>
      <h2 className="govuk-heading-m">School details</h2>
      <label className="govuk-label" htmlFor="school-name">Official name</label>
      <input id="school-name" className="govuk-input govuk-!-margin-bottom-5" required minLength={2} maxLength={250} value={school.official_name} onChange={e => setSchool({ ...school, official_name: e.target.value })} />
      <label className="govuk-label" htmlFor="school-slug">Public school URL</label>
      <div className="govuk-hint" id="school-slug-hint">Use lowercase words separated by hyphens. Changing this URL keeps the old address redirecting to the new one.</div>
      <div className="govuk-input__wrapper govuk-!-margin-bottom-5"><span className="govuk-input__prefix" aria-hidden="true">/government/institutions/</span><input id="school-slug" aria-describedby="school-slug-hint" className="govuk-input" required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={160} value={school.slug} onChange={e => setSchool({ ...school, slug: e.target.value })} /></div>
      <label className="govuk-label" htmlFor="school-ownership">Ownership</label>
      <select id="school-ownership" className="govuk-select govuk-!-margin-bottom-5" value={school.ownership} onChange={e => setSchool({ ...school, ownership: e.target.value })}>
        {["public", "private", "community", "faith_based", "other", "unknown"].map(value => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
      </select>
      <label className="govuk-label" htmlFor="school-tier">Main school level</label>
      <select id="school-tier" className="govuk-select govuk-!-margin-bottom-5" value={school.main_tier || ""} onChange={e => setSchool({ ...school, main_tier: e.target.value || null })}>
        <option value="">Not recorded</option>{Object.entries(SCHOOL_LEVELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
      <label className="govuk-label" htmlFor="school-description">Description</label>
      <textarea id="school-description" className="govuk-textarea govuk-!-margin-bottom-5" rows={6} maxLength={10000} value={school.description || ""} onChange={e => setSchool({ ...school, description: e.target.value || null })} />
      <SchoolDropdown label="School type" value={school.institution_type || ""} options={["regular", "special", "integrated", "ecde_centre", "hospital_school", "other"]} onChange={value => setSchool({ ...school, institution_type: value || null })} />
      <SchoolDropdown label="School category" value={school.moe_category || ""} options={["national", "extra_county", "county", "sub_county", "special_needs", "integrated", "private", "other", "unknown"]} onChange={value => setSchool({ ...school, moe_category: value || null })} />
      <SchoolDropdown label="Learner gender" value={school.gender_type || ""} options={["boys", "girls", "mixed"]} onChange={value => setSchool({ ...school, gender_type: value || null })} />
      <SchoolDropdown label="Attendance arrangement" value={school.accommodation_type || ""} options={["day", "boarding", "partial_boarding"]} onChange={value => setSchool({ ...school, accommodation_type: value || null })} />
      <SchoolDropdown label="Registration status" value={school.registration_status || ""} options={["registered", "provisional", "unregistered", "suspended", "unknown"]} onChange={value => setSchool({ ...school, registration_status: value || null })} />
      <label className="govuk-label" htmlFor="sponsor-name">Sponsor</label>
      <input id="sponsor-name" className="govuk-input govuk-!-margin-bottom-5" value={school.sponsor_name || ""} onChange={e => setSchool({ ...school, sponsor_name: e.target.value || null })} />
      <SchoolDropdown label="Special-needs provision" value={school.special_needs_status || ""} options={["not_applicable", "inclusive", "special_school", "resource_unit", "integrated", "unknown"]} onChange={value => setSchool({ ...school, special_needs_status: value || null })} />
      <fieldset className="govuk-fieldset govuk-!-margin-bottom-5">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Special-needs categories</legend>
        <div className="govuk-hint">Select all categories that apply.</div>
        <div className="govuk-checkboxes govuk-checkboxes--small">
          {["physical", "visual", "hearing", "intellectual", "autism", "multiple_disabilities", "communication", "specific_learning_difficulties", "albinism", "emotional_and_behavioural", "gifted_and_talented", "other"].map(category => <div className="govuk-checkboxes__item" key={category}>
            <input className="govuk-checkboxes__input" id={`sne-${category}`} type="checkbox" checked={(school.sne_categories || []).includes(category)} onChange={event => setSchool({ ...school, sne_categories: event.target.checked ? [...new Set([...(school.sne_categories || []), category])] : (school.sne_categories || []).filter(value => value !== category) })} />
            <label className="govuk-label govuk-checkboxes__label" htmlFor={`sne-${category}`}>{category.replaceAll("_", " ").replace(/\b\w/g, value => value.toUpperCase())}</label>
          </div>)}
        </div>
      </fieldset>
      <h3 className="govuk-heading-s">Location</h3>
      <SchoolDropdown label="County" value={selectedCountyCode == null ? "" : String(selectedCountyCode)} options={geography.counties.map(county => ({ value: String(county.code), label: county.name }))} disabled={geographyLoading} onChange={value => {
        const county = geography.counties.find(option => String(option.code) === value);
        setSchool({ ...school, county_code: county?.code ?? null, county: county?.name ?? null, sub_county: null, sub_county_id: null, constituency: null, constituency_id: null, ward: null, ward_id: null });
      }} />
      <SchoolDropdown label="Sub-county" value={selectedSubCountyId || ""} options={geography.subCounties.filter(option => option.county_code === selectedCountyCode).map(option => ({ value: option.id, label: option.name }))} disabled={!selectedCountyCode || geographyLoading} onChange={value => {
        const subCounty = geography.subCounties.find(option => option.id === value);
        setSchool({ ...school, sub_county_id: subCounty?.id ?? null, sub_county: subCounty?.name ?? null });
      }} />
      <SchoolDropdown label="Constituency" value={selectedConstituencyId || ""} options={geography.constituencies.filter(option => option.county_id === schoolCounty?.id).map(option => ({ value: option.id, label: option.name }))} disabled={!selectedCountyCode || geographyLoading} onChange={value => {
        const constituency = geography.constituencies.find(option => option.id === value);
        setSchool({ ...school, constituency_id: constituency?.id ?? null, constituency: constituency?.name ?? null, ward_id: null, ward: null });
      }} />
      <SchoolDropdown label="Ward" value={selectedWardId || ""} options={geography.wards.filter(option => option.constituency_id === selectedConstituencyId).map(option => ({ value: option.id, label: option.name }))} disabled={!selectedConstituencyId || geographyLoading} onChange={value => {
        const ward = geography.wards.find(option => option.id === value);
        setSchool({ ...school, ward_id: ward?.id ?? null, ward: ward?.name ?? null });
      }} />
      <label className="govuk-label" htmlFor="school-operating">Operating status</label>
      <select id="school-operating" className="govuk-select govuk-!-margin-bottom-5" value={school.operational_status || ""} onChange={e => setSchool({ ...school, operational_status: e.target.value || null })}>
        <option value="">Not recorded</option>{["operational", "temporarily_closed", "closed", "merged", "unknown"].map(value => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
      </select>
      <label className="govuk-label" htmlFor="school-verification">Verification status</label>
      <select id="school-verification" className="govuk-select govuk-!-margin-bottom-5" value={school.verification_status || ""} onChange={e => setSchool({ ...school, verification_status: e.target.value || null })}>
        <option value="">Not recorded</option>{["unverified", "source_confirmed", "cross_source_match", "institution_verified", "disputed"].map(value => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
      </select>
      {([ ["short_name", "Short name"], ["physical_address", "Physical address"], ["postal_address", "Postal address"], ["public_phone", "Public phone"], ["public_email", "Public email"], ["website_url", "Website"] ] as const).map(([key, label]) => <div className="govuk-form-group" key={key}>
        <label className="govuk-label" htmlFor={key}>{label}</label>
        <input id={key} className="govuk-input" type={key === "public_email" ? "email" : key === "website_url" ? "url" : key === "public_phone" ? "tel" : "text"} value={school[key] || ""} onChange={e => setSchool({ ...school, [key]: e.target.value || null })} />
      </div>)}
      {([ ["total_enrollment", "Total enrolment"], ["total_teachers", "Total teachers"] ] as const).map(([key, label]) => <div className="govuk-form-group" key={key}>
        <label className="govuk-label" htmlFor={key}>{label}</label>
        <input id={key} className="govuk-input govuk-input--width-10" type="number" min={0} step={1} value={school[key] ?? ""} onChange={e => setSchool({ ...school, [key]: e.target.value === "" ? null : Number(e.target.value) })} />
      </div>)}
      {([ ["water_source", "Water source"], ["power_source", "Power source"], ["internet_connectivity", "Internet connectivity"] ] as const).map(([key, label]) => <div className="govuk-form-group" key={key}>
        <label className="govuk-label" htmlFor={key}>{label}</label>
        <input id={key} className="govuk-input" value={school[key] || ""} onChange={e => setSchool({ ...school, [key]: e.target.value || null })} />
      </div>)}
      {([ ["nemis_code", "NEMIS code"], ["knec_code", "KNEC code"], ["tsc_code", "TSC code"] ] as const).map(([key, label]) => <div className="govuk-form-group" key={key}>
        <label className="govuk-label" htmlFor={key}>{label}</label>
        <input id={key} className="govuk-input" value={school[key] || ""} onChange={e => setSchool({ ...school, [key]: e.target.value || null })} />
      </div>)}
      {([ ["latitude", "Latitude"], ["longitude", "Longitude"] ] as const).map(([key, label]) => <div className="govuk-form-group" key={key}>
        <label className="govuk-label" htmlFor={key}>{label}</label>
        <input id={key} className="govuk-input govuk-input--width-10" type="number" step="any" value={school[key] ?? ""} onChange={e => setSchool({ ...school, [key]: e.target.value === "" ? null : Number(e.target.value) })} />
      </div>)}
      <p className="govuk-hint">Changing the canonical URL keeps the previous address as a redirect. Source records and official service histories are retained.</p>
      <button type="submit" className="govuk-button" disabled={saving}>{saving ? "Saving…" : "Save school"}</button>
      {school.ownership === "public" && school.is_published && <p className="govuk-body"><Link className="govuk-link" href={`/government/institutions/${school.slug}`}>View public school profile</Link></p>}
    </form>}
    {school && <SchoolSourcesEditor schoolId={id} />}
    {school && <SchoolOfficialsEditor schoolId={id} />}
    {school && <details className="govuk-details govuk-!-margin-top-8">
      <summary className="govuk-details__summary"><span className="govuk-details__summary-text">Permanently delete this school</span></summary>
      <div className="govuk-details__text">
        <p className="govuk-body">Deletion removes this school, its aliases, identifiers, offerings and imported source links. Unpublish it above if you only want to hide it.</p>
        <label className="govuk-label" htmlFor="delete-confirmation">Type <strong>{savedName}</strong> to confirm</label>
        <input id="delete-confirmation" className="govuk-input govuk-!-margin-bottom-4" autoComplete="off" value={confirmation} onChange={e => setConfirmation(e.target.value)} />
        <button type="button" className="govuk-button govuk-button--warning" disabled={saving || confirmation !== savedName} onClick={deleteSchool}>Delete school permanently</button>
      </div>
    </details>}
  </div>;
}

type SchoolOption = string | { value: string; label: string };

function SchoolDropdown({ label, value, options, onChange, disabled = false }: {
  label: string;
  value: string;
  options: SchoolOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const id = `school-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const normalized = options.map((option) => typeof option === "string"
    ? { value: option, label: option.replaceAll("_", " ").replace(/\b\w/g, (part) => part.toUpperCase()) }
    : option);
  const choices = value && !normalized.some((option) => option.value === value)
    ? [{ value, label: `${value.replaceAll("_", " ")} (existing value)` }, ...normalized]
    : normalized;
  return <div className="govuk-form-group">
    <label className="govuk-label" htmlFor={id}>{label}</label>
    <select className="govuk-select govuk-!-width-full" id={id} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
      <option value="">Not recorded</option>
      {choices.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </div>;
}
