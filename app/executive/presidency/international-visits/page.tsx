'use client';

import { useState, useMemo } from "react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";
import Link from "next/link";

type VisitRecord = {
  id: string;
  country: string;
  city: string;
  region: 'Africa' | 'Europe' | 'Americas' | 'Asia-Pacific' | 'Middle East';
  dates: string;
  classification: 'State Visit' | 'Working Visit' | 'Summit' | 'Bilateral Meeting';
  outcome: string;
  speechSummary?: string;
  speechFullText?: string;
  pdfUrl?: string;
  pdfSize?: string;
};

// Comprehensive official dispatch log mapping all 5 global regions
const visitsData: VisitRecord[] = [
  {
    id: "v1",
    country: "United States",
    city: "Washington, D.C.",
    region: "Americas",
    dates: "20-24 May 2024",
    classification: "State Visit",
    outcome: "Secured KES 15B framework financing for green energy infrastructure and tech partnership corridors.",
    speechSummary: "Address to the US Congress on Democratic Alliances",
    speechFullText: "Honourable members, Kenya stands ready to pioneer digital infrastructure transformations across East Africa through mutual public sector investment...",
    pdfUrl: "/documents/speeches/ruto-us-congress-2024.pdf",
    pdfSize: "245KB"
  },
  {
    id: "v2",
    country: "Ethiopia",
    city: "Addis Ababa",
    region: "Africa",
    dates: "17-18 February 2024",
    classification: "Summit",
    outcome: "Signed regional logistics optimization treaty for Lamu Port-South Sudan-Ethiopia Transport (LAPSSET) corridor safety.",
    speechSummary: "37th Ordinary Session of the African Union Assembly",
    speechFullText: "Our integration rests upon industrial trade synchronization. We must clear transit cross-border barriers immediately...",
    pdfUrl: "/documents/speeches/ruto-au-summit-2024.pdf",
    pdfSize: "180KB"
  },
  {
    id: "v3",
    country: "Germany",
    city: "Berlin",
    region: "Europe",
    dates: "13-14 September 2024",
    classification: "Working Visit",
    outcome: "Concluded bilateral labor migration agreement allowing skilled Kenyan technicians structured visa placements.",
    speechSummary: "Keynote at the Berlin Citizens Forum on Global Mobility",
    speechFullText: "This agreement honors human capacity. It bridges economic human resource needs with transparent legal frameworks...",
    pdfUrl: "/documents/speeches/ruto-berlin-mobility-2024.pdf",
    pdfSize: "192KB"
  },
  {
    id: "v4",
    country: "China",
    city: "Beijing",
    region: "Asia-Pacific",
    dates: "4-6 September 2024",
    classification: "Summit",
    outcome: "Secured KES 40B conditional grants for expanding local rural smart grid connections and dual-carriageway networks.",
    speechSummary: "FOCAC High-Level Dialogue on Industrialization",
    speechFullText: "Partnerships must remain mutually progressive. Infrastructure investments yield immediate dividends when paired with technology drops...",
    pdfUrl: "/documents/speeches/ruto-focac-beijing-2024.pdf",
    pdfSize: "310KB"
  },
  {
    id: "v5",
    country: "Saudi Arabia",
    city: "Riyadh",
    region: "Middle East",
    dates: "11-12 November 2023",
    classification: "Summit",
    outcome: "Concluded bilateral financing framework for renewable energy grid stabilization and agricultural export concessions.",
    speechSummary: "Saudi-African Summit Executive Plenary Address",
    speechFullText: "The transition to sustainable economic baselines demands institutional co-investment frameworks that scale past sovereign borders...",
    pdfUrl: "/documents/speeches/ruto-riyadh-summit-2023.pdf",
    pdfSize: "215KB"
  }
];

export default function InternationalVisitsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  
  // Layout state toggle - defaults to GOV.UK standard 'table' grid directory structure
  const [layoutMode, setLayoutMode] = useState<'table' | 'timeline'>('table');

  const filteredVisits = useMemo(() => {
    return visitsData.filter((v) => {
      const matchesSearch = 
        v.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.outcome.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegion = !selectedRegion || v.region === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, selectedRegion]);

  const hasActiveFilters = searchTerm !== "" || selectedRegion !== "";

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "The Presidency", href: "/executive/presidency" },
          { text: "International Visits", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Register of Presidential International Visits</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Official record of foreign visits, bilateral outcomes, summits attended, and statutory speeches delivered by President William Ruto.
            </p>

            {/* Mobile Responsive Layout Toggle & Filters Row */}
            <div className="govuk-grid-row govuk-!-margin-bottom-2">
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search-visit">Search</label>
                  <input
                    className="govuk-input"
                    id="search-visit"
                    type="search"
                    placeholder="Country, city, or key outcomes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="region-select">Global Region</label>
                  <select
                    className="govuk-select govuk-!-width-full"
                    id="region-select"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                    <option value="">All Regions</option>
                    <option value="Africa">Africa</option>
                    <option value="Europe">Europe</option>
                    <option value="Americas">Americas</option>
                    <option value="Asia-Pacific">Asia-Pacific</option>
                    <option value="Middle East">Middle East</option>
                  </select>
                </div>
              </div>

              {/* Layout Switch Button Component (Aligned with input grid blocks) */}
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <span className="govuk-label govuk-!-font-weight-bold">View Layout</span>
                  <div style={{ display: 'inline-flex', width: '100%', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setLayoutMode('table')}
                      className={`govuk-button ${layoutMode === 'table' ? '' : 'govuk-button--secondary'}`}
                      style={{ flex: 1, margin: 0, borderRight: 'none', borderRadius: '0' }}
                    >
                      Table View
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutMode('timeline')}
                      className={`govuk-button ${layoutMode === 'timeline' ? '' : 'govuk-button--secondary'}`}
                      style={{ flex: 1, margin: 0, borderRadius: '0' }}
                    >
                      Timeline
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filter Tags Row */}
            {hasActiveFilters && (
              <div className="govuk-!-margin-bottom-4" style={{ background: '#f8f8f8', padding: '12px', border: '1px solid #bfc1c3' }}>
                <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">Active filters:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {searchTerm && (
                    <button type="button" onClick={() => setSearchTerm("")} style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center' }}>
                      Keywords: &ldquo;{searchTerm}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}
                  {selectedRegion && (
                    <button type="button" onClick={() => setSelectedRegion("")} style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', display: 'inline-flex', alignItems: 'center' }}>
                      Region: {selectedRegion} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}
                  <button type="button" onClick={() => { setSearchTerm(""); setSelectedRegion(""); }} className="govuk-link govuk-!-font-size-16" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            <h2 className="govuk-heading-m govuk-!-margin-bottom-4" aria-live="polite">
              Showing {filteredVisits.length} recorded diplomatic engagements
            </h2>

            {filteredVisits.length > 0 ? (
              layoutMode === 'table' ? (
                /* OPTION A: STANDARD GOV.UK COMPLIANT DATA TABLE WINDOW */
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                  <table className="govuk-table" style={{ minWidth: '850px' }}>
                    <caption className="govuk-table__caption govuk-visually-hidden">Log of international presidential visits.</caption>
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '160px' }}>Destination</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '120px' }}>Dates</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '130px' }}>Classification</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Primary Diplomatic Outcomes & Addresses</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      {filteredVisits.map((v) => (
                        <tr key={v.id} className="govuk-table__row">
                          <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                            <span className="govuk-!-font-weight-bold" style={{ display: 'block', fontSize: '16px' }}>{v.country}</span>
                            <span style={{ fontSize: '14px', color: '#505a5f' }}>{v.city}</span>
                          </th>
                          <td className="govuk-table__cell govuk-body-s">{v.dates}</td>
                          <td className="govuk-table__cell govuk-body-s">
                            <strong className={`govuk-tag ${v.classification === 'State Visit' ? 'govuk-tag--blue' : v.classification === 'Summit' ? 'govuk-tag--purple' : 'govuk-tag--grey'}`}>
                              {v.classification}
                            </strong>
                          </td>
                          <td className="govuk-table__cell govuk-body-s">
                            <p className="govuk-body-s govuk-!-margin-bottom-2">{v.outcome}</p>
                            {v.speechSummary && (
                              <div className="govuk-!-margin-top-2">
                                <details className="govuk-details govuk-!-margin-bottom-1" data-module="govuk-details">
                                  <summary className="govuk-details__summary"><span className="govuk-details__summary-text" style={{ fontSize: '14px' }}>Read speech: &ldquo;{v.speechSummary}&rdquo;</span></summary>
                                  <div className="govuk-details__text" style={{ padding: '10px', fontSize: '14px', background: '#fff', borderLeft: '4px solid #bfc1c3' }}><em>{v.speechFullText}</em></div>
                                </details>
                                {v.pdfUrl && (
                                  <Link href={v.pdfUrl} className="govuk-link govuk-!-font-size-14" style={{ display: 'inline-inline-block', marginTop: '4px', fontWeight: 'bold' }}>
                                    Download speech text PDF ({v.pdfSize})
                                  </Link>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* OPTION B: ACCESSIBLE TIMELINE PATTERN LAYOUT */
                <div style={{ borderLeft: '4px solid #1d70b8', paddingLeft: '20px', marginLeft: '10px', marginBottom: '30px' }}>
                  {filteredVisits.map((v) => (
                    <div key={v.id} style={{ position: 'relative', marginBottom: '35px' }}>
                      {/* Timeline Node Visual Anchor Indicator dot */}
                      <div style={{ position: 'absolute', left: '-27px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#1d70b8', border: '4px solid #fff', boxShadow: '0 0 0 2px #1d70b8' }}></div>
                      
                      <span className="govuk-body-s govuk-!-font-weight-bold" style={{ color: '#505a5f' }}>{v.dates}</span>
                      <h3 className="govuk-heading-s govuk-!-margin-top-1 govuk-!-margin-bottom-1">
                        {v.country} ({v.city}) &mdash; <span style={{ fontWeight: 'normal', fontSize: '14px' }} className="govuk-body-s">{v.classification}</span>
                      </h3>
                      
                      <p className="govuk-body-s govuk-!-margin-bottom-2" style={{ maxWidth: '700px' }}>{v.outcome}</p>
                      
                      {v.speechSummary && (
                        <div style={{ maxWidth: '700px' }}>
                          <details className="govuk-details govuk-!-margin-bottom-1" data-module="govuk-details">
                            <summary className="govuk-details__summary"><span className="govuk-details__summary-text" style={{ fontSize: '14px' }}>Read speech outline</span></summary>
                            <div className="govuk-details__text" style={{ padding: '10px', fontSize: '14px', background: '#f8f8f8' }}><em>{v.speechFullText}</em></div>
                          </details>
                          {v.pdfUrl && (
                            <Link href={v.pdfUrl} className="govuk-link govuk-!-font-size-14" style={{ fontWeight: 'bold' }}>
                              Download full address PDF ({v.pdfSize})
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="govuk-body govuk-!-margin-top-4">
                <p>No international visits match your current criteria selection settings.</p>
              </div>
            )}

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
