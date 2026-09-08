"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LegislationProvisionEditor({
  provisionId,
  initial,
}: {
  provisionId: string;
  initial: any;
}) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const set = (name: string, value: any) =>
    setForm((current: any) => ({ ...current, [name]: value }));

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch(
      `/api/admin/legislation/provisions/${provisionId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    const payload = await response.json().catch(() => null);
    setSaving(false);

    if (!response.ok) {
      setMessage(payload?.error || "Could not save provision.");
      return;
    }

    setMessage("Changes saved.");
    router.refresh();
  }

  return (
    <form onSubmit={save}>
      {message ? <div className="govuk-inset-text">{message}</div> : null}

      <div className="admin-form-grid">
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="provision_number">
            Provision number
          </label>
          <input
            className="govuk-input"
            id="provision_number"
            value={form.provision_number ?? ""}
            onChange={(e) => set("provision_number", e.target.value)}
          />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="provision_type">
            Provision type
          </label>
          <select
            className="govuk-select"
            id="provision_type"
            value={form.provision_type ?? "section"}
            onChange={(e) => set("provision_type", e.target.value)}
          >
            {[
              "part",
              "section",
              "subsection",
              "paragraph",
              "schedule",
              "schedule_section",
              "other",
            ].map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="heading">Heading</label>
        <input
          className="govuk-input"
          id="heading"
          value={form.heading ?? ""}
          onChange={(e) => set("heading", e.target.value)}
        />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="body_text">Plain legal text</label>
        <textarea
          className="govuk-textarea admin-code-area"
          id="body_text"
          rows={16}
          value={form.body_text ?? ""}
          onChange={(e) => set("body_text", e.target.value)}
        />
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="body_html">Accessible HTML</label>
        <span className="govuk-hint">
          Preserve legal numbering and inline-link marker spans.
        </span>
        <textarea
          className="govuk-textarea admin-code-area"
          id="body_html"
          rows={18}
          value={form.body_html ?? ""}
          onChange={(e) => set("body_html", e.target.value)}
        />
      </div>

      <div className="admin-form-grid">
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="status">Provision status</label>
          <select
            className="govuk-select"
            id="status"
            value={form.status ?? "In force"}
            onChange={(e) => set("status", e.target.value)}
          >
            {[
              "In force",
              "Amended",
              "Not yet commenced",
              "Repealed",
              "Deleted",
              "Spent",
              "Revoked",
              "Superseded",
              "Historical",
            ].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="review_status">Content review</label>
          <select
            className="govuk-select"
            id="review_status"
            value={form.review_status ?? "Imported"}
            onChange={(e) => set("review_status", e.target.value)}
          >
            <option value="Imported">Imported</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Needs attention">Needs attention</option>
          </select>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="relationship_review_status">
            Relationship review
          </label>
          <select
            className="govuk-select"
            id="relationship_review_status"
            value={form.relationship_review_status ?? "Pending"}
            onChange={(e) => set("relationship_review_status", e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Needs attention">Needs attention</option>
          </select>
        </div>
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="admin_notes">Admin notes</label>
        <textarea
          className="govuk-textarea"
          id="admin_notes"
          rows={4}
          value={form.admin_notes ?? ""}
          onChange={(e) => set("admin_notes", e.target.value)}
        />
      </div>

      <button className="govuk-button" disabled={saving} type="submit">
        {saving ? "Saving…" : "Save provision"}
      </button>
    </form>
  );
}
