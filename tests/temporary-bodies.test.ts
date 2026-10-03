import { describe, expect, it } from "vitest";
import {
  buildInstitutionRow,
  isTemporaryBodySchemaUnavailable,
  isTemporaryBodyType,
} from "@/lib/institutions/fields";

describe("temporary public body records", () => {
  it("accepts supported body types and rejects arbitrary values", () => {
    expect(isTemporaryBodyType("Task force")).toBe(true);
    expect(isTemporaryBodyType("Working party")).toBe(true);
    expect(isTemporaryBodyType("Ministerial department")).toBe(false);
    expect(isTemporaryBodyType(null)).toBe(false);
  });

  it("recognizes missing temporary-body columns in PostgREST error formats", () => {
    expect(
      isTemporaryBodySchemaUnavailable(
        "Could not find the 'record_kind' column of 'institutions' in the schema cache",
      ),
    ).toBe(true);
    expect(
      isTemporaryBodySchemaUnavailable(
        'column institutions.temporary_body_type does not exist',
      ),
    ).toBe(true);
    expect(
      isTemporaryBodySchemaUnavailable("search_vector does not exist"),
    ).toBe(false);
  });

  it("preserves the type, parent and term dates in the database row", () => {
    const row = buildInstitutionRow({
      record_kind: "temporary_body",
      temporary_body_type: "Advisory panel",
      parent_institution_id: "a1b2c3d4-e5f6-4789-8123-456789abcdef",
      term_start_date: "2026-01-01",
      term_end_date: "",
    });

    expect(row).toMatchObject({
      record_kind: "temporary_body",
      temporary_body_type: "Advisory panel",
      institution_type: "Advisory panel",
      parent_institution_id: "a1b2c3d4-e5f6-4789-8123-456789abcdef",
      term_start_date: "2026-01-01",
      term_end_date: null,
    });
  });

  it("preserves an explicit institution type when one was provided", () => {
    const row = buildInstitutionRow({
      record_kind: "temporary_body",
      temporary_body_type: "Task force",
      institution_type: "Temporary public body",
    });

    expect(row.institution_type).toBe("Temporary public body");
  });
});
