"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

interface ActPayload {
  _id: string;
  shortTitle: string;
  citation?: string;
  yearEnacted?: number;
  status?: string;
  globalSummary?: string;
  houseOfOrigin: "nationalAssembly" | "senate" | string;
  capNumber?: string | number;
  dateOfAssent?: string;
  dateOfCommencement?: string;
  slug: { current: string };
}

interface ParliamentActsListClientProps {
  initialActs: unknown[];
}

export default function ParliamentActsListClient({ initialActs }: ParliamentActsListClientProps) {
  // Explicitly cast incoming server data safely into client state
  const acts = useMemo(() => (initialActs || []) as ActPayload[], [initialActs]);
  const [searchQuery, setSearchQuery] = useState("");

  // Live client-side lookup filtering sequence
  const filteredActs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return acts;
    
    return acts.filter((act) => {
      return (
        act.shortTitle?.toLowerCase().includes(query) ||
        act.citation?.toLowerCase().includes(query) ||
        String(act.yearEnacted).includes(query) ||
        act.globalSummary?.toLowerCase().includes(query) ||
        act.capNumber?.toString().includes(query)
      );
    });
  }, [searchQuery, acts]);

  // Group content safely by originating houses sorted newest first
  const nationalAssemblyActs = useMemo(() => {
    return filteredActs
      .filter((act) => act.houseOfOrigin === "nationalAssembly")
      .sort((a, b) => Number(b.yearEnacted || 0) - Number(a.yearEnacted || 0));
  }, [filteredActs]);

  const senateActs = useMemo(() => {
    return filteredActs
      .filter((act) => act.houseOfOrigin === "senate")
      .sort((a, b) => Number(b.yearEnacted || 0) - Number(a.yearEnacted || 0));
  }, [filteredActs]);

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Acts of Parliament", href: "/acts/parliament" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        {/* Document Header Panel - Shrunk typography down to clean statutory sizes */}
        <div className="govuk-!-margin-bottom-4">
          <h1 className="govuk-heading-l govuk-!-margin-bottom-2" style={{ fontSize: "32px" }}>
            Acts of Parliament
          </h1>
          <p className="govuk-body" style={{ fontSize: "17px", marginBottom: 0, color: "#2b2b2b" }}>
            Browse Acts passed by the Parliament of Kenya, grouped by House of Origin.
          </p>
        </div>

        {/* Live Filter Form Group Section */}
        <div className="govuk-form-group govuk-!-margin-bottom-4">
          <label className="govuk-label govuk-label--s" htmlFor="acts-search">
            Search Acts
          </label>
          <div id="search-hint" className="govuk-hint govuk-!-font-size-14">
            Search by act title, citation number, or year (e.g. "Data Protection Act", "2019")
          </div>
          <input
            id="acts-search"
            aria-describedby="search-hint"
            className="govuk-input govuk-input--width-full"
            type="search"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--m" />

        {/* Content Column Grid Layout Split */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds-from-desktop govuk-grid-column-full">
            
            {/* ================= NATIONAL ASSEMBLY SECTION ================= */}
            <section className="govuk-!-margin-bottom-6">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px", borderBottom: "2px solid #1d70b8", paddingBottom: "4px" }}>
                National Assembly Acts
              </h2>

              {nationalAssemblyActs.length === 0 ? (
                <p className="govuk-body-s govuk-!-text-colour-dark-grey">No matching Assembly acts found.</p>
              ) : (
                <div className="legislation-acts-list">
                  {nationalAssemblyActs.map((act) => (
                    <details 
                      key={act._id} 
                      className="govuk-details govuk-!-margin-bottom-0"
                      style={{ borderBottom: "1px solid #b1b4b6", paddingTop: "6px", paddingBottom: "6px" }}
                    >
                      <summary 
                        className="govuk-details__summary govuk-!-margin-bottom-0" 
                        style={{ cursor: "pointer", paddingLeft: "20px", position: "relative", listStyle: "none" }}
                      >
                        <span className="summary-chevron" style={{ position: "absolute", left: "0", top: "2px", fontSize: "10px", color: "#1d70b8", transition: "transform 0.1s ease" }}>▶</span>
                        <span className="govuk-details__summary-text govuk-heading-s govuk-!-margin-0" style={{ fontSize: "16px", color: "#1d70b8" }}>
                          {act.shortTitle}
                        </span>
                      </summary>
                      
                      <div className="govuk-details__text" style={{ borderLeft: "none", paddingLeft: "20px", paddingTop: "6px", paddingBottom: "4px" }}>
                        <p className="govuk-body-s govuk-!-margin-bottom-2" style={{ color: "#505a5f" }}>
                          <strong>{act.citation || "No Citation"}</strong> • {act.yearEnacted || "N/A"} •{" "}
                          <span style={{ textTransform: "uppercase", fontWeight: "bold" }}>{act.status || "Active"}</span>
                        </p>

                        <p className="govuk-body-s govuk-!-margin-bottom-3" style={{ lineHeight: "1.4" }}>
                          {act.globalSummary || "No summary profile attached yet."}
                        </p>

                        <ul className="govuk-list" style={{ paddingLeft: 0, fontSize: "14px", lineHeight: "1.4", color: "#2b2b2b", marginBottom: "10px" }}>
                          <li>House of Origin: <strong>National Assembly</strong></li>
                          {act.capNumber && <li>Cap Number: <strong>{act.capNumber}</strong></li>}
                          {act.dateOfAssent && <li>Date of Assent: {act.dateOfAssent}</li>}
                          {act.dateOfCommencement && <li>Commencement: {act.dateOfCommencement}</li>}
                        </ul>

                        <p className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-1">
                          <Link href={`/acts/parliament/${act.slug?.current}`} className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold" }}>
                            View full Act provisions →
                          </Link>
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </section>

            {/* ================= SENATE SECTION ================= */}
            <section className="govuk-!-margin-top-4">
              <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px", borderBottom: "2px solid #505a5f", paddingBottom: "4px" }}>
                Senate Acts
              </h2>

              {senateActs.length === 0 ? (
                searchQuery ? (
                  <p className="govuk-body-s govuk-!-text-colour-dark-grey">No matching Senate acts found.</p>
                ) : (
                  <div className="govuk-inset-text" style={{ marginTop: "10px", padding: "10px", fontSize: "15px" }}>
                    Coming soon — The Senate legislative database is currently being populated.
                  </div>
                )
              ) : (
                <div className="legislation-acts-list">
                  {senateActs.map((act) => (
                    <details 
                      key={act._id} 
                      className="govuk-details govuk-!-margin-bottom-0"
                      style={{ borderBottom: "1px solid #b1b4b6", paddingTop: "6px", paddingBottom: "6px" }}
                    >
                      <summary 
                        className="govuk-details__summary govuk-!-margin-bottom-0" 
                        style={{ cursor: "pointer", paddingLeft: "20px", position: "relative", listStyle: "none" }}
                      >
                        <span className="summary-chevron" style={{ position: "absolute", left: "0", top: "2px", fontSize: "10px", color: "#1d70b8", transition: "transform 0.1s ease" }}>▶</span>
                        <span className="govuk-details__summary-text govuk-heading-s govuk-!-margin-0" style={{ fontSize: "16px", color: "#1d70b8" }}>
                          {act.shortTitle}
                        </span>
                      </summary>
                      
                      <div className="govuk-details__text" style={{ borderLeft: "none", paddingLeft: "20px", paddingTop: "6px", paddingBottom: "4px" }}>
                        <p className="govuk-body-s govuk-!-margin-bottom-2" style={{ color: "#505a5f" }}>
                          <strong>{act.citation}</strong> • {act.yearEnacted} • <strong>{act.status}</strong>
                        </p>
                        <p className="govuk-body-s govuk-!-margin-bottom-3">
                          {act.globalSummary || "No summary available yet."}
                        </p>
                        <p className="govuk-body-s govuk-!-margin-bottom-1">
                          <Link href={`/acts/parliament/${act.slug?.current}`} className="govuk-link govuk-link--no-underline" style={{ fontWeight: "bold" }}>
                            View full Act provisions →
                          </Link>
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>

        <GovUKFeedback />
      </main>

      {/* Global CSS Overrides for clean legislation element handling */}
      <style dangerouslySetInnerHTML={{__html: `
        summary::-webkit-details-marker { display: none !important; }
        summary { list-style: none !important; }
        .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; }
        .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
        details[open] summary .summary-chevron { transform: rotate(90deg); display: inline-block; top: 4px !important; }
      `}} />
    </div>
  );
}
