type TableHeader = {
  text: string;
  className?: string;
};

type TableRow = {
  cells: React.ReactNode[];
};

type Props = {
  headers: TableHeader[];
  rows: TableRow[];
  caption?: string;
};

export default function GovUKTable({ headers, rows, caption }: Props) {
  return (
    <table className="govuk-table">
      {caption && (
        <caption className="govuk-table__caption govuk-table__caption--m">
          {caption}
        </caption>
      )}
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          {headers.map((header, i) => (
            <th key={i} scope="col" className={`govuk-table__header ${header.className || ""}`}>
              {header.text}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {rows.map((row, i) => (
          <tr key={i} className="govuk-table__row">
            {row.cells.map((cell, j) => (
              <td key={j} className="govuk-table__cell">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}