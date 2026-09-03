// app/kenya-gazette/archive/page.tsx
import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server"; // Adjust path to your actual Supabase server client
import GovUKBreadcrumbs from "@/components/govuk/Breadcrumbs";

export const revalidate = 3600; // Cache for 1 hour

export const metadata = {
  title: "Kenya Gazette Full Archive & Search",
  description: "Search and browse the complete Kenya Gazette archive from 1989 to present.",
};

type SearchParams = Promise<{ year?: string; page?: string }>;

async function ArchiveContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  const pageSize = 20;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  
  // Build the base query
  let query = supabase
    .from("gazette_issues")
    .select(`
      id,
      year,
      volume,
      issue_number,
      date,
      pdf_url,
      notice_count: gazette_notices(count)
    `, { count: "exact" })
    .order("date", { ascending: false });

  // Apply year filter if provided
  if (params.year) {
    query = query.eq("year", parseInt(params.year, 10));
  }

  // Apply pagination
  query = query.range(from, to);

  const { data: issues, count, error } = await query;

  if (error) {
    return <p className="govuk-body">Failed to load archive data. Please try again later.</p>;
  }

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <>
      {issues && issues.length > 0 ? (
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header">Date</th>
              <th scope="col" className="govuk-table__header">Year</th>
              <th scope="col" className="govuk-table__header">Volume & No.</th>
              <th scope="col" className="govuk-table__header">Notices</th>
              <th scope="col" className="govuk-table__header">Actions</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {issues.map((issue: any) => (
              <tr key={issue.id} className="govuk-table__row">
                <td className="govuk-table__cell">
                  {new Date(issue.date).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                <td className="govuk-table__cell">{issue.year}</td>
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
                    <Link href={`/kenya-gazette/${issue.year}`} className="govuk-link govuk-!-font-size-16">
                      View Issue →
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="govuk-inset-text">
          <p className="govuk-body">No Gazette issues found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="govuk-pagination" role="navigation" aria-label="Pagination">
          {currentPage > 1 && (
            <div className="govuk-pagination__prev">
              <Link 
                href={`/kenya-gazette/archive?year=${params.year || ""}&page=${currentPage - 1}`} 
                className="govuk-link govuk-pagination__link"
              >
                <span className="govuk-pagination__link-title govuk-pagination__link-title--decorated">Previous</span>
              </Link>
            </div>
          )}
          {currentPage < totalPages && (
            <div className="govuk-pagination__next">
              <Link 
                href={`/kenya-gazette/archive?year=${params.year || ""}&page=${currentPage + 1}`} 
                className="govuk-link govuk-pagination__link"
              >
                <span className="govuk-pagination__link-title govuk-pagination__link-title--decorated">Next</span>
              </Link>
            </div>
          )}
        </nav>
      )}
    </>
  );
}

export default async function GazetteArchivePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const breadcrumbs = [
    { text: "Home", href: "/" },
    { text: "Kenya Gazette", href: "/kenya-gazette" },
    { text: "Full Archive" },
  ];

  return (
    <div className="govuk-width-container">
      <GovUKBreadcrumbs items={breadcrumbs} />

      <main className="govuk-main-wrapper" id="main-content" role="main">
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-one-third">
            {/* Filter Sidebar */}
            <div className="govuk-!-margin-bottom-6" style={{ position: 'sticky', top: '20px' }}>
              <h2 className="govuk-heading-m govuk-!-margin-bottom-4">Filter archive</h2>
              <form action="/kenya-gazette/archive" method="GET">
                <div className="govuk-form-group">
                  <label className="govuk-label" htmlFor="filter-year">Year</label>
                  <select className="govuk-select govuk-!-width-full" id="filter-year" name="year" defaultValue={params.year || ""}>
                    <option value="">All years</option>
                    {Array.from({ length: new Date().getFullYear() - 1989 + 1 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="govuk-button govuk-!-margin-bottom-0">Apply filters</button>
                {(params.year) && (
                  <Link href="/kenya-gazette/archive" className="govuk-link govuk-!-display-block govuk-!-margin-top-2">
                    Clear filters
                  </Link>
                )}
              </form>
            </div>
          </div>

          <div className="govuk-grid-column-two-thirds">
            <span className="govuk-caption-xl">Archive</span>
            <h1 className="govuk-heading-xl govuk-!-margin-bottom-6">Kenya Gazette Archive</h1>
            
            <Suspense fallback={<p className="govuk-body">Loading archive...</p>}>
              <ArchiveContent searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}