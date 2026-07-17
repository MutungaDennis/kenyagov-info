import type { ReactNode } from "react";
import type { HansardTableBlock } from "@/lib/hansard/tables";

/** Shared Portable Text components for Hansard speech (public + reuse). */
export const hansardSpeechPortableTextComponents = {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p
        style={{
          margin: "0 0 0.75em",
          fontSize: "1.0625rem",
          lineHeight: 1.6,
          color: "#0b0c0c",
        }}
      >
        {children}
      </p>
    ),
  },
  types: {
    hansardTable: ({ value }: { value: HansardTableBlock }) => (
      <HansardTableView table={value} />
    ),
  },
};

export function HansardTableView({ table }: { table: HansardTableBlock }) {
  const headers = table.headers || [];
  const rows = table.rows || [];
  if (headers.length === 0 && rows.length === 0) return null;

  return (
    <div
      className="app-table-scroll govuk-!-margin-top-3 govuk-!-margin-bottom-4"
      role="region"
      aria-label={table.caption || "Schedule table"}
      tabIndex={0}
      style={{
        overflowX: "auto",
        border: "1px solid #b1b4b6",
        background: "#fff",
      }}
    >
      {table.caption ? (
        <p
          className="govuk-body-s"
          style={{
            margin: 0,
            padding: "8px 12px",
            fontWeight: 700,
            background: "#f3f2f1",
            borderBottom: "1px solid #b1b4b6",
          }}
        >
          {table.caption}
        </p>
      ) : null}
      <table className="govuk-table" style={{ marginBottom: 0, width: "100%" }}>
        {headers.length > 0 && (
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              {headers.map((h, i) => (
                <th
                  key={i}
                  scope="col"
                  className="govuk-table__header"
                  style={{
                    whiteSpace: i === 1 ? "normal" : "nowrap",
                    verticalAlign: "bottom",
                    fontSize: "0.9rem",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="govuk-table__body">
          {rows.map((row) => (
            <tr key={row._key} className="govuk-table__row">
              {(row.cells || []).map((cell, ci) => {
                const isNumeric =
                  ci > 0 &&
                  /^[\d,.\-\s]+$/.test(String(cell).trim()) &&
                  String(cell).trim() !== "-";
                return (
                  <td
                    key={ci}
                    className={
                      isNumeric
                        ? "govuk-table__cell govuk-table__cell--numeric"
                        : "govuk-table__cell"
                    }
                    style={{
                      fontSize: "0.95rem",
                      verticalAlign: "top",
                      whiteSpace: ci >= 2 ? "nowrap" : "normal",
                      minWidth: ci === 1 ? 200 : undefined,
                    }}
                  >
                    {cell || "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
