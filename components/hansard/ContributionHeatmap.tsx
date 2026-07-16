import Link from "next/link";

export type DayCount = {
  /** YYYY-MM-DD */
  date: string;
  count: number;
};

type Props = {
  /** Daily contribution counts (unfiltered speaking record) */
  days: DayCount[];
  /** Base path for day filter links, e.g. /government/legislature/hansard/member/slug */
  memberPath: string;
  /** Optional caption for screen readers */
  memberName?: string;
};

const CELL = 11;
const GAP = 3;
const WEEK_W = CELL + GAP;

/** GitHub-like intensity greens */
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

/**
 * GitHub contribution graph / “pulse” calendar:
 * 53 weeks × 7 days, intensity by speaking volume that day.
 */
export default function ContributionHeatmap({
  days,
  memberPath,
  memberName,
}: Props) {
  const countByDate = new Map(days.map((d) => [d.date, d.count]));
  const maxCount = Math.max(0, ...days.map((d) => d.count), 1);

  // Window: last ~52 weeks ending today (or last activity if earlier data only)
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const end = startOfWeekSunday(today);
  end.setDate(end.getDate() + 6); // end of this week (Saturday)

  const start = new Date(end);
  start.setDate(start.getDate() - 7 * 52 + 1); // ~365 days
  // Align start to Sunday
  const gridStart = startOfWeekSunday(start);

  const weeks: Array<Array<{ date: string; count: number; inRange: boolean }>> =
    [];
  const cursor = new Date(gridStart);
  while (cursor <= end) {
    const week: Array<{ date: string; count: number; inRange: boolean }> = [];
    for (let i = 0; i < 7; i++) {
      const ymd = formatYmd(cursor);
      const inRange = cursor >= start && cursor <= today;
      week.push({
        date: ymd,
        count: inRange ? countByDate.get(ymd) || 0 : 0,
        inRange,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  // Month labels: first week where month changes
  const monthLabels: Array<{ weekIndex: number; label: string }> = [];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const mid = week[3] || week[0];
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
    .filter((d) => d.inRange)
    .reduce((s, d) => s + d.count, 0);

  const activeDays = weeks
    .flat()
    .filter((d) => d.inRange && d.count > 0).length;

  const dayFilterHref = (ymd: string) => {
    const params = new URLSearchParams();
    params.set("dateFrom", ymd);
    params.set("dateTo", ymd);
    return `${memberPath}?${params.toString()}`;
  };

  const monthFilterHref = (ymd: string) => {
    const month = ymd.slice(0, 7);
    return `${memberPath}?month=${month}`;
  };

  return (
    <section
      className="govuk-!-margin-bottom-6"
      aria-labelledby="heatmap-heading"
    >
      <h2 id="heatmap-heading" className="govuk-heading-m">
        Speaking activity
      </h2>
      <p className="govuk-body-s" style={{ maxWidth: 40 + "rem" }}>
        Pulse over the past year — denser squares mean more Hansard
        contributions that day (same idea as GitHub contribution activity).
        Hover a day for the count; select it to filter the list.
      </p>

      <p className="govuk-body-s govuk-!-margin-bottom-3">
        <strong>{totalInWindow}</strong> contribution
        {totalInWindow === 1 ? "" : "s"} across{" "}
        <strong>{activeDays}</strong> sitting day
        {activeDays === 1 ? "" : "s"} in this window
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
        {/* Month labels */}
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
          {/* Day-of-week labels */}
          <div
            aria-hidden
            style={{
              display: "flex",
              flexDirection: "column",
              gap: GAP,
              marginRight: 6,
              paddingTop: 0,
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

          {/* Grid */}
          <div
            role="img"
            aria-label={`Contribution activity calendar for the past year. ${totalInWindow} contributions on ${activeDays} days. Darker green means more activity.`}
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
                  if (!day.inRange) {
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

        {/* Legend */}
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

      {/* Compact monthly summary for keyboard / AT users (not the old long a11y disclaimer) */}
      {days.length > 0 && (
        <details className="govuk-details govuk-!-margin-top-3">
          <summary className="govuk-details__summary">
            <span className="govuk-details__summary-text">
              Monthly totals (table)
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
                {Array.from(
                  days.reduce((map, d) => {
                    const m = d.date.slice(0, 7);
                    map.set(m, (map.get(m) || 0) + d.count);
                    return map;
                  }, new Map<string, number>()),
                )
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([month, count]) => (
                    <tr key={month} className="govuk-table__row">
                      <td className="govuk-table__cell">
                        <Link
                          href={monthFilterHref(`${month}-01`)}
                          className="govuk-link"
                        >
                          {new Date(month + "-01").toLocaleDateString("en-KE", {
                            month: "long",
                            year: "numeric",
                          })}
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
