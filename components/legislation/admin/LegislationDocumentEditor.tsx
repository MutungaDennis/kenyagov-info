"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LegislationDocumentEditor({
  documentId,
  initial,
}: {
  documentId: string;
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

    const response = await fetch(`/api/admin/legislation/documents/${documentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json().catch(() => null);

    setSaving(false);

    if (!response.ok) {
      setMessage(payload?.error || "Could not save legislation.");
      return;
    }

    setMessage("Changes saved.");
    router.refresh();
  }

  return (
    <form onSubmit={save}>
      {message ? <div className="govuk-inset-text">{message}</div> : null}

      <h2 className="govuk-heading-l">Core identity</h2>
      {[
        ["title", "Title"],
        ["short_title", "Short title"],
        ["citation", "Citation"],
        ["slug", "Public slug"],
        ["year", "Year"],
        ["act_number", "Act number"],
        ["cap_number", "Cap number"],
        ["bill_reference", "Bill reference"],
      ].map(([name, label]) => (
        <div className="govuk-form-group" key={name}>
          <label className="govuk-label" htmlFor={name}>{label}</label>
          <input
            className="govuk-input"
            id={name}
            value={form[name] ?? ""}
            onChange={(e) => set(name, e.target.value)}
          />
        </div>
      ))}

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="long_title">Long title</label>
        <textarea
          className="govuk-textarea"
          id="long_title"
          rows={4}
          value={form.long_title ?? ""}
          onChange={(e) => set("long_title", e.target.value)}
        />
      </div>

      <h2 className="govuk-heading-l govuk-!-margin-top-7">Legal status</h2>
      <div className="admin-form-grid">
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="category">Category</label>
          <select className="govuk-select" id="category" value={form.category ?? "act"} onChange={(e) => set("category", e.target.value)}>
            <option value="act">Act of Parliament</option>
            <option value="county_act">County legislation</option>
            <option value="subsidiary">Subsidiary legislation</option>
            <option value="treaty">Treaty</option>
          </select>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="legislation_kind">Legislation type</label>
          <select className="govuk-select" id="legislation_kind" value={form.legislation_kind ?? "principal"} onChange={(e) => set("legislation_kind", e.target.value)}>
            {["principal","amending","repealing","revision","consolidation","subsidiary","treaty","other"].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="status">Status</label>
          <select className="govuk-select" id="status" value={form.status ?? "In force"} onChange={(e) => set("status", e.target.value)}>
            {["In force","Partially in force","Not yet commenced","Repealed","Spent","Revoked","Superseded","Historical"].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="originating_chamber">Originating House</label>
          <select className="govuk-select" id="originating_chamber" value={form.originating_chamber ?? ""} onChange={(e) => set("originating_chamber", e.target.value || null)}>
            <option value="">Not verified / not applicable</option>
            <option value="national_assembly">National Assembly</option>
            <option value="senate">Senate</option>
            <option value="county_assembly">County Assembly</option>
          </select>
        </div>
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="legislature_name">Legislature</label>
        <input className="govuk-input" id="legislature_name" value={form.legislature_name ?? ""} onChange={(e) => set("legislature_name", e.target.value)} />
      </div>

      <h2 className="govuk-heading-l govuk-!-margin-top-7">Dates</h2>
      <div className="admin-form-grid">
        {[
          ["assent_date", "Assent"],
          ["publication_date", "Publication"],
          ["commencement_date", "Commencement"],
          ["last_amended_date", "Last amended"],
          ["current_version_date", "Current version"],
          ["repeal_date", "Repeal"],
        ].map(([name, label]) => (
          <div className="govuk-form-group" key={name}>
            <label className="govuk-label" htmlFor={name}>{label}</label>
            <input className="govuk-input" id={name} type="date" value={form[name] ?? ""} onChange={(e) => set(name, e.target.value || null)} />
          </div>
        ))}
      </div>

      <h2 className="govuk-heading-l govuk-!-margin-top-7">Source and review</h2>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="source_url">Official source URL</label>
        <input className="govuk-input" id="source_url" type="url" value={form.source_url ?? ""} onChange={(e) => set("source_url", e.target.value)} />
      </div>

      <div className="admin-form-grid">
        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="review_status">Content review</label>
          <select className="govuk-select" id="review_status" value={form.review_status ?? "Imported"} onChange={(e) => set("review_status", e.target.value)}>
            <option value="Imported">Imported</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Needs attention">Needs attention</option>
          </select>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label" htmlFor="relationship_review_status">Relationship review</label>
          <select className="govuk-select" id="relationship_review_status" value={form.relationship_review_status ?? "Pending"} onChange={(e) => set("relationship_review_status", e.target.value)}>
            <option value="Pending">Pending</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Needs attention">Needs attention</option>
          </select>
        </div>
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="admin_notes">Admin notes</label>
        <textarea className="govuk-textarea" id="admin_notes" rows={5} value={form.admin_notes ?? ""} onChange={(e) => set("admin_notes", e.target.value)} />
      </div>

      <button className="govuk-button" disabled={saving} type="submit">
        {saving ? "Saving…" : "Save legislation"}
      </button>
    </form>
  );
}
