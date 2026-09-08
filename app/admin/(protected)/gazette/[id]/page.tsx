"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { adminPath } from "@/lib/admin-path";
import { REVIEW_STATUSES } from "@/lib/gazette/relationship-types";

type Notice = {
  id: string;
  notice_number: number;
  title: string;
  notice_type?: string | null;
  act_referenced?: string | null;
  content_html?: string | null;
  source_page_start?: number | null;
  source_page_end?: number | null;
  transcription_status?: string | null;
  transcription_notes?: string | null;
  relationship_review_status?: string | null;
  gazette_issues?: any;
};

export default function GazetteNoticeAdminEditPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [notice, setNotice] = useState<Notice | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/gazette/notices/${id}`, { credentials: "include", cache: "no-store" });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Failed to load notice"); setLoading(false); return; }
      setNotice(json.data);
      setForm(json.data);
      setLoading(false);
    })();
  }, [id]);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true); setMessage(null); setError(null);
    const res = await fetch(`/api/admin/gazette/notices/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        notice_type: form.notice_type,
        act_referenced: form.act_referenced,
        source_page_start: form.source_page_start === "" ? null : Number(form.source_page_start),
        source_page_end: form.source_page_end === "" ? null : Number(form.source_page_end),
        transcription_status: form.transcription_status,
        transcription_notes: form.transcription_notes,
        relationship_review_status: form.relationship_review_status,
        content_html: form.content_html,
      }),
    });
    const json = await res.json();
    setSaving(false);
    if (!res.ok) return setError(json.error || "Update failed");
    setNotice((n) => n ? { ...n, ...json.data } : json.data);
    setMessage("Gazette notice updated.");
  };

  const gi = notice?.gazette_issues
    ? (Array.isArray(notice.gazette_issues) ? notice.gazette_issues[0] : notice.gazette_issues)
    : null;

  return (
    <div className="govuk-width-container">
      <Link href={adminPath("gazette")} className="govuk-back-link">Back to Gazette</Link>
      <main className="govuk-main-wrapper">
        {loading && <p className="govuk-body">Loading…</p>}
        {error && <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <p className="govuk-body">{error}</p>
        </div>}

        {notice && (
          <>
            <span className="govuk-caption-xl">Gazette Notice No. {notice.notice_number}</span>
            <h1 className="govuk-heading-xl">Edit notice</h1>

            <div className="govuk-button-group">
              <Link className="govuk-button govuk-button--secondary"
                href={adminPath(`gazette/${id}/relationships`)}>
                Manage relationships
              </Link>
              {gi && <Link className="govuk-button govuk-button--secondary" target="_blank"
                href={`/kenya-gazette/${gi.year}/${gi.issue_number}/notice/${notice.notice_number}`}>
                View public
              </Link>}
            </div>

            {message && <div className="govuk-notification-banner govuk-notification-banner--success">
              <div className="govuk-notification-banner__content"><p className="govuk-body">{message}</p></div>
            </div>}

            <form onSubmit={save}>
              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="title">Title</label>
                <input id="title" className="govuk-input" value={form.title || ""}
                  onChange={(e) => set("title", e.target.value)} />
              </div>

              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="notice-type">Notice type</label>
                    <input id="notice-type" className="govuk-input" value={form.notice_type || ""}
                      onChange={(e) => set("notice_type", e.target.value)} />
                  </div>
                </div>
                <div className="govuk-grid-column-one-half">
                  <div className="govuk-form-group">
                    <label className="govuk-label" htmlFor="review">Relationship review status</label>
                    <select id="review" className="govuk-select" value={form.relationship_review_status || "Not reviewed"}
                      onChange={(e) => set("relationship_review_status", e.target.value)}>
                      {REVIEW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="legal-basis">Legal basis / source wording</label>
                <input id="legal-basis" className="govuk-input" value={form.act_referenced || ""}
                  onChange={(e) => set("act_referenced", e.target.value)} />
                <div className="govuk-hint">Keep this source wording even after legislation becomes linked data.</div>
              </div>

              <div className="govuk-grid-row">
                <div className="govuk-grid-column-one-quarter">
                  <label className="govuk-label" htmlFor="page-start">Source page start</label>
                  <input id="page-start" className="govuk-input govuk-input--width-5" type="number"
                    value={form.source_page_start ?? ""} onChange={(e) => set("source_page_start", e.target.value)} />
                </div>
                <div className="govuk-grid-column-one-quarter">
                  <label className="govuk-label" htmlFor="page-end">Source page end</label>
                  <input id="page-end" className="govuk-input govuk-input--width-5" type="number"
                    value={form.source_page_end ?? ""} onChange={(e) => set("source_page_end", e.target.value)} />
                </div>
                <div className="govuk-grid-column-one-half">
                  <label className="govuk-label" htmlFor="transcription-status">Transcription status</label>
                  <input id="transcription-status" className="govuk-input"
                    value={form.transcription_status || ""} onChange={(e) => set("transcription_status", e.target.value)} />
                </div>
              </div>

              <div className="govuk-form-group govuk-!-margin-top-4">
                <label className="govuk-label" htmlFor="notes">Transcription notes</label>
                <textarea id="notes" className="govuk-textarea" rows={4}
                  value={form.transcription_notes || ""} onChange={(e) => set("transcription_notes", e.target.value)} />
              </div>

              <div className="govuk-form-group">
                <label className="govuk-label govuk-label--m" htmlFor="html">HTML transcription</label>
                <div className="govuk-hint">
                  This remains the faithful source transcription. Do not insert CitizenGuide entity links here; manage those under Relationships.
                </div>
                <textarea id="html" className="govuk-textarea" rows={24}
                  value={form.content_html || ""} onChange={(e) => set("content_html", e.target.value)} />
              </div>

              <button className="govuk-button" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
