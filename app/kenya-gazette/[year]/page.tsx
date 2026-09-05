import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GazetteSearchForm from "@/components/gazette/GazetteSearchForm";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{
    year: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { year } =
    await params;

  return {
    title: `Kenya Gazette Archive ${year}`,
    description: `Browse and search Kenya Gazette issues and notices published in ${year}.`,
    alternates: {
      canonical: `/kenya-gazette/${year}`,
    },
  };
}

export default async function GazetteYearPage({
  params,
}: PageProps) {
  const {
    year: yearStr,
  } = await params;

  const year =
    Number.parseInt(
      yearStr,
      10
    );

  const currentYear =
    new Date().getFullYear();

  if (
    Number.isNaN(year) ||
    year < 1986 ||
    year > currentYear
  ) {
    notFound();
  }

  const supabase =
    await createClient();

  const {
    data: issues,
    error,
  } = await supabase
    .from("gazette_issues")
    .select(`
      id,
      year,
      volume,
      issue_number,
      date,
      pdf_url,
      official_source_url,
      is_special_issue,
      notice_count:gazette_notices(count)
    `)
    .eq(
      "year",
      year
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

  if (error) {
    console.error(
      "Gazette year query failed:",
      error
    );
  }

  const safeIssues =
    issues ?? [];

  const groupedIssues =
    safeIssues.reduce<
      Record<
        string,
        any[]
      >
    >(
      (
        acc,
        issue
      ) => {
        const date =
          new Date(
            issue.date
          );

        const monthYear =
          date.toLocaleString(
            "en-KE",
            {
              month:
                "long",
              year: "numeric",
            }
          );

        if (
          !acc[
            monthYear
          ]
        ) {
          acc[
            monthYear
          ] = [];
        }

        acc[
          monthYear
        ].push(
          issue
        );

        return acc;
      },
      {}
    );

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
      text:
        year.toString(),
    },
  ];

  const nearbyYears =
    Array.from(
      new Set(
        [
          year - 2,
          year - 1,
          year,
          year + 1,
          year + 2,
        ].filter(
          (
            value
          ) =>
            value >=
              1986 &&
            value <=
              currentYear
        )
      )
    ).sort(
      (
        a,
        b
      ) =>
        b - a
    );

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs
        items={
          breadcrumbs
        }
      />

      <main
        className="govuk-main-wrapper"
        id="main-content"
        role="main"
      >
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">
              Archive
            </span>

            <h1 className="govuk-heading-xl govuk-!-margin-bottom-6">
              Kenya Gazette{" "}
              {year}
            </h1>

            <p className="govuk-body">
              Browse Gazette
              issues published
              in {year}, or
              search within
              notices from this
              year.
            </p>

            <p className="govuk-body">
              Where available,
              each issue includes
              a direct link to
              the official
              Gazette source for
              independent
              verification.
            </p>

            <GazetteSearchForm
              inputId={`gazette-year-${year}-search`}
              year={year}
              heading={`Search Gazette notices from ${year}`}
            />

            {Object.keys(
              groupedIssues
            ).length ===
            0 ? (
              <div className="govuk-inset-text">
                No Gazette
                issues have
                been added for{" "}
                {year} yet.
              </div>
            ) : (
              <div className="govuk-!-margin-bottom-8">
                {Object.entries(
                  groupedIssues
                ).map(
                  ([
                    monthYear,
                    monthIssues,
                  ]) => (
                    <details
                      key={
                        monthYear
                      }
                      className="govuk-details govuk-!-margin-bottom-4"
                      open
                    >
                      <summary className="govuk-details__summary">
                        <span className="govuk-details__summary-text">
                          {
                            monthYear
                          }{" "}
                          (
                          {
                            monthIssues.length
                          }{" "}
                          issues)
                        </span>
                      </summary>

                      <div className="govuk-details__text">
                        <div
                          className="gazette-table-scroll"
                          role="region"
                          aria-label={`${monthYear} Gazette issues`}
                          tabIndex={
                            0
                          }
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
                              {monthIssues.map(
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
                                              "long",
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
                                        ,
                                        No.{" "}
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
                                        className="govuk-link govuk-!-font-weight-bold"
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
                                            on
                                            Kenya
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
                      </div>
                    </details>
                  )
                )}
              </div>
            )}

            <Link
              href="/kenya-gazette/archive"
              className="govuk-back-link"
            >
              Back to full
              Gazette archive
            </Link>
          </div>

          <div className="govuk-grid-column-one-third">
            <nav aria-labelledby="browse-years-heading">
              <h2
                id="browse-years-heading"
                className="govuk-heading-m"
              >
                Browse nearby
                years
              </h2>

              <ul className="govuk-list">
                {nearbyYears.map(
                  (
                    otherYear
                  ) => (
                    <li
                      key={
                        otherYear
                      }
                    >
                      {otherYear ===
                      year ? (
                        <strong>
                          {
                            otherYear
                          }
                        </strong>
                      ) : (
                        <Link
                          className="govuk-link"
                          href={`/kenya-gazette/${otherYear}`}
                        >
                          {
                            otherYear
                          }
                        </Link>
                      )}
                    </li>
                  )
                )}

                <li className="govuk-!-margin-top-3">
                  <Link
                    className="govuk-link"
                    href="/kenya-gazette/archive"
                  >
                    View all
                    years
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </main>
    </div>
  );
}