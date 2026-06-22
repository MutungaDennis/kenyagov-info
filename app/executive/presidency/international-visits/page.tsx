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
type SpeechItem = {
  _key: string;
  title: string;
  deliveryDate?: string;
  forum?: string;
  speechText?: string;
  pdfUrl?: string;
  pdfSizeBytes?: number;
};

type OutcomeAgreement = {
  _key: string;
  title?: string;
  details?: string;
};

// Main VisitRecord configuration supporting comprehensive dynamic data streams
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
  speeches?: SpeechItem[];
};

// GROQ query drawing trip properties while targeting uploaded speech transcripts and sizes
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
  "speeches": speeches[] {
    _key,
    title,
    deliveryDate,
    forum,
    speechText,
    "pdfUrl": speechDocument.asset->url,
    "pdfSizeBytes": speechDocument.asset->size
  }
}`;
export default function InternationalVisitsPage() {
  const [visitsData, setVisitsData] = useState<VisitRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(""); // Stores selected country filter
  const [layoutMode, setLayoutMode] = useState<'table' | 'timeline'>('table');

  // Trigger data load from Sanity on component initialization
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

  // Formatting utility converting raw date stamps into a highly compact, stacked GOV.UK layout block
  function renderStackedDates(departure: string, returning?: string) {
    if (!departure) return <span className="govuk-body-s" style={{ color: '#505a5f' }}>Date unrecorded</span>;
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    const depDate = new Date(departure).toLocaleDateString('en-GB', options);
    const retDate = returning ? new Date(returning).toLocaleDateString('en-GB', options) : null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '16px', lineHeight: '1.25' }}>
        <div><span style={{ color: '#505a5f', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', display: 'inline-block', width: '42px' }}>From:</span> {depDate}</div>
        <div><span style={{ color: '#505a5f', fontWeight: 'bold', fontSize: '13px', textTransform: 'uppercase', display: 'inline-block', width: '42px' }}>To:</span> {retDate || depDate}</div>
      </div>
    );
  }

  // Formatting utility for clean display names in the timeline view
  function formatTripDates(departure: string, returning?: string): string {
    if (!departure) return "Date unrecorded";
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const depDate = new Date(departure).toLocaleDateString('en-GB', options);
    if (!returning) return depDate;
    const retDate = new Date(returning).toLocaleDateString('en-GB', options);
    return `${depDate} to ${retDate}`;
  }

  // Normalization logic transforming internal schema keys to human-readable labels
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
  // Automatically calculate the dynamic list of destination countries for the dropdown filter
  const uniqueCountries = useMemo(() => {
    const countries = visitsData
      .map(v => v.country)
      .filter((c): c is string => !!c);
    return Array.from(new Set(countries)).sort();
  }, [visitsData]);

  // Compute filtered datasets concurrently using performant React hooks
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
        countryStr.toLowerCase() === selectedRegion.toLowerCase();

      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, selectedRegion, visitsData]);

  const hasActiveFilters = searchTerm !== "" || selectedRegion !== "";

  return (
    <div className="govuk-width-container" style={{ fontFamily: '"GDS Transport", arial, sans-serif' }}>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "The Executive", href: "/executive" },
          { text: "The Presidency", href: "/executive/presidency" },
          { text: "International Visits", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-4" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h2 className="govuk-heading-m govuk-!-margin-bottom-2">
  Register of Presidential International Visits
</h2>
<p className="govuk-body-s govuk-!-margin-bottom-4">
  Official statutory record of foreign visits, bilateral agreements, summits attended, and global dispatches filed by the Executive.
</p>


            {/* Mobile Responsive Layout Toggle & Filters Row */}
            <div className="govuk-grid-row govuk-!-margin-bottom-4" style={{ borderBottom: '1px solid #bfc1c3', paddingBottom: '15px' }}>
              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold govuk-!-font-size-19" htmlFor="search-visit">Search keywords</label>
                  <input
                    className="govuk-input"
                    id="search-visit"
                    type="search"
                    style={{ height: '40px', borderWidth: '2px' }}
                    placeholder="e.g. MoUs, trade, security..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold govuk-!-font-size-19" htmlFor="region-select">Filter by Country</label>
                  <select
                    className="govuk-select govuk-!-width-full"
                    id="region-select"
                    style={{ height: '40px', borderWidth: '2px', padding: '6px' }}
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">All Countries ({uniqueCountries.length})</option>
                    {uniqueCountries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="govuk-grid-column-one-third govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <span className="govuk-label govuk-!-font-weight-bold govuk-!-font-size-19">View Layout</span>
                  <div style={{ display: 'inline-flex', width: '100%', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setLayoutMode('table')}
                      className={`govuk-button ${layoutMode === 'table' ? '' : 'govuk-button--secondary'}`}
                      style={{ 
                        flex: 1, 
                        margin: 0, 
                        borderRight: 'none', 
                        borderRadius: '0', 
                        height: '40px', 
                        boxShadow: 'none',
                        fontWeight: layoutMode === 'table' ? 700 : 400
                      }}
                      disabled={isLoading}
                    >
                      Table View
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutMode('timeline')}
                      className={`govuk-button ${layoutMode === 'timeline' ? '' : 'govuk-button--secondary'}`}
                      style={{ 
                        flex: 1, 
                        margin: 0, 
                        borderRadius: '0', 
                        height: '40px', 
                        boxShadow: 'none',
                        fontWeight: layoutMode === 'timeline' ? 700 : 400
                      }}
                      disabled={isLoading}
                    >
                      Timeline View
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Clear Filter Tags Row */}
            {hasActiveFilters && (
              <div className="govuk-!-margin-bottom-6" style={{ background: '#f8f8f8', padding: '15px', border: '2px solid #bfc1c3' }}>
                <p className="govuk-heading-s govuk-!-margin-bottom-2" style={{ fontSize: '16px' }}>Active filter criteria:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                  {searchTerm && (
                    <button type="button" onClick={() => setSearchTerm("")} style={{ background: '#fff', border: '1px solid #1d70b8', padding: '6px 12px', cursor: 'pointer', fontSize: '16px', display: 'inline-flex', alignItems: 'center', fontWeight: 'bold' }}>
                      Keywords: &ldquo;{searchTerm}&rdquo; <span style={{ marginLeft: '10px', color: '#d4351c', fontWeight: 'bold', fontSize: '18px' }}>&times;</span>
                    </button>
                  )}
                  {selectedRegion && (
                    <button type="button" onClick={() => setSelectedRegion("")} style={{ background: '#fff', border: '1px solid #1d70b8', padding: '6px 12px', cursor: 'pointer', fontSize: '16px', display: 'inline-flex', alignItems: 'center', fontWeight: 'bold' }}>
                      Country: {selectedRegion} <span style={{ marginLeft: '10px', color: '#d4351c', fontWeight: 'bold', fontSize: '18px' }}>&times;</span>
                    </button>
                  )}
                  <button type="button" onClick={() => { setSearchTerm(""); setSelectedRegion(""); }} className="govuk-link govuk-!-font-size-19" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', color: '#1d70b8', padding: 0 }}>
                    Clear all filters
                  </button>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="govuk-body-l govuk-!-padding-top-4 govuk-!-padding-bottom-4" style={{ color: '#505a5f' }}>
                Loading official deployment register...
              </div>
            )}
            {!isLoading && (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-4" style={{ fontWeight: 700, fontSize: '24px' }} aria-live="polite">
                  Showing {filteredVisits.length} recorded diplomatic engagements
                </h2>
                
                {filteredVisits.length > 0 ? (
                  layoutMode === 'table' ? (
                    /* OPTION A: STANDARD GOV.UK COMPLIANT DATA TABLE WINDOW */
                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '35px', border: '1px solid #bfc1c3' }}>
                      <table className="govuk-table" style={{ minWidth: '950px', marginBottom: 0 }}>
                        <caption className="govuk-table__caption govuk-visually-hidden">Log of international presidential visits.</caption>
                        <thead className="govuk-table__head" style={{ background: '#f8f8f8' }}>
                          <tr className="govuk-table__row">
                            <th scope="col" className="govuk-table__header govuk-body-m" style={{ fontWeight: 'bold', width: '200px', padding: '12px 8px', borderBottom: '3px solid #1d70b8' }}>Destination</th>
                            <th scope="col" className="govuk-table__header govuk-body-m" style={{ fontWeight: 'bold', width: '180px', padding: '12px 8px', borderBottom: '3px solid #1d70b8' }}>Dates</th>
                            <th scope="col" className="govuk-table__header govuk-body-m" style={{ fontWeight: 'bold', width: '160px', padding: '12px 8px', borderBottom: '3px solid #1d70b8' }}>Classification</th>
                            <th scope="col" className="govuk-table__header govuk-body-m" style={{ fontWeight: 'bold', padding: '12px 8px', borderBottom: '3px solid #1d70b8' }}>Primary Diplomatic Outcomes & Agreements</th>
                          </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                          {filteredVisits.map((v) => (
                            <tr key={v.id} className="govuk-table__row" style={{ borderBottom: '1px solid #bfc1c3' }}>
                              <th scope="row" className="govuk-table__header govuk-body-m" style={{ fontWeight: 'normal', padding: '15px 8px' }}>
                                <span className="govuk-!-font-weight-bold" style={{ display: 'block', fontSize: '19px', color: '#0b0c0c' }}>{v.country}</span>
                                {v.cities && v.cities.length > 0 && (
                                  <span style={{ fontSize: '16px', color: '#505a5f', display: 'block', marginTop: '2px' }}>{v.cities.join(", ")}</span>
                                )}
                              </th>
                              <td className="govuk-table__cell govuk-body-m" style={{ padding: '15px 8px', verticalAlign: 'top' }}>
                                {renderStackedDates(v.departureDate, v.returnDate)}
                              </td>
                              <td className="govuk-table__cell govuk-body-m" style={{ padding: '15px 8px', verticalAlign: 'top' }}>
                                <strong className={`govuk-tag ${
                                  v.tripType === 'state-visit' ? 'govuk-tag--blue' : 
                                  v.tripType === 'summit' ? 'govuk-tag--purple' : 'govuk-tag--grey'
                                }`} style={{ fontSize: '14px', letterSpacing: '0.5px', padding: '4px 8px' }}>
                                  {formatClassification(v.tripType)}
                                </strong>
                              </td>
                              <td className="govuk-table__cell govuk-body-m" style={{ padding: '15px 8px', verticalAlign: 'top' }}>
                                <p className="govuk-body-m govuk-!-font-weight-bold govuk-!-margin-bottom-2" style={{ fontSize: '19px', color: '#1d70b8' }}>{v.title}</p>
                                
                                {v.financialValue && (
                                  <p className="govuk-body-m govuk-!-margin-bottom-3" style={{ color: '#00703c', background: '#eef7f2', padding: '6px 12px', borderLeft: '4px solid #00703c', display: 'inline-block' }}>
                                    <strong>Financial Funding Secured:</strong> {v.financialValue}
                                  </p>
                                )}

                                {v.outcomesList && v.outcomesList.length > 0 ? (
                                  <div className="govuk-!-margin-top-3 govuk-!-margin-bottom-3">
                                    <span className="govuk-!-font-weight-bold" style={{ fontSize: '16px', color: '#0b0c0c', display: 'block' }}>MoUs & Key Bilateral Treaties:</span>
                                    <ul className="govuk-list govuk-list--bullet govuk-!-margin-top-1" style={{ paddingLeft: '20px', marginBottom: 0 }}>
                                      {v.outcomesList.map((item) => (
                                        <li key={item._key} style={{ fontSize: '16px', marginBottom: '6px', lineHeight: '1.4' }}>
                                          <strong>{item.title}</strong>{item.details ? ` — ${item.details}` : ''}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <p className="govuk-body-s" style={{ color: '#505a5f', fontStyle: 'italic', fontSize: '16px', margin: '10px 0' }}>No formal MoUs tracked for this record path.</p>
                                )}

                                {/* DYNAMIC SPEECH MULTI-LIST EXTENSION ARRAY LOOP */}
                                {v.speeches && v.speeches.length > 0 && (
                                  <div className="govuk-!-margin-top-3" style={{ borderTop: '1px solid #bfc1c3', paddingTop: '12px' }}>
                                    <span className="govuk-!-font-weight-bold" style={{ fontSize: '16px', display: 'block', marginBottom: '8px', color: '#1d70b8' }}>
                                      Official Statements & Addresses Delivered:
                                    </span>
                                    
                                    {v.speeches.map((speech) => (
                                      <div key={speech._key} style={{ marginBottom: '12px', background: '#f8f8f8', padding: '12px', borderLeft: '4px solid #1d70b8' }}>
                                        <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-1" style={{ fontSize: '16px', lineHeight: '1.3', color: '#0b0c0c' }}>
                                          {speech.title}
                                        </p>
                                        
                                        {speech.forum && (
                                          <p className="govuk-body-s govuk-!-margin-bottom-2" style={{ color: '#505a5f', fontSize: '14px', marginTop: '2px' }}>
                                            <strong>Forum/Panel:</strong> {speech.forum}
                                          </p>
                                        )}

                                        {speech.speechText && (
                                          <details className="govuk-details govuk-!-margin-bottom-2" style={{ marginTop: '5px', marginBottom: '5px' }}>
                                            <summary className="govuk-details__summary">
                                              <span className="govuk-details__summary-text" style={{ fontSize: '14px' }}>Read speech summary snippet</span>
                                            </summary>
                                            <div className="govuk-details__text" style={{ fontSize: '15px', background: '#fff', padding: '10px', border: '1px solid #bfc1c3', borderLeft: 'none' }}>
                                              {speech.speechText}
                                            </div>
                                          </details>
                                        )}

                                        {speech.pdfUrl && (
                                          <Link href={speech.pdfUrl} target="_blank" rel="noreferrer" className="govuk-link" style={{ fontWeight: 'bold', display: 'inline-block', marginTop: '4px', fontSize: '15px', color: '#1d70b8' }}>
                                            Download Transcript ({formatDocumentMeta(speech.pdfSizeBytes)})
                                          </Link>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="govuk-!-margin-top-3">
                                  {v.pdfUrl ? (
                                    <Link href={v.pdfUrl} target="_blank" rel="noreferrer" className="govuk-link govuk-!-font-weight-bold" style={{ fontSize: '16px', display: 'inline-block', color: '#1d70b8' }}>
                                      Download Joint Communiqué / Report ({formatDocumentMeta(v.pdfSizeBytes)})
                                    </Link>
                                  ) : v.webLink ? (
                                    <Link href={v.webLink} target="_blank" rel="noreferrer" className="govuk-link" style={{ fontSize: '16px', color: '#1d70b8' }}>
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
                    /* OPTION B: ACCESSIBLE GOV.UK STEP-BY-STEP COMPLIANT TIMELINE PATTERN */
                    <div style={{ borderLeft: '4px solid #1d70b8', paddingLeft: '25px', marginLeft: '15px', marginTop: '20px', marginBottom: '40px' }}>
                      {filteredVisits.map((v) => (
                        <div key={v.id} style={{ position: 'relative', marginBottom: '45px' }}>
                          
                          {/* Timeline Node Visual Anchor Indicator dot matching GOV.UK branding */}
                          <div style={{ 
                            position: 'absolute', 
                            left: '-33px', 
                            top: '2px', 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%', 
                            background: '#1d70b8', 
                            border: '4px solid #fff', 
                            boxShadow: '0 0 0 3px #1d70b8' 
                          }}></div>
                          
                          <span className="govuk-body-s govuk-!-font-weight-bold" style={{ color: '#505a5f', fontSize: '16px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {formatTripDates(v.departureDate, v.returnDate)}
                          </span>
                          
                          <h3 className="govuk-heading-m govuk-!-margin-top-1 govuk-!-margin-bottom-2" style={{ fontWeight: 700, fontSize: '22px', color: '#0b0c0c' }}>
                            {v.country} {v.cities && v.cities.length > 0 ? `(${v.cities.join(", ")})` : ''} 
                            <span style={{ fontWeight: 'normal', fontSize: '16px', marginLeft: '12px', display: 'inline-block' }}>
                              <strong className="govuk-tag govuk-tag--grey" style={{ fontSize: '12px', padding: '2px 6px' }}>
                                {formatClassification(v.tripType)}
                              </strong>
                            </span>
                          </h3>
                          
                          <p className="govuk-heading-s govuk-!-margin-bottom-2" style={{ maxWidth: '800px', fontWeight: 700, fontSize: '19px', color: '#1d70b8' }}>
                            {v.title}
                          </p>

                          {v.financialValue && (
                            <p className="govuk-body-m govuk-!-margin-bottom-2" style={{ color: '#00703c', fontSize: '16px', background: '#eef7f2', padding: '4px 8px', display: 'inline-block' }}>
                              <strong>Funding Secured:</strong> {v.financialValue}
                            </p>
                          )}
                          
                          {v.outcomesList && v.outcomesList.length > 0 && (
                            <div className="govuk-!-margin-bottom-3" style={{ maxWidth: '800px' }}>
                              <ul className="govuk-list govuk-list--bullet" style={{ paddingLeft: '20px', margin: '5px 0' }}>
                                {v.outcomesList.map((item) => (
                                  <li key={item._key} style={{ fontSize: '16px', marginBottom: '4px', lineHeight: '1.4' }}>
                                    <strong>{item.title}</strong>: {item.details}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* TIMELINE SPEECHES ITERATOR */}
                          {v.speeches && v.speeches.length > 0 && (
                            <div style={{ maxWidth: '800px', background: '#f8f8f8', padding: '12px', borderLeft: '4px solid #bfc1c3', marginBottom: '15px' }}>
                              <span className="govuk-!-font-weight-bold" style={{ fontSize: '15px', display: 'block', marginBottom: '6px' }}>Delivered Addresses:</span>
                              {v.speeches.map((speech) => (
                                <div key={speech._key} style={{ marginBottom: '8px', fontSize: '15px' }}>
                                  • <strong>{speech.title}</strong> {speech.forum ? `(${speech.forum})` : ''}
                                  {speech.pdfUrl && (
                                    <div style={{ paddingLeft: '12px', marginTop: '2px' }}>
                                      <Link href={speech.pdfUrl} target="_blank" rel="noreferrer" className="govuk-link" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                                        Download Speech text ({formatDocumentMeta(speech.pdfSizeBytes)})
                                      </Link>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {v.pdfUrl && (
                            <div style={{ marginTop: '12px' }}>
                              <Link href={v.pdfUrl} target="_blank" rel="noreferrer" className="govuk-link govuk-!-font-size-16" style={{ fontWeight: 'bold', color: '#1d70b8' }}>
                                Download full visit report ({formatDocumentMeta(v.pdfSizeBytes)})
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="govuk-body-m govuk-!-margin-top-4" style={{ background: '#f8f8f8', padding: '20px', border: '1px solid #bfc1c3' }}>
                    <p style={{ margin: 0, color: '#505a5f' }}>No international presidential visits match your current criteria selection settings.</p>
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
