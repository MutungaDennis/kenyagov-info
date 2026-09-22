
import { safeHtml } from "@/lib/safe-html";
import Link from "next/link";
import type { Metadata } from "next";
import { createPublicClient } from "@/lib/supabase/public";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import SearchAutocomplete from "@/components/govuk/SearchAutocomplete";
import { searchSite } from "@/lib/search/search";
import { resultHref } from "@/lib/search/results";

interface SearchParams {
  q?: string;
  type?: string;
  page?: string;
}

/** Short revalidate — search is dynamic via searchParams but keep Worker light */
export const revalidate = 60;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  const term = q?.trim();
  if (term) {
    return {
      title: `Search results for “${term}”`,
      description: `Search CitizenGuide.KE for “${term}” — government institutions, leaders, counties, laws, elections and guides.`,
      robots: { index: false, follow: true },
    };
  }
  return {
    title: "Search",
    description:
      "Search CitizenGuide.KE for government institutions, leaders, counties, the Constitution, elections, services and guides.",
    alternates: { canonical: "/search" },
  };
}

export default async function SearchResultsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const parsedParams = await searchParams;
  const q = parsedParams.q ? parsedParams.q.trim().slice(0, 120) : "";
  const selectedType = parsedParams.type || "";

  const { results: allResults, partialFailure } = q
    ? await searchSite(createPublicClient(), q, selectedType, 100)
    : { results: [], partialFailure: false };
  const page = Math.max(1, Math.min(Math.ceil(allResults.length / 20) || 1, Math.floor(Number(parsedParams.page)) || 1));
  const results = allResults.slice((page - 1) * 20, page * 20);
  const errorMsg = partialFailure && !results.length ? "Search sources are temporarily unavailable." : "";


  const getFilterUrl = (type: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (type) params.set("type", type);
    return `/search?${params.toString()}`;
  };

  // GOV.UK-style snippet highlighting (focus yellow #ffdd00)
  function highlight(text: string | null | undefined, term: string): string {
    const escaped = (text || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
    if (!escaped || !term) return escaped;
    const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${safeTerm})`, "gi");
    return escaped.replace(
      regex,
      '<mark class="app-search-highlight">$1</mark>',
    );
  }

  return (
  <>
      <GovUKBreadcrumbs
        items={[
          { text: "Home", href: "/" },
          { text: "Search", href: "/search" },
          ...(q ? [{ text: `Results for “${q}”` }] : []),
        ]}
      />

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <h1 className="govuk-heading-l govuk-!-margin-bottom-4">
              {q ? "Search results" : "Search"}
            </h1>

            <div className="govuk-form-group govuk-!-margin-bottom-6">
              <label className="govuk-label govuk-label--m" htmlFor="site-search-input">
                Search this website
              </label>
              <div id="search-hint" className="govuk-hint">
                For example: IEBC, Constitution Article 47, passport, or Nairobi County
              </div>
              <div className="govuk-!-max-width-two-thirds">
                <SearchAutocomplete key={q + selectedType} filterType={selectedType}
                  initialQuery={q}
                  placeholder="Search institutions, services, laws, elections…"
                  inputId="site-search-input"
                />
              </div>
              <p className="govuk-body-s govuk-!-margin-top-2">
                Search names, abbreviations or topics. Spelling variations are supported; exact names and article numbers take priority.
              </p>
            </div>
          </div>
        </div>

        <div className="govuk-grid-row">
          {/* Classification Categorization Faceted Sidebar */}
          <div className="govuk-grid-column-one-third print-hide govuk-!-margin-bottom-4">
            <h2 className="govuk-heading-s govuk-!-margin-bottom-2">Filter by type</h2>
            
              <ul className="govuk-list govuk-list--spaced govuk-!-margin-0 govuk-!-padding-0">
                <li>
                  <Link href={getFilterUrl("")} className={`govuk-link ${selectedType === "" ? 'govuk-!-font-weight-bold' : ''}`}>
                    All results
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Institution")} className={`govuk-link ${selectedType === "Institution" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Institutions &amp; Bodies
                  </Link>
                </li>
                <li><Link href={getFilterUrl("School")} className={`govuk-link ${selectedType === "School" ? "govuk-!-font-weight-bold" : ""}`}>Public schools</Link></li>
                <li><Link href={getFilterUrl("Document")} className={`govuk-link ${selectedType === "Document" ? "govuk-!-font-weight-bold" : ""}`}>Documents</Link></li>
                <li><Link href={getFilterUrl("Constitutional Article")} className={`govuk-link ${selectedType === "Constitutional Article" ? "govuk-!-font-weight-bold" : ""}`}>Constitutional articles</Link></li>
                {["County Law", "Subsidiary Legislation", "Treaty", "Cabinet Brief", "Presidential Speech", "Gazette Issue"].map(type => <li key={type}><Link href={getFilterUrl(type)} className={`govuk-link ${selectedType === type ? "govuk-!-font-weight-bold" : ""}`}>{type}</Link></li>)}
                <li>
                  <Link href={getFilterUrl("Leader")} className={`govuk-link ${selectedType === "Leader" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Leaders &amp; Profiles
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Official")} className={`govuk-link ${selectedType === "Official" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Public Officials
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("County")} className={`govuk-link ${selectedType === "County" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Counties
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Constituency")} className={`govuk-link ${selectedType === "Constituency" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Constituencies
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Ward")} className={`govuk-link ${selectedType === "Ward" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Wards
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Political Party")} className={`govuk-link ${selectedType === "Political Party" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Political Parties
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Guide")} className={`govuk-link ${selectedType === "Guide" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Guides &amp; How-to
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Service")} className={`govuk-link ${selectedType === "Service" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Public Services
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("News")} className={`govuk-link ${selectedType === "News" ? 'govuk-!-font-weight-bold' : ''}`}>
                    News &amp; Updates
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Presidential Trip")} className={`govuk-link ${selectedType === "Presidential Trip" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Presidential Trips
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Act of Parliament")} className={`govuk-link ${selectedType === "Act of Parliament" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Acts &amp; Laws
                  </Link>
                </li>
                <li>
                  <Link href={getFilterUrl("Page")} className={`govuk-link ${selectedType === "Page" ? 'govuk-!-font-weight-bold' : ''}`}>
                    Site pages
                  </Link>
                </li>
              </ul>
          </div>

          <div className="govuk-grid-column-two-thirds">
            {errorMsg ? (
              <div className="govuk-error-summary" aria-labelledby="error-summary-title" role="alert" tabIndex={-1}>
                <h2 className="govuk-error-summary__title" id="error-summary-title">There is a problem</h2>
                <div className="govuk-error-summary__body">
                  <p className="govuk-body">Search is temporarily unavailable. Try again in a few minutes.</p>
                  <p className="govuk-body-s">{errorMsg}</p>
                </div>
              </div>
            ) : q ? (
              <>
                <h2 className="govuk-heading-m govuk-!-margin-bottom-2" aria-live="polite">
                  {allResults.length === 100 ? "Top 100" : allResults.length} result{allResults.length !== 1 ? "s" : ""} for <strong>“{q}”</strong>
                </h2>

                {partialFailure && results.length > 0 && (
                  <div className="govuk-inset-text govuk-!-margin-bottom-4">
                    Some search sources were slow or unavailable. Showing the best matches we could load.
                  </div>
                )}

                {results.length > 0 && results[0]?.rank != null && results[0].rank < 0.3 && (
                  <div className="govuk-inset-text govuk-!-margin-bottom-4">
                    Showing lower confidence matches for “{q}”. Try a different spelling or a more specific term.
                  </div>
                )}

                {results.length > 0 ? (
                  <><ul className="govuk-list govuk-!-margin-top-0">
                    {results.map((item, idx) => (
                      <li
                        key={`${item.id || item.slug || item.path}-${idx}`}
                        className="govuk-!-padding-top-3 govuk-!-padding-bottom-3 app-search-result"
                      >
                        <span className="govuk-caption-m govuk-!-font-size-14 govuk-!-font-weight-bold govuk-!-display-block govuk-!-margin-bottom-1">
                          {item.entity_type}
                        </span>
                        <h3 className="govuk-heading-m govuk-!-margin-0">
                          <Link
                            href={resultHref(item)}
                            className="govuk-link govuk-!-font-weight-bold"
                          >
                            <span
                              dangerouslySetInnerHTML={{
                                __html: safeHtml(highlight(item.name, q)),
                              }}
                            />
                          </Link>
                        </h3>
                        {item.snippet && (
                          <p
                            className="govuk-body-s govuk-!-margin-top-1 govuk-!-margin-bottom-0 truncate-2-lines"
                            dangerouslySetInnerHTML={{
                              __html: safeHtml(highlight(item.snippet, q)),
                            }}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                  {allResults.length > 20 && <nav aria-label="Search result pages" className="govuk-!-margin-top-5"><p className="govuk-body">Page {page} of {Math.ceil(allResults.length / 20)}</p>{page > 1 && <Link className="govuk-button govuk-button--secondary govuk-!-margin-right-3" href={getFilterUrl(selectedType) + `&page=${page - 1}`}>Previous results</Link>}{page * 20 < allResults.length && <Link className="govuk-button govuk-button--secondary" href={getFilterUrl(selectedType) + `&page=${page + 1}`}>Next results</Link>}</nav>}
                  </>
                ) : (
                  <div className="govuk-body govuk-!-margin-top-4">
                    <p>No matches found.</p>
                    <p className="govuk-body-s">
                      Try a shorter term or different spelling. Search supports
                      fuzzy matching across government data and site pages.
                    </p>
                    <p className="govuk-body-s">
                      Popular starting points:{" "}
                      <Link href="/services" className="govuk-link">Services</Link>
                      {", "}
                      <Link href="/elections" className="govuk-link">Elections</Link>
                      {", "}
                      <Link href="/constitution" className="govuk-link">Constitution</Link>
                      {", "}
                      <Link href="/government" className="govuk-link">Government</Link>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="govuk-body">
                <p>
                  Type a term to search institutions, leaders, counties, laws,
                  elections and guides.
                </p>
                <h2 className="govuk-heading-s">Popular searches</h2>
                <ul className="govuk-list govuk-list--bullet">
                  <li>
                    <Link href="/search?q=IEBC" className="govuk-link">IEBC</Link>
                  </li>
                  <li>
                    <Link href="/search?q=Constitution" className="govuk-link">
                      Constitution
                    </Link>
                  </li>
                  <li>
                    <Link href="/search?q=2027+election" className="govuk-link">
                      2027 election
                    </Link>
                  </li>
                  <li>
                    <Link href="/search?q=passport" className="govuk-link">
                      Passport
                    </Link>
                  </li>
                  <li>
                    <Link href="/search?q=Nairobi" className="govuk-link">
                      Nairobi County
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

      <style>{`
        .app-search-highlight {
          background-color: #ffdd00;
          color: #0b0c0c;
          padding: 0 2px;
          font-weight: 700;
        }
        .app-search-result {
          border-bottom: 1px solid #b1b4b6;
        }
        .app-search-result:last-child {
          border-bottom: 0;
        }
      `}</style>
  </>
);
}

