import { createServiceClient } from "@/lib/supabase/service";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminPath } from "@/lib/admin-path";
import {
  formatDate,
  formatDateTime,
  pct,
  isTestPath,
} from "@/lib/page-feedback";

export const dynamic = "force-dynamic";

type Vote = {
  page_path: string;
  is_useful: boolean;
  created_at: string;
  admin_comment: string | null;
  admin_comment_at: string | null;
  admin_comment_by: string | null;
};

const MAX_DETAIL_VOTES = 2000; // safety cap per page

async function loadPageVotes(path: string) {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("page_usefulness_votes")
    .select(
      "page_path, is_useful, created_at, admin_comment, admin_comment_at, admin_comment_by"
    )
    .eq("page_path", path)
    .order("created_at", { ascending: false })
    .limit(MAX_DETAIL_VOTES);

  if (error) return { votes: [] as Vote[], error: error.message };
  return { votes: (data as Vote[]) || [], error: null };
}

async function saveAdminComment(formData: FormData) {
  "use server";
  const pagePath = String(formData.get("page_path") || "").trim();
  const comment = String(formData.get("comment") || "").trim();
  const adminName = String(formData.get("admin_name") || "Admin").trim();

  if (!pagePath) return;

  const supabase = createServiceClient();
  const { data: latest } = await supabase
    .from("page_usefulness_votes")
    .select("created_at")
    .eq("page_path", pagePath)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latest) return;

  await supabase
    .from("page_usefulness_votes")
    .update({
      admin_comment: comment || null,
      admin_comment_at: new Date().toISOString(),
      admin_comment_by: adminName,
    })
    .eq("page_path", pagePath)
    .eq("created_at", latest.created_at);

  revalidatePath("/admin/page-feedback");
  revalidatePath("/admin/page-feedback/detail");
}

export default async function PageFeedbackDetailPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string }>;
}) {
  const { path: rawPath } = await searchParams;
  const path = rawPath ? decodeURIComponent(rawPath) : "";

  if (!path) {
    return (
      <div className="govuk-error-summary" role="alert">
        <h2 className="govuk-error-summary__title">Missing page path</h2>
        <p className="govuk-body">
          <Link className="govuk-link" href={adminPath("page-feedback")}>
            Back to page feedback
          </Link>
        </p>
      </div>
    );
  }

  const { votes, error } = await loadPageVotes(path);

  const yes = votes.filter((v) => v.is_useful).length;
  const no = votes.length - yes;
  const overallPct = pct(yes, votes.length);

  // Daily breakdown
  const byDay = new Map<string, { yes: number; no: number }>();
  for (const v of votes) {
    const day = v.created_at.slice(0, 10); // YYYY-MM-DD
    const row = byDay.get(day) || { yes: 0, no: 0 };
    if (v.is_useful) row.yes += 1;
    else row.no += 1;
    byDay.set(day, row);
  }
  const daily = [...byDay.entries()]
    .map(([day, counts]) => ({
      day,
      ...counts,
      total: counts.yes + counts.no,
      pct: pct(counts.yes, counts.yes + counts.no),
    }))
    .sort((a, b) => b.day.localeCompare(a.day));

  // Hour-of-day distribution (useful for spotting bots / office hours)
  const byHour = Array.from({ length: 24 }, () => ({ yes: 0, no: 0 }));
  for (const v of votes) {
    const hour = new Date(v.created_at).getHours(); // local to server; adjust if needed
    if (v.is_useful) byHour[hour].yes += 1;
    else byHour[hour].no += 1;
  }

  // Latest admin note
  const latestWithComment = votes.find((v) => v.admin_comment);
  const isTest = isTestPath(path);

  return (
    <>
      <p className="govuk-body">
        <Link className="govuk-link" href={adminPath("page-feedback")}>
          ← Back to all page feedback
        </Link>
      </p>

      <span className="govuk-caption-l">Page feedback detail</span>
      <h1 className="govuk-heading-xl govuk-!-margin-bottom-2">
        <a className="govuk-link" href={path} target="_blank" rel="noreferrer">
          {path}
        </a>
        {isTest && (
          <span className="govuk-tag govuk-tag--grey govuk-!-margin-left-2">
            Test page
          </span>
        )}
      </h1>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">Could not load votes</h2>
          <p className="govuk-body">{error}</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-one-quarter">
          <div className="admin-task-card">
            <p className="govuk-body-s">Total answers</p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">
              {votes.length}
            </p>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div className="admin-task-card">
            <p className="govuk-body-s">Useful (Yes)</p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">{yes}</p>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div className="admin-task-card">
            <p className="govuk-body-s">Not useful (No)</p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">{no}</p>
          </div>
        </div>
        <div className="govuk-grid-column-one-quarter">
          <div className="admin-task-card">
            <p className="govuk-body-s">% useful</p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">
              {overallPct}%
            </p>
          </div>
        </div>
      </div>

      {/* Admin note */}
      <div className="govuk-inset-text govuk-!-margin-bottom-6">
        <h2 className="govuk-heading-s">Admin note</h2>
        {latestWithComment?.admin_comment ? (
          <>
            <p className="govuk-body">{latestWithComment.admin_comment}</p>
            <p className="govuk-hint">
              {latestWithComment.admin_comment_by} ·{" "}
              {latestWithComment.admin_comment_at
                ? formatDateTime(latestWithComment.admin_comment_at)
                : ""}
            </p>
          </>
        ) : (
          <p className="govuk-hint">No note yet.</p>
        )}

        <details className="govuk-details">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              {latestWithComment?.admin_comment ? "Edit note" : "Add note"}
            </span>
          </summary>
          <div className="govuk-details__text">
            <form action={saveAdminComment}>
              <input type="hidden" name="page_path" value={path} />
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="comment">
                  Note
                </label>
                <textarea
                  className="govuk-textarea"
                  id="comment"
                  name="comment"
                  rows={3}
                  defaultValue={latestWithComment?.admin_comment || ""}
                />
              </div>
              <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="admin_name">
                  Your name
                </label>
                <input
                  className="govuk-input govuk-input--width-10"
                  id="admin_name"
                  name="admin_name"
                  defaultValue={latestWithComment?.admin_comment_by || ""}
                  required
                />
              </div>
              <button type="submit" className="govuk-button">
                Save note
              </button>
            </form>
          </div>
        </details>
      </div>

      {/* Daily breakdown */}
      <h2 className="govuk-heading-m">Performance by day</h2>
      {daily.length === 0 ? (
        <p className="govuk-body">No votes yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }} className="govuk-!-margin-bottom-6">
          <table className="govuk-table">
            <thead className="govuk-table__head">
              <tr className="govuk-table__row">
                <th className="govuk-table__header">Date</th>
                <th className="govuk-table__header govuk-table__header--numeric">
                  Yes
                </th>
                <th className="govuk-table__header govuk-table__header--numeric">
                  No
                </th>
                <th className="govuk-table__header govuk-table__header--numeric">
                  Total
                </th>
                <th className="govuk-table__header govuk-table__header--numeric">
                  % useful
                </th>
              </tr>
            </thead>
            <tbody className="govuk-table__body">
              {daily.map((d) => (
                <tr className="govuk-table__row" key={d.day}>
                  <td className="govuk-table__cell">{formatDate(d.day)}</td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    {d.yes}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    {d.no}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    {d.total}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    {d.pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Hour-of-day (helps spot automation) */}
      <h2 className="govuk-heading-m">Answers by hour of day</h2>
      <p className="govuk-hint">
        Useful for spotting automated traffic (e.g. spikes at odd hours).
      </p>
      <div style={{ overflowX: "auto" }} className="govuk-!-margin-bottom-6">
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header">Hour</th>
              <th className="govuk-table__header govuk-table__header--numeric">
                Yes
              </th>
              <th className="govuk-table__header govuk-table__header--numeric">
                No
              </th>
              <th className="govuk-table__header govuk-table__header--numeric">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {byHour.map((h, hour) => {
              const total = h.yes + h.no;
              if (total === 0) return null;
              return (
                <tr className="govuk-table__row" key={hour}>
                  <td className="govuk-table__cell">
                    {String(hour).padStart(2, "0")}:00 –{" "}
                    {String(hour).padStart(2, "0")}:59
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    {h.yes}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    {h.no}
                  </td>
                  <td className="govuk-table__cell govuk-table__cell--numeric">
                    {total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Individual votes */}
      <h2 className="govuk-heading-m">Individual answers</h2>
      <p className="govuk-body">
        Most recent first
        {votes.length >= MAX_DETAIL_VOTES &&
          ` (showing latest ${MAX_DETAIL_VOTES})`}
        .
      </p>
      <div style={{ overflowX: "auto" }}>
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header">When</th>
              <th className="govuk-table__header">Answer</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {votes.map((v, i) => (
              <tr className="govuk-table__row" key={`${v.created_at}-${i}`}>
                <td className="govuk-table__cell">
                  {formatDateTime(v.created_at)}
                </td>
                <td className="govuk-table__cell">
                  {v.is_useful ? (
                    <span className="govuk-tag govuk-tag--green">Yes</span>
                  ) : (
                    <span className="govuk-tag govuk-tag--red">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
