"use client";

import { FormEvent, useEffect, useState } from "react";

export function LegislationVersionsManager({ documentId }: { documentId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    version_date: "",
    version_label: "",
    version_type: "consolidated",
    source_url: "",
    pdf_url: "",
    pdf_file_name: "",
    pdf_page_count: "",
    pdf_accessibility: "Unknown",
    html_available: true,
    is_current: false,
    notes: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch(`/api/admin/legislation/documents/${documentId}/versions`, { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) setRows(payload.data || []);
  }

  useEffect(() => { void load(); }, [documentId]);

  const set = (name: string, value: any) =>
    setForm((current: any) => ({ ...current, [name]: value }));

  async function add(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(`/api/admin/legislation/documents/${documentId}/versions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(payload?.error || "Could not add version.");
      return;
    }
    setMessage("Version added.");
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this version record?")) return;
    const response = await fetch(
      `/api/admin/legislation/documents/${documentId}/versions?id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    if (response.ok) await load();
  }

  return (
    <div>
      <h2 className="govuk-heading-l">Versions and official files</h2>
      <form onSubmit={add}>
        <div className="admin-form-grid">
          <div className="govuk-form-group">
            <label className="govuk-label">Version date</label>
            <input className="govuk-input" type="date" value={form.version_date} onChange={(e) => set("version_date", e.target.value)} required />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label">Version type</label>
            <select className="govuk-select" value={form.version_type} onChange={(e) => set("version_type", e.target.value)}>
              <option value="original">Original</option>
              <option value="amended">Amended</option>
              <option value="consolidated">Consolidated</option>
              <option value="historical">Historical</option>
            </select>
          </div>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label">Version label</label>
          <input className="govuk-input" value={form.version_label} onChange={(e) => set("version_label", e.target.value)} />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label">Official source URL</label>
          <input className="govuk-input" type="url" value={form.source_url} onChange={(e) => set("source_url", e.target.value)} />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label">PDF URL</label>
          <input className="govuk-input" type="url" value={form.pdf_url} onChange={(e) => set("pdf_url", e.target.value)} />
        </div>

        <div className="admin-form-grid">
          <div className="govuk-form-group">
            <label className="govuk-label">File name</label>
            <input className="govuk-input" value={form.pdf_file_name} onChange={(e) => set("pdf_file_name", e.target.value)} />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label">Pages</label>
            <input className="govuk-input" inputMode="numeric" value={form.pdf_page_count} onChange={(e) => set("pdf_page_count", e.target.value)} />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label">Accessibility</label>
            <select className="govuk-select" value={form.pdf_accessibility} onChange={(e) => set("pdf_accessibility", e.target.value)}>
              <option value="Unknown">Unknown</option>
              <option value="Accessible">Accessible</option>
              <option value="Partially accessible">Partially accessible</option>
              <option value="Scanned image">Scanned image</option>
            </select>
          </div>
        </div>

        <div className="govuk-checkboxes">
          <div className="govuk-checkboxes__item">
            <input className="govuk-checkboxes__input" id="version-current" type="checkbox" checked={form.is_current} onChange={(e) => set("is_current", e.target.checked)} />
            <label className="govuk-label govuk-checkboxes__label" htmlFor="version-current">Current version</label>
          </div>
        </div>

        <button className="govuk-button govuk-!-margin-top-4" type="submit">Add version</button>
      </form>

      {message ? <div className="govuk-inset-text">{message}</div> : null}

      <h3 className="govuk-heading-m govuk-!-margin-top-7">Existing versions</h3>
      <ul className="govuk-list govuk-list--spaced">
        {rows.map((row) => (
          <li key={row.id}>
            <strong>{row.version_date}</strong> — {row.version_label || row.version_type}
            {row.is_current ? " — Current" : ""}
            {row.pdf_url ? <> — <a className="govuk-link" href={row.pdf_url}>PDF ↗</a></> : null}
            <div>
              <button className="govuk-button govuk-button--warning govuk-!-margin-top-2" type="button" onClick={() => remove(row.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
