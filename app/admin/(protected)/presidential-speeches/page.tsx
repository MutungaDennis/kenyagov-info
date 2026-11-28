"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";
import { adminPath } from "@/lib/admin-path";

type SpeechRow = { id: string; slug: string; title: string; record_kind: string; speech_date: string; is_published: boolean; summary: string | null };
type SpeechList = { data: SpeechRow[]; total: number; offset: number; limit: number; error?: string };

async function fetchSpeeches(url: string): Promise<SpeechList> {
  const response = await fetch(url, { credentials: "include", cache: "no-store" });
  const result = (await response.json()) as SpeechList;
  if (!response.ok) throw new Error(result.error || "Could not load publications.");
  return result;
}

export default function PresidentialSpeechAdminPage() {
  const [query, setQuery] = useState("");
  const [offset, setOffset] = useState(0);
  const key = `/api/admin/presidential-speeches?q=${encodeURIComponent(query.trim())}&offset=${offset}`;
  const { data, error, isLoading, isValidating } = useSWR(key, fetchSpeeches, { keepPreviousData: true });
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.limit ?? 25)));
  const currentPage = Math.floor(offset / (data?.limit ?? 25)) + 1;

  return (
    <>
      <h1 className="govuk-heading-xl">Presidential speeches and communications</h1>
      <p className="govuk-body-l">Manage publication details and links in speeches, messages and communiqués. The formatted document text is preserved when you add or update links.</p>
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="speech-admin-search">Search publications</label>
        <input className="govuk-input" id="speech-admin-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setOffset(0); }} placeholder="Search by title" />
      </div>
      {error && <div className="govuk-error-summary" role="alert"><h2 className="govuk-error-summary__title">Publications could not be loaded</h2><p className="govuk-body">{error.message}</p></div>}
      {isLoading && <p className="govuk-body" role="status">Loading publications…</p>}
      {data && (
        <>
          <p className="govuk-body" aria-live="polite">{data.total.toLocaleString("en-KE")} publication{data.total === 1 ? "" : "s"}{isValidating ? " · Updating results…" : ""}</p>
          {data.data.length > 0 ? (
            <div className="govuk-table-responsive">
              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-table__caption--m">Publications</caption>
                <thead className="govuk-table__head"><tr className="govuk-table__row"><th className="govuk-table__header" scope="col">Title</th><th className="govuk-table__header" scope="col">Type</th><th className="govuk-table__header" scope="col">Date</th><th className="govuk-table__header" scope="col">Status</th><th className="govuk-table__header" scope="col"><span className="govuk-visually-hidden">Actions</span></th></tr></thead>
                <tbody className="govuk-table__body">{data.data.map((speech) => (
                  <tr className="govuk-table__row" key={speech.id}>
                    <th className="govuk-table__header" scope="row">{speech.title}</th>
                    <td className="govuk-table__cell">{speech.record_kind}</td>
                    <td className="govuk-table__cell">{speech.speech_date}</td>
                    <td className="govuk-table__cell">{speech.is_published ? "Published" : "Draft"}</td>
                    <td className="govuk-table__cell"><Link className="govuk-link" href={adminPath(`presidential-speeches/${encodeURIComponent(speech.id)}/edit`)}>Edit</Link></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <p className="govuk-body">No publications match that search.</p>}
          {data.total > (data.limit ?? 25) && <nav className="govuk-button-group" aria-label="Publication pages">
            <button className="govuk-button govuk-button--secondary" type="button" disabled={offset === 0 || isValidating} onClick={() => setOffset((value) => Math.max(0, value - (data.limit ?? 25)))}>Previous</button>
            <span className="govuk-body govuk-!-margin-top-2">Page {currentPage} of {totalPages}</span>
            <button className="govuk-button govuk-button--secondary" type="button" disabled={offset + (data.limit ?? 25) >= data.total || isValidating} onClick={() => setOffset((value) => value + (data.limit ?? 25))}>Next</button>
          </nav>}
        </>
      )}
    </>
  );
}
