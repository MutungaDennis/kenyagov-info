// app/elections/polling-stations/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKPagination from "@/components/govuk/Pagination";
import LastUpdated from "@/components/govuk/LastUpdated";
import PollingStationFilters from "@/components/votes/polling-station-filters";

// ============================================
// ELECTION YEARS CONFIGURATION
// ============================================
// Sorted with newest first — this becomes the default selection.
// Add new election years here as data becomes available.
// ============================================

interface ElectionYear {
  year: number;
  table: string;
  votersColumn: string;
  label: string;
  description: string;
}

const AVAILABLE_ELECTIONS: ElectionYear[] = [
  {
    year: 2022,
    table: 'polling_stations_2022',
    votersColumn: 'registered_voters_2022',
    label: '2022 General Election',
    description: 'Data from the 9 August 2022 General Election',
  },
];

const DEFAULT_ELECTION = AVAILABLE_ELECTIONS[0];
const ITEMS_PER_PAGE = 50;

interface SearchParams {
  year?: string;
  county?: string;
  constituency?: string;
  ward?: string;
  q?: string;
  page?: string;
}

export default async function PollingStationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const requestedYear = params.year ? parseInt(params.year, 10) : null;
  const selectedElection = AVAILABLE_ELECTIONS.find(e => e.year === requestedYear) 
    || DEFAULT_ELECTION;

  const county = params.county || "";
  const constituency = params.constituency || "";
  const ward = params.ward || "";
  const q = params.q ? params.q.trim() : "";
  
  const currentPage = Math.max(1, parseInt(params.page || "1", 10));
  const fromOffset = (currentPage - 1) * ITEMS_PER_PAGE;
  const toOffset = fromOffset + ITEMS_PER_PAGE - 1;

  // Fetch lookup data for filters
  const { data: counties } = await supabase
    .from("counties")
    .select("name, code")
    .order("name");

  const { data: constituencies } = await supabase
    .from("constituencies")
    .select("name, county_code, constituency_code")
    .order("name");

  const { data: allWardsList } = await supabase
    .from("wards")
    .select("name, ward_code, constituency_code")
    .order("name");

  // Build the main query
  let baseQuery = supabase
    .from(selectedElection.table)
    .select(`
      id,
      slug,
      name,
      polling_station_code,
      reg_centre_name,
      stream_number,
      ${selectedElection.votersColumn},
      counties ( name ),
      constituencies ( name ),
      wards ( name )
    `, { count: 'exact' })
    .eq("is_active", true);

  // Apply filters
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

  const { data: stations, count, error } = await baseQuery
    .order("polling_station_code", { ascending: true })
    .range(fromOffset, toOffset);

  if (error) {
    return (
  <>
      
        <GovUKBreadcrumbs
          items={[
            { text: "Home", href: "/" },
            { text: "Elections", href: "/elections" },
            { text: "Polling stations", href: "/elections/polling-stations" },
          ]}
        />
        
          <div className="govuk-error-summary" role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <p className="govuk-body">We could not load the polling station data. Please try again later.</p>
            </div>
          </div>
        
      
    
  </>
);
  }

  const totalStations = count || 0;
  const totalPages = Math.ceil(totalStations / ITEMS_PER_PAGE);
  const hasActiveFilters = !!county || !!constituency || !!ward || !!q;

  // Build query string for filter links
  const buildQueryString = (overrides: Record<string, string> = {}) => {
    const currentParams: Record<string, string> = {};
    
    if (selectedElection.year !== DEFAULT_ELECTION.year) {
      currentParams.year = selectedElection.year.toString();
    }
    if (county) currentParams.county = county;
    if (constituency) currentParams.constituency = constituency;
    if (ward) currentParams.ward = ward;
    if (q) currentParams.q = q;
    
    Object.entries(overrides).forEach(([key, value]) => {
      if (value === "") {
        delete currentParams[key];
      } else {
        currentParams[key] = value;
      }
    });
    
    const queryString = Object.entries(currentParams)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
    
    return queryString ? `?${queryString}` : "";
  };

  const getExportUrl = () => {
    const params = new URLSearchParams();
    params.set("year", selectedElection.year.toString());
    if (county) params.set("county", county);
    if (constituency) params.set("constituency", constituency);
    if (ward) params.set("ward", ward);
    if (q) params.set("q", q);
    return `/api/data/exports/polling-stations?${params.toString()}`;
  };

  const paginationParams: Record<string, string> = {};
  if (selectedElection.year !== DEFAULT_ELECTION.year) {
    paginationParams.year = selectedElection.year.toString();
  }
  if (county) paginationParams.county = county;
  if (constituency) paginationParams.constituency = constituency;
  if (ward) paginationParams.ward = ward;
  if (q) paginationParams.q = q;

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Elections", href: "/elections" },
          { text: "Polling stations", href: "/elections/polling-stations" },
        ]}
      />

      
        
        <h1 className="govuk-heading-xl">Polling stations</h1>
        
        <p className="govuk-body-l">
          Search for polling stations and view registered voter numbers for each election year.
        </p>

        {/* Data source attribution */}
        <div className="govuk-inset-text govuk-!-margin-bottom-6">
          <p className="govuk-body govuk-!-margin-bottom-2">
            <strong>Data source:</strong> Independent Electoral and Boundaries Commission (IEBC).
          </p>
          <p className="govuk-body govuk-!-margin-bottom-0">
            <a 
              href="https://www.iebc.or.ke/docs/rov_per_caw.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="govuk-link"
            >
              View IEBC voter register summary (PDF)
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
                style={{ marginLeft: '4px', verticalAlign: 'middle', display: 'inline-block' }}
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span className="govuk-visually-hidden"> (opens in a new tab)</span>
            </a>
          </p>
        </div>

        {/* Election Year Selector */}
        <div className="app-election-year-selector govuk-!-margin-bottom-6">
          <form method="GET" action="/elections/polling-stations" className="app-election-year-form">
            <div className="app-election-year-group">
              <label className="govuk-label govuk-label--s" htmlFor="year">
                Election year
              </label>
              <select
                name="year"
                id="year"
                className="govuk-select"
                defaultValue={selectedElection.year.toString()}
              >
                {AVAILABLE_ELECTIONS.map(election => (
                  <option key={election.year} value={election.year}>
                    {election.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="app-election-year-actions">
              <button type="submit" className="govuk-button govuk-!-margin-bottom-0">
                View
              </button>
            </div>
          </form>
          <p className="govuk-body-s govuk-!-margin-top-2 govuk-!-margin-bottom-0">
            {selectedElection.description}
          </p>
        </div>

        {/* Filters */}
        <PollingStationFilters
          counties={counties || []}
          constituencies={constituencies || []}
          wards={allWardsList || []}
          selectedCounty={county}
          selectedConstituency={constituency}
          selectedWard={ward}
          search={q}
          totalResults={totalStations}
          action="/elections/polling-stations"
        />

        {/* Active filters */}
        {hasActiveFilters && (
          <div className="app-active-filters govuk-!-margin-bottom-6">
            <p className="govuk-body-s govuk-!-margin-bottom-2">
              <strong>Active filters:</strong>
            </p>
            <div className="app-filter-chips">
              {county && (
                <Link href={`/elections/polling-stations${buildQueryString({ county: "" })}`} className="app-filter-chip">
                  County: {county} <span className="app-filter-chip-remove">&times;</span>
                </Link>
              )}
              {constituency && (
                <Link href={`/elections/polling-stations${buildQueryString({ constituency: "" })}`} className="app-filter-chip">
                  Constituency: {constituency} <span className="app-filter-chip-remove">&times;</span>
                </Link>
              )}
              {ward && (
                <Link href={`/elections/polling-stations${buildQueryString({ ward: "" })}`} className="app-filter-chip">
                  Ward: {ward} <span className="app-filter-chip-remove">&times;</span>
                </Link>
              )}
              {q && (
                <Link href={`/elections/polling-stations${buildQueryString({ q: "" })}`} className="app-filter-chip">
                  Search: &ldquo;{q}&rdquo; <span className="app-filter-chip-remove">&times;</span>
                </Link>
              )}
              <Link href="/elections/polling-stations" className="govuk-link govuk-!-margin-left-2">
                Clear all filters
              </Link>
            </div>
          </div>
        )}

        {/* Export link */}
        <div className="app-export-bar govuk-!-margin-bottom-6">
          <span className="govuk-body-s govuk-!-margin-bottom-0">
            Download this data as a spreadsheet for your own analysis.
          </span>
          <a 
            href={getExportUrl()} 
            className="govuk-link govuk-!-margin-bottom-0"
            download
          >
            Download filtered data as CSV
          </a>
        </div>

        {/* Results count */}
        <p className="govuk-body govuk-!-margin-bottom-4" aria-live="polite">
          <strong>
            {totalStations > 0 ? fromOffset + 1 : 0} to {Math.min(toOffset + ITEMS_PER_PAGE, totalStations)} of {totalStations.toLocaleString()} polling stations
          </strong>
          {hasActiveFilters && " matching your filters"}
        </p>

        {/* Table or empty state */}
        {totalStations > 0 ? (
          <>
            <div className="app-table-responsive">
              <table className="govuk-table">
                <caption className="govuk-table__caption govuk-visually-hidden">
                  Polling stations for {selectedElection.label}
                </caption>
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    <th scope="col" className="govuk-table__header">No.</th>
                    <th scope="col" className="govuk-table__header">IEBC code</th>
                    <th scope="col" className="govuk-table__header">Polling station</th>
                    <th scope="col" className="govuk-table__header">Stream</th>
                    <th scope="col" className="govuk-table__header">Registration centre</th>
                    <th scope="col" className="govuk-table__header">Ward</th>
                    <th scope="col" className="govuk-table__header">Constituency</th>
                    <th scope="col" className="govuk-table__header govuk-table__header--numeric">Registered voters</th>
                  </tr>
                </thead>
                <tbody className="govuk-table__body">
                  {stations?.map((station: any, index) => {
                    const constName = (station.constituencies as any)?.name || "—";
                    const wName = (station.wards as any)?.name || "—";
                    const voters = station[selectedElection.votersColumn];

                    return (
                      <tr key={station.id} className="govuk-table__row">
                        <td className="govuk-table__cell">
                          {fromOffset + index + 1}
                        </td>
                        <td className="govuk-table__cell">
                          <code className="app-station-code">{station.polling_station_code}</code>
                        </td>
                        <th scope="row" className="govuk-table__header">
                          <Link href={`/elections/polling-stations/${station.slug}`} className="govuk-link">
                            {station.name}
                          </Link>
                        </th>
                        <td className="govuk-table__cell">
                          {station.stream_number || "—"}
                        </td>
                        <td className="govuk-table__cell">
                          {station.reg_centre_name || "—"}
                        </td>
                        <td className="govuk-table__cell">{wName}</td>
                        <td className="govuk-table__cell">{constName}</td>
                        <td className="govuk-table__cell govuk-table__cell--numeric">
                          {voters ? voters.toLocaleString() : "0"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <GovUKPagination
              currentPage={currentPage}
              totalPages={totalPages}
              baseUrl="/elections/polling-stations"
              queryParams={paginationParams}
            />
          </>
        ) : (
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-2">
              No polling stations match your filters.
            </p>
            <p className="govuk-body govuk-!-margin-bottom-0">
              <Link href="/elections/polling-stations" className="govuk-link">
                Clear all filters and view all polling stations
              </Link>
            </p>
          </div>
        )}

        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

        <div className="govuk-inset-text">
          <p className="govuk-body govuk-!-margin-bottom-0">
            Polling station data is provided by the Independent Electoral and Boundaries Commission (IEBC). 
            Registered voter numbers are based on the official voter register for the selected election year.
          </p>
        </div>

        <LastUpdated published="2026-01-01" lastUpdated="2026-07-02" />

      

      <style>{`
        .app-election-year-selector {
          padding: 20px;
          background-color: #f3f2f1;
          border-left: 4px solid #00703c;
        }

        .app-election-year-form {
          display: flex;
          gap: 20px;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .app-election-year-group {
          flex: 1;
          min-width: 200px;
        }

        .app-election-year-group .govuk-select {
          width: 100%;
        }

        .app-election-year-actions {
          padding-bottom: 2px;
        }

        .app-filters-panel {
          padding: 20px;
          background-color: #f3f2f1;
          border-left: 4px solid #1d70b8;
        }

        .app-filters-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .app-filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .app-filters-grid .govuk-form-group {
          margin-bottom: 0;
        }

        .app-filters-grid .govuk-select,
        .app-filters-grid .govuk-input {
          width: 100%;
        }

        .app-active-filters {
          padding: 15px;
          background-color: #f3f2f1;
          border-left: 4px solid #1d70b8;
        }

        .app-filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .app-filter-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          background-color: #ffffff;
          border: 1px solid #1d70b8;
          color: #1d70b8;
          text-decoration: none;
          font-size: 16px;
        }

        .app-filter-chip:hover {
          background-color: #1d70b8;
          color: #ffffff;
        }

        .app-filter-chip:hover .app-filter-chip-remove {
          color: #ffffff;
        }

        .app-filter-chip-remove {
          margin-left: 8px;
          color: #d4351c;
          font-weight: bold;
          font-size: 18px;
          line-height: 1;
        }

        .app-export-bar {
          padding: 15px;
          background-color: #f3f2f1;
          border-left: 4px solid #00703c;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .app-table-responsive {
          overflow-x: auto;
          margin-bottom: 30px;
        }

        .app-station-code {
          font-size: 14px;
          color: #505a5f;
          background-color: #f3f2f1;
          padding: 2px 6px;
          border-radius: 2px;
        }

        @media (max-width: 40.0625rem) {
          .app-election-year-form {
            flex-direction: column;
            align-items: stretch;
          }

          .app-election-year-group {
            min-width: 100%;
          }

          .app-filters-grid {
            grid-template-columns: 1fr;
          }

          .app-export-bar {
            flex-direction: column;
            align-items: flex-start;
          }

          .app-filter-chips {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    
  
  </>
);
}