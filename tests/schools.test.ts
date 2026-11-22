import { describe, expect, it, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SchoolProfile from "@/components/schools/SchoolProfile";
import { schoolEditSchema } from "@/lib/schools/admin-schema";
import { hasSchoolValue, safeSchoolWebsite, schoolDirectorate, schoolSearchTerm, schoolValue } from "@/lib/schools/types";

const db = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/lib/supabase/public", () => ({ createPublicClient: () => db }));
import { getPublicSchool } from "@/lib/schools/queries";

function response(data: unknown, error: unknown = null) {
  const query = { select: vi.fn(), eq: vi.fn(), order: vi.fn(), maybeSingle: vi.fn().mockResolvedValue({ data, error }) };
  query.select.mockReturnValue(query); query.eq.mockReturnValue(query); query.order.mockReturnValue(query);
  return query;
}
beforeEach(() => db.from.mockReset());

describe("public school lookup", () => {
  it("restricts canonical and legacy URL lookups to public ownership", async () => {
    const canonical = response(null);
    const alias = response({ school_id: "school-1" });
    const target = response({ id: "school-1", slug: "example-primary" });
    db.from.mockReturnValueOnce(canonical).mockReturnValueOnce(alias).mockReturnValueOnce(target).mockReturnValue(response([]));
    expect(await getPublicSchool("old-example")).toMatchObject({ slug: "example-primary", sources: [], officials: [] });
    expect(canonical.eq).toHaveBeenCalledWith("ownership", "public");
    expect(canonical.eq).toHaveBeenCalledWith("is_published", true);
    expect(target.eq).toHaveBeenCalledWith("ownership", "public");
    expect(target.eq).toHaveBeenCalledWith("is_published", true);
    expect(target.eq).toHaveBeenCalledWith("id", "school-1");
  });
  it("does not expose a private school through a legacy alias", async () => {
    db.from.mockReturnValueOnce(response(null)).mockReturnValueOnce(response({ school_id: "private-1" })).mockReturnValueOnce(response(null));
    expect(await getPublicSchool("private-old")).toBeNull();
  });
  it("reports database failure instead of pretending a school does not exist", async () => {
    db.from.mockReturnValueOnce(response(null, { message: "unavailable" }));
    await expect(getPublicSchool("example")).rejects.toThrow("temporarily unavailable");
  });
});

describe("public school profile provenance", () => {
  it("shows linked data sources, record dates and officials without requiring portraits", () => {
    const markup = renderToStaticMarkup(createElement(SchoolProfile, { school: {
      id: "school-1", slug: "example-school", official_name: "Example School", short_name: null,
      ownership: "public", main_tier: "primary", county: "Nairobi", sub_county: null,
      county_code: 47, moe_category: null, gender_type: null, accommodation_type: null,
      operational_status: "operational", description: null, institution_type: "regular",
      registration_status: null, constituency: null, ward: null, physical_address: null,
      postal_address: null, latitude: null, longitude: null, public_phone: null, public_email: null,
      website_url: null, nemis_code: null, knec_code: null, tsc_code: null, sponsor_name: null,
      special_needs_status: null, sne_categories: null, total_enrollment: null, total_teachers: null,
      water_source: null, power_source: null, internet_connectivity: null,
      verification_status: "source_confirmed", last_verified_at: null,
      created_at: "2024-01-01T00:00:00Z", updated_at: "2025-02-03T00:00:00Z",
      parent: null, ministry: null,
      sources: [{ id: "source-1", external_record_id: "record-1", external_name: "Example School", review_status: "approved", source: {
        title: "Kenya Schools dataset", publisher: "Education Data Publisher", source_url: "https://example.org/schools",
        licence: "Open data licence", publication_date: null, reference_year: 2025,
      } }],
      officials: [{ id: "official-1", full_name: "Amina Example", role_title: "Head teacher",
        start_date: "2023-01-01", end_date: null, biography: null, photo_url: null }],
    } as never }));
    expect(markup).toContain("Kenya Schools dataset");
    expect(markup).toContain("https://example.org/schools");
    expect(markup).toContain("Page created: 1 January 2024");
    expect(markup).toContain("Last updated: 3 February 2025");
    expect(markup).toContain("Amina Example");
    expect(markup).toContain("Head teacher");
  });
});

describe("school administration and display", () => {
  const valid = { official_name: "Example Primary", ownership: "public", main_tier: "primary", description: null };
  it("rejects mass assignment of hierarchy, URLs or administrator privileges", () => {
    for (const field of ["parent_institution_id", "supervising_ministry_id", "is_admin"]) {
      expect(schoolEditSchema.safeParse({ ...valid, [field]: "forged" }).success).toBe(false);
    }
    expect(schoolEditSchema.safeParse(valid).success).toBe(true);
    expect(schoolEditSchema.safeParse({ ...valid, slug: "example-primary-school" }).success).toBe(true);
    expect(schoolEditSchema.safeParse({ ...valid, slug: "Not a valid URL" }).success).toBe(false);
    expect(schoolEditSchema.safeParse({ ...valid, ownership: "PUBLIC" }).success).toBe(false);
  });
  it("maps junior education correctly and leaves ECDE unassigned", () => {
    expect(schoolDirectorate("junior")).toBe("directorate-primary-education");
    expect(schoolDirectorate("senior_secondary")).toBe("directorate-secondary-education");
    expect(schoolDirectorate("ecde")).toBeNull();
  });
  it("accepts editorial unpublishing independently of operational status", () => {
    expect(schoolEditSchema.safeParse({ ...valid, is_published: false, operational_status: "operational" }).success).toBe(true);
    expect(schoolEditSchema.safeParse({ ...valid, is_published: "false" }).success).toBe(false);
    expect(schoolEditSchema.safeParse({ ...valid, website_url: "javascript:alert(1)" }).success).toBe(false);
    expect(schoolEditSchema.safeParse({ ...valid, total_teachers: -1 }).success).toBe(false);
  });
  it("accepts the additional profile fields and validates coordinates and categories", () => {
    expect(schoolEditSchema.safeParse({ ...valid, gender_type: "mixed", sne_categories: ["physical"] }).success).toBe(true);
    expect(schoolEditSchema.safeParse({ ...valid, latitude: 91 }).success).toBe(false);
    expect(schoolEditSchema.safeParse({ ...valid, longitude: -181 }).success).toBe(false);
  });
  it("omits missing profile values and preserves zero resource counts", () => {
    expect(safeSchoolWebsite("javascript:alert(1)")).toBeNull();
    expect(safeSchoolWebsite("https://example.org")).toBe("https://example.org/");
    expect(hasSchoolValue(null)).toBe(false);
    expect(hasSchoolValue("unknown")).toBe(false);
    expect(hasSchoolValue([])).toBe(false);
    expect(hasSchoolValue(0)).toBe(true);
    expect(schoolValue(0)).toBe("0");
    expect(schoolValue(null)).toBe("Not recorded");
    expect(schoolSearchTerm(" %Alliance_ ")).toBe("Alliance");
  });
});
