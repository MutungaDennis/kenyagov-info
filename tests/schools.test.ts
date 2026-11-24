import { describe, expect, it, vi, beforeEach } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SchoolProfile from "@/components/schools/SchoolProfile";
import EducationDirectorateLanding, { isEducationDirectorateSlug } from "@/components/schools/EducationDirectorateLanding";
import { schoolEditSchema, schoolPatchSchema } from "@/lib/schools/admin-schema";
import { hasSchoolValue, safeSchoolWebsite, schoolDirectorate, schoolSearchTerm, schoolValue } from "@/lib/schools/types";

const db = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/lib/supabase/public", () => ({ createPublicClient: () => db }));
import { getPublicSchool } from "@/lib/schools/queries";

function response(data: unknown, error: unknown = null) {
  const result = { data, error };
  const query = Object.assign(Promise.resolve(result), {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  });
  query.select.mockReturnValue(query); query.eq.mockReturnValue(query); query.order.mockReturnValue(query);
  return query;
}
beforeEach(() => db.from.mockReset());

describe("education directorate routes", () => {
  it("renders separate primary and secondary school landing pages for their institution URLs", () => {
    const primarySlug = "directorate-primary-education";
    const secondarySlug = "directorate-secondary-education";
    const primary = renderToStaticMarkup(createElement(EducationDirectorateLanding, { slug: primarySlug }));
    const secondary = renderToStaticMarkup(createElement(EducationDirectorateLanding, { slug: secondarySlug }));

    expect(isEducationDirectorateSlug(primarySlug)).toBe(true);
    expect(isEducationDirectorateSlug(secondarySlug)).toBe(true);
    expect(isEducationDirectorateSlug("not-an-education-directorate")).toBe(false);
    expect(primary).toContain("Directorate of Primary Education");
    expect(primary).toContain("Search schools by name or location");
    expect(secondary).toContain("Directorate of Secondary Education");
    expect(secondary).toContain("Search schools by name or location");
  });
});

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
  it("falls back to the existing school fields until the optional gate columns exist", async () => {
    const school = { id: "legacy-school", slug: "legacy-school" };
    db.from.mockReturnValueOnce(response(null, { message: "column education_schools.entrance_lat does not exist" }))
      .mockReturnValueOnce(response(school))
      .mockReturnValueOnce(response(null, { message: "sources unavailable" }))
      .mockReturnValueOnce(response(null, { message: "officials unavailable" }));

    await expect(getPublicSchool("legacy-school")).resolves.toMatchObject({
      slug: "legacy-school", entrance_lat: null, entrance_lng: null,
    });
  });
  it("does not expose a private school through a legacy alias", async () => {
    db.from.mockReturnValueOnce(response(null)).mockReturnValueOnce(response({ school_id: "private-1" })).mockReturnValueOnce(response(null));
    expect(await getPublicSchool("private-old")).toBeNull();
  });
  it("keeps a school profile available when optional source and official records fail", async () => {
    const school = { id: "school-optional", slug: "school-optional" };
    db.from.mockReturnValueOnce(response(school))
      .mockReturnValueOnce(response(null, { message: "source records unavailable" }))
      .mockReturnValueOnce(response(null, { message: "officials unavailable" }));

    await expect(getPublicSchool("school-optional")).resolves.toMatchObject({
      slug: "school-optional",
      sources: [],
      officials: [],
    });
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
      county_code: 47, moe_category: "c2", gender_type: null, accommodation_type: null,
      operational_status: "operational", description: null, institution_type: "regular",
      registration_status: null, constituency: null, ward: null, physical_address: null,
      postal_address: null, latitude: -1.2864, longitude: 36.8172, entrance_lat: -1.2865, entrance_lng: 36.8173, public_phone: null, public_email: null,
      website_url: null, nemis_code: null, knec_code: null, tsc_code: null, sponsor_name: null,
      special_needs_status: null, sne_categories: null, total_enrollment: null, total_teachers: null,
      water_source: null, power_source: null, internet_connectivity: null,
      verification_status: "source_confirmed", last_verified_at: null,
      created_at: "2024-01-01T00:00:00Z", updated_at: "2025-02-03T00:00:00Z",
      parent: null, ministry: null,
      sources: [{ id: "source-1", external_record_id: "record-1", external_name: "Example School", review_status: "approved", raw_record: { school_metadata: {
        former_school_name: "Mutembuku Secondary School", first_published_date: "2017-01-01",
        dataset_last_updated: "2020-08-24", metadata_last_updated: "2023-01-20",
      } }, source: {
        title: "Kenya Schools dataset", publisher: "Education Data Publisher", source_url: "https://example.org/schools",
        licence: "Open data licence", publication_date: null, reference_year: 2025,
      } }],
      officials: [{ id: "official-1", full_name: "Amina Example", role_title: "Head teacher",
        start_date: "2023-01-01", end_date: null, biography: null, photo_url: null }],
    } as never }));
    expect(markup).toContain("Kenya Schools dataset");
    expect(markup).toContain("Former school name");
    expect(markup).toContain("Mutembuku Secondary School");
    expect(markup).toContain("First published: 1 January 2017");
    expect(markup).toContain("Dataset last updated: 24 August 2020");
    expect(markup).toContain("Metadata last updated: 20 January 2023");
    expect(markup).toContain("Cluster 2 (C2)");
    expect(markup).toContain("https://www.google.com/maps/dir/?api=1&amp;destination=-1.2865,36.8173");
    expect(markup).toContain("Get directions to the main gate");
    expect(markup).toContain('"latitude":-1.2865,"longitude":36.8173');
    expect(schoolValue("day_and_boarding")).toBe("Day And Boarding");
    expect(schoolValue("school@example.org")).toBe("school@example.org");
    expect(markup).toContain("https://example.org/schools");
    expect(markup).toContain("Page created: 1 January 2024");
    expect(markup).toContain("Last updated: 3 February 2025");
    expect(markup).not.toContain("Verification:");
    expect(markup.indexOf("Kenya Schools dataset")).toBeLessThan(markup.indexOf("Information updated"));
    expect(markup.indexOf("Information updated")).toBeGreaterThan(markup.indexOf("Amina Example"));
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
    expect(schoolPatchSchema.safeParse({ short_name: "New short name" }).success).toBe(true);
    expect(schoolPatchSchema.safeParse({ website_url: "javascript:alert(1)" }).success).toBe(false);
  });
  it("accepts comprehensive schools and maps them to primary education", () => {
    expect(schoolEditSchema.safeParse({ ...valid, main_tier: "comprehensive" }).success).toBe(true);
    expect(schoolDirectorate("comprehensive")).toBe("directorate-primary-education");
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
    expect(schoolEditSchema.safeParse({ ...valid, entrance_lat: -1.2865, entrance_lng: 36.8173 }).success).toBe(true);
    expect(schoolEditSchema.safeParse({ ...valid, entrance_lat: 91, entrance_lng: 36.8173 }).success).toBe(false);
    expect(schoolEditSchema.safeParse({ ...valid, entrance_lng: 181 }).success).toBe(false);
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
