import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GazetteSearchForm from "@/components/gazette/GazetteSearchForm";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Search the Kenya Gazette",
  description: "Search accessible Kenya Gazette notice transcriptions.",
  robots: {
    index: false,
    follow: true,
  },
};

type SearchParams = Promise<{
  q?: string;
  year?: string;
  issueNumber?: string;
  page?: string;
}>;

type SearchResult = {
  id: string;
  issue_id: string;
  notice_number: number;
  title: string;
  notice_type: string | null;
  act_referenced: string | null;
  year: number;
  volume: string;
  issue_number: number;
  issue_date: string;
  rank: number;
  total_count: number;
};

export default async function GazetteSearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const year = params.year ? Number.parseInt(params.year, 10) : undefined;
  const issueNumber = params.issueNumber
    ? Number.parseInt(params.issueNumber, 10)
    : undefined;
  const currentPage = Math.max(Number.parseInt(params.page || "1", 10) || 1, 1);
  const pageSize = 25;
  const offset = (currentPage - 1) * pageSize;

  let results: SearchResult[] = [];
  let errorMessage = "";

  if (q) {
    const supabase = await createClient();

    const { data, error } = await (supabase as any).rpc("search_gazette_notices", {
      search_query: q,
      filter_year: typeof year === "number" && !Number.isNaN(year) ? year : null,
      filter_issue_number:
        typeof issueNumber === "number" && !Number.isNaN(issueNumber)
          ? issueNumber
          : null,
      result_limit: pageSize,
      result_offset: offset,
    });

    if (error) {
      console.error("Gazette search failed:", error);
      errorMessage = "Search is temporarily unavailable.";
    } else {
      results = (data || []) as SearchResult[];
    }
  }

  const total = results[0]?.total_count ?? 0;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  function pageHref(page: number) {
    const next = new URLSearchParams({ q, page: String(page) });
    if (year) next.set("year", String(year));
    if (issueNumber) next.set("issueNumber", String(issueNumber));
    return `/kenya-gazette/search?${next.toString()}`;
  }

  const breadcrumbs = [
    { text: "Home", href: "/" },
    { text: "Kenya Gazette", href: "/kenya-gazette" },
    { text: "Search" },
  ];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={breadcrumbs} />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <h1 className="govuk-heading-xl">Search the Kenya Gazette</h1>

            <GazetteSearchForm
              inputId="gazette-search-page-input"
              defaultValue={q}
              year={year}
              issueNumber={issueNumber}
            />

            {errorMessage ? (
              <div className="govuk-error-summary" data-module="govuk-error-summary">
                <div role="alert">
                  <h2 className="govuk-error-summary__title">There is a problem</h2>
                  <div className="govuk-error-summary__body">{errorMessage}</div>
                </div>
              </div>
            ) : !q ? (
              <div className="govuk-inset-text">
                Enter a notice number, name, organisation, law, location or phrase.
              </div>
            ) : (
              <>
                <h2 className="govuk-heading-l">
                  {total === 0
                    ? "No results"
                    : `${total.toLocaleString("en-KE")} ${total === 1 ? "result" : "results"}`}
                </h2>

                {(year || issueNumber) && (
                  <p className="govuk-body">
                    Search scope:{" "}
                    {year && <strong>{year}</strong>}
                    {year && issueNumber && ", "}
                    {issueNumber && <strong>Issue {issueNumber}</strong>}
                    {" · "}
                    <Link
                      className="govuk-link"
                      href={`/kenya-gazette/search?q=${encodeURIComponent(q)}`}
                    >
                      Search all Gazette notices
                    </Link>
                  </p>
                )}

                {results.length > 0 && (
                  <ol className="govuk-list">
                    {results.map((result) => (
                      <li key={result.id} className="govuk-!-margin-bottom-6">
                        <h3 className="govuk-heading-m govuk-!-margin-bottom-1">
                          <Link
                            className="govuk-link"
                            href={`/kenya-gazette/${result.year}/${result.issue_number}/notice/${result.notice_number}`}
                          >
                            Gazette Notice No. {result.notice_number}: {result.title}
                          </Link>
                        </h3>
                        <p className="govuk-body-s govuk-!-margin-bottom-1 gazette-result-meta">
                          Kenya Gazette Vol. {result.volume}, No. {result.issue_number} ·{" "}
                          {new Date(result.issue_date).toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                        {(result.notice_type || result.act_referenced) && (
                          <p className="govuk-body-s govuk-!-margin-bottom-0">
                            {[result.notice_type, result.act_referenced]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}

                {totalPages > 1 && (
                  <nav className="govuk-pagination" aria-label="Search result pages">
                    {currentPage > 1 && (
                      <div className="govuk-pagination__prev">
                        <Link
                          className="govuk-link govuk-pagination__link"
                          href={pageHref(currentPage - 1)}
                          rel="prev"
                        >
                          <span className="govuk-pagination__link-title govuk-pagination__link-title--decorated">
                            Previous
                          </span>
                        </Link>
                      </div>
                    )}

                    <p className="govuk-body govuk-!-margin-bottom-0">
                      Page {currentPage} of {totalPages}
                    </p>

                    {currentPage < totalPages && (
                      <div className="govuk-pagination__next">
                        <Link
                          className="govuk-link govuk-pagination__link"
                          href={pageHref(currentPage + 1)}
                          rel="next"
                        >
                          <span className="govuk-pagination__link-title govuk-pagination__link-title--decorated">
                            Next
                          </span>
                        </Link>
                      </div>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
