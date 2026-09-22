export type ExportRow = Record<string, unknown>;

/** RFC 4180 quoting; spreadsheet formula protection applies only to text cells. */
export function csvCell(value: unknown): string {
  if (value == null) return "";
  let text = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (typeof value === "string" && /^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function rowsToCsv(rows: ExportRow[], fields: readonly string[]) {
  return [fields.join(","), ...rows.map(row => fields.map(field => csvCell(row[field])).join(","))].join("\r\n") + "\r\n";
}

/** Fetch every page; never return a successful truncated download after an error. */
export async function collectExportRows(
  fetchPage: (from: number, to: number) => PromiseLike<{ data: ExportRow[] | null; error: unknown }>,
  pageSize = 1000,
  maxRows = 100000,
) {
  const rows: ExportRow[] = [];
  while (rows.length <= maxRows) {
    const { data, error } = await fetchPage(rows.length, rows.length + pageSize - 1);
    if (error || !data) throw new Error("The dataset could not be downloaded completely. Please try again.");
    rows.push(...data);
    if (rows.length > maxRows) throw new Error("This extract is too large. Narrow it using the documented filters.");
    if (data.length < pageSize) return rows;
  }
  throw new Error("Export limit exceeded");
}
