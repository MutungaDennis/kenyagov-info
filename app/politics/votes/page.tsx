import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PollingStationFilters from "@/components/votes/polling-station-filters";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKFeedback from "@/components/govuk/Feedback";

interface SearchParams {
  county?: string;
  constituency?: string;
  ward?: string;
  q?: string;
  page?: string;
}

const ITEMS_PER_PAGE = 50;

export default async function PollingStationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();

  // Parse asynchronous search parameters safely
  const parsedParams = await searchParams;
  const county = parsedParams.county || "";
  const constituency = parsedParams.constituency || "";
  const ward = parsedParams.ward || "";
  const q = parsedParams.q ? parsedParams.q.trim() : "";
  
  const currentPage = Math.max(1, parseInt(parsedParams.page || "1", 10));
  const fromOffset = (currentPage - 1) * ITEMS_PER_PAGE;
  const toOffset = fromOffset + ITEMS_PER_PAGE - 1;

    // ============================================
  // FETCH LOOKUP ARRAYS FOR FILTERS
  // ============================================
  // Fetch all 47 counties to map reference codes
  const { data: counties } = await supabase
    .from("counties")
    .select("name, code")
    .order("name");

  // Fetch all 290 constituencies to allow bidirectional back-fills on the client
  const { data: constituencies } = await supabase
    .from("constituencies")
    .select("name, county_code, constituency_code")
    .order("name");

  // Fetch all 1,450 wards to handle deep nested dropdown changes safely
  const { data: allWardsList } = await supabase
    .from("wards")
    .select("name, ward_code, constituency_code")
    .order("name");

  // ============================================
  // BUILD CORE DATABASE STRINGS & AGGREGATIONS
  // ============================================
  let baseQuery = supabase
    .from("polling_stations_2022")
    .select(`
      id,
      slug,
      name,
      polling_station_code,
      reg_centre_name,
      registered_voters_2022,
      counties ( name ),
      constituencies ( name ),
      wards ( name )
    `, { count: 'exact' })
    .eq("is_active", true);

  // Apply sequential recursive lookups based on actual text names mapping down foreign elements
  if (county) {
    const activeCountyObj = counties?.find(c => c.name === county);
    if (activeCountyObj) baseQuery = baseQuery.eq("county_code", activeCountyObj.code);
  }
  
  if (constituency) {
    const activeConstObj = constituencies?.find(c => c.name === constituency);
    if (activeConstObj) baseQuery = baseQuery.eq("constituency_code", activeConstObj.constituency_code);
  }
  
  if (ward) {
    const activeWardObj = allWardsList?.find(w => w.name === ward);
    if (activeWardObj) baseQuery = baseQuery.eq("ward_code", activeWardObj.ward_code);
  }

  if (q) {
    const formattedQuery = `%${q}%`;
    baseQuery = baseQuery.or(
      `name.ilike."${formattedQuery}",reg_centre_name.ilike."${formattedQuery}",polling_station_code.ilike."${formattedQuery}"`
    );
  }

  // Execute structured range query mapping data array blocks
  const { data: stations, count, error } = await baseQuery
    .order("polling_station_code", { ascending: true })
    .range(fromOffset, toOffset);

  if (error) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
          <h1 className="govuk-heading-l">System Data Load Error</h1>
          <p className="govuk-body">Unable to map current polling station dependencies. Please filter down your structural search query metrics.</p>
          <pre style={{ background: '#f8f8f8', padding: '10px', border: '1px solid #bfc1c3' }}>{error.message}</pre>
        </main>
      </div>
    );
  }

  const totalStations = count || 0;
  const totalPages = Math.ceil(totalStations / ITEMS_PER_PAGE);
  const hasActiveFilters = !!county || !!constituency || !!ward || !!q;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (county) params.set("county", county);
    if (constituency) params.set("constituency", constituency);
    if (ward) params.set("ward", ward);
    if (q) params.set("q", q);
    params.set("page", pageNumber.toString());
    return `/politics/votes?${params.toString()}`;
  };

  const getFilterClearUrl = (removeKey: "county" | "constituency" | "ward" | "q") => {
    const params = new URLSearchParams();
    if (removeKey !== "county" && county) params.set("county", county);
    if (removeKey !== "constituency" && constituency) params.set("constituency", constituency);
    if (removeKey !== "ward" && ward) params.set("ward", ward);
    if (removeKey !== "q" && q) params.set("q", q);
    return `/politics/votes?${params.toString()}`;
  };

  const getExportUrl = () => {
    const params = new URLSearchParams();
    if (county) params.set("county", county);
    if (constituency) params.set("constituency", constituency);
    if (ward) params.set("ward", ward);
    if (q) params.set("q", q);
    return `/api/data/exports/polling-stations?${params.toString()}`;
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Politics & Elections", href: "/politics/elections" },
          { text: "2022 Polling Stations", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">2022 General Election Polling Stations</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Search and view official voting centers and individual room streams registered by the Independent Electoral and Boundaries Commission (IEBC) for the 2022 General Election.
            </p>

            {/* FILTER DROPDOWN CLIENT CONTAINER COMPONENT */}
<PollingStationFilters
  counties={counties || []}
  constituencies={constituencies || []}
  wards={allWardsList || []}
  selectedCounty={county}
  selectedConstituency={constituency}
  selectedWard={ward}
  search={q}
  totalResults={totalStations}
/>


            {/* ACTIVE FILTERS CHIP PANEL */}
            {hasActiveFilters && (
              <div className="govuk-!-margin-bottom-4" style={{ background: '#f8f8f8', padding: '12px', border: '1px solid #bfc1c3' }}>
                <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">Active search parameters:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {county && (
                    <Link href={getFilterClearUrl("county")} style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', textDecoration: 'none', color: '#1d70b8', display: 'inline-flex', alignItems: 'center' }}>
                      County: {county} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </Link>
                  )}
                  {constituency && (
                    <Link href={getFilterClearUrl("constituency")} style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', textDecoration: 'none', color: '#1d70b8', display: 'inline-flex', alignItems: 'center' }}>
                      Constituency: {constituency} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </Link>
                  )}
                  {ward && (
                    <Link href={getFilterClearUrl("ward")} style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', textDecoration: 'none', color: '#1d70b8', display: 'inline-flex', alignItems: 'center' }}>
                      Ward: {ward} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </Link>
                  )}
                  {q && (
                    <Link href={getFilterClearUrl("q")} style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', fontSize: '14px', textDecoration: 'none', color: '#1d70b8', display: 'inline-flex', alignItems: 'center' }}>
                      Keyword: &ldquo;{q}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </Link>
                  )}
                  <Link href="/politics/votes" className="govuk-link govuk-!-font-size-16" style={{ paddingLeft: '4px' }}>
                    Reset all configurations
                  </Link>
                </div>
              </div>
            )}

            {/* OPEN ACCESS TRANSPARENCY EXPORT COMPONENT */}
            <div className="govuk-!-margin-bottom-4" style={{ background: '#f3f2f1', padding: '12px 15px', border: '1px solid #bfc1c3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span className="govuk-body-s govuk-!-margin-0">
                Machine-readable open access tabular datasets mapping downstream voters to national registry disclosure baselines.
              </span>
              <a 
                href={getExportUrl()} 
                className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-bold" 
                style={{ textDecoration: 'underline' }}
              >
                Download filtered stations as CSV file spreadsheet
              </a>
            </div>

            {/* METADATA RESULT HOOK COUNTER */}
            <h2 className="govuk-heading-s govuk-!-margin-bottom-3" aria-live="polite">
              Showing {totalStations > 0 ? fromOffset + 1 : 0} to {Math.min(toOffset + ITEMS_PER_PAGE, totalStations)} of {totalStations.toLocaleString()} active polling streams
            </h2>

            {totalStations > 0 ? (
              <>
                {/* Responsive Mobile Layout Container Wrapper */}
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                  <table className="govuk-table" style={{ minWidth: '850px' }}>
                    <caption className="govuk-table__caption govuk-visually-hidden">
                      Electoral polling streams showing code parameters, structural facilities, and total voter registration volumes.
                    </caption>
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ width: '50px' }}>No.</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ width: '140px' }}>IEBC Code</th>
                        <th scope="col" className="govuk-table__header govuk-body-s">Polling Station Stream Name</th>
                        <th scope="col" className="govuk-table__header govuk-body-s">Ward</th>
                        <th scope="col" className="govuk-table__header govuk-body-s">Constituency</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ width: '160px' }}>Registered Voters</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      {stations?.map((station, index) => {
                        // Safely parse joined text mappings from foreign relationships
                        const constName = (station.constituencies as any)?.name || "—";
                        const wName = (station.wards as any)?.name || "—";

                        return (
                          <tr key={station.id} className="govuk-table__row">
                            <td className="govuk-table__cell govuk-body-s">
                              {fromOffset + index + 1}
                            </td>
                            <td className="govuk-table__cell govuk-body-s govuk-!-font-weight-bold" style={{ color: '#505a5f' }}>
                              <code>{station.polling_station_code}</code>
                            </td>
                            <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                              <Link href={`/politics/votes/${station.slug}`} className="govuk-link govuk-!-font-weight-bold">
                                {station.name}
                              </Link>
                            </th>
                            <td className="govuk-table__cell govuk-body-s">{wName}</td>
                            <td className="govuk-table__cell govuk-body-s">{constName}</td>
                            <td className="govuk-table__cell govuk-body-s">
                              {station.registered_voters_2022 ? station.registered_voters_2022.toLocaleString() : 0}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* GOV.UK DESIGN SYSTEM COMPLIANT PAGINATION ELEMENT */}
                {totalPages > 1 && (
                  <nav className="govuk-pagination" role="navigation" aria-label="Pagination Navigation Menu">
                    {currentPage > 1 && (
                      <div className="govuk-pagination__prev">
                        <Link className="govuk-link govuk-pagination__link" href={createPageUrl(currentPage - 1)} rel="prev">
                          <svg className="govuk-pagination__icon govuk-pagination__icon--prev" xmlns="http://w3.org" height="13" width="15" viewBox="0 0 17 13">
                            <path d="m3.3 7 4.1 4.1-1.4 1.4L0 6.5 6 0l1.4 1.4L3.3 5.5H17v2H3.3z"></path>
                          </svg>
                          <span className="govuk-pagination__link-title">Previous</span>
                        </Link>
                      </div>
                    )}
                    
                    <ul className="govuk-pagination__list">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .map((p, idx, arr) => {
                          const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                          return (
                            <div key={p} style={{ display: 'contents' }}>
                              {showEllipsis && (
                                <li className="govuk-pagination__item govuk-pagination__item--ellipsis" style={{ display: 'inline-block', padding: '0 8px', color: '#1d70b8' }}>
                                  ...
                                </li>
                              )}
                              <li className={`govuk-pagination__item ${p === currentPage ? 'govuk-pagination__item--current' : ''}`}>
                                <Link 
                                  className="govuk-link govuk-pagination__link" 
                                  href={createPageUrl(p)} 
                                  aria-label={`Page ${p}`} 
                                  aria-current={p === currentPage ? 'page' : undefined}
                                >
                                  {p}
                                </Link>
                              </li>
                            </div>
                          );
                        })}
                    </ul>

                    {currentPage < totalPages && (
                      <div className="govuk-pagination__next">
                        <Link className="govuk-link govuk-pagination__link" href={createPageUrl(currentPage + 1)} rel="next">
                          <span className="govuk-pagination__link-title">Next</span>
                          <svg className="govuk-pagination__icon govuk-pagination__icon--next" xmlns="http://w3.org" height="13" width="15" viewBox="0 0 17 13">
                            <path d="m13.7 5.5-4.1-4.1 1.4-1.4L17 6.5 11 13l-1.4-1.4 4.1-4.1H0v-2h13.7z"></path>
                          </svg>
                        </Link>
                      </div>
                    )}
                  </nav>
                )}
              </>
            ) : (
              <div style={{ marginTop: 25 }} className="govuk-body">
                <p>No official polling station records match your current organizational filter choices.</p>
                <Link href="/politics/votes" className="govuk-link govuk-!-font-weight-bold">
                  Reset configurations and view all records
                </Link>
              </div>
            )}

            <GovUKFeedback />
          </div>
        </div>
      </main>
    </div>
  );
}
