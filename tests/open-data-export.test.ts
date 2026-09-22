import { describe, expect, it } from "vitest";
import { collectExportRows, rowsToCsv } from "@/lib/open-data/export-format";

describe("public data downloads", () => {
  it("fetches beyond the API page limit", async () => {
    const source = Array.from({ length: 1450 }, (_, id) => ({ id }));
    const result = await collectExportRows(async (from, to) => ({ data: source.slice(from, to + 1), error: null }));
    expect(result).toEqual(source);
  });
  it("fails instead of serving a partial export", async () => {
    await expect(collectExportRows(async from => from === 0
      ? { data: [{ id: 1 }, { id: 2 }], error: null }
      : { data: null, error: new Error("network") }, 2)).rejects.toThrow("completely");
  });
  it("preserves zero, escapes multiline cells and protects spreadsheet formulas", () => {
    expect(rowsToCsv([{ name: 'A,"B"\nC', missing: null, zero: 0, formula: '=1+1' }], ["name", "missing", "zero", "formula"]))
      .toBe('name,missing,zero,formula\r\n"A,""B""\nC",,"0","\'=1+1"\r\n');
  });
});
