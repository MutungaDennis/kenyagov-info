'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import LastUpdated from "@/components/govuk/LastUpdated";

interface CensusYear {
  id: number;
  census_year: number;
  is_active: boolean;
}

interface CensusRecord {
  id: number;
  category_code: string;
  name: string;
  population_count: number;
  parent_id: number | null;
  classification_type: 'MACRO' | 'CITIZEN_MAIN' | 'CITIZEN_SUB';
}

export default function CommunitiesPage() {
  const [years, setYears] = useState<CensusYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [records, setRecords] = useState<CensusRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'totals' | 'tribes' | 'foreign'>('totals');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Phase 1: Query Available Timeline Directories
  useEffect(() => {
    async function fetchTimelineYears() {
      try {
        const supabase = createClient();
        const { data, error: yearError } = await supabase
          .from("census_years")
          .select("id, census_year, is_active")
          .order("census_year", { ascending: false });

        if (yearError) throw yearError;
        setYears(data || []);
        
        const activeYear = data?.find(y => y.is_active) || data?.[0];
        if (activeYear) setSelectedYearId(activeYear.id);
      } catch (err: any) {
        setError(err.message || "Failed to load census years registry.");
      }
    }
    fetchTimelineYears();
  }, []);

  // Phase 2: Live Fetch Census Entries on Year ID Switch State
  useEffect(() => {
    if (selectedYearId === null) return;
    
    async function fetchCensusMetrics() {
      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data, error: recError } = await supabase
          .from("knbs_ethnicity_census")
          .select("id, category_code, name, population_count, parent_id, classification_type")
          .eq("census_year_id", selectedYearId);

        if (recError) throw recError;
        setRecords(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to query live demographic datasets.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchCensusMetrics();
  }, [selectedYearId]);

  // Data filtering logic based on category codes provided
  const macroRecords = records.filter(r => r.classification_type === 'MACRO');
  
  const citizenRecords = records.filter(r => 
    (r.classification_type === 'CITIZEN_MAIN' || r.classification_type === 'CITIZEN_SUB') && 
    !r.category_code.startsWith('FOREIGN_') && 
    !r.category_code.startsWith('EA_')
  );

  const foreignRecords = records.filter(r => 
    r.category_code.startsWith('FOREIGN_') || 
    r.category_code.startsWith('EA_') || 
    r.category_code === 'TOTAL_NON_KENYANS'
  );

  // Sorting helper logic to bubble up primary groups cleanly
  const sortedCitizenRecords = [...citizenRecords].sort((a, b) => {
    const isAMain = a.classification_type === 'CITIZEN_MAIN';
    const isBMain = b.classification_type === 'CITIZEN_MAIN';
    if (isAMain && !isBMain) return -1;
    if (!isAMain && isBMain) return 1;
    return b.population_count - a.population_count;
  });

  const selectedYearLabel = years.find(y => y.id === selectedYearId)?.census_year || 2019;

  if (isLoading && years.length === 0) {
    return (
      <div className="govuk-width-container govuk-!-padding-top-9">
        <p className="govuk-body-l">Establishing remote connection to public KNBS census database tables...</p>
      </div>
    );
  }

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Society and Culture", href: "/society-and-culture" },
          { text: "Communities", href: "/society-and-culture/communities" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        
        {/* HEADER SECTION */}
        <div className="govuk-grid-row govuk-!-margin-bottom-6">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">National Identity and Heritage</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-4">Demographics &amp; Ethnic Communities</h1>
            <p className="govuk-body-l">
              Official data tracking metrics managed natively within your database architecture to document demographic changes over successive census cycles.
            </p>
          </div>
        </div>

        {/* TIMELINE CONTROL FILTERBAR */}
        <div style={{ backgroundColor: "#f3f2f1", padding: "15px", marginBottom: "30px", borderLeft: "5px solid #1d70b8" }}>
          <div className="govuk-form-group" style={{ marginBottom: 0 }}>
            <label className="govuk-label" htmlFor="census-year-select">
              <strong>Select Active Statistics Census Year</strong>
            </label>
            <select 
              className="govuk-select" 
              id="census-year-select" 
              value={selectedYearId || ""} 
              onChange={(e) => setSelectedYearId(Number(e.target.value))}
              style={{ minWidth: "240px" }}
            >
              {years.map(y => (
                <option key={y.id} value={y.id}>KNBS Census Record: {y.census_year}</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="govuk-error-summary" role="alert" aria-labelledby="error-heading">
            <h2 className="govuk-error-summary__title" id="error-heading">Database Sync Error</h2>
            <div className="govuk-error-summary__body"><p className="govuk-body">{error}</p></div>
          </div>
        )}

        {/* DUAL WORKSPACE LAYOUT MATRIX */}
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            
            {/* GOV.UK TAB SYSTEM COMPONENT NAVIGATION LINK BUTTONS */}
            <div style={{ borderBottom: "2px solid #b1b4b6", marginBottom: "25px", display: "flex", gap: "5px" }}>
              <button 
                onClick={() => setActiveTab('totals')}
                style={{
                  padding: "10px 15px", fontWeight: "bold", border: "1px solid transparent", cursor: "pointer", fontSize: "16px",
                  backgroundColor: activeTab === 'totals' ? "#ffffff" : "transparent",
                  borderBottom: activeTab === 'totals' ? "4px solid #1d70b8" : "none",
                  borderTop: activeTab === 'totals' ? "1px solid #b1b4b6" : "none",
                  borderLeft: activeTab === 'totals' ? "1px solid #b1b4b6" : "none",
                  borderRight: activeTab === 'totals' ? "1px solid #b1b4b6" : "none"
                }}
              >
                1. Macro Totals
              </button>
              <button 
                onClick={() => setActiveTab('tribes')}
                style={{
                  padding: "10px 15px", fontWeight: "bold", border: "1px solid transparent", cursor: "pointer", fontSize: "16px",
                  backgroundColor: activeTab === 'tribes' ? "#ffffff" : "transparent",
                  borderBottom: activeTab === 'tribes' ? "4px solid #1d70b8" : "none",
                  borderTop: activeTab === 'tribes' ? "1px solid #b1b4b6" : "none",
                  borderLeft: activeTab === 'tribes' ? "1px solid #b1b4b6" : "none",
                  borderRight: activeTab === 'tribes' ? "1px solid #b1b4b6" : "none"
                }}
              >
                2. Kenyan Communities
              </button>
              <button 
                onClick={() => setActiveTab('foreign')}
                style={{
                  padding: "10px 15px", fontWeight: "bold", border: "1px solid transparent", cursor: "pointer", fontSize: "16px",
                  backgroundColor: activeTab === 'foreign' ? "#ffffff" : "transparent",
                  borderBottom: activeTab === 'foreign' ? "4px solid #1d70b8" : "none",
                  borderTop: activeTab === 'foreign' ? "1px solid #b1b4b6" : "none",
                  borderLeft: activeTab === 'foreign' ? "1px solid #b1b4b6" : "none",
                  borderRight: activeTab === 'foreign' ? "1px solid #b1b4b6" : "none"
                }}
              >
                3. Foreign Nationalities
              </button>
            </div>

            {isLoading ? (
              <p className="govuk-body">Loading selected database rows...</p>
            ) : (
              <>
                {/* TAB 1 CONTENT BLOCK: NATIONAL TOTALS */}
                {activeTab === 'totals' && (
                  <section id="tab-totals" style={{ overflowX: "auto" }}>
                    <h2 className="govuk-heading-m">Macro Distribution Summary ({selectedYearLabel})</h2>
                    <table className="govuk-table">
                      <thead className="govuk-table__head">
                        <tr className="govuk-table__row">
                          <th scope="col" className="govuk-table__header">Registry Population Segment</th>
                          <th scope="col" className="govuk-table__header govuk-table__header--numeric">Enumerated Size</th>
                        </tr>
                      </thead>
                      <tbody className="govuk-table__body">
                        {macroRecords.map((rec) => {
                          const isBoldRow = rec.category_code === 'TOTAL_POPULATION';
                          return (
                            <tr key={rec.id} className="govuk-table__row">
                            <th scope="row" className="govuk-table__header" style={{ fontWeight: isBoldRow ? "bold" : "normal" }}>{rec.name}</th>
                            <td className="govuk-table__cell govuk-table__cell--numeric" style={{ fontWeight: isBoldRow ? "bold" : "normal" }}>
                              {rec.population_count.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>
              )}

                            {/* TAB 2 CONTENT BLOCK: DETAILED COMMUNITIES WITH INTERACTIVE SUB-CATEGORIES */}
              {activeTab === 'tribes' && (
                <section id="tab-tribes" style={{ overflowX: "auto" }}>
                  <h2 className="govuk-heading-m">Kenyan Communities &amp; Sub-tribes ({selectedYearLabel})</h2>
                  <p className="govuk-body-s" style={{ color: "#505a5f" }}>
                    Major groups with sub-clans are displayed below. Select any row to expand and inspect detailed sub-category census records.
                  </p>

                  <table className="govuk-table">
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header" style={{ width: "10%" }}>Index</th>
                        <th scope="col" className="govuk-table__header" style={{ width: "55%" }}>Tribe / Ethnic Community Classification</th>
                        <th scope="col" className="govuk-table__header govuk-table__header--numeric" style={{ width: "35%" }}>Population Count</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      {(() => {
                        // 1. Separate top-level parent rows from sub-items for precise structural rendering
                        const mainGroups = citizenRecords.filter(r => r.parent_id === null || r.category_code.endsWith('_TOTAL'));
                        
                        // Sort top-level groups by total size
                        const sortedMainGroups = [...mainGroups].sort((a, b) => b.population_count - a.population_count);
                        
                        return sortedMainGroups.map((mainRec, index) => {
                          // 2. Fetch any nested children belonging to this specific parent node
                          const subCategories = citizenRecords.filter(child => child.parent_id === mainRec.id);
                          const hasSubCategories = subCategories.length > 0;

                          // Sort subcategories by size as well
                          const sortedSubCategories = [...subCategories].sort((a, b) => b.population_count - a.population_count);

                          return (
                            <React.Fragment key={mainRec.id}>
                              {/* Primary Parent Row Entry */}
                              <tr className="govuk-table__row" style={{ backgroundColor: hasSubCategories ? "#f3f2f1" : "transparent" }}>
                                <td className="govuk-table__cell">
                                  <strong>{index + 1}</strong>
                                </td>
                                <td className="govuk-table__cell">
                                  {hasSubCategories ? (
                                    <strong>{mainRec.name} <span style={{ fontWeight: "normal", fontSize: "14px", color: "#505a5f" }}>(Includes {subCategories.length} Sub-categories)</span></strong>
                                  ) : (
                                    <strong>{mainRec.name}</strong>
                                  )}
                                </td>
                                <td className="govuk-table__cell govuk-table__cell--numeric" style={{ fontWeight: "bold" }}>
                                  {mainRec.population_count.toLocaleString()}
                                </td>
                              </tr>

                              {/* Interactive Nested Sub-Category Area Panel (Rendered only if sub-clans exist) */}
                              {hasSubCategories && (
                                <tr className="govuk-table__row">
                                  <td colSpan={3} style={{ padding: "0px" }}>
                                    <details className="govuk-details" style={{ margin: "0px", padding: "12px 20px", borderLeft: "4px solid #1d70b8", backgroundColor: "#ffffff" }}>
                                      <summary className="govuk-details__summary" style={{ marginBottom: "5px" }}>
                                        <span className="govuk-details__summary-text" style={{ fontSize: "16px" }}>
                                          View sub-categories breakdown for {mainRec.name}
                                        </span>
                                      </summary>
                                      <div className="govuk-details__text" style={{ padding: "0px", borderLeft: "none" }}>
                                        <table className="govuk-table" style={{ margin: "5px 0 0 0", width: "100%" }}>
                                          <tbody className="govuk-table__body">
                                            {sortedSubCategories.map((subRec) => (
                                              <tr key={subRec.id} className="govuk-table__row" style={{ borderBottom: "1px dashed #b1b4b6" }}>
                                                <td className="govuk-table__cell" style={{ color: "#0b0c0c", fontSize: "16px" }}>
                                                  {subRec.name}
                                                </td>
                                                <td className="govuk-table__cell govuk-table__cell--numeric" style={{ color: "#0b0c0c", fontSize: "16px" }}>
                                                  {subRec.population_count.toLocaleString()}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </details>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </section>
              )}


              {/* TAB 3 CONTENT BLOCK: FOREIGN INDIVIDUAL NATIONALITIES */}
              {activeTab === 'foreign' && (
                <section id="tab-foreign" style={{ overflowX: "auto" }}>
                  <h2 className="govuk-heading-m">Foreign Nationalities &amp; Stateless Tracking ({selectedYearLabel})</h2>
                  <table className="govuk-table">
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header">Origin Classification Area</th>
                        <th scope="col" className="govuk-table__header govuk-table__header--numeric">Enumerated Size</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      {foreignRecords.map((rec) => {
                        const isSubItem = rec.category_code.startsWith('EA_');
                        const isTotalRow = rec.category_code === 'TOTAL_NON_KENYANS' || rec.category_code === 'FOREIGN_EA_COMBINED';

                        return (
                          <tr key={rec.id} className="govuk-table__row">
                            <td className="govuk-table__cell" style={{ paddingLeft: isSubItem ? "20px" : "0px" }}>
                              {isTotalRow ? <strong>{rec.name}</strong> : rec.name}
                            </td>
                            <td className="govuk-table__cell govuk-table__cell--numeric" style={{ fontWeight: isTotalRow ? "bold" : "normal" }}>
                              {rec.population_count.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </section>
              )}
            </>
          )}
          </div>

          {/* SIDEBAR NAVIGATION COLUMN */}
          <aside className="govuk-grid-column-one-third" role="complementary">
            <div style={{ borderTop: "2px solid #1d70b8", paddingTop: "15px" }}>
              <h2 className="govuk-heading-m govuk-!-margin-bottom-3">Related Guidance</h2>
              <ul className="govuk-list govuk-body-s">
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/languages" className="govuk-link">
                    <strong>Languages and Linguistic Families</strong>
                  </Link>
                </li>
                <li className="govuk-!-margin-bottom-3">
                  <Link href="/society-and-culture/constitution-and-national-values" className="govuk-link">
                    <strong>Constitution and Governance Principles</strong>
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {/* FEEDBACK & FOOTER METADATA */}
        <div className="govuk-grid-row govuk-!-margin-top-6">
          <div className="govuk-grid-column-full">
            <LastUpdated published="2026-05-22" lastUpdated="2026-05-22" />
          </div>
        </div>

      </main>
    </div>
  );
}
