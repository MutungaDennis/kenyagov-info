import type { ChartSeriesItem } from "./types";

type Props = {
  title: string;
  caption?: string;
  items: ChartSeriesItem[];
  formatValue?: (n: number) => string;
};

/** Accessible SVG line chart + data table (no chart library). */
export default function DataLineChart({
  title,
  caption,
  items,
  formatValue = (n) => n.toLocaleString(),
}: Props) {
  if (items.length < 2) {
    return (
      <div className="app-data-chart govuk-!-margin-bottom-6">
        <h3 className="govuk-heading-s">{title}</h3>
        <p className="govuk-body-s">
          Not enough points for a line chart (need at least two values).
        </p>
      </div>
    );
  }

  const w = 560;
  const h = 200;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const max = Math.max(...items.map((i) => i.count), 1);
  const min = Math.min(...items.map((i) => i.count), 0);
  const range = Math.max(max - min, 1);

  const points = items.map((item, i) => {
    const x = padL + (i / (items.length - 1)) * innerW;
    const y = padT + innerH - ((item.count - min) / range) * innerH;
    return { x, y, ...item };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <div className="app-data-chart govuk-!-margin-bottom-6">
      <h3 className="govuk-heading-s govuk-!-margin-bottom-1">{title}</h3>
      {caption && (
        <p className="govuk-body-s app-data-chart__caption">{caption}</p>
      )}
      <div className="app-data-chart__svg-wrap" role="img" aria-label={title}>
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="app-data-chart__svg"
          aria-hidden="true"
        >
          {/* grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = padT + innerH * (1 - t);
            return (
              <line
                key={t}
                x1={padL}
                x2={w - padR}
                y1={y}
                y2={y}
                className="app-data-chart__grid"
              />
            );
          })}
          <path d={pathD} className="app-data-chart__line" fill="none" />
          {points.map((p) => (
            <circle
              key={p.label}
              cx={p.x}
              cy={p.y}
              r={4}
              className="app-data-chart__dot"
            />
          ))}
          {/* x labels (sparse) */}
          {points.map((p, i) => {
            if (
              items.length > 8 &&
              i !== 0 &&
              i !== items.length - 1 &&
              i % Math.ceil(items.length / 5) !== 0
            ) {
              return null;
            }
            return (
              <text
                key={`t-${p.label}`}
                x={p.x}
                y={h - 8}
                textAnchor="middle"
                className="app-data-chart__axis-label"
              >
                {p.label.length > 10 ? `${p.label.slice(0, 8)}…` : p.label}
              </text>
            );
          })}
        </svg>
      </div>
      <table className="govuk-table govuk-!-margin-top-3">
        <caption className="govuk-visually-hidden">
          Data table for {title}
        </caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">
              Period
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
          {items.map((item) => (
            <tr key={item.label} className="govuk-table__row">
              <th scope="row" className="govuk-table__header">
                {item.label}
              </th>
              <td className="govuk-table__cell govuk-table__cell--numeric">
                {formatValue(item.count)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
