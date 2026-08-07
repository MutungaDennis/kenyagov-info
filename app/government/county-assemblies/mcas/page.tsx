import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import TableScroll from "@/components/govuk/TableScroll";

export const revalidate = 3600;

interface SearchParams {
  county?: string;
  party?: string;
  type?: string;
  q?: string;
  page?: string;
}

const ITEMS_PER_PAGE = 50;

// Helper to format name naturally: "First Name Surname"
const formatName = (firstName: string, surname: string) => {
  return `${firstName} ${surname}`.trim();
};

export default async function MCAsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parsedParams = await searchParams;
  const county = parsedParams.county || "";
  const party = parsedParams.party || "";
  const type = parsedParams.type || "";
  const q = parsedParams.q ? parsedParams.q.trim() : "";

  const currentPage = Math.max(1, parseInt(parsedParams.page || "1", 10));
  const fromOffset = (currentPage - 1) * ITEMS_PER_PAGE;
  const toOffset = fromOffset + ITEMS_PER_PAGE - 1;

  // Static 47 counties for the dropdown (no DB round-trip needed)
  const { counties: staticCounties } = await import("@/data/counties");
  const countiesList = staticCounties.map((c) => ({ name: c.name }));

  // Standardized party list for consistent filtering
  const partiesList = [
    "ANC", "CCM", "DAP-K", "DP", "FORD-K", "GDDP", "Independent", 
    "JP", "KANU", "KUP", "MCCP", "MDG", "NAP-K", "NOPEU", "ODM", 
    "PAA", "TSP", "UDA", "UDM", "UPA", "UPIA", "WDM-K"
  ];

  let mcas: any[] = [];
  let count: number | null = 0;
  let error: { message: string } | null = null;

  try {
    const supabase = createPublicClient();

    let baseQuery = supabase
      .from("mcas")
      .select(
        `
        id,
        slug,
        first_name,
        surname,
        seat_type,
        nomination_category,
        counties (name),
        wards (name),
        political_parties (name, abbreviation)
      `,
        { count: "exact" }
      )
      // Align with /government/people: unpublished MCAs are hidden from the public
      .neq("status", "Unpublished");

    if (county) baseQuery = baseQuery.eq("counties.name", county);
    if (party) baseQuery = baseQuery.eq("political_parties.name", party);
    if (type) baseQuery = baseQuery.eq("seat_type", type);

    if (q) {
      const safe = q.replace(/[%_,]/g, " ").slice(0, 80);
      baseQuery = baseQuery.or(`first_name.ilike.%${safe}%,surname.ilike.%${safe}%`);
    }

    const res = await baseQuery
      .order("first_name", { ascending: true })
      .order("surname", { ascending: true })
      .range(fromOffset, toOffset);

    mcas = res.data || [];
    count = res.count;
    if (res.error) error = res.error;
  } catch (e) {
    error = { message: e instanceof Error ? e.message : "Load failed" };
  }

  if (error) {
    return (
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper">
          <h1 className="govuk-heading-l">Unable to load MCAs</h1>
          <p className="govuk-body">Please try again later or narrow your filters.</p>
        </main>
      </div>
    );
  }

  const totalMCAs = count || 0;
  const totalPages = Math.ceil(totalMCAs / ITEMS_PER_PAGE);
  const hasActiveFilters = !!county || !!party || !!type || !!q;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (county) params.set("county", county);
    if (party) params.set("party", party);
    if (type) params.set("type", type);
    if (q) params.set("q", q);
    params.set("page", pageNumber.toString());
    return `/government/county-assemblies/mcas?${params.toString()}`;
  };

  const getFilterClearUrl = (removeKey: "county" | "party" | "type" | "q") => {
    const params = new URLSearchParams();
    if (removeKey !== "county" && county) params.set("county", county);
    if (removeKey !== "party" && party) params.set("party", party);
    if (removeKey !== "type" && type) params.set("type", type);
    if (removeKey !== "q" && q) params.set("q", q);
    return `/government/county-assemblies/mcas?${params.toString()}`;
  };

  const getExportUrl = () => {
    const params = new URLSearchParams();
    if (county) params.set("county", county);
    if (party) params.set("party", party);
    if (type) params.set("type", type);
    if (q) params.set("q", q);
    return `/api/data/exports/mcas?${params.toString()}`;
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Government", href: "/government" },
          { text: "County Assemblies", href: "/government/county-assemblies" },
          { text: "Members of County Assembly (MCAs)" },
        ]}
      />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            
            <h1 className="govuk-heading-l govuk-!-margin-bottom-2">Members of County Assembly (MCAs)</h1>
            <p className="govuk-body govuk-!-margin-bottom-6">
              Official public register of elected and nominated Members of County Assembly across all 47 devolved counties. 
              Names are displayed in natural order (First Name, Surname) for easier reading.
            </p>

            {/* GOV.UK Compliant Server-Side Filter Form */}
            <form action="/government/county-assemblies/mcas" method="GET" className="govuk-grid-row govuk-!-margin-bottom-2">
              <div className="govuk-grid-column-one-quarter govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="q">
                    Search MCAs
                  </label>
                  <input
                    className="govuk-input govuk-!-width-full"
                    id="q"
                    name="q"
                    type="search"
                    placeholder="First or last name..."
                    defaultValue={q}
                  />
                </div>
              </div>

              <div className="govuk-grid-column-one-quarter govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="county">
                    County
                  </label>
                  <select className="govuk-select govuk-!-width-full" id="county" name="county" defaultValue={county}>
                    <option value="">All Counties</option>
                    {countiesList.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="govuk-grid-column-one-quarter govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="party">
                    Political Party
                  </label>
                  <select className="govuk-select govuk-!-width-full" id="party" name="party" defaultValue={party}>
                    <option value="">All Parties</option>
                    {partiesList.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="govuk-grid-column-one-quarter govuk-!-margin-bottom-3">
                <div className="govuk-form-group govuk-!-margin-bottom-0">
                  <label className="govuk-label govuk-!-font-weight-bold" htmlFor="type">
                    Representation Type
                  </label>
                  <select className="govuk-select govuk-!-width-full" id="type" name="type" defaultValue={type}>
                    <option value="">All Types</option>
                    <option value="Elected">Elected</option>
                    <option value="Nominated">Nominated</option>
                  </select>
                </div>
              </div>

              <div className="govuk-grid-column-full">
                <div className="govuk-button-group govuk-!-margin-bottom-0">
                  <button type="submit" className="govuk-button govuk-!-margin-bottom-0">
                    Apply filters
                  </button>
                  <Link href="/government/county-assemblies/mcas" className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0">
                    Clear all filters
                  </Link>
                </div>
              </div>
            </form>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="govuk-!-margin-bottom-6" style={{ background: '#f3f2f1', padding: '16px', borderLeft: '4px solid #1d70b8' }}>
                <p className="govuk-body-s govuk-!-font-weight-bold govuk-!-margin-bottom-2">Active filters:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {county && (
                    <Link href={getFilterClearUrl("county")} className="govuk-link" style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', textDecoration: 'none', color: '#1d70b8', display: 'inline-flex', alignItems: 'center', borderRadius: '4px', fontSize: '14px' }}>
                      County: {county} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </Link>
                  )}
                  {party && (
                    <Link href={getFilterClearUrl("party")} className="govuk-link" style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', textDecoration: 'none', color: '#1d70b8', display: 'inline-flex', alignItems: 'center', borderRadius: '4px', fontSize: '14px' }}>
                      Party: {party} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </Link>
                  )}
                  {type && (
                    <Link href={getFilterClearUrl("type")} className="govuk-link" style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', textDecoration: 'none', color: '#1d70b8', display: 'inline-flex', alignItems: 'center', borderRadius: '4px', fontSize: '14px' }}>
                      Type: {type} <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </Link>
                  )}
                  {q && (
                    <Link href={getFilterClearUrl("q")} className="govuk-link" style={{ background: '#fff', border: '1px solid #1d70b8', padding: '4px 8px', textDecoration: 'none', color: '#1d70b8', display: 'inline-flex', alignItems: 'center', borderRadius: '4px', fontSize: '14px' }}>
                      Search: &ldquo;{q}&rdquo; <span style={{ marginLeft: '8px', color: '#d4351c', fontWeight: 'bold' }}>&times;</span>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Open Data Download Panel */}
            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              <p className="govuk-body govuk-!-margin-bottom-2">
                <strong>Open Data:</strong> Machine-readable data access aligned with national open information disclosure guidelines. The download reflects your current search and filter criteria.
              </p>
              <a href={getExportUrl()} className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0" download>
                Download filtered list as CSV
              </a>
            </div>

            {/* Results Counter */}
            <h2 className="govuk-heading-s govuk-!-margin-bottom-3" aria-live="polite">
              Showing {totalMCAs > 0 ? fromOffset + 1 : 0} to {Math.min(toOffset + 1, totalMCAs)} of {totalMCAs.toLocaleString()} MCAs
            </h2>

            {totalMCAs > 0 ? (
              <>
                <TableScroll caption="List of Members of County Assembly — scroll sideways on small screens">
                  <table className="govuk-table">
                    <caption className="govuk-table__caption govuk-visually-hidden">List of Members of County Assembly detailing their ward, county, and party affiliation.</caption>
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ width: '60px' }}>No.</th>
                        <th scope="col" className="govuk-table__header govuk-body-s">Name</th>
                        <th scope="col" className="govuk-table__header govuk-body-s">Ward</th>
                        <th scope="col" className="govuk-table__header govuk-body-s">County</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ width: '120px' }}>Party</th>
                        <th scope="col" className="govuk-table__header govuk-body-s" style={{ width: '120px' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody className="govuk-table__body">
                      {mcas.map((mca, index) => {
                        const fullName = formatName(mca.first_name, mca.surname);
                        const countyName = mca.counties?.name || "—";
                        const wardName = mca.wards?.name || (mca.seat_type === 'Nominated' ? 'County-wide' : '—');
                        const partyName = mca.political_parties?.abbreviation || mca.political_parties?.name || "Independent";
                        
                        return (
                          <tr key={mca.id} className="govuk-table__row">
                            <td className="govuk-table__cell govuk-body-s">{fromOffset + index + 1}</td>
                            <th scope="row" className="govuk-table__header govuk-body-s" style={{ fontWeight: 'normal' }}>
                              <Link href={`/government/people/${mca.slug}`} className="govuk-link govuk-!-font-weight-bold">
                                {fullName}
                              </Link>
                            </th>
                            <td className="govuk-table__cell govuk-body-s">{wardName}</td>
                            <td className="govuk-table__cell govuk-body-s">{countyName}</td>
                            <td className="govuk-table__cell govuk-body-s">
                              <span className="govuk-!-font-weight-bold">{partyName}</span>
                            </td>
                            <td className="govuk-table__cell govuk-body-s">
                              <span className={`govuk-tag ${mca.seat_type === 'Elected' ? 'govuk-tag--blue' : 'govuk-tag--grey'}`}>
                                {mca.seat_type}
                              </span>
                              {mca.seat_type === 'Nominated' && mca.nomination_category && (
                                <div className="govuk-hint govuk-!-margin-bottom-0">({mca.nomination_category})</div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </TableScroll>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="govuk-pagination" role="navigation" aria-label="Pagination">
                    {currentPage > 1 && (
                      <div className="govuk-pagination__prev">
                        <Link className="govuk-link govuk-pagination__link" href={createPageUrl(currentPage - 1)} rel="prev">
                          <svg className="govuk-pagination__icon govuk-pagination__icon--prev" xmlns="http://www.w3.org/2000/svg" height="13" width="15" viewBox="0 0 17 13">
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
                          <svg className="govuk-pagination__icon govuk-pagination__icon--next" xmlns="http://www.w3.org/2000/svg" height="13" width="15" viewBox="0 0 17 13">
                            <path d="m13.7 5.5-4.1-4.1 1.4-1.4L17 6.5 11 13l-1.4-1.4 4.1-4.1H0v-2h13.7z"></path>
                          </svg>
                        </Link>
                      </div>
                    )}
                  </nav>
                )}
              </>
            ) : (
              <div className="govuk-body govuk-!-margin-top-4">
                <p>No MCAs match your active keyword or filtering configurations.</p>
                <Link href="/government/county-assemblies/mcas" className="govuk-link govuk-!-font-weight-bold">
                  Reset view and display all records
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}