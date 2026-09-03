// app/kenya-gazette/[year]/[issueNumber]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ year: string; issueNumber: string }> }) {
  const { year, issueNumber } = await params;
  return {
    title: `Kenya Gazette Vol. ${year} No. ${issueNumber}`,
    description: `View all legal notices, appointments, and land registrations published in Kenya Gazette Vol. ${year} No. ${issueNumber}.`,
  };
}

export default async function GazetteIssuePage({ params }: { params: Promise<{ year: string; issueNumber: string }> }) {
  const { year: yearStr, issueNumber: issueNumberStr } = await params;
  const year = parseInt(yearStr, 10);
  const issueNumber = parseInt(issueNumberStr, 10);

  if (isNaN(year) || isNaN(issueNumber)) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch the issue details
  const { data: issue, error: issueError } = await supabase
    .from("gazette_issues")
    .select("id, year, volume, issue_number, date, pdf_url")
    .eq("year", year)
    .eq("issue_number", issueNumber)
    .single();

  if (issueError || !issue) {
    notFound();
  }

  // Fetch all notices for this issue
  const { data: notices } = await supabase
    .from("gazette_notices")
    .select("id, notice_number, title, notice_type, act_referenced")
    .eq("issue_id", issue.id)
    .order("notice_number", { ascending: true });

  const breadcrumbs = [
    { text: "Home", href: "/" },
    { text: "Kenya Gazette", href: "/kenya-gazette" },
    { text: year.toString(), href: `/kenya-gazette/${year}` },
    { text: `Vol. ${issue.volume} No. ${issue.issue_number}` },
  ];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={breadcrumbs} />
      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">
              Published {new Date(issue.date).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-6">
              Kenya Gazette Vol. {issue.volume} No. {issue.issue_number}
            </h1>

            <div className="govuk-!-margin-bottom-6">
              {issue.pdf_url && (
                <a href={issue.pdf_url} target="_blank" rel="noopener noreferrer" className="govuk-button govuk-!-margin-bottom-0" data-module="govuk-button">
                  Download Official PDF ↓
                </a>
              )}
            </div>

            <h2 className="govuk-heading-l">Notices in this issue</h2>
            <p className="govuk-body">
              There are {notices?.length || 0} notices published in this issue. Click on a notice to view the full parsed text.
            </p>

            {notices && notices.length > 0 ? (
              <dl className="govuk-summary-list">
                {notices.map((notice: any) => (
                  <div key={notice.id} className="govuk-summary-list__row">
                    <dt className="govuk-summary-list__key">
                      <Link href={`/kenya-gazette/notice/${notice.notice_number}`} className="govuk-link">
                        Notice No. {notice.notice_number}
                      </Link>
                    </dt>
                    <dd className="govuk-summary-list__value">
                      <p className="govuk-body govuk-!-margin-bottom-1">{notice.title}</p>
                      <p className="govuk-hint govuk-!-margin-bottom-0">
                        {notice.notice_type} {notice.act_referenced && `• ${notice.act_referenced}`}
                      </p>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="govuk-inset-text">
                <p className="govuk-body">No individual notices have been parsed for this issue yet. Please refer to the official PDF.</p>
              </div>
            )}

            <Link href={`/kenya-gazette/${year}`} className="govuk-back-link">
              Back to {year} Archive
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}