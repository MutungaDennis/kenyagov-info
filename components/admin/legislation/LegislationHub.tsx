"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { adminPath } from "@/lib/admin-path";
import LegislationUploadPanel from "@/components/admin/legislation/UploadPanel";

export type LegislationTab = "list" | "upload";

type ActRow = {
  _id: string;
  title?: string;
  shortTitle?: string;
  slug?: string;
  citation?: string;
  yearEnacted?: number;
  status?: string;
  houseOfOrigin?: string;
  countyName?: string;
};

type Props = {
  initialTab?: LegislationTab;
  counties: Array<{ id: string; name: string; slug: string }>;
};

function houseLabel(h?: string) {
  if (h === "senate") return "Senate";
  if (h === "countyAssembly") return "County Assembly";
  return "National Assembly";
}

export default function LegislationHub({
  initialTab = "list",
  counties,
}: Props) {
  const [tab, setTab] = useState<LegislationTab>(initialTab);
  const [acts, setActs] = useState<ActRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/legislation/save", {
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load Acts");
      }
      setActs(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const switchTab = (next: LegislationTab) => {
    setTab(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const filtered = acts.filter((a) => {
    if (filter === "all") return true;
    return a.houseOfOrigin === filter;
  });

  return (
    <div>
      <span className="govuk-caption-l">Law &amp; Constitution</span>
      <h1 className="govuk-heading-xl">Acts &amp; county laws</h1>
      <p className="govuk-body-l">
        Upload National Assembly, Senate, and County Assembly Acts. Fill unique
        identity fields first, then paste the official text for Grok to structure
        — formats vary, so review before saving.
      </p>

      <div className="govuk-button-group">
        <button
          type="button"
          className={
            tab === "list"
              ? "govuk-button"
              : "govuk-button govuk-button--secondary"
          }
          onClick={() => switchTab("list")}
        >
          All Acts
        </button>
        <button
          type="button"
          className={
            tab === "upload"
              ? "govuk-button"
              : "govuk-button govuk-button--secondary"
          }
          onClick={() => switchTab("upload")}
        >
          Paste Act
        </button>
      </div>

      {tab === "list" && (
        <div>
          {error && (
            <div className="govuk-error-summary" role="alert">
              <h2 className="govuk-error-summary__title">There is a problem</h2>
              <div className="govuk-error-summary__body">
                <p className="govuk-body">{error}</p>
              </div>
            </div>
          )}

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="leg_filter">
              Filter by legislature
            </label>
            <select
              id="leg_filter"
              className="govuk-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="nationalAssembly">National Assembly</option>
              <option value="senate">Senate</option>
              <option value="countyAssembly">County Assembly</option>
            </select>
          </div>

          {loading ? (
            <p className="govuk-body">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="govuk-body">
              No Acts yet.{" "}
              <button
                type="button"
                className="govuk-link"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  font: "inherit",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => switchTab("upload")}
              >
                Paste an Act
              </button>
              .
            </p>
          ) : (
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    Short title
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Citation
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Legislature
                  </th>
                  <th scope="col" className="govuk-table__header">
                    Year
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {filtered.map((a) => (
                  <tr key={a._id} className="govuk-table__row">
                    <th scope="row" className="govuk-table__header">
                      {a.slug ? (
                        <Link
                          href={`/acts/parliament/${a.slug}`}
                          className="govuk-link"
                          target="_blank"
                        >
                          {a.shortTitle || a.title}
                        </Link>
                      ) : (
                        a.shortTitle || a.title
                      )}
                    </th>
                    <td className="govuk-table__cell">{a.citation || "—"}</td>
                    <td className="govuk-table__cell">
                      {houseLabel(a.houseOfOrigin)}
                      {a.countyName ? ` · ${a.countyName}` : ""}
                    </td>
                    <td className="govuk-table__cell">
                      {a.yearEnacted ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p className="govuk-body">
            <Link href={adminPath()} className="govuk-back-link">
              Back to admin dashboard
            </Link>
          </p>
        </div>
      )}

      {tab === "upload" && (
        <LegislationUploadPanel
          counties={counties}
          onSaved={() => {
            void load();
            switchTab("list");
          }}
        />
      )}
    </div>
  );
}
