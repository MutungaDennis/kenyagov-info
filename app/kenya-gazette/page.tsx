import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import PageIntro from "@/components/site/PageIntro";
import RelatedNav from "@/components/site/RelatedNav";
import PageContents from "@/components/site/PageContents";
import GazetteSearchForm from "@/components/gazette/GazetteSearchForm";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Kenya Gazette and official notices",
  description:
    "Search and browse accessible HTML transcriptions of Kenya Gazette notices, with links to the official Gazette issues.",
  alternates: {
    canonical: "/kenya-gazette",
  },
};

export default async function KenyaGazettePage() {
  const supabase = await createClient();

  const { data: recentIssues, error } = await supabase
    .from("gazette_issues")
    .select(`
      id,
      year,
      volume,
      issue_number,
      date,
      pdf_url,
      notice_count:gazette_notices(count)
    `)
    .order("date", { ascending: false })
    .limit(8);

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
        lead="Search and browse Kenya Gazette issues and accessible HTML transcriptions of individual Gazette notices."
        showPrint
      />

      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <GazetteSearchForm inputId="gazette-home-search" />

          <PageContents
            items={[
              { href: "#recent", text: "Recent issues" },
              { href: "#about-html", text: "Accessible HTML transcriptions" },
              { href: "#structure", text: "Structure of the Gazette" },
              { href: "#using-the-gazette", text: "Using Gazette information" },
            ]}
          />

          <section id="recent" className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-l">Recent issues</h2>

            {error ? (
              <div className="govuk-inset-text">
                Unable to load recent issues at this time.
              </div>
            ) : recentIssues && recentIssues.length > 0 ? (
              <ul className="govuk-list">
                {recentIssues.map((issue: any) => (
                  <li key={issue.id} className="govuk-!-margin-bottom-4">
                    <Link
                      href={`/kenya-gazette/${issue.year}/${issue.issue_number}`}
                      className="govuk-link govuk-!-font-weight-bold"
                    >
                      {new Date(issue.date).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </Link>
                    <div className="govuk-hint govuk-!-margin-bottom-0">
                      Vol. {issue.volume}, No. {issue.issue_number} ·{" "}
                      {issue.notice_count?.[0]?.count || 0} parsed notices
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="govuk-body">No recent issues found.</p>
            )}

            <p className="govuk-body govuk-!-margin-top-4">
              <Link
                href="/kenya-gazette/archive"
                className="govuk-link govuk-!-font-weight-bold"
              >
                Browse the full Gazette archive →
              </Link>
            </p>
          </section>

          <section id="about-html" className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-l">Accessible HTML transcriptions</h2>
            <p className="govuk-body">
              CitizenGuide.KE converts Gazette notices from PDF into structured HTML so that
              notices are easier to search, read, copy, link to and use with assistive technology.
            </p>
            <p className="govuk-body">
              The official Gazette PDF remains the source document. Each parsed notice links back
              to its parent issue so you can verify wording against the official publication.
            </p>
          </section>

          <section id="structure" className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-l">Structure of the Gazette</h2>
            <p className="govuk-body">
              The Kenya Gazette contains regular and special issues and may include general
              notices, legal notices and legislative supplements.
            </p>

            <dl className="govuk-summary-list">
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">General notices</dt>
                <dd className="govuk-summary-list__value">
                  Public appointments, land matters, names, institutional notices, auctions and
                  other official notifications.
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Legal notices</dt>
                <dd className="govuk-summary-list__value">
                  Subsidiary legislation, regulations and other statutory instruments.
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Bill supplements</dt>
                <dd className="govuk-summary-list__value">
                  Bills published as part of the legislative process.
                </dd>
              </div>
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Act supplements</dt>
                <dd className="govuk-summary-list__value">
                  Acts of Parliament published in the Gazette publication series.
                </dd>
              </div>
            </dl>
          </section>

          <section id="using-the-gazette" className="govuk-!-margin-bottom-8">
            <h2 className="govuk-heading-l">Using Gazette information</h2>
            <ol className="govuk-list govuk-list--number">
              <li>Identify the Gazette issue and Gazette Notice number.</li>
              <li>Read the searchable HTML transcription for easier navigation.</li>
              <li>Use the official PDF link when exact source verification is required.</li>
              <li>Report transcription differences through the corrections portal.</li>
            </ol>

            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
              <strong className="govuk-warning-text__text">
                <span className="govuk-visually-hidden">Warning</span>
                CitizenGuide.KE improves access to Gazette material but does not replace the
                official Gazette publication.
              </strong>
            </div>

            <p className="govuk-body">
              <Link href="/corrections" className="govuk-link">
                Report a transcription or data issue
              </Link>
            </p>
          </section>
        </div>

        <RelatedNav
          links={[
            { text: "Gazette archive", href: "/kenya-gazette/archive" },
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
