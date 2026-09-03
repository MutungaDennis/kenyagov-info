// app/kenya-gazette/[year]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server"; // Adjust path to your actual Supabase server client
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  return {
    title: `Kenya Gazette Archive ${year}`,
    description: `Browse all Kenya Gazette issues, legal notices, and appointments published in ${year}.`,
  };
}

export default async function GazetteYearPage({ params }: { params: Promise<{ year: string }> }) {
  // ✅ Next.js 15: params must be awaited
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  
  if (isNaN(year) || year < 1989 || year > new Date().getFullYear()) {
    notFound();
  }

  // ✅ Await the Supabase client
  const supabase = await createClient();

  const { data: issues, error } = await supabase
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
    .eq("year", year)
    .order("date", { ascending: false });

  if (error || !issues) {
    console.error("Supabase error:", error);
    return (
      <div className="govuk-width-container govuk-!-margin-top-8">
        <p className="govuk-body">Failed to load archive data. Please try again later.</p>
      </div>
    );
  }

  // ✅ Explicitly type the reduce accumulator to prevent TS errors
  const groupedIssues = issues.reduce<Record<string, any[]>>((acc, issue) => {
    const date = new Date(issue.date);
    const monthYear = date.toLocaleString("en-KE", { month: "long", year: "numeric" });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(issue);
    return acc;
  }, {});

  const breadcrumbs = [
    { text: "Home", href: "/" },
    { text: "Kenya Gazette", href: "/kenya-gazette" },
    { text: year.toString() },
  ];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={breadcrumbs} />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">Archive</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-6">Kenya Gazette {year}</h1>

            <p className="govuk-body govuk-!-margin-bottom-6">
              Below is the complete list of Gazette issues published in {year}. 
              Click on an issue to view the official PDF or browse the individual parsed notices.
            </p>

            {Object.keys(groupedIssues).length === 0 ? (
              <div className="govuk-inset-text">
                <p className="govuk-body">No Gazette issues found for the year {year}.</p>
              </div>
            ) : (
              <div className="govuk-!-margin-bottom-8">
                {Object.entries(groupedIssues).map(([monthYear, monthIssues]) => (
                  <details key={monthYear} className="govuk-details govuk-!-margin-bottom-4" open>
                    <summary className="govuk-details__summary">
                      <span className="govuk-details__summary-text govuk-!-font-weight-bold">
                        {monthYear} <span className="govuk-hint govuk-!-display-inline govuk-!-font-size-16">({monthIssues.length} issues)</span>
                      </span>
                    </summary>
                    <div className="govuk-details__text">
                      <table className="govuk-table">
                        <thead className="govuk-table__head">
                          <tr className="govuk-table__row">
                            <th scope="col" className="govuk-table__header">Date</th>
                            <th scope="col" className="govuk-table__header">Volume & No.</th>
                            <th scope="col" className="govuk-table__header">Notices</th>
                            <th scope="col" className="govuk-table__header">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="govuk-table__body">
                          {monthIssues.map((issue: any) => (
                            <tr key={issue.id} className="govuk-table__row">
                              <td className="govuk-table__cell">
                                {new Date(issue.date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                              </td>
                              <td className="govuk-table__cell">
                                Vol. {issue.volume} <br/>
                                <span className="govuk-hint govuk-!-margin-bottom-0">No. {issue.issue_number}</span>
                              </td>
                              <td className="govuk-table__cell">
                                <strong>{issue.notice_count?.[0]?.count || 0}</strong>
                              </td>
                              <td className="govuk-table__cell">
                                <div className="govuk-!-display-flex govuk-!-gap-3">
                                  {issue.pdf_url && (
                                    <a href={issue.pdf_url} target="_blank" rel="noopener noreferrer" className="govuk-link govuk-!-font-size-16">
                                      PDF ↓
                                    </a>
                                  )}
                                  <Link href={`/kenya-gazette/${issue.year}/${issue.issue_number}`} className="govuk-link govuk-!-font-size-16">
                                View Notices →
                                </Link>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                ))}
              </div>
            )}

            <Link href="/kenya-gazette" className="govuk-back-link">
              Back to Kenya Gazette
            </Link>
          </div>

          <div className="govuk-grid-column-one-third">
            <div className="govuk-!-margin-bottom-6" style={{ position: 'sticky', top: '20px' }}>
              <h2 className="govuk-heading-m govuk-!-margin-bottom-2">Browse other years</h2>
              <nav aria-label="Other years">
                <ul className="govuk-list govuk-!-font-size-16">
                  <li><Link href="/kenya-gazette/2024" className="govuk-link">2024</Link></li>
                  <li><Link href="/kenya-gazette/2023" className="govuk-link">2023</Link></li>
                  <li><Link href="/kenya-gazette/2022" className="govuk-link">2022</Link></li>
                  <li><Link href="/kenya-gazette/archive" className="govuk-link">View full archive →</Link></li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}   