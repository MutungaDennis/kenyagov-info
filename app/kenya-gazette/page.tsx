// app/kenya-gazette/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server"; // Adjust path to your actual Supabase server client
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import PageContents from "@/components/site/PageContents";

export const revalidate = 86400; // Cache for 24 hours

export const metadata: Metadata = {
  title: "Kenya Gazette and official notices",
  description:
    "Browse the Kenya Gazette archive. Search appointments, legal notices, land registrations, and subsidiary legislation.",
};

export default async function KenyaGazettePage() {
  const supabase = await createClient();

  // Fetch the 6 most recent Gazette issues with their notice counts
  const { data: recentIssues, error } = await supabase
    .from("gazette_issues")
    .select(`
      id,
      year,
      volume,
      issue_number,
      date,
      pdf_url,
      notice_count: gazette_notices(count)
    `)
    .order("date", { ascending: false })
    .limit(6);

  return (
    <>
      <PageIntro
        breadcrumbs={[
          { text: "Home", href: "/" },
          { text: "Law and documents", href: "/documents" },
          { text: "Kenya Gazette" },
        ]}
        caption="Official public journal"
        title="The Kenya Gazette"
        lead="The authoritative public journal of the Government of Kenya. All formal appointments, legal notices, land registrations, and subsidiary legislation must be published here to take effect."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <PageContents
            items={[
              { href: "#recent", text: "Recent issues" },
              { href: "#structure", text: "Structure of the Gazette" },
              { href: "#how-to-use", text: "How to use Gazette information" },
              { href: "#this-website", text: "How we structure our data" },
            ]}
          />

          {/* RECENT ISSUES */}
          <section id="recent" className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-l">Recent issues</h2>
            {error ? (
              <p className="govuk-body">Unable to load recent issues at this time.</p>
            ) : recentIssues && recentIssues.length > 0 ? (
              <ul className="govuk-list govuk-list--bullet">
                {recentIssues.map((issue: any) => (
                  <li key={issue.id} className="govuk-!-margin-bottom-2">
                    <Link 
                      href={`/kenya-gazette/${issue.year}`} 
                      className="govuk-link govuk-!-font-weight-bold"
                    >
                      {new Date(issue.date).toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}
                    </Link>
                    {" — "}
                    <span className="govuk-hint govuk-!-display-inline govuk-!-margin-bottom-0">
                      Vol. {issue.volume}, No. {issue.issue_number} ({issue.notice_count?.[0]?.count || 0} notices)
                    </span>
                    {issue.pdf_url && (
                      <>
                        {" | "}
                        <a href={issue.pdf_url} target="_blank" rel="noopener noreferrer" className="govuk-link">
                          Official PDF ↓
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="govuk-body">No recent issues found.</p>
            )}
            <p className="govuk-body govuk-!-margin-top-4">
              <Link href="/kenya-gazette/archive" className="govuk-link govuk-!-font-weight-bold">
                View the full archive (1989–Present) →
              </Link>
            </p>
          </section>

          {/* STRUCTURE */}
          <section id="structure" className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-l">Structure of the Gazette</h2>
            <p className="govuk-body">
              The Gazette is published weekly (usually on Fridays) and is divided into specific supplements. 
              Understanding these supplements helps you find the exact type of legal instrument you need.
            </p>

            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">General Notices</dt>
                <dd className="govuk-summary-list__value">
                  Appointments, land registrations, change of names, and institutional proclamations.
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Legal Notices (L.N.)</dt>
                <dd className="govuk-summary-list__value">
                  Subsidiary legislation, regulations, and statutory instruments issued by Cabinet Secretaries.
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Bill Supplements</dt>
                <dd className="govuk-summary-list__value">
                  Draft legislation introduced to the National Assembly, Senate, or County Assemblies.
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Act Supplements</dt>
                <dd className="govuk-summary-list__value">
                  Finalized Acts of Parliament that have received Presidential Assent.
                </dd>
              </div>
            </dl>
          </section>

          {/* HOW TO USE */}
          <section id="how-to-use" className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-l">How to use Gazette information</h2>
            <ol className="govuk-list govuk-list--number">
              <li>Identify the <strong>Gazette Notice Number</strong> (e.g., Notice No. 17421) or the Legal Notice number.</li>
              <li>Verify the date of publication to establish when the legal instrument took effect.</li>
              <li>
                Prefer the exact Gazette wording over secondary summaries when accuracy matters 
                (e.g., court filings, formal challenges, or land due diligence).
              </li>
            </ol>
            
            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
              <strong className="govuk-warning-text__text">
                <span className="govuk-visually-hidden">Warning </span>
                Unofficial PDFs shared on social media can be incomplete or altered. 
                Always verify against the official Government Printer sources or our verified HTML transcripts.
              </strong>
            </div>
          </section>

          {/* THIS WEBSITE */}
          <section id="this-website" className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-l">How we structure our data</h2>
            <p className="govuk-body">
              Unlike traditional PDF archives, CitizenGuide.KE parses Gazette notices into structured HTML. 
              This allows you to:
            </p>
            <ul className="govuk-list govuk-list--bullet">
              <li>Copy specific clauses without capturing page headers and footers.</li>
              <li>Link directly to a specific notice (e.g., <code className="govuk-!-font-size-16">/kenya-gazette/notice/17421</code>).</li>
              <li>Track when specific public officers were appointed or removed.</li>
            </ul>
            <p className="govuk-body">
              If you spot a mismatch between our directory and a Gazette notice, use our{" "}
              <Link href="/corrections" className="govuk-link">corrections portal</Link>.
            </p>
          </section>

        </div>

        <RelatedNav
          links={[
            { text: "Editorial policy", href: "/editorial-policy" },
            { text: "Open data API", href: "/open-data" },
            { text: "Access to information", href: "/access-to-information" },
            { text: "Disclaimer", href: "/disclaimer" },
          ]}
        />
      </div>
    </>
  );
}