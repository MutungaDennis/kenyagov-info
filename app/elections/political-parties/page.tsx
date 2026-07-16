// app/elections/political-parties/page.tsx
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export const revalidate = 3600;


interface SearchParams {
  q?: string;
  coalition?: string;
}

export default async function PoliticalPartiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = createPublicClient();
  const params = await searchParams;

  const q = params?.q?.toLowerCase().trim();
  const coalitionFilter = params?.coalition;

  // Fetch all coalitions for the filter dropdown
  const { data: coalitions } = await supabase
    .from("coalitions")
    .select("id, name, abbreviation")
    .order("name");

  // Fetch all parties with their coalition info
  let query = supabase.from("political_parties").select(`
    id, slug, name, abbreviation, symbol, colors, slogan,
    coalition_id,
    coalitions (id, name, abbreviation)
  `);

  // Apply coalition filter if selected
  if (coalitionFilter) {
    query = query.eq("coalition_id", coalitionFilter);
  }

  const { data: parties, error } = await query.order("name");

  if (error) {
    return (
      
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">Could not load political parties. Please try again later.</p>
          </div>
        </div>
      
    );
  }

  // Apply search filter
  let filtered = parties || [];

  if (q) {
    filtered = filtered.filter((p: any) =>
      p.name?.toLowerCase().includes(q) ||
      p.abbreviation?.toLowerCase().includes(q) ||
      p.slogan?.toLowerCase().includes(q)
    );
  }

  // Group by coalition
  const grouped = filtered.reduce((acc: any, party: any) => {
    const key = party.coalitions?.name || "Independent parties";
    if (!acc[key]) acc[key] = [];
    acc[key].push(party);
    return acc;
  }, {});

  // Build query string for form submissions
  const buildQueryString = (overrides: Record<string, string>) => {
    const current: Record<string, string> = {};
    if (q) current.q = q;
    if (coalitionFilter) current.coalition = coalitionFilter;
    const merged = { ...current, ...overrides };
    return Object.entries(merged)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join("&");
  };

  const hasActiveFilters = q || coalitionFilter;

  return (
  <>
    
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Elections", href: "/elections" },
          { text: "Political parties", href: "/elections/political-parties" },
        ]}
      />

      
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Political parties in Kenya</h1>
            <p className="govuk-body-l">
              Search the official register of political parties maintained by the Office of the Registrar of Political Parties (ORPP).
            </p>

            <div className="govuk-inset-text govuk-!-margin-bottom-6">
              <p className="govuk-body govuk-!-margin-bottom-0">
                <strong>{filtered.length}</strong> {filtered.length === 1 ? "party" : "parties"} found
                {hasActiveFilters && " matching your filters"}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="app-party-filters govuk-!-margin-bottom-6">
          <form method="GET" action="/elections/political-parties" className="app-party-filters-form">
            <div className="app-party-filter-group">
              <label className="govuk-label govuk-label--s" htmlFor="q">
                Search
              </label>
              <input
                id="q"
                name="q"
                className="govuk-input"
                defaultValue={q || ""}
                placeholder="Party name, abbreviation or slogan"
              />
            </div>

            <div className="app-party-filter-group">
              <label className="govuk-label govuk-label--s" htmlFor="coalition">
                Coalition
              </label>
              <select
                name="coalition"
                id="coalition"
                className="govuk-select"
                defaultValue={coalitionFilter || ""}
              >
                <option value="">All coalitions</option>
                {coalitions?.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.abbreviation})
                  </option>
                ))}
              </select>
            </div>

            <div className="app-party-filter-actions">
              <button type="submit" className="govuk-button govuk-!-margin-bottom-0">
                Apply filters
              </button>
              {hasActiveFilters && (
                <Link
                  href="/elections/political-parties"
                  className="govuk-link govuk-!-margin-left-3"
                >
                  Clear filters
                </Link>
              )}
            </div>
          </form>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="govuk-inset-text">
            <p className="govuk-body govuk-!-margin-bottom-0">
              No political parties match your search. Try different keywords or{" "}
              <Link href="/elections/political-parties" className="govuk-link">
                clear all filters
              </Link>
              .
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([coalitionName, items]: any) => (
            <section key={coalitionName} className="govuk-!-margin-bottom-8">
              <h2 className="govuk-heading-l app-coalition-heading">
                {coalitionName}
                <span className="govuk-caption-m govuk-!-margin-top-1">
                  {items.length} {items.length === 1 ? "party" : "parties"}
                </span>
              </h2>

              <ul className="govuk-list app-party-list">
                {items.map((party: any) => (
                  <li key={party.id} className="app-party-item">
                    <Link
                      href={`/elections/political-parties/${party.slug}`}
                      className="govuk-link govuk-link--no-visited-state"
                    >
                      <h3 className="govuk-heading-m govuk-!-margin-bottom-1">
                        {party.name}
                      </h3>
                    </Link>

                    <div className="app-party-meta">
                      {party.abbreviation && (
                        <span className="app-party-abbr">
                          <strong>{party.abbreviation}</strong>
                        </span>
                      )}
                      {party.coalitions && (
                        <strong className="govuk-tag govuk-tag--blue">
                          {party.coalitions.abbreviation}
                        </strong>
                      )}
                    </div>

                    {party.slogan && (
                      <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                        {party.slogan}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        <hr className="govuk-section-break govuk-section-break--l govuk-section-break--visible" />

        <div className="govuk-inset-text">
          <p className="govuk-body govuk-!-margin-bottom-0">
            Under Section 34(e) of the Political Parties Act, the Office of the Registrar of Political Parties (ORPP) maintains the official register of political parties in Kenya.
          </p>
        </div>

      

      <style>{`
        .app-party-filters {
          padding: 20px;
          background-color: #f3f2f1;
          border-left: 4px solid #1d70b8;
        }

        .app-party-filters-form {
          display: flex;
          gap: 20px;
          align-items: flex-end;
          flex-wrap: wrap;
        }

        .app-party-filter-group {
          flex: 1;
          min-width: 200px;
        }

        .app-party-filter-group .govuk-input,
        .app-party-filter-group .govuk-select {
          width: 100%;
        }

        .app-party-filter-actions {
          display: flex;
          align-items: center;
          padding-bottom: 2px;
        }

        .app-coalition-heading {
          border-bottom: 3px solid #1d70b8;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }

        .app-party-list {
          margin: 0;
          padding: 0;
        }

        .app-party-item {
          padding: 20px 0;
          border-bottom: 1px solid #b1b4b6;
        }

        .app-party-item:last-child {
          border-bottom: none;
        }

        .app-party-item h3 {
          color: #1d70b8;
        }

        .app-party-item h3:hover {
          text-decoration-thickness: 3px;
        }

        .app-party-meta {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 5px;
        }

        .app-party-abbr {
          color: #505a5f;
          font-size: 16px;
        }

        @media (max-width: 40.0625rem) {
          .app-party-filters-form {
            flex-direction: column;
            align-items: stretch;
          }

          .app-party-filter-group {
            min-width: 100%;
          }

          .app-party-filter-actions {
            justify-content: space-between;
          }
        }
      `}</style>
    
  
  </>
);
}