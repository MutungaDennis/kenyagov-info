"use client";

import { useEffect, useState } from "react";
import type { InstitutionOffice } from "@/lib/institutions/offices";

type OfficeDraft = {
  office_name: string;
  office_type: string;
  geographic_level: string;
  county: string;
  constituency: string;
  sub_county: string;
  physical_address: string;
  postal_address: string;
  phone: string;
  email: string;
  website_url: string;
  latitude: string;
  longitude: string;
  start_date: string;
  end_date: string;
  notes: string;
  is_active: boolean;
  sort_order: number;
};

const OFFICE_TYPES = [
  "Regional office",
  "County office",
  "Constituency office",
  "Sub-county office",
  "Branch office",
  "Service centre",
  "Other",
];

function emptyDraft(): OfficeDraft {
  return {
    office_name: "",
    office_type: "Branch office",
    geographic_level: "",
    county: "",
    constituency: "",
    sub_county: "",
    physical_address: "",
    postal_address: "",
    phone: "",
    email: "",
    website_url: "",
    latitude: "",
    longitude: "",
    start_date: "",
    end_date: "",
    notes: "",
    is_active: true,
    sort_order: 0,
  };
}

function toDraft(office: InstitutionOffice): OfficeDraft {
  return {
    ...emptyDraft(),
    ...office,
    geographic_level: office.geographic_level || "",
    county: office.county || "",
    constituency: office.constituency || "",
    sub_county: office.sub_county || "",
    physical_address: office.physical_address || "",
    postal_address: office.postal_address || "",
    phone: office.phone || "",
    email: office.email || "",
    website_url: office.website_url || "",
    latitude: office.latitude == null ? "" : String(office.latitude),
    longitude: office.longitude == null ? "" : String(office.longitude),
    start_date: office.start_date || "",
    end_date: office.end_date || "",
    notes: office.notes || "",
  };
}

function OfficeFields({
  office,
  onChange,
  prefix,
}: {
  office: OfficeDraft;
  onChange: (office: OfficeDraft) => void;
  prefix: string;
}) {
  const textField = (
    key: keyof OfficeDraft,
    label: string,
    hint?: string,
    type = "text",
    required = false,
  ) => (
    <div className="govuk-form-group" key={key}>
      <label className="govuk-label" htmlFor={`${prefix}-${key}`}>{label}</label>
      {hint && <div className="govuk-hint" id={`${prefix}-${key}-hint`}>{hint}</div>}
      <input
        className="govuk-input"
        id={`${prefix}-${key}`}
        type={type}
        value={String(office[key])}
        required={required}
        aria-describedby={hint ? `${prefix}-${key}-hint` : undefined}
        onChange={event => onChange({ ...office, [key]: event.target.value })}
      />
    </div>
  );

  return (
    <>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          {textField("office_name", "Office name *", "For example, IEBC Nairobi County Office", "text", true)}
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor={`${prefix}-office_type`}>Office type</label>
            <select
              className="govuk-select"
              id={`${prefix}-office_type`}
              value={office.office_type}
              onChange={event => onChange({ ...office, office_type: event.target.value })}
            >
              {OFFICE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-third">{textField("geographic_level", "Coverage level", "For example, national, regional, county or constituency")}</div>
        <div className="govuk-grid-column-one-third">{textField("county", "County")}</div>
        <div className="govuk-grid-column-one-third">{textField("constituency", "Constituency")}</div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">{textField("sub_county", "Sub-county")}</div>
        <div className="govuk-grid-column-one-half">{textField("physical_address", "Street address or landmark")}</div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">{textField("postal_address", "Postal address")}</div>
        <div className="govuk-grid-column-one-quarter">{textField("phone", "Telephone", undefined, "tel")}</div>
        <div className="govuk-grid-column-one-quarter">{textField("email", "Email", undefined, "email")}</div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">{textField("website_url", "Office website", undefined, "url")}</div>
        <div className="govuk-grid-column-one-quarter">{textField("latitude", "Latitude", "Optional map coordinates")}</div>
        <div className="govuk-grid-column-one-quarter">{textField("longitude", "Longitude", "Optional map coordinates")}</div>
      </div>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-half">{textField("start_date", "Office opened", undefined, "date")}</div>
        <div className="govuk-grid-column-one-half">{textField("end_date", "Office closed", "Leave blank if it is still open", "date")}</div>
      </div>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor={`${prefix}-notes`}>Additional information</label>
        <textarea
          className="govuk-textarea"
          id={`${prefix}-notes`}
          rows={3}
          value={office.notes}
          onChange={event => onChange({ ...office, notes: event.target.value })}
        />
      </div>
      <div className="govuk-checkboxes govuk-checkboxes--small govuk-!-margin-bottom-4">
        <div className="govuk-checkboxes__item">
          <input
            className="govuk-checkboxes__input"
            id={`${prefix}-is_active`}
            type="checkbox"
            checked={office.is_active}
            onChange={event => onChange({ ...office, is_active: event.target.checked })}
          />
          <label className="govuk-label govuk-checkboxes__label" htmlFor={`${prefix}-is_active`}>This office is currently open</label>
        </div>
      </div>
    </>
  );
}

export default function InstitutionOfficesPanel({
  institutionId,
}: {
  institutionId: string;
}) {
  const [offices, setOffices] = useState<InstitutionOffice[]>([]);
  const [newOffice, setNewOffice] = useState<OfficeDraft>(emptyDraft());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/admin/institutions/${institutionId}/offices`, {
      credentials: "include",
      cache: "no-store",
    }).then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error([result.error, result.hint].filter(Boolean).join(" — "));
      if (!cancelled) setOffices(Array.isArray(result.data) ? result.data as InstitutionOffice[] : []);
    }).catch(reason => {
      if (!cancelled) setError(reason instanceof Error ? reason.message : "Failed to load offices.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [institutionId]);

  const addOffice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newOffice.office_name.trim() || saving) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/admin/institutions/${institutionId}/offices`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOffice),
      });
      const result = await response.json();
      if (!response.ok) throw new Error([result.error, result.hint].filter(Boolean).join(" — "));
      setOffices(previous => [...previous, result.data as InstitutionOffice].sort((a, b) => a.office_name.localeCompare(b.office_name)));
      setNewOffice(emptyDraft());
      setSuccess("Office added.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to add office.");
    } finally {
      setSaving(false);
    }
  };

  const saveOffice = async (office: InstitutionOffice, draft: OfficeDraft) => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/admin/institutions/${institutionId}/offices/${office.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const result = await response.json();
      if (!response.ok) throw new Error([result.error, result.hint].filter(Boolean).join(" — "));
      setOffices(previous => previous.map(item => item.id === office.id ? result.data as InstitutionOffice : item));
      setSuccess("Office changes saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to save office.");
    } finally {
      setSaving(false);
    }
  };

  const removeOffice = async (office: InstitutionOffice) => {
    if (!window.confirm(`Remove ${office.office_name} from this institution?`)) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch(`/api/admin/institutions/${institutionId}/offices/${office.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error([result.error, result.hint].filter(Boolean).join(" — "));
      setOffices(previous => previous.filter(item => item.id !== office.id));
      setSuccess("Office removed.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Failed to remove office.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="govuk-!-margin-top-8" aria-labelledby="institution-offices-heading">
      <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />
      <h2 className="govuk-heading-l" id="institution-offices-heading">Other offices and branches</h2>
      <p className="govuk-body">
        Add regional, county, constituency and other offices separately from the
        institution’s headquarters. Add one record for each office so people can
        find its location and local contact details.
      </p>
      {error && <div className="govuk-error-summary" role="alert"><h3 className="govuk-error-summary__title">There is a problem</h3><p className="govuk-body">{error}</p></div>}
      {success && <p className="govuk-body govuk-!-font-weight-bold" role="status">{success}</p>}
      {loading ? <p className="govuk-body">Loading offices…</p> : (
        offices.length ? offices.map(office => (
          <OfficeRecord
            key={office.id}
            office={office}
            disabled={saving}
            onSave={draft => void saveOffice(office, draft)}
            onRemove={() => void removeOffice(office)}
          />
        )) : <p className="govuk-inset-text">No additional offices have been recorded.</p>
      )}
      <details className="govuk-!-margin-top-6">
        <summary className="govuk-link">Add an office</summary>
        <form className="govuk-!-margin-top-4" onSubmit={event => void addOffice(event)}>
          <OfficeFields office={newOffice} onChange={setNewOffice} prefix="new-office" />
          <button className="govuk-button" type="submit" disabled={saving || !newOffice.office_name.trim()}>
            {saving ? "Saving…" : "Add office"}
          </button>
        </form>
      </details>
    </section>
  );
}

function OfficeRecord({
  office,
  disabled,
  onSave,
  onRemove,
}: {
  office: InstitutionOffice;
  disabled: boolean;
  onSave: (draft: OfficeDraft) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState(() => toDraft(office));
  return (
    <details className="govuk-details">
      <summary className="govuk-details__summary">
        <span className="govuk-details__summary-text">
          {office.office_name} — {office.office_type}{!office.is_active ? " (closed)" : ""}
        </span>
      </summary>
      <div className="govuk-details__text">
        <OfficeFields office={draft} onChange={setDraft} prefix={`office-${office.id}`} />
        <div className="govuk-button-group">
          <button className="govuk-button" type="button" disabled={disabled} onClick={() => onSave(draft)}>Save office</button>
          <button className="govuk-button govuk-button--secondary" type="button" disabled={disabled} onClick={onRemove}>Remove office</button>
        </div>
      </div>
    </details>
  );
}
