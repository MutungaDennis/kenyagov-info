import { beforeEach, describe, expect, it, vi } from "vitest";
const gate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/admin-api", () => ({ requireAdminApi: gate, slugify: (value: string) => value }));
import { DELETE, PATCH } from "@/app/api/admin/schools/[id]/route";
import { POST as createSchool } from "@/app/api/admin/schools/route";
import { DELETE as deleteInstitution } from "@/app/api/admin/institutions/[id]/route";
import { NextRequest } from "next/server";

const id = "1a04579d-9fe5-4b91-a92a-bc5d05e01701";
const context = { params: Promise.resolve({ id }) };
const request = (method: string, body: unknown, origin = "https://example.org") => new Request(`https://example.org/api/admin/schools/${id}`, { method, headers: { "Content-Type": "application/json", origin }, body: JSON.stringify(body) });
const query = { delete: vi.fn(), update: vi.fn(), insert: vi.fn(), eq: vi.fn(), select: vi.fn(), maybeSingle: vi.fn(), single: vi.fn() };
const from = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  for (const method of [query.delete, query.update, query.insert, query.eq, query.select]) method.mockReturnValue(query);
  query.maybeSingle.mockResolvedValue({ data: { id }, error: null });
  query.single.mockResolvedValue({ data: { id, slug: "example-primary" }, error: null });
  from.mockReturnValue(query);
  gate.mockResolvedValue({ ok: true, supabase: { from } });
});
describe("school mutation safeguards", () => {
  it("creates an unpublished school with a verified county name", async () => {
    query.maybeSingle.mockResolvedValueOnce({ data: { name: "Nairobi" }, error: null });
    const response = await createSchool(request("POST", {
      official_name: "Example Primary",
      slug: "example-primary",
      ownership: "public",
      main_tier: "primary",
      institution_type: "regular",
      county_code: 47,
      description: null,
    }));
    expect(response.status).toBe(201);
    expect(query.insert).toHaveBeenCalledWith(expect.objectContaining({
      official_name: "Example Primary",
      normalized_name: "example primary",
      county: "Nairobi",
      county_code: 47,
      is_published: false,
    }));
  });
  it("rejects school categories that the database does not allow", async () => {
    const response = await createSchool(request("POST", {
      official_name: "Example Primary",
      slug: "example-primary",
      ownership: "public",
      main_tier: "primary",
      institution_type: "integrated",
      county_code: 47,
      description: null,
    }));
    expect(response.status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });
  it("deletes only the school matching both ID and confirmed saved name", async () => {
    expect((await DELETE(request("DELETE", { confirmation: "Example Primary" }), context)).status).toBe(200);
    expect(query.eq).toHaveBeenCalledWith("id", id);
    expect(query.eq).toHaveBeenCalledWith("official_name", "Example Primary");
  });
  it("rejects cross-origin deletion and missing confirmation before querying", async () => {
    expect((await DELETE(request("DELETE", { confirmation: "Example Primary" }, "https://other.org"), context)).status).toBe(403);
    expect((await DELETE(request("DELETE", {}), context)).status).toBe(400);
    expect(from).not.toHaveBeenCalled();
  });
  it("does not report success when a school name has changed", async () => {
    query.maybeSingle.mockResolvedValueOnce({ data: null, error: null });
    expect((await DELETE(request("DELETE", { confirmation: "Old name" }), context)).status).toBe(409);
  });
  it("persists an unpublished flag without altering ownership", async () => {
    expect((await PATCH(request("PATCH", { official_name: "Example Primary", ownership: "public", main_tier: "primary", description: null, is_published: false }), context)).status).toBe(200);
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({ ownership: "public", is_published: false }));
  });
  it("accepts a partial edit without revalidating unrelated legacy fields", async () => {
    query.maybeSingle
      .mockResolvedValueOnce({ data: { county_code: 47, sub_county_id: null, constituency_id: null }, error: null })
      .mockResolvedValueOnce({ data: { id }, error: null });
    const response = await PATCH(request("PATCH", { short_name: "Example" }), context);
    expect(response.status).toBe(200);
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({ short_name: "Example" }));
    expect(query.update).not.toHaveBeenCalledWith(expect.objectContaining({ website_url: expect.anything() }));
  });
  it("saves school name history and establishment year directly on the school", async () => {
    const response = await PATCH(request("PATCH", { former_name: "Old School Name", established_year: 1984 }), context);
    expect(response.status).toBe(200);
    expect(query.update).toHaveBeenCalledWith(expect.objectContaining({
      former_name: "Old School Name",
      established_year: 1984,
    }));
  });
  it("explains when the school metadata migration is missing", async () => {
    query.maybeSingle
      .mockResolvedValueOnce({ data: { county_code: 47, sub_county_id: null, constituency_id: null }, error: null })
      .mockResolvedValueOnce({ data: null, error: { code: "42703", message: "column education_schools.established_year does not exist" } });
    const response = await PATCH(request("PATCH", { established_year: 1984 }), context);
    expect(response.status).toBe(409);
    expect((await response.json()).error).toContain("20261124_school_name_history_and_established_year.sql");
  });
  it("retains institution identities even for an authorised administrator", async () => {
    expect((await deleteInstitution(new NextRequest("https://example.org/api/admin/institutions/example", { method: "DELETE" }), context)).status).toBe(409);
    expect(from).not.toHaveBeenCalled();
  });
});
