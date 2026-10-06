"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminPath } from "@/lib/admin-path";
import styles from "./parliamentary-committee-editor.module.css";
import {
  chamberLabel,
  type ParliamentaryCommittee,
} from "@/lib/legislature/committees";

type CommitteeForm = ParliamentaryCommittee & {
  description: string;
  mandate: string;
  established_date: string;
  dissolved_date: string;
};

const EMPTY_COMMITTEE: CommitteeForm = {
  id: "",
  chamber: "national_assembly",
  category: "",
  name: "",
  slug: "",
  description: "",
  mandate: "",
  established_date: "",
  dissolved_date: "",
  is_active: true,
  is_published: false,
  sort_order: 1,
};

export default function ParliamentaryCommitteeEditor({ committeeId }: { committeeId: string }) {
  const [committee, setCommittee] = useState<CommitteeForm>(EMPTY_COMMITTEE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/admin/parliamentary-committees/${committeeId}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) throw new Error([json.error, json.hint].filter(Boolean).join(" "));
        if (active) {
          setCommittee({
            ...EMPTY_COMMITTEE,
            ...json.committee,
            description: json.committee.description || "",
            mandate: json.committee.mandate || "",
            established_date: json.committee.established_date || "",
            dissolved_date: json.committee.dissolved_date || "",
          });
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load committee.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [committeeId]);

  const updateCommittee = (patch: Partial<CommitteeForm>) => {
    setCommittee((current) => ({ ...current, ...patch }));
    setError(null);
    setSuccess(null);
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/admin/parliamentary-committees/${committeeId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(committee),
      });
      const json = await response.json();
      if (!response.ok) throw new Error([json.error, json.hint].filter(Boolean).join(" "));
      setSuccess("Committee details saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save committee.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="govuk-body">Loading committee…</p>;

  return (
    <main className={`govuk-main-wrapper ${styles.page}`}>
      <Link href={adminPath("parliamentary-committees")} className="govuk-back-link">
        Back to committees
      </Link>
      <h1 className="govuk-heading-xl">{committee.name || "Edit committee"}</h1>
      <p className="govuk-caption-l">{chamberLabel(committee.chamber)}</p>
      <p className="govuk-body">
        Manage committee details and publication status here. Assign MPs or Senators and House
        secretariat staff from the relevant National Assembly or Senate institution editor.
      </p>
      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <p className="govuk-body">{error}</p>
        </div>
      )}
      {success && (
        <div className="govuk-notification-banner govuk-notification-banner--success" role="status">
          <p className="govuk-body">{success}</p>
        </div>
      )}

      <form onSubmit={save}>
        <fieldset className="govuk-fieldset govuk-!-margin-bottom-7">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--m">Committee details</legend>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half govuk-form-group">
              <label className="govuk-label" htmlFor="committee-name">Committee name</label>
              <input className="govuk-input" id="committee-name" value={committee.name} maxLength={200} required onChange={(event) => updateCommittee({ name: event.target.value })} />
            </div>
            <div className="govuk-grid-column-one-quarter govuk-form-group">
              <span className="govuk-label">House</span>
              <p className="govuk-body">{chamberLabel(committee.chamber)}</p>
              <p className="govuk-hint">The House is fixed when the committee is created.</p>
            </div>
            <div className="govuk-grid-column-one-quarter govuk-form-group">
              <label className="govuk-label" htmlFor="committee-category">Category</label>
              <input className="govuk-input" id="committee-category" value={committee.category} maxLength={150} required onChange={(event) => updateCommittee({ category: event.target.value })} />
            </div>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-one-half govuk-form-group">
              <label className="govuk-label" htmlFor="committee-slug">URL name</label>
              <input className="govuk-input" id="committee-slug" value={committee.slug} maxLength={220} required onChange={(event) => updateCommittee({ slug: event.target.value })} />
              <div className="govuk-hint">Public page: /government/legislature/committees/{committee.slug}</div>
            </div>
            <div className="govuk-grid-column-one-quarter govuk-form-group">
              <label className="govuk-label" htmlFor="committee-established">Established</label>
              <input className="govuk-input" id="committee-established" type="date" value={committee.established_date} onChange={(event) => updateCommittee({ established_date: event.target.value })} />
            </div>
            <div className="govuk-grid-column-one-quarter govuk-form-group">
              <label className="govuk-label" htmlFor="committee-dissolved">Dissolved / ended</label>
              <input className="govuk-input" id="committee-dissolved" type="date" value={committee.dissolved_date} onChange={(event) => updateCommittee({ dissolved_date: event.target.value })} />
            </div>
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="committee-description">Description</label>
            <textarea className="govuk-textarea" id="committee-description" rows={3} value={committee.description} onChange={(event) => updateCommittee({ description: event.target.value })} />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="committee-mandate">Mandate and responsibilities</label>
            <textarea className="govuk-textarea" id="committee-mandate" rows={5} value={committee.mandate} onChange={(event) => updateCommittee({ mandate: event.target.value })} />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="committee-order">Display order</label>
            <input className="govuk-input govuk-input--width-3" id="committee-order" type="number" min={1} step={1} value={committee.sort_order} onChange={(event) => updateCommittee({ sort_order: Number(event.target.value) })} />
          </div>
          <div className="govuk-checkboxes govuk-checkboxes--small">
            <div className="govuk-checkboxes__item">
              <input className="govuk-checkboxes__input" id="committee-active" type="checkbox" checked={committee.is_active} onChange={(event) => updateCommittee({ is_active: event.target.checked })} />
              <label className="govuk-label govuk-checkboxes__label" htmlFor="committee-active">This committee is active</label>
            </div>
            <div className="govuk-checkboxes__item">
              <input className="govuk-checkboxes__input" id="committee-published" type="checkbox" checked={committee.is_published} onChange={(event) => updateCommittee({ is_published: event.target.checked })} />
              <label className="govuk-label govuk-checkboxes__label" htmlFor="committee-published">Publish this committee page</label>
            </div>
          </div>
        </fieldset>

        <div className={styles.actionBar}>
          <button className="govuk-button" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save committee"}
          </button>
        </div>
      </form>
    </main>
  );
}
