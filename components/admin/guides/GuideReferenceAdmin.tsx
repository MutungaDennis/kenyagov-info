"use client";

import { useState } from "react";
import useSWR from "swr";

type Kind = "glossary" | "acronym";
type Entry = {
  id: string;
  term?: string;
  slug?: string;
  acronym?: string;
  full_form?: string;
  meaning?: string | null;
  reference_label?: string | null;
  reference_url?: string | null;
  sort_order?: number;
  is_published?: boolean;
};
type FormState = Omit<Entry, "id"> & { id?: string };
const blank: FormState = { term: "", acronym: "", full_form: "", meaning: "", reference_label: "", reference_url: "", sort_order: 0, is_published: true };

export default function GuideReferenceAdmin() {
  const [kind, setKind] = useState<Kind>("glossary");
  const [form, setForm] = useState<FormState>(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { data: entries = [], isLoading: loading, mutate } = useSWR<Entry[]>(
    `/api/admin/guides?kind=${kind}`,
    async (url: string) => {
      const response = await fetch(url, { credentials: "include" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load entries.");
      return result.data || [];
    },
  );

  const update = (key: keyof FormState, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/guides", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, kind }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save entry.");
      setNotice("Entry saved.");
      setForm(blank);
      await mutate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save entry.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entry: Entry) => {
    const label = kind === "glossary" ? entry.term : entry.acronym;
    if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return;
    const response = await fetch(`/api/admin/guides?kind=${kind}&id=${encodeURIComponent(entry.id)}`, { method: "DELETE", credentials: "include" });
    const result = await response.json();
    if (!response.ok) { setError(result.error || "Unable to delete entry."); return; }
    setNotice("Entry deleted.");
    if (form.id === entry.id) setForm(blank);
    await mutate();
  };

  const edit = (entry: Entry) => setForm({ ...blank, ...entry });
  const label = kind === "glossary" ? "Term" : "Acronym";

  return (
    <div className="govuk-!-padding-top-6">
      <h1 className="govuk-heading-xl">Guides reference manager</h1>
      <p className="govuk-body-l">Manage glossary definitions and acronym expansions shown in public guides. Add a source reference so readers can check further information.</p>
      <div className="govuk-button-group" role="tablist" aria-label="Guide reference types">
        {([ ["glossary", "Glossary terms"], ["acronym", "Acronyms"] ] as const).map(([value, text]) => (
          <button key={value} type="button" role="tab" aria-selected={kind === value} className={kind === value ? "govuk-button" : "govuk-button govuk-button--secondary"} onClick={() => { setKind(value); setForm(blank); setNotice(""); setError(""); }}>{text}</button>
        ))}
      </div>
      {error ? <p className="govuk-error-message" role="alert">{error}</p> : null}
      {notice ? <p className="govuk-body" role="status">{notice}</p> : null}

      <div className="govuk-grid-row">
        <section className="govuk-grid-column-one-half" aria-label={`Add or edit ${label.toLowerCase()}`}>
          <h2 className="govuk-heading-m">{form.id ? "Edit entry" : `Add ${label.toLowerCase()}`}</h2>
          <form onSubmit={(event) => void save(event)}>
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="entry-term">{label}</label>
              <input required id="entry-term" className="govuk-input" value={kind === "glossary" ? form.term || "" : form.acronym || ""} onChange={(event) => update(kind === "glossary" ? "term" : "acronym", event.target.value)} />
            </div>
            {kind === "acronym" ? <div className="govuk-form-group"><label className="govuk-label" htmlFor="entry-full-form">Full form</label><input required id="entry-full-form" className="govuk-input" value={form.full_form || ""} onChange={(event) => update("full_form", event.target.value)} /></div> : null}
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="entry-meaning">{kind === "glossary" ? "Meaning" : "Context or meaning (optional)"}</label>
              <textarea id="entry-meaning" required={kind === "glossary"} className="govuk-textarea" rows={4} value={form.meaning || ""} onChange={(event) => update("meaning", event.target.value)} />
            </div>
            <fieldset className="govuk-fieldset govuk-!-margin-bottom-4">
              <legend className="govuk-fieldset__legend govuk-fieldset__legend--s">Reference (optional)</legend>
              <div className="govuk-form-group"><label className="govuk-label" htmlFor="reference-label">Reference name</label><input id="reference-label" className="govuk-input" value={form.reference_label || ""} onChange={(event) => update("reference_label", event.target.value)} placeholder="For example, Constitution of Kenya" /></div>
              <div className="govuk-form-group"><label className="govuk-label" htmlFor="reference-url">Reference URL</label><input id="reference-url" type="url" className="govuk-input" value={form.reference_url || ""} onChange={(event) => update("reference_url", event.target.value)} placeholder="https://…" /></div>
            </fieldset>
            <div className="govuk-form-group"><label className="govuk-label" htmlFor="sort-order">Display order</label><input id="sort-order" type="number" className="govuk-input govuk-input--width-5" value={form.sort_order ?? 0} onChange={(event) => update("sort_order", event.target.value)} /></div>
            <div className="govuk-checkboxes govuk-!-margin-bottom-4"><div className="govuk-checkboxes__item"><input id="entry-published" type="checkbox" className="govuk-checkboxes__input" checked={form.is_published !== false} onChange={(event) => update("is_published", event.target.checked)} /><label className="govuk-label govuk-checkboxes__label" htmlFor="entry-published">Publish this entry</label></div></div>
            <div className="govuk-button-group"><button className="govuk-button" type="submit" disabled={saving}>{saving ? "Saving…" : form.id ? "Save changes" : "Add entry"}</button>{form.id ? <button type="button" className="govuk-button govuk-button--secondary" onClick={() => setForm(blank)}>Cancel edit</button> : null}</div>
          </form>
        </section>
        <section className="govuk-grid-column-one-half" aria-label={`Existing ${label.toLowerCase()} entries`}>
          <h2 className="govuk-heading-m">Existing entries</h2>
          {loading ? <p className="govuk-body">Loading entries…</p> : entries.length ? (
            <ul className="govuk-list govuk-list--spaced">
              {entries.map((entry) => <li key={entry.id} className="govuk-!-padding-bottom-3 govuk-!-margin-bottom-3" style={{ borderBottom: "1px solid #b1b4b6" }}>
                <strong>{kind === "glossary" ? entry.term : `${entry.acronym} — ${entry.full_form}`}</strong>
                <p className="govuk-body-s govuk-!-margin-top-1">{entry.meaning || "No additional meaning"}{entry.is_published === false ? " · Draft" : ""}</p>
                {entry.reference_url ? <p className="govuk-body-s"><a className="govuk-link" href={entry.reference_url} target="_blank" rel="noopener noreferrer">{entry.reference_label || "View reference"}</a></p> : null}
                <div className="govuk-button-group"><button type="button" className="govuk-link" onClick={() => edit(entry)}>Edit</button><button type="button" className="govuk-link" onClick={() => void remove(entry)}>Delete</button></div>
              </li>)}
            </ul>
          ) : <p className="govuk-body">No entries have been added yet.</p>}
        </section>
      </div>
    </div>
  );
}
