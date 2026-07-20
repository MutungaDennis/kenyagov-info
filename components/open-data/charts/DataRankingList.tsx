import type { ChartSeriesItem } from "./types";

type Props = {
  title: string;
  caption?: string;
  items: ChartSeriesItem[];
  formatValue?: (n: number) => string;
};

/** Ordered ranking list — good for top-N without another bar chart. */
export default function DataRankingList({
  title,
  caption,
  items,
  formatValue = (n) => n.toLocaleString(),
}: Props) {
  if (!items.length) {
    return (
      <div className="app-data-chart govuk-!-margin-bottom-6">
        <h3 className="govuk-heading-s">{title}</h3>
        <p className="govuk-body-s">No rankings available.</p>
      </div>
    );
  }

  return (
    <div className="app-data-chart govuk-!-margin-bottom-6">
      <h3 className="govuk-heading-s govuk-!-margin-bottom-1">{title}</h3>
      {caption && (
        <p className="govuk-body-s app-data-chart__caption">{caption}</p>
      )}
      <ol className="app-data-ranking">
        {items.slice(0, 15).map((item, i) => (
          <li key={item.label} className="app-data-ranking__item">
            <span className="app-data-ranking__rank" aria-hidden="true">
              {i + 1}
            </span>
            <span className="app-data-ranking__label">{item.label}</span>
            <span className="app-data-ranking__value">
              {formatValue(item.count)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
