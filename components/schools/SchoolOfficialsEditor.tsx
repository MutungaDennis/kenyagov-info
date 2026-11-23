"use client";

import { useCallback, useEffect, useState } from "react";

type Official = {
  id: string;
  full_name: string;
  role_title: string;
  start_date: string | null;
  end_date: string | null;
  biography: string | null;
  photo_url: string | null;
  is_published: boolean;
};

type Props = { schoolId: string };
type Draft = Omit<Official, "id">;
const blankDraft: Draft = {
  full_name: "", role_title: "Head teacher", start_date: null, end_date: null,
  biography: null, photo_url: null, is_published: true,
};

export default function SchoolOfficialsEditor({ schoolId }: Props) {
  const [officials, setOfficials] = useState<Official[]>([]);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadOfficials = useCallback(async (): Promise<Official[]> => {
    const response = await fetch(`/api/admin/schools/${schoolId}/officials`, { cache: "no-store" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Could not load school officials");
    return body as Official[];
  }, [schoolId]);

  useEffect(() => {
    let cancelled = false;
    loadOfficials()
      .then((data) => { if (!cancelled) setOfficials(data); })
      .catch((error) => { if (!cancelled) setMessage(error instanceof Error ? error.message : "Could not load school officials"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [loadOfficials]);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  function startEditing(official: Official) {
    setEditingId(official.id);
    setDraft({
      full_name: official.full_name,
      role_title: official.role_title,
      start_date: official.start_date,
      end_date: official.end_date,
      biography: official.biography,
      photo_url: official.photo_url,
      is_published: official.is_published,
    });
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage("");
    try {
      const endpoint = `/api/admin/schools/${schoolId}/officials${editingId ? `/${editingId}` : ""}`;
      const response = await fetch(endpoint, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, start_date: draft.start_date || null, end_date: draft.end_date || null, biography: draft.biography || null, photo_url: draft.photo_url || null }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not save school official");
      setDraft(blankDraft); setEditingId(null);
      setOfficials(await loadOfficials());
      setMessage("School official saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save school official");
    } finally {
      setSaving(false);
    }
  }

  async function removeOfficial(id: string) {
    if (saving || !window.confirm("Remove this official’s service record?")) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/schools/${schoolId}/officials/${id}`, { method: "DELETE" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not remove official");
      if (editingId === id) { setEditingId(null); setDraft(blankDraft); }
      setOfficials((current) => current.filter((official) => official.id !== id));
      setMessage("Official service record removed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove official");
    } finally {
      setSaving(false);
    }
  }

  return <section className="govuk-!-margin-top-7 govuk-!-margin-bottom-7" aria-labelledby="school-officials-admin-heading">
    <h2 className="govuk-heading-m" id="school-officials-admin-heading">School officials</h2>
    <p className="govuk-body">Record head teachers and other officials with their roles and service dates. Photographs are optional.</p>
    {message && <p className="govuk-body" role="status">{message}</p>}
    {loading ? <p className="govuk-body" role="status">Loading officials…</p> : officials.length === 0
      ? <p className="govuk-inset-text">No officials have been recorded.</p>
      : <ul className="govuk-list govuk-list--bullet">
        {officials.map((official) => <li key={official.id} className="govuk-!-margin-bottom-3">
          <strong>{official.full_name}</strong> — {official.role_title}
          <span className="govuk-body-s">{official.start_date ? ` · From ${official.start_date}` : ""}{official.end_date ? ` to ${official.end_date}` : " · Current"}{official.is_published ? " · Published" : " · Hidden"}</span><br />
          <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-1" onClick={() => startEditing(official)}>Edit</button>{" "}
          <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-1" disabled={saving} onClick={() => void removeOfficial(official.id)}>Remove</button>
        </li>)}
      </ul>}
    <form onSubmit={save} className="govuk-!-margin-top-5">
      <h3 className="govuk-heading-s">{editingId ? "Edit service record" : "Add an official"}</h3>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="official-name">Full name</label><input className="govuk-input" id="official-name" required maxLength={250} value={draft.full_name} onChange={(event) => update("full_name", event.target.value)} /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="official-role">Role</label><input className="govuk-input" id="official-role" required maxLength={150} value={draft.role_title} onChange={(event) => update("role_title", event.target.value)} /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="official-start-date">Service start date</label><input className="govuk-input govuk-input--width-20" id="official-start-date" type="date" value={draft.start_date ?? ""} onChange={(event) => update("start_date", event.target.value || null)} /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="official-end-date">Service end date</label><input className="govuk-input govuk-input--width-20" id="official-end-date" type="date" value={draft.end_date ?? ""} onChange={(event) => update("end_date", event.target.value || null)} /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="official-biography">Additional details</label><textarea className="govuk-textarea" id="official-biography" rows={4} maxLength={5000} value={draft.biography ?? ""} onChange={(event) => update("biography", event.target.value || null)} /></div>
      <div className="govuk-form-group"><label className="govuk-label" htmlFor="official-photo">Photo URL (optional)</label><input className="govuk-input" id="official-photo" type="url" value={draft.photo_url ?? ""} onChange={(event) => update("photo_url", event.target.value || null)} /></div>
      <div className="govuk-checkboxes govuk-!-margin-bottom-4"><div className="govuk-checkboxes__item"><input className="govuk-checkboxes__input" id="official-published" type="checkbox" checked={draft.is_published} onChange={(event) => update("is_published", event.target.checked)} /><label className="govuk-label govuk-checkboxes__label" htmlFor="official-published">Show this official on the public profile</label></div></div>
      <button type="submit" className="govuk-button govuk-button--secondary" disabled={saving}>{saving ? "Saving…" : editingId ? "Save official" : "Add official"}</button>
      {editingId && <button type="button" className="govuk-button govuk-button--secondary govuk-!-margin-left-2" onClick={() => { setDraft(blankDraft); setEditingId(null); }}>Cancel edit</button>}
    </form>
  </section>;
}
