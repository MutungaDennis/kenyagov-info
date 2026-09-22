"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { matchesSearch as matchesText } from "@/lib/search/match";
import type { CountyLeadershipRow } from "@/lib/counties/leadership";

type SortField =
  | "code"
  | "governor"
  | "county"
  | "party"
  | "region"
  | "deputy";
type SortOrder = "asc" | "desc";

const REGIONS = [
  "",
  "Coast",
  "North Eastern",
  "Eastern",
  "Central",
  "Rift Valley",
  "Western",
  "Nyanza",
  "Nairobi",
] as const;

export default function GovernorsDirectoryClient({
  rows,
}: {
  rows: CountyLeadershipRow[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [sortField, setSortField] = useState<SortField>("county");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const parties = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      if (r.governor?.party) set.add(r.governor.party);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return rows
      .filter((r) => {
        const matchesSearch = matchesText(q, r.countyName, r.governor?.displayName, r.deputyGovernor?.displayName, r.governor?.party, r.region);

        const matchesParty =
          !selectedParty ||
          (r.governor?.party || "").toLowerCase() ===
            selectedParty.toLowerCase();

        const matchesRegion =
          !selectedRegion || r.region === selectedRegion;

        return matchesSearch && matchesParty && matchesRegion;
      })
      .sort((a, b) => {
        const dir = sortOrder === "asc" ? 1 : -1;
        if (sortField === "code") {
          return dir * ((a.countyCode || 0) - (b.countyCode || 0));
        }
        const pick = (r: CountyLeadershipRow): string => {
          switch (sortField) {
            case "governor":
              return r.governor?.displayName || "";
            case "county":
              return r.countyName || "";
            case "party":
              return r.governor?.party || "";
            case "region":
              return r.region || "";
            case "deputy":
              return r.deputyGovernor?.displayName || "";
            default:
              return "";
          }
        };
        return dir * pick(a).localeCompare(pick(b));
      });
  }, [rows, searchTerm, selectedParty, selectedRegion, sortField, sortOrder]);

  const hasActiveFilters =
    searchTerm !== "" || selectedParty !== "" || selectedRegion !== "";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedParty("");
    setSelectedRegion("");
  };

  const sortMark = (field: SortField) =>
    sortField === field ? (sortOrder === "asc" ? " ▲" : " ▼") : "";

  const personCell = (
    person: CountyLeadershipRow["governor"],
    countySlug: string,
  ) => {
    if (!person) return <span className="govuk-hint">—</span>;
    if (person.slug) {
      return (
        <Link
          href={`/government/people/${person.slug}`}
          className="govuk-link govuk-!-font-weight-bold"
        >
          {person.displayName}
        </Link>
      );
    }
    return (
      <Link
        href={`/government/institutions/${countySlug}`}
        className="govuk-link govuk-!-font-weight-bold"
      >
        {person.displayName}
      </Link>
    );
  };

  return (
    <>
      <div className="govuk-grid-row govuk-!-margin-bottom-2">
        <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
          <div className="govuk-form-group govuk-!-margin-bottom-0">
            <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search">
              Search
            </label>
            <input
              className="govuk-input"
              id="search"
              type="search"
              placeholder="Governor or county name…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
          <div className="govuk-form-group govuk-!-margin-bottom-0">
            <label className="govuk-label govuk-!-font-weight-bold" htmlFor="party">
              Party
            </label>
            <select
              className="govuk-select govuk-!-width-full"
              id="party"
              value={selectedParty}
              onChange={(e) => setSelectedParty(e.target.value)}
            >
              <option value="">All parties</option>
              {parties.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
          <div className="govuk-form-group govuk-!-margin-bottom-0">
            <label className="govuk-label govuk-!-font-weight-bold" htmlFor="region">
              Region
            </label>
            <select
              className="govuk-select govuk-!-width-full"
              id="region"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="">All regions</option>
              {REGIONS.filter(Boolean).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="govuk-!-margin-bottom-4">
          <button
            type="button"
            className="govuk-link"
            onClick={clearAllFilters}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              font: "inherit",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Clear all filters
          </button>
        </div>
      )}

      <h2 className="govuk-heading-m govuk-!-margin-bottom-4" aria-live="polite">
        Showing {filtered.length} of {rows.length} counties
      </h2>

      {filtered.length > 0 ? (
        <div className="govuk-!-overflow-x-auto govuk-!-margin-bottom-5">
          <table className="govuk-table">
            <caption className="govuk-table__caption govuk-visually-hidden">
              Current county governors and deputies
            </caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th scope="col" className="govuk-table__header">
                  <button
                    type="button"
                    className="govuk-link govuk-!-font-weight-bold"
                    onClick={() => handleSort("code")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    Code{sortMark("code")}
                  </button>
                </th>
                <th scope="col" className="govuk-table__header">
                  <button
                    type="button"
                    className="govuk-link govuk-!-font-weight-bold"
                    onClick={() => handleSort("governor")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    Governor{sortMark("governor")}
                  </button>
                </th>
                <th scope="col" className="govuk-table__header">
                  <button
                    type="button"
                    className="govuk-link govuk-!-font-weight-bold"
                    onClick={() => handleSort("county")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    County{sortMark("county")}
                  </button>
                </th>
                <th scope="col" className="govuk-table__header">
                  <button
                    type="button"
                    className="govuk-link govuk-!-font-weight-bold"
                    onClick={() => handleSort("party")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    Party{sortMark("party")}
                  </button>
                </th>
                <th scope="col" className="govuk-table__header">
                  <button
                    type="button"
                    className="govuk-link govuk-!-font-weight-bold"
                    onClick={() => handleSort("region")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    Region{sortMark("region")}
                  </button>
                </th>
                <th scope="col" className="govuk-table__header">
                  <button
                    type="button"
                    className="govuk-link govuk-!-font-weight-bold"
                    onClick={() => handleSort("deputy")}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      font: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    Deputy Governor{sortMark("deputy")}
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {filtered.map((r) => (
                <tr key={r.countyId} className="govuk-table__row">
                  <td className="govuk-table__cell govuk-body-s">
                    {r.countyCode != null
                      ? String(r.countyCode).padStart(2, "0")
                      : "—"}
                  </td>
                  <th scope="row" className="govuk-table__header">
                    {personCell(r.governor, r.countySlug)}
                  </th>
                  <td className="govuk-table__cell">
                    <Link
                      href={`/government/institutions/${r.countySlug}`}
                      className="govuk-link"
                    >
                      {r.countyName}
                    </Link>
                  </td>
                  <td className="govuk-table__cell govuk-body-s">
                    {r.governor?.party || "—"}
                  </td>
                  <td className="govuk-table__cell govuk-body-s">
                    {r.region || "—"}
                  </td>
                  <td className="govuk-table__cell">
                    {personCell(r.deputyGovernor, r.countySlug)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="govuk-body">No counties match your search filters.</p>
      )}

      <p className="govuk-body govuk-!-margin-top-2">
        This table lists the heads of each County Executive. Where a Governor or
        Deputy has not been added yet, the cell shows <strong>—</strong>. Names
        link to people profiles when available; county names open the county
        institution profile.
      </p>
    </>
  );
}
