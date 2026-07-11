import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WardsFilters from "@/components/wards/wards-filters";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


interface SearchParams {
  county?: string;
  constituency?: string;
  q?: string;
  page?: string;
}

const ITEMS_PER_PAGE = 50;

export default async function WardsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();

  // ============================================
  // PARSE SEARCH PARAMS Safely
  // ============================================
  const parsedParams = await searchParams;
  const county = parsedParams.county || "";
  const constituency = parsedParams.constituency || "";
  const q = parsedParams.q ? parsedParams.q.trim() : "";
  
  const currentPage = Math.max(1, parseInt(parsedParams.page || "1", 10));
  const fromOffset = (currentPage - 1) * ITEMS_PER_PAGE;
  const toOffset = fromOffset + ITEMS_PER_PAGE - 1;

  // ============================================
  // FETCH REFERENCE COUNTIES FOR FILTERS
  // ============================================
  const { data: counties } = await supabase
    .from("counties")
    .select("name")
    .order("name");

  // ============================================
  // DETERMINE CONDITIONAL COUNTY FROM CONSTITUENCY
  // ============================================
  let selectedCounty = county;

  if (constituency && !county) {
    const { data: constituencyCounty } = await supabase
      .from("constituencies")
      .select(`
        county_code,
        counties (
          name
        )
      `)
      .eq("name", constituency)
      .single();

    if (constituencyCounty?.counties) {
      if (Array.isArray(constituencyCounty.counties) && constituencyCounty.counties.length > 0) {
        selectedCounty = constituencyCounty.counties[0].name;
      } else if (!Array.isArray(constituencyCounty.counties)) {
        selectedCounty = (constituencyCounty.counties as any).name;
      }
    }
  }

  // ============================================
  // FETCH CONSTITUENCIES FOR FILTER DROPDOWNS
  // ============================================
  let constituencyQuery = supabase
    .from("constituencies")
    .select("name, county_code")
    .order("name");

  if (selectedCounty) {
    const { data: countyData } = await supabase
      .from("counties")
      .select("code")
      .eq("name", selectedCounty)
      .single();

    if (countyData) {
      constituencyQuery = constituencyQuery.eq("county_code", countyData.code);
    }
  }

  const { data: constituencies } = await constituencyQuery;

  // ============================================
  // BUILD CORE DATA AND TOTAL COUNT QUERIES
  // ============================================
  let baseQuery = supabase
    .from("wards")
    .select(`
      id,
      slug,
      name,
      ward_code,
      county_name,
      constituency_name,
      registered_voters_2022
    `, { count: 'exact' })
    .eq("is_active", true);

  // Apply strict conditional filters safely
  if (selectedCounty) baseQuery = baseQuery.eq("county_name", selectedCounty);
  if (constituency) baseQuery = baseQuery.eq("constituency_name", constituency);
  
  // FIX: Properly format and quote the PostgREST text matching statement
  if (q) {
    const formattedQuery = `%${q}%`;
    baseQuery = baseQuery.or(
      `name.ilike."${formattedQuery}",constituency_name.ilike."${formattedQuery}",county_name.ilike."${formattedQuery}"`
    );
  }

  // Execute database query with fixed ranges
  const { data: wards, count, error } = await baseQuery
    .order("county_name", { ascending: true })
    .order("constituency_name", { ascending: true })
    .order("name", { ascending: true })
    .range(fromOffset, toOffset);

  // ============================================
  // EVALUATE ERRORS
  // ============================================
  if (error) {
    return (
  <>
      
        
          <h1 className="govuk-heading-l">System Error</h1>
          <p className="govuk-body">Unable to process your request. Please check your data filters and try again.</p>
          <pre className="govuk-!-background-grey govuk-!-padding-2 govuk-!-border-1">{error.message}</pre>
        
      
    
  </>
);
  }

  const totalWards = count || 0;
  const totalPages = Math.ceil(totalWards / ITEMS_PER_PAGE);
  const hasActiveFilters = !!county || !!constituency || !!q;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (county) params.set("county", county);
    if (constituency) params.set("constituency", constituency);
    if (q) params.set("q", q);
    params.set("page", pageNumber.toString());
    return `/counties/wards?${params.toString()}`;
  };

  const getFilterClearUrl = (removeKey: "county" | "constituency" | "q") => {
    const params = new URLSearchParams();
    if (removeKey !== "county" && county) params.set("county", county);
    if (removeKey !== "constituency" && constituency) params.set("constituency", constituency);
    if (removeKey !== "q" && q) params.set("q", q);
    return `/counties/wards?${params.toString()}`;
  };

  // Compile active search parameters to craft an optimized endpoint track url for export route tracking
  const getExportUrl = () => {
    const params = new URLSearchParams();
    if (county) params.set("county", county);
    if (constituency) params.set("constituency", constituency);
    if (q) params.set("q", q);
    return `/api/data/exports/wards?${params.toString()}`;
  };

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Counties", href: "/counties" },
          { text: "Wards", href: "" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Wards in Kenya</h1>
            <p className="govuk-body govuk-!-margin-bottom-4">
              Browse electoral and administrative ward boundaries mapped across all 47 devolved counties and 290 constituencies.
            </p>

            {/* ASYNC FILTER DRIVER INPUT BOX BLOCK */}
            <WardsFilters
              counties={counties || []}
              constituencies={constituencies || []}
              selectedCounty={selectedCounty}
              selectedConstituency={constituency}
              search={q}
            />

            {/* GOV.UK Compliant Filter Removal Tags Display Panel */}
            {hasActiveFilters && (
              <div className="govuk-!-margin-bottom-4 govuk-!-background-grey govuk-!-padding-2 govuk-!-border-1">
                <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">Active filters:</p>
                <div className="govuk-!-display-flex govuk-!-flex-wrap-wrap govuk-!-gap-2 govuk-!-align-items-center">
                  {county && (
                    <Link href={getFilterClearUrl("county")} className="govuk-link govuk-!-font-size-14" style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', textDecoration: 'none', color: '#1d70b8', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}>
                      County: {county} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </Link>
                  )}
                  {constituency && (
                    <Link href={getFilterClearUrl("constituency")} className="govuk-link govuk-!-font-size-14" style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', textDecoration: 'none', color: '#1d70b8', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}>
                      Constituency: {constituency} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </Link>
                  )}
                  {q && (
                    <Link href={getFilterClearUrl("q")} className="govuk-link govuk-!-font-size-14" style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', cursor: 'pointer', textDecoration: 'none', color: '#1d70b8', display: 'inline-flex', alignItems: 'center', borderStyle: 'solid' }}>
                      Search: &ldquo;{q}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </Link>
                  )}
                  <Link href="/counties/wards" className="govuk-link govuk-!-font-size-16" style={{ paddingLeft: '4px' }}>
                    Clear all filters
                  </Link>
                </div>
              </div>
            )}

            {/* Open Data Download Panel (GOV.UK Compliant Server Model) */}
            <div className="govuk-!-margin-bottom-4" style={{ background: '#f3f2f1', padding: '12px 15px', border: '1px solid #bfc1c3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <span className="govuk-body-s govuk-!-margin-0">
                Machine-readable open data access framework complying with national transparency disclosure guidelines.
              </span>
              <a 
                href={getExportUrl()}
                className="govuk-link govuk-!-font-size-16 govuk-!-font-weight-bold"
                style={{ textDecoration: 'underline' }}
              >
                Download filtered matching wards list as CSV text spreadsheet
              </a>
            </div>

            {/* METADATA RESULT HOOK COUNTER */}
            <h2 className="govuk-heading-s govuk-!-margin-bottom-3" aria-live="polite">
              Showing {totalWards > 0 ? fromOffset + 1 : 0} to {Math.min(toOffset + ITEMS_PER_PAGE, totalWards)} of {totalWards.toLocaleString()} electoral wards
            </h2>

            {totalWards > 0 ? (
              <>
                {/* Responsive Mobile Layout Container Wrapper */}
                <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: '25px' }}>
                  <table className="govuk-table" style={{ minWidth: '700px' }}>
                    <caption className="govuk-table__caption govuk-visually-hidden">
                      List of administrative wards in Kenya detailing constituencies and local voter volumes.
                    </caption>
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ width: '60px' }}>No.</th>
                        <th scope="col" className="govuk-table__header govuk-body-s">Ward</th>
                        <th scope="col" className="govuk-table__header govuk-body-s">Constituency</th>
                        <th scope="col" className="govuk-table__header govuk-body-s">County</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ width: '200px' }}>Registered Voters (2022)</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      {wards?.map((ward, index) => (
                        <tr key={ward.id} className="govuk-table__row">
                          <td className="govuk-table__cell govuk-body-s">{fromOffset + index + 1}</td>
                          <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                            <Link href={`/counties/wards/${ward.slug}`} className="govuk-link govuk-!-font-weight-bold">
                              {ward.name}
                            </Link>
                          </th>
                          <td className="govuk-table__cell govuk-body-s">{ward.constituency_name}</td>
                          <td className="govuk-table__cell govuk-body-s">{ward.county_name}</td>
                          <td className="govuk-table__cell govuk-body-s">
                            {ward.registered_voters_2022 ? ward.registered_voters_2022.toLocaleString() : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* GOV.UK Design System Pagination Component */}
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
                <p>No results match your selected county, constituency, or keyword search parameter configurations.</p>
                <Link href="/counties/wards" className="govuk-link govuk-!-font-weight-bold">
                  Reset view and display all records
                </Link>
              </div>
            )}

            
          </div>
        </div>
      
    
  
  </>
);
}
