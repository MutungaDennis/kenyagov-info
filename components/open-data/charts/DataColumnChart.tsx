import type { ChartSeriesItem } from "./types";

type Props = {
  title: string;
  caption?: string;
  items: ChartSeriesItem[];
  formatValue?: (n: number) => string;
};

/** Vertical column chart with accessible table. */
export default function DataColumnChart({
  title,
  caption,
  items,
  formatValue = (n) => n.toLocaleString(),
}: Props) {
  if (!items.length) {
    return (
      <div className="app-data-chart govuk-!-margin-bottom-6">
        <h3 className="govuk-heading-s">{title}</h3>
        <p className="govuk-body-s">No values for this chart.</p>
      </div>
    );
  }

  const max = Math.max(...items.map((i) => i.count), 1);
  const display = items.slice(0, 12);

  return (
    <div className="app-data-chart govuk-!-margin-bottom-6">
      <h3 className="govuk-heading-s govuk-!-margin-bottom-1">{title}</h3>
      {caption && (
        <p className="govuk-body-s app-data-chart__caption">{caption}</p>
      )}
      <div
        className="app-data-columns"
        role="img"
        aria-label={title}
      >
        {display.map((item) => {
          const pct = Math.max(4, Math.round((item.count / max) * 100));
          return (
            <div key={item.label} className="app-data-columns__item">
              <div className="app-data-columns__value">
                {formatValue(item.count)}
              </div>
              <div className="app-data-columns__track" aria-hidden="true">
                <div
                  className="app-data-columns__fill"
                  style={{ height: `${pct}%` }}
                />
              </div>
              <div className="app-data-columns__label" title={item.label}>
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
      <table className="govuk-table govuk-!-margin-top-3 govuk-visually-hidden">
        <caption>Data for {title}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {display.map((item) => (
            <tr key={item.label}>
              <th scope="row">{item.label}</th>
              <td>{formatValue(item.count)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
