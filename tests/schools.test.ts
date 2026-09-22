import { describe, expect, it, vi, beforeEach } from "vitest";
import { schoolEditSchema } from "@/lib/schools/admin-schema";
import { safeSchoolWebsite, schoolDirectorate, schoolSearchTerm, schoolValue } from "@/lib/schools/types";

const db = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock("@/lib/supabase/public", () => ({ createPublicClient: () => db }));
import { getPublicSchool } from "@/lib/schools/queries";

function response(data: unknown, error: unknown = null) {
  const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn().mockResolvedValue({ data, error }) };
  query.select.mockReturnValue(query); query.eq.mockReturnValue(query);
  return query;
}
beforeEach(() => db.from.mockReset());

describe("public school lookup", () => {
  it("restricts canonical and legacy URL lookups to public ownership", async () => {
    const canonical = response(null);
    const alias = response({ school_id: "school-1" });
    const target = response({ id: "school-1", slug: "example-primary" });
    db.from.mockReturnValueOnce(canonical).mockReturnValueOnce(alias).mockReturnValueOnce(target);
    expect(await getPublicSchool("old-example")).toMatchObject({ slug: "example-primary" });
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

describe("school administration and display", () => {
  const valid = { official_name: "Example Primary", ownership: "public", main_tier: "primary", description: null };
  it("rejects mass assignment of hierarchy, URLs or administrator privileges", () => {
    for (const field of ["parent_institution_id", "supervising_ministry_id", "slug", "is_admin"]) {
      expect(schoolEditSchema.safeParse({ ...valid, [field]: "forged" }).success).toBe(false);
    }
    expect(schoolEditSchema.safeParse(valid).success).toBe(true);
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
  it("blocks executable website links and preserves zero resource counts", () => {
    expect(safeSchoolWebsite("javascript:alert(1)")).toBeNull();
    expect(safeSchoolWebsite("https://example.org")).toBe("https://example.org/");
    expect(schoolValue(0)).toBe("0");
    expect(schoolValue(null)).toBe("Not recorded");
    expect(schoolSearchTerm(" %Alliance_ ")).toBe("Alliance");
  });
});
