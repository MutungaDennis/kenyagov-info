"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import { SCHOOL_LEVELS } from "@/lib/schools/types";

type Record = {
  official_name: string;
  ownership: string;
  main_tier: string | null;
  description: string | null;
  slug: string;
  county: string | null;
  sub_county: string | null;
  constituency: string | null;
  ward: string | null;
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
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!school) return;
    setSaving(true); setMessage("");
    try {
      const { official_name, ownership, main_tier, description, is_published, short_name, operational_status, institution_type, moe_category, gender_type, accommodation_type, registration_status, sponsor_name, special_needs_status, sne_categories, county, sub_county, constituency, ward, physical_address, postal_address, latitude, longitude, public_phone, public_email, website_url, nemis_code, knec_code, tsc_code, total_enrollment, total_teachers, water_source, power_source, internet_connectivity, verification_status } = school;
      const response = await fetch(`/api/admin/schools/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ official_name, ownership, main_tier, description, is_published, short_name, operational_status, institution_type, moe_category, gender_type, accommodation_type, registration_status, sponsor_name, special_needs_status, sne_categories, county, sub_county, constituency, ward, physical_address, postal_address, latitude, longitude, public_phone, public_email, website_url, nemis_code, knec_code, tsc_code, total_enrollment, total_teachers, water_source, power_source, internet_connectivity, verification_status }) });
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
      {([ ["institution_type", "School type"], ["moe_category", "School category"], ["gender_type", "Learner gender"], ["accommodation_type", "Day or boarding"], ["registration_status", "Registration status"], ["sponsor_name", "Sponsor"], ["special_needs_status", "Special-needs provision"], ["county", "County"], ["sub_county", "Sub-county"], ["constituency", "Constituency"], ["ward", "Ward"] ] as const).map(([key, label]) => <div className="govuk-form-group" key={key}>
        <label className="govuk-label" htmlFor={key}>{label}</label>
        <input id={key} className="govuk-input" value={school[key] || ""} onChange={e => setSchool({ ...school, [key]: e.target.value || null })} />
      </div>)}
      <label className="govuk-label" htmlFor="sne-categories">Special-needs categories</label>
      <input id="sne-categories" className="govuk-input govuk-!-margin-bottom-5" value={(school.sne_categories || []).join(", ")} onChange={e => setSchool({ ...school, sne_categories: e.target.value.split(",").map(value => value.trim()).filter(Boolean) })} />
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
      <p className="govuk-hint">The URL stays the same when you correct a name. Imported source records are retained.</p>
      <button type="submit" className="govuk-button" disabled={saving}>{saving ? "Saving…" : "Save school"}</button>
      {school.ownership === "public" && school.is_published && <p className="govuk-body"><Link className="govuk-link" href={`/government/institutions/${school.slug}`}>View public school profile</Link></p>}
    </form>}
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
