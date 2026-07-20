import Link from "next/link";

export type DayCount = {
  /** YYYY-MM-DD */
  date: string;
  count: number;
};

export type TenureSegmentView = {
  start: string;
  end: string;
};

type Props = {
  /** Daily contribution counts (floor speaking record) */
  days: DayCount[];
  /** Base path for day filter links */
  memberPath: string;
  memberName?: string;
  /**
   * Inclusive window for the pulse grid (typically a calendar year ∩ tenure).
   * YYYY-MM-DD
   */
  rangeStart: string;
  rangeEnd: string;
  /** When set, days outside tenure are not painted as “in office empty” */
  tenureSegments?: TenureSegmentView[];
  /** Year shown (for captions / tabs) */
  pulseYear: number;
  /** All tenure years for navigation tabs */
  yearOptions: number[];
  /** Years that have at least one contribution (for tab hints) */
  yearsWithActivity?: number[];
  /** Preserve other filters when switching year */
  queryPreserve?: Record<string, string | undefined>;
  tenureSummary?: string;
  coverageNote?: string | null;
  entryHints?: string[];
  stillServing?: boolean;
  /** Totals across full tenure (not just this year) */
  tenureTotals?: {
    contributions: number;
    activeDays: number;
  };
};

const CELL = 11;
const GAP = 3;
const WEEK_W = CELL + GAP;

function cellColor(count: number, max: number): string {
  if (count <= 0) return "#ebedf0";
  if (max <= 1) return "#40c463";
  const t = count / max;
  if (t <= 0.25) return "#9be9a8";
  if (t <= 0.5) return "#40c463";
  if (t <= 0.75) return "#30a14e";
  return "#216e39";
}

function parseYmd(ymd: string): Date {
  return new Date(ymd + "T12:00:00");
}

function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeekSunday(d: Date): Date {
  const x = new Date(d);
  x.setHours(12, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

function inSegments(
  ymd: string,
  segments?: TenureSegmentView[],
): boolean {
  if (!segments?.length) return true;
  return segments.some((s) => ymd >= s.start && ymd <= s.end);
}

/**
 * GitHub-style contribution pulse for a tenure-aware date window
 * (usually one calendar year within office tenure).
 */
export default function ContributionHeatmap({
  days,
  memberPath,
  memberName,
  rangeStart,
  rangeEnd,
  tenureSegments,
  pulseYear,
  yearOptions,
  yearsWithActivity = [],
  queryPreserve = {},
  tenureSummary,
  coverageNote,
  entryHints = [],
  stillServing,
  tenureTotals,
}: Props) {
  const countByDate = new Map(days.map((d) => [d.date, d.count]));
  const maxCount = Math.max(0, ...days.map((d) => d.count), 1);

  const windowStart = parseYmd(rangeStart);
  const windowEnd = parseYmd(rangeEnd);
  const gridStart = startOfWeekSunday(windowStart);
  const gridEnd = startOfWeekSunday(windowEnd);
  gridEnd.setDate(gridEnd.getDate() + 6);

  const weeks: Array<
    Array<{
      date: string;
      count: number;
      /** In selected year window and in office */
      active: boolean;
      /** In office but outside this year window (padding cells) */
      outOfWindow: boolean;
    }>
  > = [];

  const cursor = new Date(gridStart);
  while (cursor <= gridEnd) {
    const week: Array<{
      date: string;
      count: number;
      active: boolean;
      outOfWindow: boolean;
    }> = [];
    for (let i = 0; i < 7; i++) {
      const ymd = formatYmd(cursor);
      const inWindow = ymd >= rangeStart && ymd <= rangeEnd;
      const inOffice = inSegments(ymd, tenureSegments);
      const active = inWindow && inOffice;
      week.push({
        date: ymd,
        count: active ? countByDate.get(ymd) || 0 : 0,
        active,
        outOfWindow: !inWindow || !inOffice,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const monthLabels: Array<{ weekIndex: number; label: string }> = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const mid = week.find((d) => d.active) || week[3] || week[0];
    if (!mid) return;
    const m = parseYmd(mid.date).getMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      monthLabels.push({
        weekIndex: wi,
        label: parseYmd(mid.date).toLocaleDateString("en-KE", {
          month: "short",
        }),
      });
    }
  });

  const totalInWindow = weeks
    .flat()
    .filter((d) => d.active)
    .reduce((s, d) => s + d.count, 0);

  const activeDays = weeks
    .flat()
    .filter((d) => d.active && d.count > 0).length;

  const dayFilterHref = (ymd: string) => {
    const params = new URLSearchParams();
    params.set("dateFrom", ymd);
    params.set("dateTo", ymd);
    if (pulseYear) params.set("pulseYear", String(pulseYear));
    return `${memberPath}?${params.toString()}`;
  };

  const monthFilterHref = (ymd: string) => {
    const month = ymd.slice(0, 7);
    const params = new URLSearchParams();
    params.set("month", month);
    params.set("pulseYear", String(pulseYear));
    return `${memberPath}?${params.toString()}`;
  };

  const yearHref = (year: number) => {
    const params = new URLSearchParams();
    params.set("pulseYear", String(year));
    Object.entries(queryPreserve).forEach(([k, v]) => {
      if (v && k !== "pulseYear" && k !== "dateFrom" && k !== "dateTo" && k !== "month") {
        params.set(k, v);
      }
    });
    const q = params.toString();
    return q ? `${memberPath}?${q}` : memberPath;
  };

  const activityYearSet = new Set(yearsWithActivity);

  // Monthly totals only within this year window
  const monthlyInWindow = Array.from(
    days
      .filter((d) => d.date >= rangeStart && d.date <= rangeEnd)
      .reduce((map, d) => {
        const m = d.date.slice(0, 7);
        map.set(m, (map.get(m) || 0) + d.count);
        return map;
      }, new Map<string, number>()),
  ).sort(([a], [b]) => b.localeCompare(a));

  return (
    <section
      className="govuk-!-margin-bottom-6"
      aria-labelledby="heatmap-heading"
    >
      <h2 id="heatmap-heading" className="govuk-heading-m">
        Speaking activity (pulse)
      </h2>

      {tenureSummary && (
        <p className="govuk-body govuk-!-margin-bottom-2">
          <strong>In office:</strong> {tenureSummary}
          {stillServing ? " (still serving)" : ""}
          {memberName ? ` · ${memberName}` : ""}
        </p>
      )}

      {entryHints.length > 0 && (
        <ul className="govuk-list govuk-list--bullet govuk-!-margin-bottom-2">
          {entryHints.map((h) => (
            <li key={h} className="govuk-body-s">
              {h}
            </li>
          ))}
        </ul>
      )}

      {coverageNote && (
        <div className="govuk-inset-text govuk-!-margin-bottom-3">
          <p className="govuk-body-s govuk-!-margin-bottom-0">{coverageNote}</p>
        </div>
      )}

      <p className="govuk-body-s">
        Pulse for <strong>{pulseYear}</strong> while in office — denser squares
        mean more floor contributions that day. Days outside this office tenure
        are blank. Chair / Temporary Speaker turns are excluded. Blank days in
        office may mean no floor speech, a sitting not yet published, or no
        sitting.
      </p>

      {tenureTotals && (
        <p className="govuk-body-s govuk-!-margin-bottom-2">
          <strong>Full tenure (on this site):</strong>{" "}
          {tenureTotals.contributions.toLocaleString()} floor contribution
          {tenureTotals.contributions === 1 ? "" : "s"} on{" "}
          {tenureTotals.activeDays.toLocaleString()} sitting day
          {tenureTotals.activeDays === 1 ? "" : "s"}.
        </p>
      )}

      {/* Year tabs */}
      {yearOptions.length > 1 && (
        <nav
          className="govuk-!-margin-bottom-3"
          aria-label="Pulse year"
        >
          <p className="govuk-body-s govuk-!-margin-bottom-1">
            <strong>Year in office</strong>
          </p>
          <ul
            className="govuk-list"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {yearOptions.map((y) => {
              const isCurrent = y === pulseYear;
              const hasAct = activityYearSet.has(y);
              return (
                <li key={y}>
                  {isCurrent ? (
                    <span
                      className="govuk-tag"
                      style={{ background: "#047857", color: "#fff" }}
                    >
                      {y}
                      {hasAct ? "" : " · no speeches"}
                    </span>
                  ) : (
                    <Link
                      href={yearHref(y)}
                      className="govuk-link"
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        border: "1px solid #b1b4b6",
                        textDecoration: "none",
                        fontWeight: hasAct ? 700 : 400,
                      }}
                    >
                      {y}
                      {!hasAct ? " · —" : ""}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <p className="govuk-body-s govuk-!-margin-bottom-3">
        <strong>{totalInWindow}</strong> contribution
        {totalInWindow === 1 ? "" : "s"} across <strong>{activeDays}</strong>{" "}
        sitting day{activeDays === 1 ? "" : "s"} in {pulseYear}
        {memberName ? ` for ${memberName}` : ""}.
      </p>

      <div
        style={{
          overflowX: "auto",
          border: "1px solid #b1b4b6",
          padding: "12px 12px 10px",
          background: "#fff",
        }}
      >
        <div
          style={{
            position: "relative",
            height: 16,
            marginLeft: 28,
            marginBottom: 4,
            minWidth: weeks.length * WEEK_W,
          }}
          aria-hidden
        >
          {monthLabels.map(({ weekIndex, label }) => (
            <span
              key={`${weekIndex}-${label}`}
              style={{
                position: "absolute",
                left: weekIndex * WEEK_W,
                fontSize: 10,
                color: "#505a5f",
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: 0 }}>
          <div
            aria-hidden
            style={{
              display: "flex",
              flexDirection: "column",
              gap: GAP,
              marginRight: 6,
              width: 22,
            }}
          >
            {["", "Mon", "", "Wed", "", "Fri", ""].map((label, i) => (
              <div
                key={i}
                style={{
                  height: CELL,
                  fontSize: 9,
                  lineHeight: `${CELL}px`,
                  color: "#505a5f",
                  textAlign: "right",
                }}
              >
                {label}
              </div>
            ))}
          </div>

          <div
            role="img"
            aria-label={`Contribution activity for ${pulseYear}. ${totalInWindow} contributions on ${activeDays} days while in office. Darker green means more activity.`}
            style={{ display: "flex", gap: GAP }}
          >
            {weeks.map((week, wi) => (
              <div
                key={wi}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: GAP,
                }}
              >
                {week.map((day) => {
                  if (day.outOfWindow) {
                    return (
                      <div
                        key={day.date}
                        style={{
                          width: CELL,
                          height: CELL,
                          borderRadius: 2,
                          background: "transparent",
                        }}
                      />
                    );
                  }
                  const color = cellColor(day.count, maxCount);
                  const title = `${parseYmd(day.date).toLocaleDateString(
                    "en-KE",
                    {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    },
                  )}: ${day.count} contribution${day.count === 1 ? "" : "s"}`;
                  if (day.count > 0) {
                    return (
                      <Link
                        key={day.date}
                        href={dayFilterHref(day.date)}
                        title={title}
                        aria-label={title}
                        style={{
                          width: CELL,
                          height: CELL,
                          borderRadius: 2,
                          background: color,
                          display: "block",
                          outlineOffset: 1,
                        }}
                      />
                    );
                  }
                  return (
                    <div
                      key={day.date}
                      title={title}
                      style={{
                        width: CELL,
                        height: CELL,
                        borderRadius: 2,
                        background: color,
                        boxSizing: "border-box",
                        border: "1px solid rgba(27, 31, 35, 0.06)",
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 4,
            marginTop: 10,
            fontSize: 11,
            color: "#505a5f",
          }}
          aria-hidden
        >
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((level) => (
            <span
              key={level}
              style={{
                width: CELL,
                height: CELL,
                borderRadius: 2,
                background:
                  level === 0
                    ? "#ebedf0"
                    : level === 1
                      ? "#9be9a8"
                      : level === 2
                        ? "#40c463"
                        : level === 3
                          ? "#30a14e"
                          : "#216e39",
                border: "1px solid rgba(27, 31, 35, 0.06)",
              }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {monthlyInWindow.length > 0 && (
        <details className="govuk-details govuk-!-margin-top-3">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              Monthly totals for {pulseYear} (table)
            </span>
          </summary>
          <div className="govuk-details__text">
            <table className="govuk-table">
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  <th scope="col" className="govuk-table__header">
                    Month
                  </th>
                  <th
                    scope="col"
                    className="govuk-table__header govuk-table__header--numeric"
                  >
                    Contributions
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {monthlyInWindow.map(([month, count]) => (
                  <tr key={month} className="govuk-table__row">
                    <td className="govuk-table__cell">
                      <Link
                        href={monthFilterHref(`${month}-01`)}
                        className="govuk-link"
                      >
                        {new Date(month + "-15T12:00:00").toLocaleDateString(
                          "en-KE",
                          { month: "long", year: "numeric" },
                        )}
                      </Link>
                    </td>
                    <td className="govuk-table__cell govuk-table__cell--numeric">
                      {count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </section>
  );
}
