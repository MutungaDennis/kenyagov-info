import type { ChartSeriesItem } from "./types";

type Props = {
  title: string;
  caption?: string;
  items: ChartSeriesItem[];
  formatValue?: (n: number) => string;
};

const COLORS = [
  "#047857",
  "#065f46",
  "#0f766e",
  "#115e59",
  "#134e4a",
  "#1e3a5f",
  "#374151",
  "#4b5563",
  "#6b7280",
  "#9ca3af",
];

/** Donut chart (SVG) + legend table. */
export default function DataDonutChart({
  title,
  caption,
  items,
  formatValue = (n) => n.toLocaleString(),
}: Props) {
  const filtered = items.filter((i) => i.count > 0).slice(0, 8);
  if (!filtered.length) {
    return (
      <div className="app-data-chart govuk-!-margin-bottom-6">
        <h3 className="govuk-heading-s">{title}</h3>
        <p className="govuk-body-s">No values for this chart.</p>
      </div>
    );
  }

  const total = filtered.reduce((s, i) => s + i.count, 0) || 1;
  const r = 56;
  const cx = 70;
  const cy = 70;
  const stroke = 22;
  const c = 2 * Math.PI * r;

  let offset = 0;
  const slices = filtered.map((item, i) => {
    const frac = item.count / total;
    const dash = frac * c;
    const slice = {
      ...item,
      color: COLORS[i % COLORS.length],
      dasharray: `${dash} ${c - dash}`,
      dashoffset: -offset,
      pct: Math.round(frac * 100),
    };
    offset += dash;
    return slice;
  });

  return (
    <div className="app-data-chart govuk-!-margin-bottom-6">
      <h3 className="govuk-heading-s govuk-!-margin-bottom-1">{title}</h3>
      {caption && (
        <p className="govuk-body-s app-data-chart__caption">{caption}</p>
      )}
      <div className="app-data-donut">
        <svg
          viewBox="0 0 140 140"
          className="app-data-donut__svg"
          role="img"
          aria-label={title}
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#f3f2f1"
            strokeWidth={stroke}
          />
          {slices.map((s) => (
            <circle
              key={s.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={s.dasharray}
              strokeDashoffset={s.dashoffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          ))}
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            className="app-data-donut__total"
          >
            {formatValue(total)}
          </text>
          <text
            x={cx}
            y={cy + 14}
            textAnchor="middle"
            className="app-data-donut__total-label"
          >
            total
          </text>
        </svg>
        <table className="govuk-table app-data-donut__legend">
          <caption className="govuk-visually-hidden">
            Breakdown for {title}
          </caption>
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header">
                Category
              </th>
              <th
                scope="col"
                className="govuk-table__header govuk-table__header--numeric"
              >
                Share
              </th>
              <th
                scope="col"
                className="govuk-table__header govuk-table__header--numeric"
              >
                Value
              </th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {slices.map((s) => (
              <tr key={s.label} className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  <span
                    className="app-data-donut__swatch"
                    style={{ backgroundColor: s.color }}
                    aria-hidden="true"
                  />{" "}
                  {s.label}
                </th>
                <td className="govuk-table__cell govuk-table__cell--numeric">
                  {s.pct}%
                </td>
                <td className="govuk-table__cell govuk-table__cell--numeric">
                  {formatValue(s.count)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
