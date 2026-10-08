"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Option = { name: string; slug?: string };

interface Props {
  basePath: string;
  counties: Option[];
  constituencies: Option[];
  wards: Option[];
  parties: string[];
  values: { county: string; constituency: string; ward: string; party: string; type: string; q: string };
}

export default function McaFilters({ basePath, counties, constituencies, wards, parties, values }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(values.q);

  const go = (next: Partial<typeof values>) => {
    const merged = { ...values, q, ...next };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    startTransition(() => router.push(`${basePath}${params.size ? `?${params}` : ""}`));
  };

  return (
    <form
      role="search"
      aria-label="Find an MCA"
      className="govuk-!-margin-bottom-6"
      style={{ opacity: pending ? 0.7 : 1 }}
      onSubmit={(e) => {
        e.preventDefault();
        go({});
      }}
    >
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="mca-q">Name</label>
        <div style={{ display: "flex", gap: 8, maxWidth: 520 }}>
          <input
            id="mca-q"
            className="govuk-input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="First or last name"
          />
          <button type="submit" className="govuk-button govuk-!-margin-bottom-0">Search</button>
        </div>
      </div>

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-one-quarter-from-desktop govuk-grid-column-full">
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="mca-county">County</label>
            <select
              id="mca-county"
              className="govuk-select govuk-!-width-full"
              value={values.county}
              onChange={(e) => go({ county: e.target.value, constituency: "", ward: "" })}
            >
              <option value="">All counties</option>
              {counties.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter-from-desktop govuk-grid-column-full">
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="mca-constituency">Constituency</label>
            <select
              id="mca-constituency"
              className="govuk-select govuk-!-width-full"
              value={values.constituency}
              disabled={!values.county}
              onChange={(e) => go({ constituency: e.target.value, ward: "" })}
            >
              <option value="">{values.county ? "All constituencies" : "Choose a county first"}</option>
              {constituencies.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter-from-desktop govuk-grid-column-full">
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="mca-ward">Ward</label>
            <select
              id="mca-ward"
              className="govuk-select govuk-!-width-full"
              value={values.ward}
              disabled={!values.constituency}
              onChange={(e) => go({ ward: e.target.value })}
            >
              <option value="">{values.constituency ? "All wards" : "Choose a constituency first"}</option>
              {wards.map((w) => <option key={w.slug} value={w.slug}>{w.name}</option>)}
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter-from-desktop govuk-grid-column-full">
          <div className="govuk-form-group">
            <label className="govuk-label govuk-label--s" htmlFor="mca-type">Elected or nominated</label>
            <select
              id="mca-type"
              className="govuk-select govuk-!-width-full"
              value={values.type}
              onChange={(e) => go({ type: e.target.value })}
            >
              <option value="">Elected and nominated</option>
              <option value="Elected">Elected</option>
              <option value="Nominated">Nominated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="mca-party">Party</label>
        <select
          id="mca-party"
          className="govuk-select"
          value={values.party}
          onChange={(e) => go({ party: e.target.value })}
        >
          <option value="">All parties</option>
          {parties.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {(values.county || values.constituency || values.ward || values.party || values.type || values.q) && (
        <p className="govuk-body">
          <a className="govuk-link" href={basePath}>Clear all filters</a>
        </p>
      )}
    </form>
  );
}
