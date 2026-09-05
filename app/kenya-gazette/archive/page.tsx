import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GazetteSearchForm from "@/components/gazette/GazetteSearchForm";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Kenya Gazette full archive",
  description:
    "Browse Kenya Gazette issues from 1986 to the present and search parsed Gazette notices.",
  alternates: {
    canonical: "/kenya-gazette/archive",
  },
};

type SearchParams = Promise<{
  year?: string;
  page?: string;
}>;

export default async function GazetteArchivePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const currentPage = Math.max(
    Number.parseInt(
      params.page || "1",
      10
    ) || 1,
    1
  );

  const selectedYear = params.year
    ? Number.parseInt(
        params.year,
        10
      )
    : undefined;

  const pageSize = 30;

  const from =
    (currentPage - 1) *
    pageSize;

  const to =
    from +
    pageSize -
    1;

  const supabase =
    await createClient();

  let query = supabase
    .from("gazette_issues")
    .select(
      `
        id,
        year,
        volume,
        issue_number,
        date,
        pdf_url,
        official_source_url,
        is_special_issue,
        notice_count:gazette_notices(count)
      `,
      {
        count: "exact",
      }
    )
    .order(
      "date",
      {
        ascending: false,
      }
    )
    .order(
      "issue_number",
      {
        ascending: false,
      }
    );

  if (
    typeof selectedYear ===
      "number" &&
    !Number.isNaN(
      selectedYear
    )
  ) {
    query =
      query.eq(
        "year",
        selectedYear
      );
  }

  const {
    data: issues,
    count,
    error,
  } =
    await query.range(
      from,
      to
    );

  const totalPages =
    Math.max(
      Math.ceil(
        (count || 0) /
          pageSize
      ),
      1
    );

  const currentYear =
    new Date().getFullYear();

  const breadcrumbs = [
    {
      text: "Home",
      href: "/",
    },
    {
      text: "Kenya Gazette",
      href: "/kenya-gazette",
    },
    {
      text: "Full archive",
    },
  ];

  function pageHref(
    page: number
  ) {
    const queryParams =
      new URLSearchParams();

    if (selectedYear) {
      queryParams.set(
        "year",
        String(selectedYear)
      );
    }

    queryParams.set(
      "page",
      String(page)
    );

    return `/kenya-gazette/archive?${queryParams.toString()}`;
  }

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={breadcrumbs}
      />

      <main
        className="govuk-main-wrapper"
        id="main-content"
        role="main"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            <div className="govuk-!-margin-bottom-6">
              <h2 className="govuk-heading-m">
                Filter archive
              </h2>

              <form
                action="/kenya-gazette/archive"
                method="get"
              >
                <div className="govuk-form-group">
                  <label
                    className="govuk-label"
                    htmlFor="filter-year"
                  >
                    Year
                  </label>

                  <select
                    className="govuk-select govuk-!-width-full"
                    id="filter-year"
                    name="year"
                    defaultValue={
                      params.year ||
                      ""
                    }
                  >
                    <option value="">
                      All years
                    </option>

                    {Array.from(
                      {
                        length:
                          currentYear -
                          1986 +
                          1,
                      },
                      (
                        _,
                        index
                      ) =>
                        currentYear -
                        index
                    ).map(
                      (year) => (
                        <option
                          key={
                            year
                          }
                          value={
                            year
                          }
                        >
                          {year}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <button
                  type="submit"
                  className="govuk-button"
                >
                  Apply filter
                </button>

                {params.year && (
                  <p className="govuk-body">
                    <Link
                      href="/kenya-gazette/archive"
                      className="govuk-link"
                    >
                      Clear filter
                    </Link>
                  </p>
                )}
              </form>
            </div>
          </div>

          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">
              Archive
            </span>

            <h1 className="govuk-heading-xl">
              Kenya Gazette
              archive
            </h1>

            <p className="govuk-body">
              Browse Kenya Gazette
              issues from 1986 to
              the present. CitizenGuide
              provides searchable HTML
              versions of parsed
              notices and links each
              issue to its official
              source where available.
            </p>

            <GazetteSearchForm
              inputId="gazette-archive-search"
              year={selectedYear}
              heading={
                selectedYear
                  ? `Search Gazette notices from ${selectedYear}`
                  : "Search all Gazette notices"
              }
            />

            {error ? (
              <div
                className="govuk-error-summary"
                data-module="govuk-error-summary"
              >
                <div role="alert">
                  <h2 className="govuk-error-summary__title">
                    There is a
                    problem
                  </h2>

                  <div className="govuk-error-summary__body">
                    The Gazette
                    archive could
                    not be loaded.
                  </div>
                </div>
              </div>
            ) : issues &&
              issues.length >
                0 ? (
              <>
                <div
                  className="gazette-table-scroll"
                  role="region"
                  aria-label="Gazette archive results"
                  tabIndex={0}
                >
                  <table className="govuk-table">
                    <thead className="govuk-table__head">
                      <tr className="govuk-table__row">
                        <th
                          scope="col"
                          className="govuk-table__header"
                        >
                          Date
                        </th>

                        <th
                          scope="col"
                          className="govuk-table__header"
                        >
                          Gazette
                          issue
                        </th>

                        <th
                          scope="col"
                          className="govuk-table__header"
                        >
                          Parsed
                          notices
                        </th>

                        <th
                          scope="col"
                          className="govuk-table__header"
                        >
                          Links
                        </th>
                      </tr>
                    </thead>

                    <tbody className="govuk-table__body">
                      {issues.map(
                        (
                          issue: any
                        ) => (
                          <tr
                            key={
                              issue.id
                            }
                            className="govuk-table__row"
                          >
                            <td className="govuk-table__cell">
                              <Link
                                href={`/kenya-gazette/${issue.year}/${issue.issue_number}`}
                                className="govuk-link govuk-!-font-weight-bold"
                              >
                                {new Date(
                                  issue.date
                                ).toLocaleDateString(
                                  "en-KE",
                                  {
                                    day: "numeric",
                                    month:
                                      "short",
                                    year: "numeric",
                                  }
                                )}
                              </Link>
                            </td>

                            <td className="govuk-table__cell">
                              <div>
                                Vol.{" "}
                                {
                                  issue.volume
                                }
                                , No.{" "}
                                {
                                  issue.issue_number
                                }
                              </div>

                              {issue.is_special_issue && (
                                <div className="govuk-!-margin-top-2">
                                  <strong className="govuk-tag govuk-tag--blue">
                                    Special
                                    Issue
                                  </strong>
                                </div>
                              )}
                            </td>

                            <td className="govuk-table__cell">
                              {
                                issue
                                  .notice_count?.[0]
                                  ?.count ||
                                0
                              }
                            </td>

                            <td className="govuk-table__cell">
                              <Link
                                href={`/kenya-gazette/${issue.year}/${issue.issue_number}`}
                                className="govuk-link"
                              >
                                View
                                notices
                              </Link>

                              {issue.official_source_url && (
                                <>
                                  <br />

                                  <a
                                    href={
                                      issue.official_source_url
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="govuk-link"
                                  >
                                    Official
                                    source
                                    on Kenya
                                    Law
                                  </a>
                                </>
                              )}

                              {issue.pdf_url && (
                                <>
                                  <br />

                                  <a
                                    href={
                                      issue.pdf_url
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="govuk-link"
                                  >
                                    Official
                                    PDF
                                  </a>
                                </>
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {totalPages >
                  1 && (
                  <nav
                    className="govuk-pagination"
                    role="navigation"
                    aria-label="Archive pagination"
                  >
                    {currentPage >
                      1 && (
                      <div className="govuk-pagination__prev">
                        <Link
                          className="govuk-link govuk-pagination__link"
                          href={pageHref(
                            currentPage -
                              1
                          )}
                          rel="prev"
                        >
                          <span className="govuk-pagination__link-title govuk-pagination__link-title--decorated">
                            Previous
                          </span>
                        </Link>
                      </div>
                    )}

                    <p className="govuk-body govuk-!-margin-bottom-0 gazette-pagination-summary">
                      Page{" "}
                      {
                        currentPage
                      }{" "}
                      of{" "}
                      {
                        totalPages
                      }
                    </p>

                    {currentPage <
                      totalPages && (
                      <div className="govuk-pagination__next">
                        <Link
                          className="govuk-link govuk-pagination__link"
                          href={pageHref(
                            currentPage +
                              1
                          )}
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
            ) : (
              <div className="govuk-inset-text">
                No Gazette issues
                match this filter.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}