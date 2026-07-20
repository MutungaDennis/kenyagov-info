/**
 * Accessible horizontal bar list — GOV.UK-like, no chart library.
 * Numbers are also clear in the adjacent value column.
 */

export type DataBarItem = {
  label: string;
  count: number;
};

type Props = {
  title: string;
  caption?: string;
  items: DataBarItem[];
  /** Format large counts with locale separators */
  formatValue?: (n: number) => string;
};

export default function DataBarList({
  title,
  caption,
  items,
  formatValue = (n) => n.toLocaleString(),
}: Props) {
  if (!items.length) {
    return (
      <div className="govuk-!-margin-bottom-6">
        <h3 className="govuk-heading-s">{title}</h3>
        <p className="govuk-body-s">No summary values available for this chart.</p>
      </div>
    );
  }

  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <div className="app-data-bars govuk-!-margin-bottom-6">
      <h3 className="govuk-heading-s govuk-!-margin-bottom-1">{title}</h3>
      {caption && (
        <p className="govuk-body-s govuk-!-margin-bottom-3" style={{ color: "#505a5f" }}>
          {caption}
        </p>
      )}
      <table className="govuk-table app-data-bars__table">
        <caption className="govuk-visually-hidden">{title}</caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">
              Category
            </th>
            <th scope="col" className="govuk-table__header">
              Distribution
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
          {items.map((item) => {
            const pct = Math.max(2, Math.round((item.count / max) * 100));
            return (
              <tr key={item.label} className="govuk-table__row">
                <th scope="row" className="govuk-table__header">
                  {item.label}
                </th>
                <td className="govuk-table__cell app-data-bars__cell-bar">
                  <div
                    className="app-data-bars__track"
                    role="presentation"
                    aria-hidden="true"
                  >
                    <div
                      className="app-data-bars__fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </td>
                <td className="govuk-table__cell govuk-table__cell--numeric">
                  {formatValue(item.count)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
