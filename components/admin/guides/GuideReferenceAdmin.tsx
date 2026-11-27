"use client";

import Link from "next/link";
import { useState } from "react";
import GuideDetailsLinkEditor from "@/components/admin/guides/GuideDetailsLinkEditor";
import useSWR from "swr";

type EntryKind = "glossary" | "acronym";
type Entry = {
  id: string;
  kind: EntryKind;
  term?: string;
  acronym?: string;
  full_form?: string;
  slug: string;
  short_meaning: string;
  details: string;
  is_published: boolean;
};
type FormState = {
  id?: string;
  kind: EntryKind;
  term: string;
  full_form: string;
  slug: string;
  short_meaning: string;
  details: string;
  is_published: boolean;
};
type Filter = "all" | EntryKind;

function emptyForm(kind: EntryKind): FormState {
  return { kind, term: "", full_form: "", slug: "", short_meaning: "", details: "", is_published: true };
}

function makeSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/[\s-]+/g, "-").replace(/^-|-$/g, "");
}

async function fetchEntries(url: string): Promise<Entry[]> {
  const response = await fetch(url, { credentials: "include", cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Unable to load entries.");
  return result.data || [];
}

export default function GuideReferenceAdmin() {
  const [filter, setFilter] = useState<Filter>("all");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const { data: entries = [], isLoading: loading, error: loadError, mutate } = useSWR<Entry[]>(
    "/api/admin/guides?kind=all",
    fetchEntries,
  );

  const filteredEntries = entries.filter((entry) => filter === "all" || entry.kind === filter);
  const update = (key: keyof FormState, value: string | boolean) => setForm((current) => current ? { ...current, [key]: value } : current);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    setNotice("");
    const entryName = form.kind === "glossary" ? "term" : "acronym";
    try {
      const response = await fetch("/api/admin/guides", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, [entryName]: form.term }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save entry.");
      setNotice(form.id ? "Changes saved." : `${form.kind === "glossary" ? "Glossary term" : "Acronym"} added.`);
      setForm(null);
      await mutate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save entry.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublished = async (entry: Entry) => {
    setError("");
    setNotice("");
    const entryName = entry.kind === "glossary" ? "term" : "acronym";
    try {
      const response = await fetch("/api/admin/guides", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          kind: entry.kind,
          [entryName]: entry.term || entry.acronym,
          full_form: entry.full_form,
          slug: entry.slug,
          short_meaning: entry.short_meaning,
          details: entry.details,
          is_published: !entry.is_published,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update publication status.");
      setNotice(entry.is_published ? "Entry unpublished." : "Entry published.");
      await mutate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update publication status.");
    }
  };

  const remove = async (entry: Entry) => {
    const title = entry.kind === "glossary" ? entry.term : entry.acronym;
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/guides?kind=${entry.kind}&id=${encodeURIComponent(entry.id)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to delete entry.");
      setNotice("Entry deleted.");
      if (form?.id === entry.id) setForm(null);
      await mutate();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to delete entry.");
    }
  };

  const edit = (entry: Entry) => {
    setForm({
      id: entry.id,
      kind: entry.kind,
      term: entry.term || entry.acronym || "",
      full_form: entry.full_form || "",
      slug: entry.slug,
      short_meaning: entry.short_meaning,
      details: entry.details,
      is_published: entry.is_published,
    });
    setError("");
    setNotice("");
  };

  const startAdd = (kind: EntryKind) => {
    setForm(emptyForm(kind));
    setError("");
    setNotice("");
  };

  return (
    <div className="govuk-!-padding-top-6">
      <h1 className="govuk-heading-xl">Guides reference manager</h1>
      <p className="govuk-body-l">Manage glossary terms and acronyms. Public lists show a short meaning; each entry has its own detail page.</p>

      <div className="govuk-button-group govuk-!-margin-bottom-5">
        <button type="button" className="govuk-button" onClick={() => startAdd("glossary")}>Add glossary term</button>
        <button type="button" className="govuk-button govuk-button--secondary" onClick={() => startAdd("acronym")}>Add acronym</button>
      </div>

      {error ? <p className="govuk-error-message" role="alert">{error}</p> : null}
      {loadError ? <p className="govuk-error-message" role="alert">{loadError.message}</p> : null}
      {notice ? <p className="govuk-body" role="status">{notice}</p> : null}

      {form ? (
        <section className="govuk-inset-text" aria-labelledby="entry-form-title">
          <h2 id="entry-form-title" className="govuk-heading-m">{form.id ? "Edit" : "Add"} {form.kind === "glossary" ? "glossary term" : "acronym"}</h2>
          <form onSubmit={(event) => void save(event)}>
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="entry-term">{form.kind === "glossary" ? "Term" : "Acronym"}</label>
              <input
                required
                id="entry-term"
                className="govuk-input"
                maxLength={form.kind === "glossary" ? 200 : 30}
                value={form.term}
                onChange={(event) => {
                  const value = event.target.value;
                  setForm((current) => current ? {
                    ...current,
                    term: value,
                    slug: !current.slug || current.slug === makeSlug(current.term) ? makeSlug(value) : current.slug,
                  } : current);
                }}
              />
            </div>
            {form.kind === "acronym" ? (
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="entry-full-form">Full form</label>
                <input required id="entry-full-form" className="govuk-input" maxLength={300} value={form.full_form} onChange={(event) => update("full_form", event.target.value)} />
              </div>
            ) : null}
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="entry-slug">URL slug</label>
              <div className="govuk-hint">Used in the public detail-page link. Use lowercase letters, numbers and hyphens.</div>
              <input required id="entry-slug" className="govuk-input" pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={200} value={form.slug} onChange={(event) => update("slug", makeSlug(event.target.value))} />
            </div>
            <div className="govuk-form-group">
              <label className="govuk-label" htmlFor="entry-short-meaning">Short meaning</label>
              <div className="govuk-hint">Shown in the list. Keep it concise (up to 300 characters).</div>
              <textarea required id="entry-short-meaning" className="govuk-textarea" rows={2} maxLength={300} value={form.short_meaning} onChange={(event) => update("short_meaning", event.target.value)} />
            </div>
            <GuideDetailsLinkEditor value={form.details} onChange={(value) => update("details", value)} />
            <div className="govuk-checkboxes govuk-!-margin-bottom-4">
              <div className="govuk-checkboxes__item">
                <input id="entry-published" type="checkbox" className="govuk-checkboxes__input" checked={form.is_published} onChange={(event) => update("is_published", event.target.checked)} />
                <label className="govuk-label govuk-checkboxes__label" htmlFor="entry-published">Publish this entry</label>
              </div>
            </div>
            <div className="govuk-button-group">
              <button className="govuk-button" type="submit" disabled={saving}>{saving ? "Saving…" : form.id ? "Save changes" : "Add entry"}</button>
              <button type="button" className="govuk-button govuk-button--secondary" onClick={() => setForm(null)}>Cancel</button>
            </div>
          </form>
        </section>
      ) : null}

      <section aria-labelledby="entries-title">
        <h2 id="entries-title" className="govuk-heading-m">Existing entries <span className="govuk-body-s">({filteredEntries.length})</span></h2>
        <div className="govuk-button-group" role="group" aria-label="Filter entries">
          {([ ["all", "All entries"], ["glossary", "Glossary"], ["acronym", "Acronyms"] ] as const).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={filter === value} className={filter === value ? "govuk-button" : "govuk-button govuk-button--secondary"} onClick={() => setFilter(value)}>{label}</button>
          ))}
        </div>
        {loading ? <p className="govuk-body">Loading entries…</p> : filteredEntries.length ? (
          <ul className="govuk-list govuk-list--spaced">
            {filteredEntries.map((entry) => {
              const title = entry.kind === "glossary" ? entry.term : entry.acronym;
              const detailPath = `/guides/${entry.kind === "glossary" ? "glossary-of-terms" : "acronyms"}/${entry.slug}`;
              return (
                <li key={`${entry.kind}-${entry.id}`} className="govuk-!-padding-bottom-4 govuk-!-margin-bottom-4" style={{ borderBottom: "1px solid #b1b4b6" }}>
                  <div className="govuk-!-margin-bottom-1">
                    <span className="govuk-tag govuk-!-margin-right-2">{entry.kind === "glossary" ? "Glossary" : "Acronym"}</span>
                    <span className={entry.is_published ? "govuk-tag" : "govuk-tag govuk-tag--grey"}>{entry.is_published ? "Published" : "Unpublished"}</span>
                  </div>
                  <h3 className="govuk-heading-s govuk-!-margin-bottom-1">{title}{entry.kind === "acronym" && entry.full_form ? ` — ${entry.full_form}` : ""}</h3>
                  <p className="govuk-body-s govuk-!-margin-bottom-1">{entry.short_meaning}</p>
                  <p className="govuk-body-s"><Link className="govuk-link" href={detailPath} target="_blank" rel="noopener noreferrer">{detailPath}</Link></p>
                  <div className="govuk-button-group">
                    <button type="button" className="govuk-link" onClick={() => edit(entry)}>Edit</button>
                    <button type="button" className="govuk-link" onClick={() => void togglePublished(entry)}>{entry.is_published ? "Unpublish" : "Publish"}</button>
                    <button type="button" className="govuk-link" onClick={() => void remove(entry)}>Delete</button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : <p className="govuk-body">No entries found. Use the buttons above to add a glossary term or acronym.</p>}
      </section>
    </div>
  );
}
