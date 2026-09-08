"use client";

import { FormEvent, useEffect, useState } from "react";

export function LegislationChangesManager({ documentId }: { documentId: string }) {
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    change_key: "",
    change_type: "amendment",
    change_date: "",
    source_title: "",
    source_citation: "",
    source_url: "",
    summary: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch(`/api/admin/legislation/documents/${documentId}/changes`, { cache: "no-store" });
    const payload = await response.json();
    if (response.ok) setRows(payload.data || []);
  }

  useEffect(() => { void load(); }, [documentId]);

  const set = (name: string, value: any) =>
    setForm((current: any) => ({ ...current, [name]: value }));

  async function add(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(`/api/admin/legislation/documents/${documentId}/changes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(payload?.error || "Could not add change.");
      return;
    }
    setMessage("Change added.");
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this lifecycle record?")) return;
    const response = await fetch(
      `/api/admin/legislation/documents/${documentId}/changes?id=${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    if (response.ok) await load();
  }

  return (
    <div>
      <h2 className="govuk-heading-l">Lifecycle and amendment history</h2>
      <p className="govuk-body">
        Keep enactment, amendment, repeal, revision and consolidation as history.
        Repealed legislation remains available for historical reference.
      </p>

      <form onSubmit={add}>
        <div className="admin-form-grid">
          <div className="govuk-form-group">
            <label className="govuk-label">Change type</label>
            <select className="govuk-select" value={form.change_type} onChange={(e) => set("change_type", e.target.value)}>
              {["enactment","commencement","amendment","repeal","revision","consolidation","revocation","correction","renumbering","other"].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label">Date</label>
            <input className="govuk-input" type="date" value={form.change_date} onChange={(e) => set("change_date", e.target.value)} required />
          </div>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label">Unique change key</label>
          <span className="govuk-hint">Example: amended-2024-07-19-act-9-2024</span>
          <input className="govuk-input" value={form.change_key} onChange={(e) => set("change_key", e.target.value)} required />
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label">Source title</label>
          <input className="govuk-input" value={form.source_title} onChange={(e) => set("source_title", e.target.value)} />
        </div>

        <div className="admin-form-grid">
          <div className="govuk-form-group">
            <label className="govuk-label">Source citation</label>
            <input className="govuk-input" value={form.source_citation} onChange={(e) => set("source_citation", e.target.value)} />
          </div>
          <div className="govuk-form-group">
            <label className="govuk-label">Source URL</label>
            <input className="govuk-input" type="url" value={form.source_url} onChange={(e) => set("source_url", e.target.value)} />
          </div>
        </div>

        <div className="govuk-form-group">
          <label className="govuk-label">Summary</label>
          <textarea className="govuk-textarea" rows={4} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
        </div>

        <button className="govuk-button" type="submit">Add lifecycle change</button>
      </form>

      {message ? <div className="govuk-inset-text">{message}</div> : null}

      <h3 className="govuk-heading-m govuk-!-margin-top-7">Recorded changes</h3>
      <ul className="govuk-list govuk-list--spaced">
        {rows.map((row) => (
          <li key={row.id}>
            <strong>{row.change_date}</strong> — {row.change_type.replaceAll("_", " ")}
            {row.source_title ? <> — {row.source_title}</> : null}
            {row.summary ? <p className="govuk-body-s">{row.summary}</p> : null}
            <button className="govuk-button govuk-button--warning" type="button" onClick={() => remove(row.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
