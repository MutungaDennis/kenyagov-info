import { createServiceClient } from "@/lib/supabase/service";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { adminPath } from "@/lib/admin-path";

export const dynamic = "force-dynamic";

// ────────────────────────────────────────────────
// Types & constants
// ────────────────────────────────────────────────
type Vote = {
  page_path: string;
  is_useful: boolean;
  created_at: string;
  admin_comment: string | null;
  admin_comment_at: string | null;
  admin_comment_by: string | null;
};

type PageTotals = {
  path: string;
  yes: number;
  no: number;
  total: number;
  pctUseful: number;
  last: string;
  urgency: number;
  trend: number | null;
  comment: string | null;
  commentAt: string | null;
  commentBy: string | null;
  latestVoteCreatedAt: string;
};

const PAGE_SIZE = 1000;
const MAX_VOTES = 20000;
const TABLE_PAGE_SIZE = 50;

const TEST_PATH_PATTERNS = [
  /^\/Test\.com/i,
  /^\/test(\/|$)/i,
  /^\/localhost/i,
];

function isTestPath(path: string): boolean {
  return TEST_PATH_PATTERNS.some((re) => re.test(path));
}

type SearchParams = {
  q?: string;
  days?: string;
  min?: string;
  sort?: string;
  group?: string;
  page?: string;
  test?: string; // "1" = include test pages
};

// ────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────
async function loadVotes(): Promise<{ votes: Vote[]; error: string | null }> {
  try {
    const supabase = createServiceClient();
    const votes: Vote[] = [];
    for (let from = 0; from < MAX_VOTES; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("page_usefulness_votes")
        .select(
          "page_path, is_useful, created_at, admin_comment, admin_comment_at, admin_comment_by"
        )
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
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Nairobi",
  });
}

function pct(yes: number, total: number) {
  if (total === 0) return 0;
  return Math.round((yes / total) * 100);
}

function getSection(path: string) {
  const parts = path.split("/").filter(Boolean);
  return parts.length ? `/${parts[0]}` : "/";
}

function statusTag(pctUseful: number, total: number) {
  if (total < 3) return null;
  if (pctUseful < 50)
    return <span className="govuk-tag govuk-tag--red">Critical</span>;
  if (pctUseful < 70)
    return <span className="govuk-tag govuk-tag--orange">Needs review</span>;
  return <span className="govuk-tag govuk-tag--green">OK</span>;
}

function buildQuery(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v !== "") sp.set(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

// ────────────────────────────────────────────────
// Server Action – save / update admin comment
// ────────────────────────────────────────────────
async function saveAdminComment(formData: FormData) {
  "use server";

  const pagePath = String(formData.get("page_path") || "").trim();
  const comment = String(formData.get("comment") || "").trim();
  const adminName = String(formData.get("admin_name") || "Admin").trim();

  if (!pagePath) return;

  const supabase = createServiceClient();

  const { data: latest, error: findError } = await supabase
    .from("page_usefulness_votes")
    .select("created_at")
    .eq("page_path", pagePath)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError || !latest) {
    console.error("Could not find vote for page:", pagePath, findError);
    return;
  }

  const { error } = await supabase
    .from("page_usefulness_votes")
    .update({
      admin_comment: comment || null,
      admin_comment_at: new Date().toISOString(),
      admin_comment_by: adminName || "Admin",
    })
    .eq("page_path", pagePath)
    .eq("created_at", latest.created_at);

  if (error) {
    console.error("Failed to save comment:", error);
    return;
  }

  revalidatePath("/admin/page-feedback");
}

// ────────────────────────────────────────────────
// Page component
// ────────────────────────────────────────────────
export default async function AdminPageFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim().toLowerCase();
  const days = parseInt(sp.days || "0", 10);
  const minVotes = Math.max(0, parseInt(sp.min || "0", 10) || 0);
  const sort = sp.sort || "no";
  const groupBySection = sp.group === "1";
  const showTest = sp.test === "1";
  const currentPage = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const { votes, error } = await loadVotes();

  const now = Date.now();
  const cutoff = days > 0 ? now - days * 24 * 60 * 60 * 1000 : 0;

  // Date filter first
  let filteredVotes =
    days > 0
      ? votes.filter((v) => new Date(v.created_at).getTime() >= cutoff)
      : votes;

  // Exclude test paths from everything unless explicitly requested
  if (!showTest) {
    filteredVotes = filteredVotes.filter((v) => !isTestPath(v.page_path));
  }

  const byPage = new Map<string, PageTotals>();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const recentCutoff = now - sevenDays;
  const previousCutoff = now - 2 * sevenDays;

  for (const vote of filteredVotes) {
    const existing = byPage.get(vote.page_path);
    const row: PageTotals = existing || {
      path: vote.page_path,
      yes: 0,
      no: 0,
      total: 0,
      pctUseful: 0,
      last: vote.created_at,
      urgency: 0,
      trend: null,
      comment: null,
      commentAt: null,
      commentBy: null,
      latestVoteCreatedAt: vote.created_at,
    };

    if (vote.is_useful) row.yes += 1;
    else row.no += 1;
    row.total = row.yes + row.no;
    row.pctUseful = pct(row.yes, row.total);
    row.urgency = Math.round(row.total * ((100 - row.pctUseful) / 100));

    if (vote.created_at > row.latestVoteCreatedAt) {
      row.latestVoteCreatedAt = vote.created_at;
      row.last = vote.created_at;
      if (vote.admin_comment) {
        row.comment = vote.admin_comment;
        row.commentAt = vote.admin_comment_at;
        row.commentBy = vote.admin_comment_by;
      }
    } else if (vote.admin_comment && !row.comment) {
      row.comment = vote.admin_comment;
      row.commentAt = vote.admin_comment_at;
      row.commentBy = vote.admin_comment_by;
    }

    byPage.set(vote.page_path, row);
  }

  // Trend (last 7d vs previous 7d) – only when we have enough history
  if (days === 0 || days >= 14) {
    const recentYes = new Map<string, number>();
    const recentTotal = new Map<string, number>();
    const prevYes = new Map<string, number>();
    const prevTotal = new Map<string, number>();

    // Use the full (date-filtered) set that respects the test toggle
    for (const vote of filteredVotes) {
      const t = new Date(vote.created_at).getTime();
      if (t >= recentCutoff) {
        recentTotal.set(vote.page_path, (recentTotal.get(vote.page_path) || 0) + 1);
        if (vote.is_useful)
          recentYes.set(vote.page_path, (recentYes.get(vote.page_path) || 0) + 1);
      } else if (t >= previousCutoff) {
        prevTotal.set(vote.page_path, (prevTotal.get(vote.page_path) || 0) + 1);
        if (vote.is_useful)
          prevYes.set(vote.page_path, (prevYes.get(vote.page_path) || 0) + 1);
      }
    }

    for (const [path, row] of byPage) {
      const rT = recentTotal.get(path) || 0;
      const pT = prevTotal.get(path) || 0;
      if (rT >= 3 && pT >= 3) {
        const rPct = pct(recentYes.get(path) || 0, rT);
        const pPct = pct(prevYes.get(path) || 0, pT);
        row.trend = rPct - pPct;
      }
    }
  }

  let pages = [...byPage.values()].filter((p) => {
    if (minVotes > 0 && p.total < minVotes) return false;
    if (q && !p.path.toLowerCase().includes(q)) return false;
    return true;
  });

  pages.sort((a, b) => {
    switch (sort) {
      case "urgency":
        return b.urgency - a.urgency || b.no - a.no;
      case "pct":
        return a.pctUseful - b.pctUseful || b.total - a.total;
      case "recent":
        return b.last.localeCompare(a.last);
      case "total":
        return b.total - a.total || b.no - a.no;
      default:
        return b.no - a.no || a.pctUseful - b.pctUseful || b.total - a.total;
    }
  });

  // How many test pages exist in the raw data (for the hint)
  const testPageCount = new Set(
    votes.filter((v) => isTestPath(v.page_path)).map((v) => v.page_path)
  ).size;

  // Section roll-up
  let sectionRows: {
    path: string;
    yes: number;
    no: number;
    total: number;
    pctUseful: number;
    pages: number;
  }[] = [];

  if (groupBySection) {
    const sections = new Map<
      string,
      { yes: number; no: number; pages: Set<string> }
    >();
    for (const p of pages) {
      const sec = getSection(p.path);
      const s = sections.get(sec) || { yes: 0, no: 0, pages: new Set() };
      s.yes += p.yes;
      s.no += p.no;
      s.pages.add(p.path);
      sections.set(sec, s);
    }
    sectionRows = [...sections.entries()]
      .map(([path, s]) => ({
        path,
        yes: s.yes,
        no: s.no,
        total: s.yes + s.no,
        pctUseful: pct(s.yes, s.yes + s.no),
        pages: s.pages.size,
      }))
      .sort((a, b) => b.no - a.no || a.pctUseful - b.pctUseful);
  }

  const totalItems = groupBySection ? sectionRows.length : pages.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / TABLE_PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * TABLE_PAGE_SIZE;
  const end = start + TABLE_PAGE_SIZE;
  const visiblePages = groupBySection ? [] : pages.slice(start, end);
  const visibleSections = groupBySection ? sectionRows.slice(start, end) : [];

  const yes = filteredVotes.filter((v) => v.is_useful).length;
  const no = filteredVotes.length - yes;
  const overallPct = pct(yes, filteredVotes.length);
  const attention = pages.filter((p) => p.no >= 3 && p.pctUseful < 50);

  const baseParams = {
    q: sp.q,
    days: sp.days,
    min: sp.min,
    sort: sp.sort,
    group: sp.group,
    test: sp.test,
  };

  return (
    <>
      <span className="govuk-caption-l">Citizen responses</span>
      <h1 className="govuk-heading-xl">Page feedback</h1>
      <p className="govuk-body">
        Answers to &ldquo;Is this page useful?&rdquo;. Click any page to see
        its full history, daily and hourly breakdown. Test pages are hidden by
        default so they do not affect the overall numbers.
      </p>

      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">
            Could not load page feedback
          </h2>
          <div className="govuk-error-summary__body">
            <p className="govuk-body">{error}</p>
          </div>
        </div>
      )}

      {/* ── Filter panel ─────────────────────────────── */}
      <div className="govuk-form-group govuk-!-margin-bottom-6">
        <form method="get" className="govuk-grid-row">
          <div className="govuk-grid-column-one-quarter">
            <label className="govuk-label" htmlFor="q">
              Search path
            </label>
            <input
              className="govuk-input"
              id="q"
              name="q"
              type="search"
              defaultValue={sp.q || ""}
              placeholder="/benefits or housing"
            />
          </div>
          <div className="govuk-grid-column-one-quarter">
            <label className="govuk-label" htmlFor="days">
              Period
            </label>
            <select
              className="govuk-select"
              id="days"
              name="days"
              defaultValue={sp.days || "0"}
            >
              <option value="0">All time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <label className="govuk-label" htmlFor="min">
              Min. answers
            </label>
            <select
              className="govuk-select"
              id="min"
              name="min"
              defaultValue={sp.min || "0"}
            >
              <option value="0">Any</option>
              <option value="3">3+</option>
              <option value="5">5+</option>
              <option value="10">10+</option>
            </select>
          </div>
          <div className="govuk-grid-column-one-quarter">
            <label className="govuk-label" htmlFor="sort">
              Sort by
            </label>
            <select
              className="govuk-select"
              id="sort"
              name="sort"
              defaultValue={sort}
            >
              <option value="no">Most “No”</option>
              <option value="urgency">Urgency score</option>
              <option value="pct">Lowest % useful</option>
              <option value="total">Most answers</option>
              <option value="recent">Most recent</option>
            </select>
          </div>

          <div className="govuk-grid-column-full govuk-!-margin-top-4">
            <div className="govuk-checkboxes govuk-checkboxes--small">
              <div className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id="group"
                  name="group"
                  type="checkbox"
                  value="1"
                  defaultChecked={groupBySection}
                />
                <label
                  className="govuk-label govuk-checkboxes__label"
                  htmlFor="group"
                >
                  Group by top-level section
                </label>
              </div>
              <div className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id="test"
                  name="test"
                  type="checkbox"
                  value="1"
                  defaultChecked={showTest}
                />
                <label
                  className="govuk-label govuk-checkboxes__label"
                  htmlFor="test"
                >
                  Include test pages (/Test.com etc.)
                </label>
              </div>
            </div>
          </div>

          <div className="govuk-grid-column-full govuk-!-margin-top-4">
            <button type="submit" className="govuk-button">
              Apply filters
            </button>
            {(sp.q || sp.days || sp.min || sp.sort || sp.group || sp.test) && (
              <Link
                href="/admin/page-feedback"
                className="govuk-link govuk-!-margin-left-4"
              >
                Clear filters
              </Link>
            )}
          </div>
        </form>
      </div>

      {/* Hint when test pages are hidden */}
      {!showTest && testPageCount > 0 && (
        <p className="govuk-hint govuk-!-margin-bottom-4">
          {testPageCount} test page{testPageCount === 1 ? "" : "s"} hidden from
          results.{" "}
          <Link
            className="govuk-link"
            href={buildQuery({ ...baseParams, test: "1" })}
          >
            Show test pages
          </Link>
        </p>
      )}

      {/* ── Summary cards ────────────────────────────── */}
      <div className="govuk-grid-row govuk-!-margin-bottom-6">
        <div className="govuk-grid-column-one-third">
          <div className="admin-task-card">
            <p className="govuk-body-s govuk-!-margin-bottom-1">
              Total answers{days > 0 ? ` (${days}d)` : ""}
              {showTest ? " (incl. test)" : ""}
            </p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">
              {filteredVotes.length}
            </p>
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="admin-task-card">
            <p className="govuk-body-s govuk-!-margin-bottom-1">Useful (Yes)</p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">{yes}</p>
            {filteredVotes.length > 0 && (
              <p className="govuk-hint govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                {overallPct}% of answers
              </p>
            )}
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="admin-task-card">
            <p className="govuk-body-s govuk-!-margin-bottom-1">
              Not useful (No)
            </p>
            <p className="govuk-heading-l govuk-!-margin-bottom-0">{no}</p>
            {filteredVotes.length > 0 && (
              <p className="govuk-hint govuk-!-margin-top-1 govuk-!-margin-bottom-0">
                {100 - overallPct}% of answers
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── At a glance ──────────────────────────────── */}
      {!error && filteredVotes.length > 0 && (
        <div className="govuk-inset-text govuk-!-margin-bottom-6">
          <p className="govuk-body govuk-!-margin-bottom-1">
            <strong>At a glance</strong>
          </p>
          <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-0">
            <li>
              Overall usefulness: <strong>{overallPct}%</strong>
              {days > 0 ? ` in the last ${days} days` : ""}.
            </li>
            <li>
              {pages.length} page{pages.length === 1 ? "" : "s"} match the
              current filters.
            </li>
            {attention.length > 0 && (
              <li>
                <strong>{attention.length}</strong> page
                {attention.length === 1 ? "" : "s"} have ≥3 “No” answers and
                under 50% useful.
              </li>
            )}
          </ul>
        </div>
      )}

      {/* ── Table ────────────────────────────────────── */}
      {totalItems === 0 && !error ? (
        <div className="govuk-inset-text">
          No page feedback matches the current filters.
        </div>
      ) : (
        <>
          <div style={{ overflowX: "auto" }}>
            <table className="govuk-table">
              <caption className="govuk-table__caption govuk-table__caption--m">
                {groupBySection ? "Feedback by section" : "Feedback by page"}
                {totalItems > TABLE_PAGE_SIZE &&
                  ` (showing ${start + 1}–${Math.min(end, totalItems)} of ${totalItems})`}
              </caption>
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    {groupBySection ? "Section" : "Page"}
                  </th>
                  <th
                    scope="col"
                    className="govuk-table__header govuk-table__header--numeric"
                  >
                    Yes
                  </th>
                  <th
                    scope="col"
                    className="govuk-table__header govuk-table__header--numeric"
                  >
                    No
                  </th>
                  <th
                    scope="col"
                    className="govuk-table__header govuk-table__header--numeric"
                  >
                    Total
                  </th>
                  <th
                    scope="col"
                    className="govuk-table__header govuk-table__header--numeric"
                  >
                    % useful
                  </th>
                  {!groupBySection && (
                    <>
                      <th
                        scope="col"
                        className="govuk-table__header govuk-table__header--numeric"
                      >
                        Urgency
                      </th>
                      <th scope="col" className="govuk-table__header">
                        Trend (7d)
                      </th>
                      <th scope="col" className="govuk-table__header">
                        Latest
                      </th>
                    </>
                  )}
                  {groupBySection && (
                    <th
                      scope="col"
                      className="govuk-table__header govuk-table__header--numeric"
                    >
                      Pages
                    </th>
                  )}
                  <th scope="col" className="govuk-table__header">
                    Status
                  </th>
                  {!groupBySection && (
                    <th scope="col" className="govuk-table__header">
                      Admin note
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {groupBySection
                  ? visibleSections.map((sec) => (
                      <tr className="govuk-table__row" key={sec.path}>
                        <td className="govuk-table__cell">
                          <Link
                            className="govuk-link"
                            href={buildQuery({
                              ...baseParams,
                              q: sec.path,
                              group: undefined,
                              page: undefined,
                            })}
                          >
                            {sec.path}
                          </Link>
                        </td>
                        <td className="govuk-table__cell govuk-table__cell--numeric">
                          {sec.yes}
                        </td>
                        <td className="govuk-table__cell govuk-table__cell--numeric">
                          {sec.no}
                        </td>
                        <td className="govuk-table__cell govuk-table__cell--numeric">
                          {sec.total}
                        </td>
                        <td className="govuk-table__cell govuk-table__cell--numeric">
                          {sec.pctUseful}%
                        </td>
                        <td className="govuk-table__cell govuk-table__cell--numeric">
                          {sec.pages}
                        </td>
                        <td className="govuk-table__cell">
                          {statusTag(sec.pctUseful, sec.total)}
                        </td>
                      </tr>
                    ))
                  : visiblePages.map((pageRow) => (
                      <tr className="govuk-table__row" key={pageRow.path}>
                        <td className="govuk-table__cell">
                          <Link
                            className="govuk-link"
                            href={`${adminPath("page-feedback/detail")}?path=${encodeURIComponent(
                              pageRow.path
                            )}`}
                          >
                            {pageRow.path}
                          </Link>
                          {isTestPath(pageRow.path) && (
                            <span className="govuk-tag govuk-tag--grey govuk-!-margin-left-2">
                              Test
                            </span>
                          )}
                        </td>
                        <td className="govuk-table__cell govuk-table__cell--numeric">
                          {pageRow.yes}
                        </td>
                        <td className="govuk-table__cell govuk-table__cell--numeric">
                          {pageRow.no}
                        </td>
                        <td className="govuk-table__cell govuk-table__cell--numeric">
                          {pageRow.total}
                        </td>
                        <td className="govuk-table__cell govuk-table__cell--numeric">
                          {pageRow.pctUseful}%
                        </td>
                        <td className="govuk-table__cell govuk-table__cell--numeric">
                          {pageRow.urgency}
                        </td>
                        <td className="govuk-table__cell">
                          {pageRow.trend === null ? (
                            <span className="govuk-hint">—</span>
                          ) : pageRow.trend > 0 ? (
                            <span className="govuk-tag govuk-tag--green">
                              ↑ {pageRow.trend}pp
                            </span>
                          ) : pageRow.trend < 0 ? (
                            <span className="govuk-tag govuk-tag--red">
                              ↓ {Math.abs(pageRow.trend)}pp
                            </span>
                          ) : (
                            <span className="govuk-hint">0pp</span>
                          )}
                        </td>
                        <td className="govuk-table__cell">
                          {formatDate(pageRow.last)}
                        </td>
                        <td className="govuk-table__cell">
                          {statusTag(pageRow.pctUseful, pageRow.total)}
                        </td>

                        {/* Admin note */}
                        <td
                          className="govuk-table__cell"
                          style={{ minWidth: "260px" }}
                        >
                          {pageRow.comment ? (
                            <div className="govuk-!-margin-bottom-2">
                              <p className="govuk-body-s govuk-!-margin-bottom-1">
                                {pageRow.comment}
                              </p>
                              <p className="govuk-hint govuk-!-margin-bottom-0">
                                {pageRow.commentBy} ·{" "}
                                {pageRow.commentAt
                                  ? formatDateTime(pageRow.commentAt)
                                  : ""}
                              </p>
                            </div>
                          ) : (
                            <p className="govuk-hint govuk-!-margin-bottom-2">
                              No note yet
                            </p>
                          )}

                          <details className="govuk-details govuk-!-margin-bottom-0">
                            <summary className="govuk-details__summary">
                              <span className="govuk-details__summary-text">
                                {pageRow.comment ? "Edit note" : "Add note"}
                              </span>
                            </summary>
                            <div className="govuk-details__text">
                              <form action={saveAdminComment}>
                                <input
                                  type="hidden"
                                  name="page_path"
                                  value={pageRow.path}
                                />
                                <div className="govuk-form-group">
                                  <label
                                    className="govuk-label"
                                    htmlFor={`comment-${pageRow.path}`}
                                  >
                                    Note
                                  </label>
                                  <textarea
                                    className="govuk-textarea"
                                    id={`comment-${pageRow.path}`}
                                    name="comment"
                                    rows={3}
                                    defaultValue={pageRow.comment || ""}
                                  />
                                </div>
                                <div className="govuk-form-group">
                                  <label
                                    className="govuk-label"
                                    htmlFor={`admin-${pageRow.path}`}
                                  >
                                    Your name
                                  </label>
                                  <input
                                    className="govuk-input govuk-input--width-10"
                                    id={`admin-${pageRow.path}`}
                                    name="admin_name"
                                    type="text"
                                    defaultValue={pageRow.commentBy || ""}
                                    required
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="govuk-button govuk-button--secondary"
                                >
                                  Save note
                                </button>
                              </form>
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              className="govuk-pagination"
              role="navigation"
              aria-label="Pagination"
            >
              {page > 1 && (
                <div className="govuk-pagination__prev">
                  <Link
                    className="govuk-link govuk-pagination__link"
                    href={buildQuery({
                      ...baseParams,
                      page: String(page - 1),
                    })}
                    rel="prev"
                  >
                    Previous
                  </Link>
                </div>
              )}
              <ul className="govuk-pagination__list">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - page) <= 2
                  )
                  .map((p, idx, arr) => (
                    <li
                      key={p}
                      className={`govuk-pagination__item${
                        p === page ? " govuk-pagination__item--current" : ""
                      }`}
                    >
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="govuk-pagination__item">…</span>
                      )}
                      <Link
                        className="govuk-link govuk-pagination__link"
                        href={buildQuery({
                          ...baseParams,
                          page: String(p),
                        })}
                        aria-label={`Page ${p}`}
                        aria-current={p === page ? "page" : undefined}
                      >
                        {p}
                      </Link>
                    </li>
                  ))}
              </ul>
              {page < totalPages && (
                <div className="govuk-pagination__next">
                  <Link
                    className="govuk-link govuk-pagination__link"
                    href={buildQuery({
                      ...baseParams,
                      page: String(page + 1),
                    })}
                    rel="next"
                  >
                    Next
                  </Link>
                </div>
              )}
            </nav>
          )}
        </>
      )}

      {votes.length >= MAX_VOTES && (
        <p className="govuk-hint">
          Showing the latest {MAX_VOTES.toLocaleString()} answers. Older
          feedback is not included.
        </p>
      )}
    </>
  );
}
