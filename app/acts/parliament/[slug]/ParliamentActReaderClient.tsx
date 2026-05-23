"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import PrintPageButton from "@/components/govuk/PrintPageButton";
import PortableTextContent from "@/components/sanity/PortableTextContent";

interface SectionPayload {
  sectionNumber: string | number;
  sectionTitle?: string;
  officialText?: any;
  plainSummary?: string;
}

interface PartPayload {
  _type: "part";
  partNumber: string;
  partTitle: string;
  sections?: SectionPayload[];
  _shouldOpen?: boolean;
}

interface ScheduleItemPayload {
  itemNumber: string | number;
  itemTitle?: string;
  officialText?: any;
  plainSummary?: string;
}

interface SchedulePayload {
  _type: "schedule";
  scheduleNumber: string;
  scheduleTitle: string;
  relatedSection?: string;
  introText?: any;
  items?: ScheduleItemPayload[];
  _shouldOpen?: boolean;
}

interface AmendmentPayload {
  amendingAct: string;
  year: number | string;
  notes?: string;
}

interface ActPayload {
  _id: string;
  shortTitle: string;
  title: string;
  citation: string;
  capNumber?: string | number;
  status: string;
  houseOfOrigin: string;
  globalSummary?: string;
  officialKenyaLawUrl?: string;
  pdfDocument?: { asset?: { url: string } };
  constitutionalBasis?: Array<{ _id: string; articleNumber: number | string; articleTitle?: string }>;
  parts?: Array<PartPayload | SchedulePayload>;
  amendments?: AmendmentPayload[];
  slug: { current: string };
}

interface ParliamentActReaderClientProps {
  initialAct: any;
}

export default function ParliamentActReaderClient({ initialAct }: ParliamentActReaderClientProps) {
  const act = initialAct as ActPayload;
  const [searchQuery, setSearchQuery] = useState("");

  // Process instant section filtering across parts, sections, and schedules context arrays
  const filteredParts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const rawParts = act.parts || [];
    if (!query) return rawParts;

    return rawParts.map((item) => {
      if (item._type === "part") {
        const matchedSections = (item.sections || []).filter((sec) => {
          return (
            sec.sectionNumber?.toString().includes(query) ||
            sec.sectionTitle?.toLowerCase().includes(query) ||
            sec.plainSummary?.toLowerCase().includes(query)
          );
        });

        const partMatch = item.partNumber?.toLowerCase().includes(query) || 
                          item.partTitle?.toLowerCase().includes(query);

        if (partMatch || matchedSections.length > 0) {
          return { 
            ...item, 
            sections: partMatch ? item.sections : matchedSections, 
            _shouldOpen: true 
          };
        }
      }

      if (item._type === "schedule") {
        const matchedItems = (item.items || []).filter((si) => {
          return (
            si.itemNumber?.toString().includes(query) ||
            si.itemTitle?.toLowerCase().includes(query) ||
            si.plainSummary?.toLowerCase().includes(query)
          );
        });

        const scheduleMatch = item.scheduleNumber?.toLowerCase().includes(query) || 
                              item.scheduleTitle?.toLowerCase().includes(query);

        if (scheduleMatch || matchedItems.length > 0) {
          return { 
            ...item, 
            items: scheduleMatch ? item.items : matchedItems, 
            _shouldOpen: true 
          };
        }
      }

      return null;
    }).filter(Boolean) as Array<PartPayload | SchedulePayload>;
  }, [searchQuery, act.parts]);
  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Acts of Parliament", href: "/acts/parliament" },
          { text: act.shortTitle, href: `/acts/parliament/${act.slug?.current}` },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* Document Top Authority Caption Panel */}
        <div className="govuk-!-margin-bottom-4">
          <span className="govuk-caption-m" style={{ color: "#505a5f", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Parliament of Kenya
          </span>
          <h1 className="govuk-heading-l govuk-!-margin-bottom-2" style={{ fontSize: "32px" }}>
            {act.shortTitle}
          </h1>
          <p className="govuk-body" style={{ fontSize: "17px", color: "#505a5f", margin: 0, lineHeight: "1.4" }}>
            {act.title}
          </p>
        </div>

        {/* Action Controls Cluster Row */}
        <div className="govuk-!-margin-bottom-4 legislation-actions-bar">
          <PrintPageButton />
          {act.pdfDocument?.asset?.url && (
            <Link href={act.pdfDocument.asset.url} className="govuk-link govuk-link--no-underline" target="_blank">
              Download PDF Act
            </Link>
          )}
          {act.officialKenyaLawUrl && (
            <Link href={act.officialKenyaLawUrl} className="govuk-link govuk-link--no-underline" target="_blank">
              View on Kenya Law
            </Link>
          )}
        </div>

        {/* Global Summary Card Callout Component */}
        <div className="govuk-!-padding-4 govuk-!-margin-bottom-6" style={{ borderLeft: "4px solid #1d70b8", backgroundColor: "#f3f2f1" }}>
          <h2 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: "16px" }}>Summary</h2>
          <p className="govuk-body-s govuk-!-margin-bottom-0" style={{ lineHeight: "1.4", color: "#2b2b2b" }}>
            {act.globalSummary || "No summary profile attached yet."}
          </p>
        </div>

        {/* Two Column Legislation Dashboard Grid Frame */}
        <div className="legislation-grid-frame">
          
          {/* Left Column: Persistent Table of Contents Navigation Index */}
          <aside className="legislation-toc-sidebar" aria-label="Table of contents mapping profile">
            <div className="govuk-!-padding-3" style={{ backgroundColor: "#f3f2f1", borderTop: "3px solid #1d70b8" }}>
              <h2 className="govuk-heading-s govuk-!-margin-bottom-2" style={{ fontSize: "15px", color: "#1d70b8" }}>Contents</h2>
              <nav aria-label="Statutory sections shortcut bookmarks">
                <ul className="govuk-list govuk-!-margin-bottom-0" style={{ paddingLeft: 0, margin: 0, fontSize: "14px" }}>
                  <li className="govuk-!-margin-bottom-1">
                    <a href="#act-information" className="govuk-link govuk-link--no-underline">Act Information</a>
                  </li>
                  {act.constitutionalBasis && act.constitutionalBasis.length > 0 && (
                    <li className="govuk-!-margin-bottom-1">
                      <a href="#constitutional-basis" className="govuk-link govuk-link--no-underline">Constitutional Basis</a>
                    </li>
                  )}
                  {filteredParts.map((item, idx) => {
                    if (item._type === "part") {
                      return (
                        <li key={`toc-part-${idx}`} className="govuk-!-margin-bottom-1" style={{ lineHeight: "1.2" }}>
                          <a href={`#part-${idx}`} className="govuk-link govuk-link--no-underline">
                            <strong>{item.partNumber}:</strong> {item.partTitle}
                          </a>
                        </li>
                      );
                    }
                    if (item._type === "schedule") {
                      return (
                        <li key={`toc-sched-${idx}`} className="govuk-!-margin-bottom-1" style={{ lineHeight: "1.2" }}>
                          <a href={`#schedule-${idx}`} className="govuk-link govuk-link--no-underline" style={{ color: "#00703c" }}>
                            <strong>{item.scheduleNumber}:</strong> {item.scheduleTitle}
                          </a>
                        </li>
                      );
                    }
                    return null;
                  })}
                  {act.amendments && act.amendments.length > 0 && (
                    <li className="govuk-!-margin-top-2" style={{ borderTop: "1px solid #b1b4b6", paddingTop: "4px" }}>
                      <a href="#amendments" className="govuk-link govuk-link--no-underline">Major Amendments</a>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
          </aside>
          {/* Right Column: Main Statutory Structural Content Viewport */}
          <div className="legislation-main-viewport">
            
            {/* Act Information Grid Meta Summary List */}
            <section id="act-information" className="govuk-!-margin-bottom-6" style={{ borderTop: "1px solid #b1b4b6", paddingTop: "12px" }}>
              <h2 className="govuk-heading-m govuk-!-margin-bottom-2" style={{ fontSize: "20px" }}>Act Information</h2>
              <dl className="govuk-summary-list govuk-!-margin-bottom-0" style={{ fontSize: "15px" }}>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key" style={{ width: "30%" }}>Citation</dt>
                  <dd className="govuk-summary-list__value">{act.citation}</dd>
                </div>
                {act.capNumber && (
                  <div className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">Cap Number</dt>
                    <dd className="govuk-summary-list__value">{act.capNumber}</dd>
                  </div>
                )}
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">House of Origin</dt>
                  <dd className="govuk-summary-list__value">{act.houseOfOrigin === "nationalAssembly" ? "National Assembly" : "Senate"}</dd>
                </div>
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">Current Status</dt>
                  <dd className="govuk-summary-list__value">
                    <strong className="govuk-tag" style={{ fontSize: "12px", padding: "2px 8px", backgroundColor: act.status === "active" ? "#00703c" : act.status === "amended" ? "#1d70b8" : "#d4351c" }}>
                      {act.status}
                    </strong>
                  </dd>
                </div>
              </dl>
            </section>

            {/* Constitutional Cross-referencing Links */}
            {act.constitutionalBasis && act.constitutionalBasis.length > 0 && (
              <section id="constitutional-basis" className="govuk-!-margin-bottom-6">
                <h2 className="govuk-heading-s govuk-!-margin-bottom-2" style={{ fontSize: "16px", color: "#505a5f" }}>Constitutional Basis</h2>
                <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-0" style={{ fontSize: "15px" }}>
                  {act.constitutionalBasis.map((article) => (
                    <li key={article._id}>
                      <Link href={`/constitution/article-${article.articleNumber}`} className="govuk-link govuk-link--no-underline">
                        Article {article.articleNumber}
                      </Link>
                      {article.articleTitle && ` — ${article.articleTitle}`}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Inner-Act Quick Search Bar */}
            <section className="govuk-!-margin-bottom-6" style={{ backgroundColor: "#f3f2f1", padding: "12px" }}>
              <div className="govuk-form-group govuk-!-margin-bottom-0">
                <label className="govuk-label govuk-label--s govuk-!-margin-bottom-1" htmlFor="search-sections">
                  Search provisions within this Act
                </label>
                <input
                  id="search-sections"
                  className="govuk-input"
                  type="search"
                  autoComplete="off"
                  placeholder="e.g. section numbers, terms, summaries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </section>

            {/* Main Legislative Document Provision Map Tree */}
            {filteredParts.length > 0 ? (
              <section className="legislation-statute-tree">
                {filteredParts.map((item, i) => {
                  
                  // ================= PARTS VIEW IMPLEMENTATION =================
                  if (item._type === "part") {
                    return (
                      <div key={`part-block-${i}`} id={`part-${i}`} className="govuk-!-margin-bottom-6">
                        <div className="govuk-!-padding-top-2 govuk-!-padding-bottom-2" style={{ borderBottom: "2px solid #505a5f" }}>
                          <h3 className="govuk-heading-m govuk-!-margin-0" style={{ fontSize: "18px" }}>
                            {item.partNumber} — {item.partTitle}
                          </h3>
                        </div>

                        <div className="govuk-!-margin-top-3">
                          {item.sections?.map((section, j) => (
                            <div key={`section-row-${j}`} id={`section-${section.sectionNumber}`} className="govuk-!-margin-bottom-4" style={{ paddingLeft: "10px" }}>
                              <h4 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: "16px", color: "#2b2b2b" }}>
                                <span style={{ fontWeight: "bold", marginRight: "8px" }}>{section.sectionNumber}.</span>
                                {section.sectionTitle}
                              </h4>
                              
                              <div className="govuk-!-margin-top-2" style={{ paddingLeft: "15px" }}>
                                {section.officialText && (
                                  <div className="govuk-body-m legislation-clause-text" style={{ fontSize: "15px", lineHeight: "1.5" }}>
                                    <PortableTextContent content={section.officialText} />
                                  </div>
                                )}
                                {section.plainSummary && (
                                  <details open={!!item._shouldOpen} className="govuk-details govuk-!-margin-top-2 govuk-!-margin-bottom-0" style={{ backgroundColor: "#f3f2f1", padding: "8px" }}>
                                    <summary className="govuk-details__summary">
                                      <span className="govuk-details__summary-text govuk-!-font-size-14">Plain English Summary</span>
                                    </summary>
                                    <div className="govuk-details__text" style={{ borderLeft: "none", paddingLeft: 0, paddingTop: "6px", paddingBottom: 0 }}>
                                      <p className="govuk-body-s govuk-!-margin-0">{section.plainSummary}</p>
                                    </div>
                                  </details>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  // ================= SCHEDULES VIEW IMPLEMENTATION =================
                  if (item._type === "schedule") {
                    return (
                      <section key={`schedule-block-${i}`} id={`schedule-${i}`} className="govuk-!-margin-bottom-6" style={{ border: "1px solid #b1b4b6", borderRadius: "2px" }}>
                        <div className="govuk-!-padding-3" style={{ backgroundColor: "#1d70b8", color: "white" }}>
                          <h3 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ color: "white", fontSize: "16px" }}>{item.scheduleNumber}</h3>
                          <p className="govuk-body-s govuk-!-margin-0" style={{ color: "white", fontWeight: "bold" }}>{item.scheduleTitle}</p>
                          {item.relatedSection && (
                            <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: "#f3f2f1", fontStyle: "italic" }}>Related to {item.relatedSection}</p>
                          )}
                        </div>

                        <div className="govuk-!-padding-3">
                          {item.introText && (
                            <div className="govuk-body-s govuk-!-margin-bottom-3" style={{ fontStyle: "italic" }}>
                              <PortableTextContent content={item.introText} />
                            </div>
                          )}

                          {item.items?.map((scheduleItem, j) => (
                            <div key={`sched-item-${j}`} className="govuk-!-margin-bottom-3" style={{ borderLeft: "3px solid #1d70b8", paddingLeft: "10px" }}>
                              <h4 className="govuk-heading-s govuk-!-margin-bottom-1" style={{ fontSize: "15px" }}>
                                {scheduleItem.itemNumber} {scheduleItem.itemTitle && `— ${scheduleItem.itemTitle}`}
                              </h4>
                              {scheduleItem.officialText && (
                                <div className="govuk-body-s legislation-clause-text" style={{ paddingLeft: "10px" }}>
                                  <PortableTextContent content={scheduleItem.officialText} />
                                </div>
                              )}
                              {scheduleItem.plainSummary && (
                                <details open={!!item._shouldOpen} className="govuk-details govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ backgroundColor: "#f3f2f1", padding: "6px" }}>
                                  <summary className="govuk-details__summary">
                                    <span className="govuk-details__summary-text govuk-!-font-size-14">Summary</span>
                                  </summary>
                                  <div className="govuk-details__text" style={{ borderLeft: "none", paddingLeft: 0, paddingTop: "4px", paddingBottom: 0 }}>
                                    <p className="govuk-body-s govuk-!-margin-0">{scheduleItem.plainSummary}</p>
                                  </div>
                                </details>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    );
                  }

                  return null;
                })}
              </section>
            ) : (
              <p className="govuk-body-s govuk-!-text-colour-dark-grey">No parts or provisions match your search query filter.</p>
            )}

            {/* ================= MAJOR AMENDMENTS HISTORY FOOTER ================= */}
            {act.amendments && act.amendments.length > 0 && (
              <section id="amendments" className="govuk-!-margin-top-6 govuk-!-padding-top-4" style={{ borderTop: "1px solid #b1b4b6" }}>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-3" style={{ fontSize: "20px" }}>Major Amendments</h2>
                <ul className="govuk-list govuk-list--bullet" style={{ fontSize: "15px" }}>
                  {act.amendments.map((amendment, i) => (
                    <li key={`amend-${i}`} className="govuk-!-margin-bottom-2">
                      <strong>{amendment.amendingAct}</strong> ({amendment.year})
                      {amendment.notes && (
                        <div className="govuk-!-margin-top-1 govuk-!-text-colour-dark-grey" style={{ paddingLeft: "10px", fontStyle: "italic" }}>
                          {amendment.notes}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

          </div>
        </div>

        <GovUKFeedback />
      </main>

      {/* Global CSS Layout Overrides safe for Next App Architecture */}
      <style dangerouslySetInnerHTML={{__html: `
        summary::-webkit-details-marker { display: none !important; }
        summary { list-style: none !important; }
        .govuk-link--no-underline { text-decoration: none !important; color: #1d70b8 !important; }
        .govuk-link--no-underline:hover { text-decoration: underline !important; color: #003078 !important; }
        
        .legislation-actions-bar { display: flex; gap: 1.5rem; flex-wrap: wrap; align-items: center; }
        .legislation-grid-frame { display: flex; flex-direction: column; gap: 24px; }
        .legislation-toc-sidebar { width: 100%; position: relative; }
        .legislation-main-viewport { width: 100%; }

        @media (min-width: 48.0625rem) {
          .legislation-grid-frame { flex-direction: row; align-items: start; }
          .legislation-toc-sidebar { width: 280px; position: sticky; top: 20px; align-self: start; flex-shrink: 0; }
          .legislation-main-viewport { flex: 1; min-width: 0; }
        }
      `}} />
    </div>
  );
}
