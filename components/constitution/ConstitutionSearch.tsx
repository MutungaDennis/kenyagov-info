"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type Result = { result_type: string; result_id: string; number_label: string; title: string; snippet: string; href: string };

export default function ConstitutionSearch() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (q.trim().length < 2) return;
    setLoading(true);
    setSearched(true);
    const res = await fetch(`/api/constitution/search?q=${encodeURIComponent(q.trim())}`, { cache: "no-store" });
    const json = await res.json();
    setResults(json.data || []);
    setLoading(false);
  }

  return (
    <div className="govuk-!-margin-bottom-6">
      <form onSubmit={submit} role="search">
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--m" htmlFor="constitution-search">Search the Constitution</label>
          <div className="govuk-hint">Try “Article 35”, “fair hearing”, “county governments” or “Fourth Schedule”.</div>
          <div className="constitution-search-row">
            <input id="constitution-search" className="govuk-input" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="govuk-button" disabled={loading}>{loading ? "Searching…" : "Search"}</button>
          </div>
        </div>
      </form>

      {searched && !loading && results.length === 0 && <p className="govuk-body">No matching constitutional provisions found.</p>}
      {results.length > 0 && (
        <div className="govuk-!-margin-top-4">
          <h2 className="govuk-heading-m">Search results</h2>
          <ul className="govuk-list constitution-search-results">
            {results.map((r) => (
              <li key={`${r.result_type}-${r.result_id}`}>
                <Link href={r.href} className="govuk-link govuk-link--no-visited-state"><strong>{r.number_label}: {r.title}</strong></Link>
                {r.snippet && <p className="govuk-body-s govuk-!-margin-top-1">{r.snippet.replace(/<[^>]+>/g, "")}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
