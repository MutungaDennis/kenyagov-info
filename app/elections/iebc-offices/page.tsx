// app/elections/iebc-offices/page.tsx
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GovUKPagination from "@/components/govuk/Pagination";
import LastUpdated from "@/components/govuk/LastUpdated";

interface PageProps {
  searchParams?: Promise<{
    q?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 50;

// Helper function to safely convert any value to lowercase string
const safeString = (value: any): string => {
  if (value === null || value === undefined) return "";
  return String(value).toLowerCase();
};

export default async function IebcOfficesPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const query = params?.q?.toLowerCase().trim() || "";
  const currentPage = parseInt(params?.page || "1", 10);

  const { data } = await supabase
    .from("constituencies")
    .select(`
      id,
      name,
      slug,
      county_code,
      office_location,
      most_conspicuous_landmark,
      registered_voters_2022
    `)
    .order("county_code", { ascending: true })
    .order("name", { ascending: true });

  const safeData = data ?? [];

  // Filter with safe string conversion
  const filtered = query
    ? safeData.filter((c) =>
        safeString(c.name).includes(query) ||
        safeString(c.county_code).includes(query) ||
        safeString(c.office_location).includes(query) ||
        safeString(c.most_conspicuous_landmark).includes(query)
      )
    : safeData;

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filtered.slice(startIndex, endIndex);

  // Query params for pagination (preserve search)
  const paginationParams: Record<string, string> = {};
  if (query) paginationParams.q = query;

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Elections", href: "/elections" },
          { text: "IEBC constituency offices", href: "/elections/iebc-offices" },
        ]}
      />

      
        
        <h1 className="govuk-heading-xl">IEBC constituency offices</h1>
        
        <p className="govuk-body">
          Find Independent Electoral and Boundaries Commission (IEBC) constituency offices across Kenya, including office locations and landmarks.
        </p>

        {/* Data source attribution */}
        <div className="govuk-inset-text govuk-!-margin-bottom-6">
          <p className="govuk-body govuk-!-margin-bottom-2">
            <strong>Data source:</strong> Independent Electoral and Boundaries Commission (IEBC).
          </p>
          <p className="govuk-body govuk-!-margin-bottom-0">
            <a 
              href="https://www.iebc.or.ke/docs/Physical_Locations_of_County_and_Constituency_Offices_in_Kenya.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="govuk-link"
            >
              View official IEBC office locations document (PDF)
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

        {/* Search */}
        <div className="app-iebc-search govuk-!-margin-bottom-6">
          <form method="GET" action="/elections/iebc-offices" className="app-iebc-search-form">
            <div className="app-iebc-search-input">
              <label className="govuk-label govuk-label--s" htmlFor="q">
                Search
              </label>
              <input
                className="govuk-input"
                id="q"
                name="q"
                type="text"
                defaultValue={query}
                placeholder="Constituency, county code or office location"
              />
            </div>
            <div className="app-iebc-search-actions">
              <button type="submit" className="govuk-button govuk-!-margin-bottom-0">
                Search
              </button>
              {query && (
                <a
                  href="/elections/iebc-offices"
                  className="govuk-link govuk-!-margin-left-3"
                >
                  Clear search
                </a>
              )}
            </div>
          </form>
        </div>

        {/* Results count - now below search */}
        <div className="govuk-inset-text govuk-!-margin-bottom-6">
          <p className="govuk-body govuk-!-margin-bottom-0">
            <strong>{filtered.length}</strong> {filtered.length === 1 ? "constituency office" : "constituency offices"} found
            {query && ` matching "${query}"`}
            {totalPages > 1 && ` (showing ${startIndex + 1}–${Math.min(endIndex, filtered.length)} of ${filtered.length})`}
          </p>
        </div>

        {/* Table */}
        {paginatedData.length === 0 ? (
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              No constituency offices match your search. Try different keywords or{" "}
              <a href="/elections/iebc-offices" className="govuk-link">
                clear the search
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="app-table-responsive">
            <table className="govuk-table">
              <caption className="govuk-table__caption govuk-visually-hidden">
                IEBC constituency offices directory
              </caption>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">Constituency</th>
                  <th scope="col" className="govuk-table__header">County code</th>
                  <th scope="col" className="govuk-table__header">IEBC office location</th>
                  <th scope="col" className="govuk-table__header">Landmark</th>
                  <th scope="col" className="govuk-table__header govuk-table__header--numeric">Registered voters (2022)</th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {paginatedData.map((c: any) => (
                  <tr key={c.id} className="govuk-table__row">
                    <td className="govuk-table__cell">
                      <strong>{c.name || "Unknown"}</strong>
                    </td>
                    <td className="govuk-table__cell">{c.county_code ?? "—"}</td>
                    <td className="govuk-table__cell">{c.office_location || "Not recorded"}</td>
                    <td className="govuk-table__cell">{c.most_conspicuous_landmark || "Not recorded"}</td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {c.registered_voters_2022?.toLocaleString() ?? "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination - Bottom only */}
        <GovUKPagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl="/elections/iebc-offices"
          queryParams={paginationParams}
        />

        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

        <LastUpdated published="2026-01-01" lastUpdated="2026-07-02" />

      

      <style>{`
        .app-iebc-search {
          padding: 20px;
          background-color: #f3f2f1;
          border-left: 4px solid #1d70b8;
        }

        .app-iebc-search-form {
          display: flex;
          gap: 20px;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .app-iebc-search-input {
          flex: 1;
          min-width: 250px;
        }

        .app-iebc-search-input .govuk-input {
          width: 100%;
        }

        .app-iebc-search-actions {
          display: flex;
          align-items: center;
          padding-bottom: 2px;
        }

        .app-table-responsive {
          overflow-x: auto;
        }

        @media (max-width: 40.0625rem) {
          .app-iebc-search-form {
            flex-direction: column;
            align-items: stretch;
          }

          .app-iebc-search-input {
            min-width: 100%;
          }

          .app-iebc-search-actions {
            justify-content: space-between;
          }
        }
      `}</style>
    
  
  </>
);
}