import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{
    noticeNumber: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { noticeNumber } = await params;
  const parsedNoticeNumber = Number.parseInt(noticeNumber, 10);

  if (Number.isNaN(parsedNoticeNumber)) {
    return {
      title: "Gazette notice not found",
    };
  }

  const supabase = await createClient();

  const { data: notice } = await supabase
    .from("gazette_notices")
    .select("notice_number, title")
    .eq("notice_number", parsedNoticeNumber)
    .maybeSingle();

  if (!notice) {
    return {
      title: "Gazette notice not found",
    };
  }

  return {
    title: `Gazette Notice No. ${notice.notice_number} | ${notice.title}`,
    description: `Read the accessible HTML transcription of Kenya Gazette Notice No. ${notice.notice_number}.`,
    alternates: {
      canonical: `/kenya-gazette/notice/${notice.notice_number}`,
    },
  };
}

export default async function GazetteNoticePage({
  params,
}: PageProps) {
  const { noticeNumber: noticeNumberStr } = await params;
  const noticeNumber = Number.parseInt(noticeNumberStr, 10);

  if (Number.isNaN(noticeNumber)) {
    notFound();
  }

  const supabase = await createClient();

  /*
   * Fetch the notice first.
   *
   * issue_id is deliberately included because it is the authoritative
   * relationship between a notice and its Gazette issue.
   */
  const { data: notice, error: noticeError } = await supabase
    .from("gazette_notices")
    .select(`
      id,
      issue_id,
      notice_number,
      title,
      notice_type,
      act_referenced,
      content_html
    `)
    .eq("notice_number", noticeNumber)
    .maybeSingle();

  if (noticeError || !notice || !notice.issue_id) {
    notFound();
  }

  /*
   * Fetch the parent Gazette issue explicitly.
   */
  const { data: issue, error: issueError } = await supabase
    .from("gazette_issues")
    .select(`
      id,
      year,
      volume,
      issue_number,
      date,
      pdf_url
    `)
    .eq("id", notice.issue_id)
    .single();

  if (issueError || !issue) {
    notFound();
  }

  const publishedDate = new Date(issue.date).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const breadcrumbs = [
    { text: "Home", href: "/" },
    { text: "Kenya Gazette", href: "/kenya-gazette" },
    {
      text: issue.year.toString(),
      href: `/kenya-gazette/${issue.year}`,
    },
    {
      text: `Vol. ${issue.volume} No. ${issue.issue_number}`,
      href: `/kenya-gazette/${issue.year}/${issue.issue_number}`,
    },
    { text: `Notice ${notice.notice_number}` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentDocument",
    name: `Kenya Gazette Notice No. ${notice.notice_number}: ${notice.title}`,
    headline: notice.title,
    datePublished: issue.date,
    identifier: `Gazette Notice No. ${notice.notice_number}`,
    isPartOf: {
      "@type": "PublicationIssue",
      name: `Kenya Gazette Vol. ${issue.volume} No. ${issue.issue_number}`,
      issueNumber: String(issue.issue_number),
      datePublished: issue.date,
    },
    publisher: {
      "@type": "GovernmentOrganization",
      name: "Government of Kenya",
    },
    url: `https://www.citizenguide.ke/kenya-gazette/notice/${notice.notice_number}`,
  };

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={breadcrumbs} />

      <main
        className="govuk-main-wrapper"
        id="main-content"
        role="main"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />

        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">
              Gazette Notice No. {notice.notice_number}
            </span>

            <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
              {notice.title}
            </h1>

            <div className="govuk-!-margin-bottom-6">
              {notice.notice_type && (
                <strong className="govuk-tag govuk-tag--blue govuk-!-margin-right-2">
                  {notice.notice_type}
                </strong>
              )}

              <span className="govuk-body-l govuk-!-margin-bottom-0 govuk-!-display-inline-block">
                Published: {publishedDate}
              </span>
            </div>

            {issue.pdf_url && (
              <div className="govuk-!-margin-bottom-6">
                <a
                  href={issue.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="govuk-button govuk-button--secondary govuk-!-margin-bottom-0"
                  data-module="govuk-button"
                >
                  View official Gazette PDF
                </a>
              </div>
            )}

            <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l" />

            <dl className="govuk-summary-list govuk-!-margin-bottom-8">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  Gazette issue
                </dt>
                <dd className="govuk-summary-list__value">
                  Vol. {issue.volume}, No. {issue.issue_number}
                </dd>
              </div>

              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  Published
                </dt>
                <dd className="govuk-summary-list__value">
                  {publishedDate}
                </dd>
              </div>

              {notice.act_referenced && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Legal basis
                  </dt>
                  <dd className="govuk-summary-list__value">
                    {notice.act_referenced}
                  </dd>
                </div>
              )}

              {notice.notice_type && (
                <div className="govuk-summary-list__row">
                  <dt className="govuk-summary-list__key">
                    Notice type
                  </dt>
                  <dd className="govuk-summary-list__value">
                    {notice.notice_type}
                  </dd>
                </div>
              )}
            </dl>

            <h2 className="govuk-heading-l">
              Full notice
            </h2>

            {notice.content_html ? (
              <article
                className="gazette-notice-content"
                dangerouslySetInnerHTML={{
                  __html: notice.content_html,
                }}
              />
            ) : (
              <div className="govuk-inset-text">
                The HTML transcription of this notice is still being
                prepared. Refer to the official Gazette PDF above.
              </div>
            )}

            <hr className="govuk-section-break govuk-section-break--visible govuk-section-break--l govuk-!-margin-top-8" />

            <div className="govuk-inset-text">
              <h2 className="govuk-heading-s govuk-!-margin-top-0">
                Source and citation
              </h2>

              <p className="govuk-body-s govuk-!-margin-bottom-2">
                Source: Kenya Gazette, Vol. {issue.volume}, No.{" "}
                {issue.issue_number}, Gazette Notice No.{" "}
                {notice.notice_number}, published {publishedDate}.
              </p>

              <p className="govuk-body-s govuk-!-margin-bottom-0">
                CitizenGuide.KE provides this HTML transcription to make
                the Gazette easier to search, read and reference. Where
                precision is legally important, verify the wording
                against the official Gazette PDF.
              </p>
            </div>

            <Link
              href={`/kenya-gazette/${issue.year}/${issue.issue_number}`}
              className="govuk-back-link"
            >
              Back to this Gazette issue
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}