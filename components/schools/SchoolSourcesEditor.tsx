"use client";

import { useCallback, useEffect, useState } from "react";

type SourceRecord = {
  id: string;
  external_name: string;
  source?: {
    title: string;
    publisher: string;
    source_url: string | null;
    publication_date: string | null;
    reference_year: number | null;
    licence: string | null;
    notes?: string | null;
  } | null;
};

type Props = { schoolId: string };

export default function SchoolSourcesEditor({ schoolId }: Props) {
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [publicationDate, setPublicationDate] = useState("");
  const [referenceYear, setReferenceYear] = useState("");
  const [licence, setLicence] = useState("");
  const [notes, setNotes] = useState("");

  const loadSources = useCallback(async (): Promise<SourceRecord[]> => {
    const response = await fetch(`/api/admin/schools/${schoolId}/sources`, { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Could not load sources");
    return body as SourceRecord[];
  }, [schoolId]);

  useEffect(() => {
    let cancelled = false;
    loadSources()
      .then((data) => { if (!cancelled) setSources(data); })
      .catch((error) => { if (!cancelled) setMessage(error instanceof Error ? error.message : "Could not load sources"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [loadSources]);

  function resetSourceForm() {
    setEditingSourceId(null);
    setTitle(""); setPublisher(""); setSourceUrl(""); setPublicationDate(""); setReferenceYear(""); setLicence(""); setNotes("");
  }

  function editSource(record: SourceRecord) {
    setEditingSourceId(record.id);
    setTitle(record.source?.title ?? "");
    setPublisher(record.source?.publisher ?? "");
    setSourceUrl(record.source?.source_url ?? "");
    setPublicationDate(record.source?.publication_date ?? "");
    setReferenceYear(record.source?.reference_year ? String(record.source.reference_year) : "");
    setLicence(record.source?.licence ?? "");
    setNotes(record.source?.notes ?? "");
    setMessage("");
    document.getElementById("school-source-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function saveSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/schools/${schoolId}/sources`, {
        method: editingSourceId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingSourceId ? { id: editingSourceId } : {}),
          title, publisher, source_url: sourceUrl,
          publication_date: publicationDate || null,
          reference_year: referenceYear ? Number(referenceYear) : null,
          licence: licence || null,
          notes: notes || null,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not save source");
      const wasEditing = Boolean(editingSourceId);
      resetSourceForm();
      setSources(await loadSources());
      setMessage(wasEditing ? "Source updated. These details may also appear anywhere this shared source is used." : "Source added to this school.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save source");
    } finally {
      setSaving(false);
    }
  }

  async function removeSource(id: string) {
    if (saving || !window.confirm("Remove this source from the school? The shared source record will remain.")) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/schools/${schoolId}/sources`, {
        method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not remove source");
      setSources((current) => current.filter((source) => source.id !== id));
      setMessage("Source removed from this school.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove source");
    } finally {
      setSaving(false);
    }
  }

  return <section className="govuk-!-margin-top-7 govuk-!-margin-bottom-7" aria-labelledby="school-sources-admin-heading">
    <h2 className="govuk-heading-m" id="school-sources-admin-heading">Sources and references</h2>
    <p className="govuk-body">Add citations used for this school. A source can be linked to multiple schools and more sources can be added over time.</p>
    {message && <p className="govuk-body" role="status">{message}</p>}
    {loading ? <p className="govuk-body" role="status">Loading sources…</p> : sources.length === 0
      ? <p className="govuk-inset-text">No sources are linked to this school yet.</p>
      : <ul className="govuk-list govuk-list--bullet">
        {sources.map((record) => <li key={record.id} className="govuk-!-margin-bottom-3">
          <strong>{record.source?.title ?? "Untitled source"}</strong>
          {record.source?.publisher ? ` — ${record.source.publisher}` : ""}
          {record.source?.source_url && <><br /><a className="govuk-link" href={record.source.source_url} target="_blank" rel="noopener noreferrer">{record.source.source_url}</a></>}
          <br /><button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-top-2 govuk-!-margin-right-2 govuk-!-margin-bottom-0" disabled={saving} onClick={() => editSource(record)}>Edit source details</button>
          <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-top-2 govuk-!-margin-bottom-0" disabled={saving} onClick={() => void removeSource(record.id)}>Remove from this school</button>
        </li>)}
      </ul>}
    <form id="school-source-form" onSubmit={saveSource} className="govuk-!-margin-top-5">
      <h3 className="govuk-heading-s">{editingSourceId ? "Edit source details" : "Add a source"}</h3>
      {editingSourceId && <p className="govuk-hint">Source details are shared across schools that use this source. Changes here update those shared details.</p>}
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="source-title">Source title</label><input className="govuk-input" id="source-title" required maxLength={250} value={title} onChange={(event) => setTitle(event.target.value)} /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="source-publisher">Publisher</label><input className="govuk-input" id="source-publisher" required maxLength={250} value={publisher} onChange={(event) => setPublisher(event.target.value)} /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="source-url">Source URL</label><input className="govuk-input" id="source-url" type="url" required value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="source-publication-date">Publication date</label><input className="govuk-input govuk-input--width-20" id="source-publication-date" type="date" value={publicationDate} onChange={(event) => setPublicationDate(event.target.value)} /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="source-reference-year">Reference year</label><input className="govuk-input govuk-input--width-10" id="source-reference-year" type="number" min="1800" max="2200" value={referenceYear} onChange={(event) => setReferenceYear(event.target.value)} /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="source-licence">Licence</label><input className="govuk-input" id="source-licence" maxLength={250} value={licence} onChange={(event) => setLicence(event.target.value)} /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="source-notes">Notes</label><textarea className="govuk-textarea" id="source-notes" rows={3} maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} /></div>
      <button type="submit" className="govuk-button govuk-button--secondary" disabled={saving}>{saving ? "Saving…" : editingSourceId ? "Save source changes" : "Add source"}</button>
      {editingSourceId && <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-left-2" disabled={saving} onClick={resetSourceForm}>Cancel editing</button>}
    </form>
  </section>;
}
