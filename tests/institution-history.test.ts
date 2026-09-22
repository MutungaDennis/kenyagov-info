import { describe, expect, it } from "vitest";
import { enrichInstitutionHistory } from "@/lib/institutions/directory-history";
import { isInstitutionHistorical } from "@/lib/institutions/fields";

describe("published institution history", () => {
  it("links a former body under its current successor without changing either identity", () => {
    const records = enrichInstitutionHistory([
      { id: "old", slug: "former-ministry", name: "Former ministry", status: "Renamed", successor_institution_id: "new", is_active: true },
      { id: "new", slug: "current-ministry", name: "Current ministry", status: "Active", predecessor_institution_id: "old", is_active: true },
    ]);
    expect(records[1].previousInstitutions).toHaveLength(1);
    expect(records[1].historySearchNames).toEqual(["Former ministry"]);
    expect(records.filter(record => !isInstitutionHistorical(record.status)).map(record => record.id)).toEqual(["new"]);
    expect(records[0].id).toBe("old");
  });
  it("keeps unpublished history private and deduplicates dated former names", () => {
    const records = enrichInstitutionHistory([
      { id: "private", slug: "private", name: "Unpublished former body", status: "Dissolved", successor_institution_id: "new", is_active: false },
      { id: "new", slug: "new", name: "New ministry", status: "Active", predecessor_institution_id: "private", is_active: true, former_names: ["Old ministry"], name_history: [{ name: "Old ministry", end_date: "2018-01-01" }, { name: "New ministry", end_date: null }] },
    ]);
    expect(records).toHaveLength(1);
    expect(records[0].previousInstitutions).toEqual([]);
    expect(records[0].former_names).toEqual(["Old ministry"]);
  });
  it("keeps organisations earmarked for change in the current directory", () => {
    expect(isInstitutionHistorical("Earmarked for change")).toBe(false);
    for (const status of ["Dissolved", "Former", "Renamed", "Merged", "Abolished"]) expect(isInstitutionHistorical(status)).toBe(true);
  });
});
