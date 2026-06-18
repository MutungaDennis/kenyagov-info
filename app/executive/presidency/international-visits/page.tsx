'use client';

import { useState, useEffect, useMemo } from "react";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import Link from "next/link";
import { createClient } from "next-sanity";

// Configure local Client pointing directly to your Sanity Studio Dataset
const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2026-06-19",
  useCdn: true,
});

// Explicit TS Interfaces mapped exactly against our presidentialTrip schema types
type OutcomeAgreement = {
  _key: string;
  title?: string;
  details?: string;
};

type VisitRecord = {
  id: string;
  title: string;
  country: string;
  cities: string[];
  tripType: string;
  departureDate: string;
  returnDate?: string;
  purposeBlock?: any[];
  focusSectors?: string[];
  outcomesList?: OutcomeAgreement[];
  financialValue?: string;
  webLink?: string;
  pdfUrl?: string;
  pdfSizeBytes?: number;
};

// GROQ queries pulling core constraints while capturing uploaded media metadata assets
const VISITS_QUERY = `*[_type == "presidentialTrip"] | order(departureDate desc) {
  "id": _id,
  title,
  "country": destinationCountry,
  "cities": destinationCities,
  tripType,
  departureDate,
  returnDate,
  "purposeBlock": purpose,
  focusSectors,
  "outcomesList": outcomes,
  "financialValue": financialCommitments,
  "webLink": officialLink,
  "pdfUrl": tripDocument.asset->url,
  "pdfSizeBytes": tripDocument.asset->size
}`;
export default function InternationalVisitsPage() {
  const [visitsData, setVisitsData] = useState<VisitRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(""); // Captures Destination Country searches
  const [layoutMode, setLayoutMode] = useState<'table' | 'timeline'>('table');

  // Trigger reactive fetch pipelines immediately upon DOM baseline construction
  useEffect(() => {
    async function fetchTrips() {
      try {
        const rawData = await sanityClient.fetch(VISITS_QUERY);
        setVisitsData(rawData || []);
      } catch (error) {
        console.error("Failed to safely extract Sanity registry assets:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTrips();
  }, []);

  // Safe utility checking file sizes dynamically for GOV.UK style conventions
  function formatDocumentMeta(bytes?: number): string {
    if (!bytes || isNaN(bytes)) return "PDF, size unknown";
    if (bytes < 1048576) {
      return `PDF, ${(bytes / 1024).toFixed(0)}KB`;
    }
    return `PDF, ${(bytes / 1048576).toFixed(1)}MB`;
  }

  // Formatting utility converting raw date stamps into accessible presentation blocks
  function formatTripDates(departure: string, returning?: string): string {
    if (!departure) return "Date unrecorded";
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const depDate = new Date(departure).toLocaleDateString('en-GB', options);
    if (!returning) return depDate;
    const retDate = new Date(returning).toLocaleDateString('en-GB', options);
    return `${depDate} to ${retDate}`;
  }

  // Normalization logic transforming internal schema keys to human readable labels
  function formatClassification(typeString: string): string {
    const maps: Record<string, string> = {
      'state-visit': 'State Visit',
      'official-visit': 'Official Visit',
      'working-visit': 'Working Visit',
      'summit': 'Summit',
      'regional-mission': 'Regional Mission'
    };
    return maps[typeString] || typeString || 'Official Engagement';
  }

  // Computing operational dataset parameters concurrently via useMemo Hooks
  const filteredVisits = useMemo(() => {
    return visitsData.filter((v) => {
      const countryStr = v.country || "";
      const citiesStr = (v.cities || []).join(", ");
      const titleStr = v.title || "";
      
      const matchesSearch = 
        countryStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        citiesStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        titleStr.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegion = !selectedRegion || 
        countryStr.toLowerCase().includes(selectedRegion.toLowerCase());

      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, selectedRegion, visitsData]);

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
              Official record of foreign visits, bilateral outcomes, summits attended, and statutory briefs filed by the Presidency.
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
                    placeholder="Keywords or outcomes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="region-select">Filter by Country</label>
                  <input
                    className="govuk-input"
                    id="region-select"
                    type="text"
                    placeholder="e.g. United States, Germany"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Layout Switch Button Component */}
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <span className="govuk-label govuk-!-font-weight-bold">View Layout</span>
                  <div style={{ display: 'inline-flex', width: '100%', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setLayoutMode('table')}
                      className={`govuk-button ${layoutMode === 'table' ? '' : 'govuk-button--secondary'}`}
                      style={{ flex: 1, margin: 0, borderRight: 'none', borderRadius: '0' }}
                      disabled={isLoading}
                    >
                      Table View
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutMode('timeline')}
                      className={`govuk-button ${layoutMode === 'timeline' ? '' : 'govuk-button--secondary'}`}
                      style={{ flex: 1, margin: 0, borderRadius: '0' }}
                      disabled={isLoading}
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
                      Destination Country: &ldquo;{selectedRegion}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </button>
                  )}
                  <button type="button" onClick={() => { setSearchTerm(""); setSelectedRegion(""); }} className="govuk-link govuk-!-font-size-16" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="govuk-body govuk-!-padding-top-4 govuk-!-padding-bottom-4">
                Loading official deployment register...
              </div>
            )}

            {!isLoading && (
              <>
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
                            <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '180px' }}>Destination</th>
                            <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '140px' }}>Dates</th>
                            <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold', width: '130px' }}>Classification</th>
                            <th scope="col" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'bold' }}>Primary Diplomatic Outcomes & Agreements</th>
                          </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                          {filteredVisits.map((v) => (
                            <tr key={v.id} className="govuk-table__row">
                              <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                                <span className="govuk-!-font-weight-bold" style={{ display: 'block', fontSize: '16px' }}>{v.country}</span>
                                {v.cities && v.cities.length > 0 && (
                                  <span style={{ fontSize: '14px', color: '#505a5f' }}>{v.cities.join(", ")}</span>
                                )}
                              </th>
                              <td className="govuk-table__cell govuk-body-s" style={{ whiteSpace: 'nowrap' }}>
                                {formatTripDates(v.departureDate, v.returnDate)}
                              </td>
                              <td className="govuk-table__cell govuk-body-s">
                                <strong className={`govuk-tag ${v.tripType === 'state-visit' ? 'govuk-tag--blue' : v.tripType === 'summit' ? 'govuk-tag--purple' : 'govuk-tag--grey'}`}>
                                  {formatClassification(v.tripType)}
                                </strong>
                              </td>
                              <td className="govuk-table__cell govuk-body-s">
                                <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1">{v.title}</p>
                                
                                {v.financialValue && (
                                  <p className="govuk-body-s govuk-!-margin-bottom-2" style={{ color: '#00703c' }}>
                                    <strong>Financial Funding Secured:</strong> {v.financialValue}
                                  </p>
                                )}

                                {v.outcomesList && v.outcomesList.length > 0 ? (
                                  <div className="govuk-!-margin-top-2 govuk-!-margin-bottom-2">
                                    <span className="govuk-!-font-weight-bold style={{ fontSize: '13px' }}">MoUs & Key Bilateral Treaties:</span>
                                    <ul className="govuk-list govuk-list--bullet govuk-!-margin-top-1" style={{ paddingLeft: '15px' }}>
                                      {v.outcomesList.map((item) => (
                                        <li key={item._key} style={{ fontSize: '14px', marginBottom: '4px' }}>
                                          <strong>{item.title}</strong>{item.details ? ` - ${item.details}` : ''}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <p className="govuk-body-s" style={{ color: '#505a5f', fontStyle: 'italic' }}>No formal MoUs tracked for this record path.</p>
                                )}

                                <div className="govuk-!-margin-top-3">
                                  {v.pdfUrl ? (
                                    <Link href={v.pdfUrl} target="_blank" rel="noreferrer" className="govuk-link govuk-!-font-size-14" style={{ display: 'inline-block', fontWeight: 'bold' }}>
                                      Download Joint Communiqué / Report ({formatDocumentMeta(v.pdfSizeBytes)})
                                    </Link>
                                  ) : v.webLink ? (
                                    <Link href={v.webLink} target="_blank" rel="noreferrer" className="govuk-link govuk-!-font-size-14">
                                      View Official State House Brief (External Link)
                                    </Link>
                                  ) : null}
                                </div>
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
                          <div style={{ position: 'absolute', left: '-27px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: '#1d70b8', border: '4px solid #fff', boxShadow: '0 0 0 2px #1d70b8' }}></div>
                          
                          <span className="govuk-body-s govuk-!-font-weight-bold" style={{ color: '#505a5f' }}>
                            {formatTripDates(v.departureDate, v.returnDate)}
                          </span>
                          <h3 className="govuk-heading-s govuk-!-margin-top-1 govuk-!-margin-bottom-1">
                            {v.country} {v.cities && v.cities.length > 0 ? `(${v.cities.join(", ")})` : ''} &mdash; <span style={{ fontWeight: 'normal', fontSize: '14px' }} className="govuk-body-s">{formatClassification(v.tripType)}</span>
                          </h3>
                          
                          <p className="govuk-body-s govuk-!-margin-bottom-2" style={{ maxWidth: '700px', fontWeight: 'bold' }}>{v.title}</p>
                          
                          {v.outcomesList && v.outcomesList.length > 0 && (
                            <ul className="govuk-list govuk-list--bullet" style={{ maxWidth: '700px', paddingLeft: '15px' }}>
                              {v.outcomesList.map((item) => (
                                <li key={item._key} style={{ fontSize: '14px' }}>
                                  <strong>{item.title}</strong>: {item.details}
                                </li>
                              ))}
                            </ul>
                          )}

                          {v.pdfUrl && (
                            <div style={{ marginTop: '8px' }}>
                              <Link href={v.pdfUrl} target="_blank" rel="noreferrer" className="govuk-link govuk-!-font-size-14" style={{ fontWeight: 'bold' }}>
                                Download full visit report ({formatDocumentMeta(v.pdfSizeBytes)})
                              </Link>
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
