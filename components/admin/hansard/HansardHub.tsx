"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { adminPath } from "@/lib/admin-path";
import ManualHansardEntry from "@/components/admin/hansard/ManualEntry";
import HansardUploadPanel from "@/components/admin/hansard/UploadPanel";

export type HansardSittingRow = {
  _id: string;
  title: string;
  houseType: string;
  sittingDate: string;
  sittingPeriod?: string;
  isActive?: boolean;
  contributionCount: number;
};

export type HansardTab = "sittings" | "manual" | "upload";

type Props = {
  sittings: HansardSittingRow[];
  studioBase: string;
  initialTab?: HansardTab;
  initialLoadDate?: string;
  initialLoadHouse?: "national-assembly" | "senate" | "county-assembly";
  initialDocumentId?: string;
};

function houseLabel(houseType: string) {
  if (houseType === "national-assembly") return "National Assembly";
  if (houseType === "senate") return "Senate";
  return "County Assembly";
}

const TABS: { id: HansardTab; label: string }[] = [
  { id: "sittings", label: "All sittings" },
  { id: "manual", label: "Manual entry" },
  { id: "upload", label: "Paste Hansard" },
];

export default function HansardHub({
  sittings,
  studioBase,
  initialTab = "sittings",
  initialLoadDate,
  initialLoadHouse,
  initialDocumentId,
}: Props) {
  const [tab, setTab] = useState<HansardTab>(initialTab);
  const [manualKey, setManualKey] = useState(0);
  const [manualPrefill, setManualPrefill] = useState({
    date: initialLoadDate || "",
    house:
      initialLoadHouse ||
      ("national-assembly" as
        | "national-assembly"
        | "senate"
        | "county-assembly"),
    documentId: initialDocumentId || "",
  });

  const stats = useMemo(() => {
    const totalSittings = sittings.length;
    const totalContributions = sittings.reduce(
      (sum, s) => sum + (s.contributionCount || 0),
      0,
    );
    const houseCounts = sittings.reduce(
      (acc: Record<string, number>, s) => {
        const house = s.houseType || "unknown";
        acc[house] = (acc[house] || 0) + 1;
        return acc;
      },
      {},
    );
    return { totalSittings, totalContributions, houseCounts };
  }, [sittings]);

  const openManualForSitting = useCallback(
    (sitting: HansardSittingRow) => {
      setManualPrefill({
        date: sitting.sittingDate,
        house: sitting.houseType as
          | "national-assembly"
          | "senate"
          | "county-assembly",
        documentId: sitting._id,
      });
      setManualKey((k) => k + 1);
      setTab("manual");
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", "manual");
        url.searchParams.set("date", sitting.sittingDate);
        url.searchParams.set("house", sitting.houseType);
        url.searchParams.set("id", sitting._id);
        window.history.replaceState({}, "", url.toString());
      }
    },
    [],
  );

  const switchTab = (next: HansardTab) => {
    setTab(next);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", next);
      if (next !== "manual") {
        url.searchParams.delete("date");
        url.searchParams.delete("house");
        url.searchParams.delete("id");
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 className="govuk-heading-xl" style={{ marginBottom: 8 }}>
            Hansard
          </h1>
          <p className="govuk-body-l" style={{ color: "#505a5f", maxWidth: 640 }}>
            One place to browse sittings, enter contributions manually (linked to
            Supabase leaders), or paste Hansard text for Grok extraction and
            member matching.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="govuk-grid-row" style={{ marginBottom: 24 }}>
        <div className="govuk-grid-column-one-quarter">
          <div
            style={{
              border: "1px solid #b1b4b6",
              padding: 16,
              background: "#fff",
            }}
          >
            <p className="govuk-body-s govuk-!-margin-bottom-1">Sittings</p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">
              {stats.totalSittings}
            </p>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div
            style={{
              border: "1px solid #b1b4b6",
              padding: 16,
              background: "#fff",
            }}
          >
            <p className="govuk-body-s govuk-!-margin-bottom-1">Contributions</p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">
              {stats.totalContributions}
            </p>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div
            style={{
              border: "1px solid #b1b4b6",
              padding: 16,
              background: "#fff",
            }}
          >
            <p className="govuk-body-s govuk-!-margin-bottom-1">
              National Assembly
            </p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">
              {stats.houseCounts["national-assembly"] || 0}
            </p>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div
            style={{
              border: "1px solid #b1b4b6",
              padding: 16,
              background: "#fff",
            }}
          >
            <p className="govuk-body-s govuk-!-margin-bottom-1">
              Senate + County
            </p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">
              {(stats.houseCounts["senate"] || 0) +
                (stats.houseCounts["county-assembly"] || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="govuk-tabs"
        data-module="govuk-tabs"
        style={{ marginBottom: 24 }}
      >
        <h2 className="govuk-tabs__title">Contents</h2>
        <ul className="govuk-tabs__list" style={{ listStyle: "none", padding: 0, display: "flex", gap: 0, borderBottom: "1px solid #b1b4b6", flexWrap: "wrap" }}>
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <li key={t.id} style={{ margin: 0 }}>
                <button
                  type="button"
                  onClick={() => switchTab(t.id)}
                  className="govuk-link"
                  style={{
                    display: "inline-block",
                    padding: "12px 16px",
                    border: "none",
                    background: active ? "#fff" : "transparent",
                    borderBottom: active ? "4px solid #1d70b8" : "4px solid transparent",
                    fontWeight: active ? 700 : 400,
                    color: "#0b0c0c",
                    cursor: "pointer",
                    textDecoration: "none",
                    fontSize: 16,
                  }}
                  aria-current={active ? "page" : undefined}
                >
                  {t.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {tab === "sittings" && (
        <section>
          <div className="govuk-button-group">
            <button
              type="button"
              className="govuk-button"
              onClick={() => switchTab("manual")}
            >
              + Manual entry
            </button>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={() => switchTab("upload")}
            >
              Paste Hansard
            </button>
            <a
              href={`${studioBase}/structure/hansardSitting`}
              target="_blank"
              rel="noopener noreferrer"
              className="govuk-button govuk-button--secondary"
              style={{ textDecoration: "none" }}
            >
              Open in Sanity Studio
            </a>
          </div>

          <h2 className="govuk-heading-m">Published &amp; draft sittings</h2>

          {sittings.length === 0 ? (
            <div className="govuk-inset-text">
              <p>No Hansard sittings yet.</p>
              <button
                type="button"
                className="govuk-button"
                onClick={() => switchTab("manual")}
              >
                Add the first sitting
              </button>
            </div>
          ) : (
            <div className="app-table-scroll" role="region" tabIndex={0}>
              <table className="govuk-table">
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th className="govuk-table__header" scope="col">
                      Date
                    </th>
                    <th className="govuk-table__header" scope="col">
                      Title
                    </th>
                    <th className="govuk-table__header" scope="col">
                      House
                    </th>
                    <th className="govuk-table__header" scope="col">
                      Entries
                    </th>
                    <th className="govuk-table__header" scope="col">
                      Status
                    </th>
                    <th className="govuk-table__header" scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {sittings.map((sitting) => (
                    <tr key={sitting._id} className="govuk-table__row">
                      <td className="govuk-table__cell" style={{ whiteSpace: "nowrap" }}>
                        {new Date(sitting.sittingDate + "T12:00:00").toLocaleDateString(
                          "en-KE",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                        {sitting.sittingPeriod && (
                          <div className="govuk-hint govuk-!-margin-bottom-0">
                            {sitting.sittingPeriod}
                          </div>
                        )}
                      </td>
                      <td className="govuk-table__cell">
                        <strong>{sitting.title}</strong>
                      </td>
                      <td className="govuk-table__cell">
                        {houseLabel(sitting.houseType)}
                      </td>
                      <td className="govuk-table__cell">
                        {sitting.contributionCount || 0}
                      </td>
                      <td className="govuk-table__cell">
                        {sitting.isActive !== false ? (
                          <span className="govuk-tag govuk-tag--green">
                            Published
                          </span>
                        ) : (
                          <span className="govuk-tag govuk-tag--grey">Draft</span>
                        )}
                      </td>
                      <td className="govuk-table__cell">
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                          <Link
                            href={`/government/legislature/hansard/${sitting.houseType}/${sitting.sittingDate}`}
                            target="_blank"
                            className="govuk-link"
                          >
                            View public
                          </Link>
                          <button
                            type="button"
                            className="govuk-link"
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              font: "inherit",
                              color: "#1d70b8",
                            }}
                            onClick={() => openManualForSitting(sitting)}
                          >
                            Edit
                          </button>
                          <a
                            href={`${studioBase}/structure/hansardSitting;${sitting._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="govuk-link"
                          >
                            Studio
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="govuk-inset-text govuk-!-margin-top-6">
            <strong>Tip:</strong> Prefer Manual entry for full control. Use{" "}
            <strong>Paste Hansard</strong> when you can copy the sitting text —
            Grok extracts speeches (skipping disclaimers), matches members by name
            and constituency, and asks you to resolve unclear links. Requires{" "}
            <code>XAI_API_KEY</code>. Speakers should be linked to Supabase so
            Sanity stores their leader UUID.
          </div>
        </section>
      )}

      {tab === "manual" && (
        <ManualHansardEntry
          key={manualKey}
          embedded
          initialLoadDate={manualPrefill.date}
          initialLoadHouse={manualPrefill.house}
          initialDocumentId={manualPrefill.documentId || undefined}
        />
      )}

      {tab === "upload" && <HansardUploadPanel embedded />}

      <p className="govuk-body-s govuk-!-margin-top-8">
        <Link href={adminPath()} className="govuk-link">
          ← Admin dashboard
        </Link>
      </p>
    </div>
  );
}
