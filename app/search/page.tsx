import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";


interface SearchParams {
  q?: string;
  type?: string;
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();

  const parsedParams = await searchParams;
  const q = parsedParams.q ? parsedParams.q.trim() : "";
  const selectedType = parsedParams.type || "";

  let results: any[] = [];
  let errorMsg = "";

  // ============================================
  // DATABASE EXECUTION STRATEGY
  // ============================================
  if (q) {
    try {
      let queryBuilder = supabase
        .from("global_search_view")
        .select("id, slug, name, snippet, entity_type, base_route")
        .textSearch("search_vector", q, {
          config: "english",
          type: "websearch"
        });

      if (selectedType) {
        queryBuilder = queryBuilder.eq("entity_type", selectedType);
      }

      const { data, error } = await queryBuilder.limit(40);

      if (error) throw error;
      results = data || [];
    } catch (e: any) {
      errorMsg = e.message || "An error occurred compiling global text queries.";
    }
  }

  const getFilterUrl = (type: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    return `/search?${params.toString()}`;
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Search Results", href: "" },
        ]}
      />

      <main className="govuk-main-wrapper govuk-!-padding-top-2" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-4">Search Results</h1>

            {/* Re-Search Field Box Layout */}
            <form method="GET" action="/search" className="govuk-form-group govuk-!-margin-bottom-6" style={{ background: '#f3f2f1', padding: '15px', borderLeft: '4px solid #002147' }}>
              <label className="govuk-label govuk-!-font-weight-bold" htmlFor="search-input">
                Search government entities, services or laws
              </label>
              <div style={{ display: 'flex', width: '100%', maxWidth: '600px', marginTop: '6px' }}>
                <input
                  className="govuk-input"
                  id="search-input"
                  name="q"
                  type="search"
                  defaultValue={q}
                  style={{ flex: 1, margin: 0, height: '40px', borderRight: 'none', borderRadius: '0' }}
                />
                <button 
                  type="submit" 
                  className="govuk-button"
                  style={{ margin: 0, height: '40px', width: '44px', padding: 0, borderRadius: '0', backgroundColor: '#00703c', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-label="Search"
                >
                  <svg style={{ display: 'block', fill: '#ffffff' }} version="1.1" xmlns="http://w3.org" width="20" height="20" viewBox="0 0 20 20">
                    <path d="M18.86 17.44l-5.11-5.11a7.37 7.37 0 1 0-1.41 1.41l5.11 5.11a1 1 0 1 0 1.42-1.41zM3 8.39a5.39 5.39 0 1 1 5.39 5.39A5.4 5.4 0 0 1 3 8.39z" />
                  </svg>
                </button>
              </div>
              {selectedType && (
                <input type="hidden" name="type" value={selectedType} />
              )}
            </form>
          </div>
        </div>

        <div className="govuk-grid-row">
          {/* Classification Categorization Faceted Sidebar */}
          <div className="govuk-grid-column-one-third print-hide govuk-!-margin-bottom-4">
            <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Filter by registry</h2>
            
              <ul className="govuk-list govuk-list--spaced" style={{ margin: 0, padding: 0 }}>
                <li>
                  <Link href={getFilterUrl("")} className="govuk-link" style={{ fontWeight: selectedType === "" ? "bold" : "normal", textDecoration: selectedType === "" ? "none" : "underline" }}>
                    All categories
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Ministry/Department")} className="govuk-link" style={{ fontWeight: selectedType === "Ministry/Department" ? "bold" : "normal", textDecoration: selectedType === "Ministry/Department" ? "none" : "underline" }}>
                    Ministries & State Depts
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("County")} className="govuk-link" style={{ fontWeight: selectedType === "County" ? "bold" : "normal", textDecoration: selectedType === "County" ? "none" : "underline" }}>
                    Counties (All 47)
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Constituency")} className="govuk-link" style={{ fontWeight: selectedType === "Constituency" ? "bold" : "normal", textDecoration: selectedType === "Constituency" ? "none" : "underline" }}>
                    Constituencies (All 290)
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Ward")} className="govuk-link" style={{ fontWeight: selectedType === "Ward" ? "bold" : "normal", textDecoration: selectedType === "Ward" ? "none" : "underline" }}>
                    Administrative Wards
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Political Party")} className="govuk-link" style={{ fontWeight: selectedType === "Political Party" ? "bold" : "normal", textDecoration: selectedType === "Political Party" ? "none" : "underline" }}>
                    Political Parties
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Leader")} className="govuk-link" style={{ fontWeight: selectedType === "Leader" ? "bold" : "normal", textDecoration: selectedType === "Leader" ? "none" : "underline" }}>
                    Leadership Profiles
                  </Link>
                </li>
              </ul>
          </div>

          {/* Results Output Stream Component */}
          <div className="govuk-grid-column-two-thirds">
            {errorMsg ? (
              <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
                <h2 className="govuk-error-summary__title" id="error-summary-title">Search Processing Error</h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body-s">{errorMsg}</p>
                </div>
              </div>
            ) : q ? (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-4" aria-live="polite">
                  Showing {results.length} results for &ldquo;{q}&rdquo;
                </h2>

                {results.length > 0 ? (
                  <ul className="govuk-list" style={{ borderTop: '1px solid #bfc1c3', padding: 0, margin: 0 }}>
                    {results.map((item) => (
                      <li key={item.id || item.slug} style={{ padding: '16px 0', borderBottom: '1px solid #e6e6e6' }}>
                        <span className="govuk-caption-m govuk-!-font-size-14 govuk-!-font-weight-bold" style={{ textTransform: 'uppercase', color: '#505a5f', display: 'block', marginBottom: '2px' }}>
                          {item.entity_type}
                        </span>
                        <h3 className="govuk-heading-m govuk-!-margin-0">
                          <Link href={`${item.base_route}/${item.slug}`} className="govuk-link govuk-!-font-weight-bold">
                            {item.name}
                          </Link>
                        </h3>
                        {item.snippet && (
                          <p className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0" style={{ color: '#353c3f', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {item.snippet}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="govuk-body govuk-!-margin-top-4">
                    <p>No matches found within the public tracking registers.</p>
                    <p className="govuk-body-s">Verify the name structure, use broader keywords, or select &ldquo;All categories&rdquo; to reset filters.</p>
                  </div>
                )}
              </>
            ) : (
              <p className="govuk-body govuk-!-margin-top-4">Type a term or constitutional keyword string above to execute queries across national registers.</p>
            )}

            
          </div>
        </div>
      </main>
    </div>
  );
}

