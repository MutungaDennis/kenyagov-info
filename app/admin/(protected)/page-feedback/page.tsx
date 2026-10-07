import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

type Vote = { page_path: string; is_useful: boolean; created_at: string };
type PageTotals = { path: string; yes: number; no: number; last: string };

const PAGE_SIZE = 1000;
const MAX_VOTES = 20000;

async function loadVotes(): Promise<{ votes: Vote[]; error: string | null }> {
  try {
    const supabase = createServiceClient();
    const votes: Vote[] = [];
    for (let from = 0; from < MAX_VOTES; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("page_usefulness_votes")
        .select("page_path, is_useful, created_at")
        .order("created_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (error) return { votes, error: error.message };
      votes.push(...((data as Vote[]) || []));
      if (!data || data.length < PAGE_SIZE) break;
    }
    return { votes, error: null };
  } catch (e: unknown) {
    return { votes: [], error: e instanceof Error ? e.message : "Unknown error" };
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Nairobi" });
}

export default async function AdminPageFeedbackPage() {
  const { votes, error } = await loadVotes();
  const byPage = new Map<string, PageTotals>();
  for (const vote of votes) {
    const row = byPage.get(vote.page_path) || { path: vote.page_path, yes: 0, no: 0, last: vote.created_at };
    if (vote.is_useful) row.yes += 1; else row.no += 1;
    if (vote.created_at > row.last) row.last = vote.created_at;
    byPage.set(vote.page_path, row);
  }
  const pages = [...byPage.values()].sort((a, b) => b.no - a.no || (b.yes + b.no) - (a.yes + a.no));
  const yes = votes.filter((vote) => vote.is_useful).length;
  const no = votes.length - yes;
  const summary: [string, number][] = [["Total answers", votes.length], ["Useful (Yes)", yes], ["Not useful (No)", no]];

  return (
    <>
      <span className="govuk-caption-l">Citizen responses</span>
      <h1 className="govuk-heading-xl">Page feedback</h1>
      <p className="govuk-body">Answers to &ldquo;Is this page useful?&rdquo;. Pages with the most &ldquo;No&rdquo; answers are listed first.</p>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">Could not load page feedback</h2>
          <div className="govuk-error-summary__body"><p className="govuk-body">{error}</p></div>
        </div>
      )}

      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        {summary.map(([label, value]) => (
          <div className="govuk-grid-column-one-third" key={label}>
            <div className="admin-task-card">
              <p className="govuk-body-s govuk-!-margin-bottom-1">{label}</p>
              <p className="govuk-heading-l govuk-!-margin-bottom-0">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {pages.length === 0 && !error ? (
        <div className="govuk-inset-text">No page feedback yet.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="govuk-table">
            <caption className="govuk-table__caption govuk-table__caption--m">Feedback by page</caption>
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header">Page</th>
                <th className="govuk-table__header govuk-table__header--numeric">Yes</th>
                <th className="govuk-table__header govuk-table__header--numeric">No</th>
                <th className="govuk-table__header govuk-table__header--numeric">% useful</th>
                <th className="govuk-table__header">Latest answer</th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {pages.map((page) => (
                <tr className="govuk-table__row" key={page.path}>
                  <td className="govuk-table__cell"><a className="govuk-link" href={page.path} target="_blank" rel="noreferrer">{page.path}</a></td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">{page.yes}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">{page.no}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">{Math.round((page.yes / (page.yes + page.no)) * 100)}%</td>
                  <td className="govuk-table__cell">{formatDate(page.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {votes.length >= MAX_VOTES && <p className="govuk-hint">Showing the latest {MAX_VOTES} answers.</p>}
    </>
  );
}
