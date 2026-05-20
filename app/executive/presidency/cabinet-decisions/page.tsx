'use client';

import { useState, useMemo } from "react";
import Link from "next/link"; // FIXED: Corrected import source for the Next.js Link component
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

type CabinetDecision = {
  id: string;
  meetingReference: string;
  title: string;
  dateIssued: string;
  sector: 'Economic & Fiscal Policy' | 'Infrastructure & Energy' | 'Health & Social Protection' | 'Internal Security';
  summary: string;
  dispatchUrl: string;
  fileSize: string;
};

const cabinetDecisionsData: CabinetDecision[] = [
  {
    id: "cab-2026-03",
    meetingReference: "Cabinet Dispatch - Third Session 2026",
    title: "Approval of National Green Energy Grid Stabilization Framework",
    dateIssued: "14 April 2026",
    sector: "Infrastructure & Energy",
    summary: "Ratified the statutory expansion plan for geothermal main lines and grid-tied solar storage investments across regional hubs.",
    dispatchUrl: "/documents/cabinet/dispatch-14-april-2026.pdf",
    fileSize: "420KB"
  },
  {
    id: "cab-2026-02",
    meetingReference: "Cabinet Dispatch - Second Session 2026",
    title: "Emergency Fiscal Allocations for Food Security and Agricultural Inputs",
    dateIssued: "10 March 2026",
    sector: "Economic & Fiscal Policy",
    summary: "Authorized conditional budget allocations for subsidized fertilizer distribution pipelines through automated digital cooperative systems.",
    dispatchUrl: "/documents/cabinet/dispatch-10-march-2026.pdf",
    fileSize: "310KB"
  },
  {
    id: "cab-2025-11",
    meetingReference: "Cabinet Dispatch - Tenth Session 2025",
    title: "Universal Health Coverage Digitization Rollout Strategy",
    dateIssued: "18 November 2025",
    sector: "Health & Social Protection",
    summary: "Approved the legal implementation framework for centralized electronic health recording networks across level 4 and 5 facilities.",
    dispatchUrl: "/documents/cabinet/dispatch-18-november-2025.pdf",
    fileSize: "540KB"
  },
  {
    id: "cab-2025-09",
    meetingReference: "Cabinet Dispatch - Eighth Session 2025",
    title: "Bilateral Policing Coordination Framework for Border Hubs",
    dateIssued: "04 September 2025",
    sector: "Internal Security",
    summary: "Sanctioned the deployable operational command protocols between immigration security cells and regional community policing boards.",
    dispatchUrl: "/documents/cabinet/dispatch-04-september-2025.pdf",
    fileSize: "612KB"
  }
];

export default function CabinetDecisionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("");

  const filteredDecisions = useMemo(() => {
    return cabinetDecisionsData.filter((decision) => {
      const matchesSearch = 
        decision.meetingReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        decision.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        decision.summary.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSector = !selectedSector || decision.sector === selectedSector;

      return matchesSearch && matchesSector;
    });
  }, [searchTerm, selectedSector]);

  const hasActiveFilters = searchTerm !== "" || selectedSector !== "";

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedSector("");
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "The Presidency", href: "/executive/presidency" },
          { text: "Cabinet Decisions", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Register of Cabinet Decisions</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Official public record of statutory resolutions, national policy approvals, and administrative directives issued during Cabinet sessions.
            </p>

            {/* Filters Input Panel */}
            <div className="govuk-grid-row govuk-!-margin-bottom-2">
              <div className="govuk-grid-column-one-half govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search-decision">
                    Search decisions
                  </label>
                  <input
                    className="govuk-input"
                    id="search-decision"
                    type="search"
                    placeholder="Keywords, session reference, or policy text..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="govuk-grid-column-one-half govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="sector-select">
                    Policy Sector
                  </label>
                  <select
                    className="govuk-select govuk-!-width-full"
                    id="sector-select"
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                  >
                    <option value="">All Policy Sectors</option>
                    <option value="Economic & Fiscal Policy">Economic & Fiscal Policy</option>
                    <option value="Infrastructure & Energy">Infrastructure & Energy</option>
                    <option value="Health & Social Protection">Health & Social Protection</option>
                    <option value="Internal Security">Internal Security</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Clear Tags Panel */}
            {hasActiveFilters && (
              <div className="govuk-!-margin-bottom-4" style={{ background: '#f8f8f8', padding: '12px', border: '1px solid #bfc1c3' }}>
                <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">Active filters:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {searchTerm && (
                    <button 
                      type="button" 
                      onClick={() => setSearchTerm("")} 
                      style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}
                    >
                      Search: &ldquo;{searchTerm}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}
                  {selectedSector && (
                    <button 
                      type="button" 
                      onClick={() => setSelectedSector("")} 
                      style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}
                    >
                      Sector: {selectedSector} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={clearAllFilters} 
                    className="govuk-link govuk-!-font-size-16" 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '4px' }}
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            <h2 className="govuk-heading-m govuk-!-margin-bottom-4" aria-live="polite">
              Showing {filteredDecisions.length} Cabinet resolutions
            </h2>

            {filteredDecisions.length > 0 ? (
              /* Mobile Safe Horizontal Scroll Element */
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                <table className="govuk-table" style={{ minWidth: '850px' }}>
                  <caption className="govuk-table__caption govuk-visually-hidden">Register of Cabinet resolutions.</caption>
                  <thead className="govuk-table__head">
                    <tr className="govuk-table__row">
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '220px' }}>Session Reference</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '120px' }}>Date Issued</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '180px' }}>Policy Sector</th>
                      <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Summary of Resolution & Official Dispatch</th>
                    </tr>
                  </thead>
                  <tbody className="govuk-table__body">
                    {filteredDecisions.map((decision) => (
                      <tr key={decision.id} className="govuk-table__row">
                        <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                          <span className="govuk-!-font-weight-bold" style={{ display: 'block', fontSize: '16px' }}>{decision.meetingReference}</span>
                          <span style={{ fontSize: '14px', color: '#505a5f', display: 'block', marginTop: '2px' }}>{decision.title}</span>
                        </th>
                        <td className="govuk-table__cell govuk-body-s">{decision.dateIssued}</td>
                        <td className="govuk-table__cell govuk-body-s">
                          <strong className={`govuk-tag ${decision.sector === 'Economic & Fiscal Policy' ? 'govuk-tag--blue' : decision.sector === 'Infrastructure & Energy' ? 'govuk-tag--purple' : 'govuk-tag--grey'}`}>
                            {decision.sector}
                          </strong>
                        </td>
                        <td className="govuk-table__cell govuk-body-s">
                          <p className="govuk-body-s govuk-!-margin-bottom-2">{decision.summary}</p>
                          <Link 
                            href={decision.dispatchUrl} 
                            className="govuk-link govuk-!-font-weight-bold govuk-!-font-size-14"
                          >
                            Download Full Cabinet Dispatch PDF ({decision.fileSize})
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="govuk-body govuk-!-margin-top-4">
                <p>No recorded Cabinet decisions match your specified search keywords or sector criteria.</p>
              </div>
            )}

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
