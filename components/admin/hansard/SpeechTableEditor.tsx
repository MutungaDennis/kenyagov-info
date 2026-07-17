"use client";

import {
  createEmptyTable,
  resizeTableColumns,
  type SpeechTableDraft,
} from "@/lib/hansard/tables";

type Props = {
  tables: SpeechTableDraft[];
  onChange: (tables: SpeechTableDraft[]) => void;
};

/**
 * Visual schedule/estimate table builder for Hansard contributions.
 * Admin picks column count and fills cells — no Markdown required.
 */
export default function SpeechTableEditor({ tables, onChange }: Props) {
  const update = (id: string, patch: Partial<SpeechTableDraft>) => {
    onChange(tables.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const setColumnCount = (id: string, n: number) => {
    onChange(
      tables.map((t) =>
        t.id === id ? resizeTableColumns(t, n) : t,
      ),
    );
  };

  const setHeader = (id: string, col: number, value: string) => {
    onChange(
      tables.map((t) => {
        if (t.id !== id) return t;
        const headers = [...t.headers];
        headers[col] = value;
        return { ...t, headers };
      }),
    );
  };

  const setCell = (id: string, row: number, col: number, value: string) => {
    onChange(
      tables.map((t) => {
        if (t.id !== id) return t;
        const rows = t.rows.map((r, ri) =>
          ri === row
            ? r.map((c, ci) => (ci === col ? value : c))
            : r,
        );
        return { ...t, rows };
      }),
    );
  };

  const addRow = (id: string) => {
    onChange(
      tables.map((t) => {
        if (t.id !== id) return t;
        return {
          ...t,
          rows: [
            ...t.rows,
            Array.from({ length: t.columnCount }, () => ""),
          ],
        };
      }),
    );
  };

  const removeRow = (id: string, rowIndex: number) => {
    onChange(
      tables.map((t) => {
        if (t.id !== id) return t;
        if (t.rows.length <= 1) return t;
        return { ...t, rows: t.rows.filter((_, i) => i !== rowIndex) };
      }),
    );
  };

  const removeTable = (id: string) => {
    onChange(tables.filter((t) => t.id !== id));
  };

  return (
    <div className="govuk-!-margin-top-4">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <h3 className="govuk-heading-s govuk-!-margin-bottom-0">
          Schedule / estimate tables
        </h3>
        <button
          type="button"
          className="govuk-button govuk-button--secondary"
          style={{ marginBottom: 0 }}
          onClick={() => onChange([...tables, createEmptyTable(4, 2)])}
        >
          + Add table
        </button>
      </div>
      <p className="govuk-hint govuk-!-margin-bottom-3">
        Choose how many columns, name the headers, then fill each row — shown
        as a proper table on the public Hansard page.
      </p>

      {tables.length === 0 && (
        <p className="govuk-body-s" style={{ color: "#505a5f" }}>
          No tables yet. Use <strong>+ Add table</strong> for First Schedule /
          vote estimates, etc.
        </p>
      )}

      {tables.map((table, ti) => (
        <div
          key={table.id}
          style={{
            border: "1px solid #b1b4b6",
            background: "#fff",
            padding: 12,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "flex-end",
              marginBottom: 12,
            }}
          >
            <div className="govuk-form-group govuk-!-margin-bottom-0" style={{ flex: "1 1 200px" }}>
              <label className="govuk-label" htmlFor={`cap-${table.id}`}>
                Table title / caption
              </label>
              <input
                id={`cap-${table.id}`}
                className="govuk-input"
                value={table.caption}
                onChange={(e) => update(table.id, { caption: e.target.value })}
                placeholder="e.g. FIRST SCHEDULE (S. 3, 4)"
              />
            </div>
            <div className="govuk-form-group govuk-!-margin-bottom-0">
              <label className="govuk-label" htmlFor={`cols-${table.id}`}>
                Columns
              </label>
              <input
                id={`cols-${table.id}`}
                className="govuk-input govuk-input--width-4"
                type="number"
                min={1}
                max={12}
                value={table.columnCount}
                onChange={(e) =>
                  setColumnCount(table.id, parseInt(e.target.value, 10) || 1)
                }
              />
            </div>
            <button
              type="button"
              className="govuk-button govuk-button--warning"
              style={{ marginBottom: 0 }}
              onClick={() => {
                if (confirm("Remove this table?")) removeTable(table.id);
              }}
            >
              Remove table
            </button>
          </div>

          <div
            className="app-table-scroll"
            role="region"
            tabIndex={0}
            style={{ overflowX: "auto" }}
          >
            <table
              className="govuk-table"
              style={{ marginBottom: 0, minWidth: table.columnCount * 120 }}
            >
              <thead className="govuk-table__head">
                <tr className="govuk-table__row">
                  {table.headers.map((h, ci) => (
                    <th
                      key={ci}
                      className="govuk-table__header"
                      scope="col"
                      style={{ minWidth: ci === 1 ? 180 : 100, padding: 4 }}
                    >
                      <input
                        className="govuk-input"
                        value={h}
                        onChange={(e) =>
                          setHeader(table.id, ci, e.target.value)
                        }
                        aria-label={`Column ${ci + 1} header`}
                        style={{ fontWeight: 700, fontSize: 13 }}
                      />
                    </th>
                  ))}
                  <th className="govuk-table__header" style={{ width: 40 }}>
                    <span className="govuk-visually-hidden">Row actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="govuk-table__body">
                {table.rows.map((row, ri) => (
                  <tr key={ri} className="govuk-table__row">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className="govuk-table__cell"
                        style={{ padding: 4, verticalAlign: "top" }}
                      >
                        {ci === 1 || table.columnCount <= 2 ? (
                          <textarea
                            className="govuk-textarea"
                            rows={2}
                            value={cell}
                            onChange={(e) =>
                              setCell(table.id, ri, ci, e.target.value)
                            }
                            style={{
                              fontSize: 13,
                              minHeight: 48,
                              marginBottom: 0,
                            }}
                            aria-label={`Row ${ri + 1}, column ${ci + 1}`}
                          />
                        ) : (
                          <input
                            className="govuk-input"
                            value={cell}
                            onChange={(e) =>
                              setCell(table.id, ri, ci, e.target.value)
                            }
                            style={{ fontSize: 13 }}
                            aria-label={`Row ${ri + 1}, column ${ci + 1}`}
                          />
                        )}
                      </td>
                    ))}
                    <td className="govuk-table__cell" style={{ padding: 4 }}>
                      <button
                        type="button"
                        className="govuk-link"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#d4351c",
                          fontSize: 13,
                        }}
                        onClick={() => removeRow(table.id, ri)}
                        disabled={table.rows.length <= 1}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="govuk-button-group govuk-!-margin-top-3 govuk-!-margin-bottom-0">
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              style={{ marginBottom: 0 }}
              onClick={() => addRow(table.id)}
            >
              + Add row
            </button>
            <span className="govuk-body-s" style={{ color: "#505a5f" }}>
              Table {ti + 1}: {table.columnCount} columns · {table.rows.length}{" "}
              row{table.rows.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
