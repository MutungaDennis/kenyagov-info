"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useSWR from "swr";
import { adminPath } from "@/lib/admin-path";
import PresidentialSpeechHtmlEditor from "@/components/admin/PresidentialSpeechHtmlEditor";

type SpeechData = {
  id: string;
  slug: string;
  title: string;
  short_title: string | null;
  summary: string | null;
  excerpt: string | null;
  occasion: string | null;
  venue: string | null;
  locality: string | null;
  county: string | null;
  country: string | null;
  speech_date: string;
  body_html: string;
  html_field: "body_html" | "transcript_html";
};

async function fetchSpeech(url: string): Promise<SpeechData> {
  const response = await fetch(url, { credentials: "include", cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Could not load the publication.");
  return result.data as SpeechData;
}

export default function PresidentialSpeechAdminForm({ id }: { id: string }) {
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR(`/api/admin/presidential-speeches/${encodeURIComponent(id)}`, fetchSpeech);
  const [fields, setFields] = useState<Partial<SpeechData>>({});
  const [bodyHtml, setBodyHtml] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  if (isLoading) return <p className="govuk-body" role="status">Loading publication…</p>;
  if (error || !data) return <div className="govuk-error-summary" role="alert"><h1 className="govuk-error-summary__title">Publication unavailable</h1><p className="govuk-body">{error?.message || "The requested publication could not be found."}</p></div>;

  const fieldValue = (name: keyof SpeechData) => String(fields[name] ?? data[name] ?? "");
  const setTextField = (name: keyof SpeechData, value: string) => setFields((previous) => ({ ...previous, [name]: value }));

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    setMessage("");
    const payload: Record<string, string> = {
      title: fieldValue("title"),
      short_title: fieldValue("short_title"),
      summary: fieldValue("summary"),
      excerpt: fieldValue("excerpt"),
      occasion: fieldValue("occasion"),
      venue: fieldValue("venue"),
      locality: fieldValue("locality"),
      county: fieldValue("county"),
      country: fieldValue("country"),
      speech_date: fieldValue("speech_date"),
    };
    if (bodyHtml !== null) payload.body_html = bodyHtml;
    try {
      const response = await fetch(`/api/admin/presidential-speeches/${encodeURIComponent(id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save changes.");
      await mutate();
      setFields({});
      setBodyHtml(null);
      setMessage("Publication details and links saved.");
      router.refresh();
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  };

  const input = (name: keyof SpeechData, label: string, type = "text") => (
    <div className="govuk-form-group" key={name}>
      <label className="govuk-label" htmlFor={`speech-${name}`}>{label}</label>
      <input className="govuk-input" id={`speech-${name}`} type={type} value={fieldValue(name)} onChange={(event) => setTextField(name, event.target.value)} />
    </div>
  );

  const textarea = (name: keyof SpeechData, label: string, hint: string) => (
    <div className="govuk-form-group" key={name}>
      <label className="govuk-label" htmlFor={`speech-${name}`}>{label}</label>
      <div className="govuk-hint" id={`speech-${name}-hint`}>{hint}</div>
      <textarea className="govuk-textarea" id={`speech-${name}`} rows={name === "summary" ? 3 : 5} value={fieldValue(name)} onChange={(event) => setTextField(name, event.target.value)} aria-describedby={`speech-${name}-hint`} />
    </div>
  );

  return (
    <>
      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href={adminPath()}>Admin</Link></li>
          <li className="govuk-breadcrumbs__list-item"><Link className="govuk-breadcrumbs__link" href={adminPath("presidential-speeches")}>Presidential speeches</Link></li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">Edit publication</li>
        </ol>
      </nav>
      <h1 className="govuk-heading-xl">Edit presidential publication</h1>
      <p className="govuk-body"><Link className="govuk-link" href={`/government/presidency/speeches/${encodeURIComponent(data.slug)}`} target="_blank" rel="noreferrer">View public publication (opens in a new tab)</Link></p>
      <form onSubmit={save}>
        {saveError && <div className="govuk-error-summary" role="alert"><h2 className="govuk-error-summary__title">There is a problem</h2><p className="govuk-body">{saveError}</p></div>}
        {message && <p className="govuk-inset-text" role="status">{message}</p>}
        <fieldset className="govuk-fieldset">
          <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">Publication details</legend>
          {input("title", "Title")}
          {input("short_title", "Short title (optional)")}
          {input("speech_date", "Publication date", "date")}
          {textarea("summary", "Summary", "A short introduction shown above the document.")}
          {textarea("excerpt", "Excerpt", "A short preview used in publication listings.")}
          {input("occasion", "Occasion")}
          {input("venue", "Venue")}
          {input("locality", "Town or locality")}
          {input("county", "County")}
          {input("country", "Country")}
        </fieldset>
        <PresidentialSpeechHtmlEditor key={data.id} initialHtml={data.body_html} onChange={setBodyHtml} />
        <div className="govuk-button-group govuk-!-margin-top-6">
          <button className="govuk-button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
          <Link className="govuk-link" href={adminPath("presidential-speeches")}>Cancel</Link>
        </div>
      </form>
    </>
  );
}
