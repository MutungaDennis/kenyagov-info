import type { Metadata } from "next";
import {
  notFound,
} from "next/navigation";
import Link from "next/link";

import {
  createClient,
} from "@/lib/supabase/server";

import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";
import GazetteSearchForm from "@/components/gazette/GazetteSearchForm";
import NoticeTextSearch from "@/components/gazette/NoticeTextSearch";
import CopyNoticeButton from "@/components/gazette/CopyNoticeButton";
import GazetteNoticeContext from "@/components/gazette/GazetteNoticeContext";
import GazetteLinkedContent from "@/components/gazette/GazetteLinkedContent";
import { getGazetteNoticeContext } from "@/lib/gazette/get-notice-context";

export const revalidate =
  3600;

type PageProps = {
  params: Promise<{
    year: string;
    issueNumber: string;
    noticeNumber: string;
  }>;
};

async function getIssueAndNotice(
  year: number,
  issueNumber: number,
  noticeNumber: number
) {
  const supabase =
    await createClient();

  const {
    data: issue,
    error: issueError,
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
      is_special_issue
    `)
    .eq(
      "year",
      year
    )
    .eq(
      "issue_number",
      issueNumber
    )
    .maybeSingle();

  if (
    issueError ||
    !issue
  ) {
    return null;
  }

  const {
    data: notice,
    error: noticeError,
  } = await supabase
    .from("gazette_notices")
    .select(`
      id,
      issue_id,
      notice_number,
      title,
      notice_type,
      act_referenced,
      content_html,
      source_page_start,
      source_page_end
    `)
    .eq(
      "issue_id",
      issue.id
    )
    .eq(
      "notice_number",
      noticeNumber
    )
    .maybeSingle();

  if (
    noticeError ||
    !notice
  ) {
    return null;
  }

  return {
    issue,
    notice,
    supabase,
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const {
    year: yearStr,
    issueNumber:
      issueNumberStr,
    noticeNumber:
      noticeNumberStr,
  } = await params;

  const year =
    Number.parseInt(
      yearStr,
      10
    );

  const issueNumber =
    Number.parseInt(
      issueNumberStr,
      10
    );

  const noticeNumber =
    Number.parseInt(
      noticeNumberStr,
      10
    );

  if (
    [
      year,
      issueNumber,
      noticeNumber,
    ].some(
      Number.isNaN
    )
  ) {
    return {
      title:
        "Gazette notice not found",
    };
  }

  const result =
    await getIssueAndNotice(
      year,
      issueNumber,
      noticeNumber
    );

  if (!result) {
    return {
      title:
        "Gazette notice not found",
    };
  }

  const {
    issue,
    notice,
  } = result;

  const canonical =
    `/kenya-gazette/${issue.year}/${issue.issue_number}/notice/${notice.notice_number}`;

  return {
    title:
      `Gazette Notice No. ${notice.notice_number} | ${notice.title}`,

    description:
      `Read, search and copy the accessible HTML transcription of Kenya Gazette Notice No. ${notice.notice_number}.`,

    alternates: {
      canonical,
    },

    openGraph: {
      type: "article",

      title:
        `Gazette Notice No. ${notice.notice_number}: ${notice.title}`,

      description:
        `Accessible HTML transcription of Kenya Gazette Notice No. ${notice.notice_number}.`,

      url:
        canonical,

      publishedTime:
        new Date(
          issue.date
        ).toISOString(),
    },
  };
}

export default async function GazetteNoticePage({
  params,
}: PageProps) {
  const {
    year: yearStr,
    issueNumber:
      issueNumberStr,
    noticeNumber:
      noticeNumberStr,
  } = await params;

  const year =
    Number.parseInt(
      yearStr,
      10
    );

  const issueNumber =
    Number.parseInt(
      issueNumberStr,
      10
    );

  const noticeNumber =
    Number.parseInt(
      noticeNumberStr,
      10
    );

  if (
    [
      year,
      issueNumber,
      noticeNumber,
    ].some(
      Number.isNaN
    )
  ) {
    notFound();
  }

  const result =
    await getIssueAndNotice(
      year,
      issueNumber,
      noticeNumber
    );

  if (!result) {
    notFound();
  }

  const {
    issue,
    notice,
    supabase,
  } = result;

  const [
    {
      data:
        previousRows,
    },
    {
      data:
        nextRows,
    },
  ] =
    await Promise.all([
      supabase
        .from(
          "gazette_notices"
        )
        .select(
          "notice_number, title"
        )
        .eq(
          "issue_id",
          issue.id
        )
        .lt(
          "notice_number",
          notice.notice_number
        )
        .order(
          "notice_number",
          {
            ascending:
              false,
          }
        )
        .limit(1),

      supabase
        .from(
          "gazette_notices"
        )
        .select(
          "notice_number, title"
        )
        .eq(
          "issue_id",
          issue.id
        )
        .gt(
          "notice_number",
          notice.notice_number
        )
        .order(
          "notice_number",
          {
            ascending:
              true,
          }
        )
        .limit(1),
    ]);

  const previousNotice =
    previousRows?.[0];

  const nextNotice =
    nextRows?.[0];

  const noticeContext =
    await getGazetteNoticeContext(notice.id);

  const publishedDate =
    new Date(
      issue.date
    ).toLocaleDateString(
      "en-KE",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  const canonicalUrl =
    `https://www.citizenguide.ke/kenya-gazette/${issue.year}/${issue.issue_number}/notice/${notice.notice_number}`;

  const issueLabel =
    `Kenya Gazette Vol. ${issue.volume} No. ${issue.issue_number}`;

  const breadcrumbs = [
    {
      text: "Home",
      href: "/",
    },

    {
      text:
        "Kenya Gazette",
      href:
        "/kenya-gazette",
    },

    {
      text:
        issue.year.toString(),

      href:
        `/kenya-gazette/${issue.year}`,
    },

    {
      text:
        `Vol. ${issue.volume} No. ${issue.issue_number}`,

      href:
        `/kenya-gazette/${issue.year}/${issue.issue_number}`,
    },

    {
      text:
        `Notice ${notice.notice_number}`,
    },
  ];

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
              Gazette Notice
              No.{" "}
              {
                notice.notice_number
              }
            </span>

            <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
              {
                notice.title
              }
            </h1>

            {issue.is_special_issue && (
              <p className="govuk-!-margin-bottom-4">
                <strong className="govuk-tag govuk-tag--blue">
                  Special
                  Issue
                </strong>
              </p>
            )}

            <p className="govuk-body-l">
              Published{" "}
              {
                publishedDate
              }
            </p>

            <dl className="govuk-summary-list govuk-!-margin-bottom-6">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  Gazette issue
                </dt>

                <dd className="govuk-summary-list__value">
                  <Link
                    href={`/kenya-gazette/${issue.year}/${issue.issue_number}`}
                    className="govuk-link"
                  >
                    Vol.{" "}
                    {
                      issue.volume
                    }
                    , No.{" "}
                    {
                      issue.issue_number
                    }
                  </Link>
                </dd>
              </div>

              {notice.notice_type && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Notice
                    type
                  </dt>

                  <dd className="govuk-summary-list__value">
                    {
                      notice.notice_type
                    }
                  </dd>
                </div>
              )}

              {notice.act_referenced && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Legal
                    basis
                  </dt>

                  <dd className="govuk-summary-list__value">
                    {
                      notice.act_referenced
                    }
                  </dd>
                </div>
              )}

              {(notice.source_page_start ||
                notice.source_page_end) && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Source
                    pages
                  </dt>

                  <dd className="govuk-summary-list__value">
                    {notice.source_page_start &&
                    notice.source_page_end
                      ? `${notice.source_page_start}–${notice.source_page_end}`
                      : notice.source_page_start ||
                        notice.source_page_end}
                  </dd>
                </div>
              )}

              {issue.official_source_url && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Official
                    source
                  </dt>

                  <dd className="govuk-summary-list__value">
                    <a
                      href={
                        issue.official_source_url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="govuk-link"
                    >
                      View this
                      Gazette issue
                      on Kenya Law
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            <div className="govuk-button-group">
              {issue.official_source_url && (
                <a
                  href={
                    issue.official_source_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="govuk-button"
                >
                  View official
                  source
                </a>
              )}

              {issue.pdf_url && (
                <a
                  href={
                    issue.pdf_url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="govuk-button govuk-button--secondary"
                >
                  View official
                  PDF
                </a>
              )}
            </div>

            <GazetteSearchForm
              inputId={`issue-search-from-notice-${notice.notice_number}`}
              year={
                issue.year
              }
              issueNumber={
                issue.issue_number
              }
              heading="Search other notices in this issue"
              compact
            />

            <NoticeTextSearch />

            <div className="govuk-inset-text">
              <strong>
                About this
                transcription
              </strong>

              <br />

              CitizenGuide.KE
              provides this
              searchable HTML
              transcription to
              make Kenya Gazette
              information easier
              to find, read, copy
              and reference.
              Where exact wording
              or legal
              verification is
              required, refer to
              the official Gazette
              source.
            </div>
          </div>
        </div>

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <GazetteNoticeContext context={noticeContext} />
          </div>
        </div>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l" />

        <section
          aria-labelledby="full-notice-heading"
        >
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h2
                id="full-notice-heading"
                className="govuk-heading-l govuk-!-margin-bottom-3"
              >
                Full notice
              </h2>

              <CopyNoticeButton
                noticeNumber={
                  notice.notice_number
                }
                issueLabel={
                  issueLabel
                }
                publishedDate={
                  publishedDate
                }
                citizenGuideUrl={
                  canonicalUrl
                }
                officialSourceUrl={
                  issue.official_source_url
                }
              />
            </div>
          </div>

          {notice.content_html ? (
            <GazetteLinkedContent
              noticeId={notice.id}
              html={notice.content_html}
            />
          ) : (
            <div className="govuk-grid-row">
              <div className="govuk-grid-column-two-thirds">
                <div className="govuk-inset-text">
                  The HTML
                  transcription
                  of this notice
                  is still being
                  prepared. Refer
                  to the official
                  Gazette source.
                </div>
              </div>
            </div>
          )}
        </section>

        <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l govuk-!-margin-top-8" />

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            {(previousNotice ||
              nextNotice) && (
              <nav
                className="govuk-pagination govuk-pagination--block"
                aria-label="Adjacent Gazette notices"
              >
                {previousNotice && (
                  <div className="govuk-pagination__prev">
                    <Link
                      className="govuk-link govuk-pagination__link"
                      href={`/kenya-gazette/${issue.year}/${issue.issue_number}/notice/${previousNotice.notice_number}`}
                      rel="prev"
                    >
                      <span className="govuk-pagination__link-title govuk-pagination__link-title--decorated">
                        Previous
                        notice
                      </span>

                      <span className="govuk-pagination__link-label">
                        Notice{" "}
                        {
                          previousNotice.notice_number
                        }
                        :{" "}
                        {
                          previousNotice.title
                        }
                      </span>
                    </Link>
                  </div>
                )}

                {nextNotice && (
                  <div className="govuk-pagination__next">
                    <Link
                      className="govuk-link govuk-pagination__link"
                      href={`/kenya-gazette/${issue.year}/${issue.issue_number}/notice/${nextNotice.notice_number}`}
                      rel="next"
                    >
                      <span className="govuk-pagination__link-title govuk-pagination__link-title--decorated">
                        Next
                        notice
                      </span>

                      <span className="govuk-pagination__link-label">
                        Notice{" "}
                        {
                          nextNotice.notice_number
                        }
                        :{" "}
                        {
                          nextNotice.title
                        }
                      </span>
                    </Link>
                  </div>
                )}
              </nav>
            )}

            <div className="govuk-inset-text">
              <h2 className="govuk-heading-s govuk-!-margin-top-0">
                Cite this
                notice
              </h2>

              <p className="govuk-body-s govuk-!-margin-bottom-2">
                Kenya Gazette,
                Vol.{" "}
                {
                  issue.volume
                }{" "}
                No.{" "}
                {
                  issue.issue_number
                }
                , Gazette Notice
                No.{" "}
                {
                  notice.notice_number
                }
                , published{" "}
                {
                  publishedDate
                }
                .
              </p>

              <p className="govuk-body-s govuk-!-margin-bottom-2">
                CitizenGuide.KE
                transcription:
                <br />

                <a
                  href={
                    canonicalUrl
                  }
                  className="govuk-link"
                >
                  {
                    canonicalUrl
                  }
                </a>
              </p>

              {issue.official_source_url && (
                <p className="govuk-body-s govuk-!-margin-bottom-0">
                  Official
                  Gazette
                  source:
                  <br />

                  <a
                    href={
                      issue.official_source_url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="govuk-link"
                  >
                    Kenya Law
                  </a>
                </p>
              )}
            </div>

            <p className="govuk-body">
              <Link
                href="/corrections"
                className="govuk-link"
              >
                Report a
                transcription
                problem
              </Link>
            </p>

            <Link
              href={`/kenya-gazette/${issue.year}/${issue.issue_number}`}
              className="govuk-back-link"
            >
              Back to this
              Gazette issue
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}