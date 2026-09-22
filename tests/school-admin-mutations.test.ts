import { beforeEach, describe, expect, it, vi } from "vitest";
const gate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/admin-api", () => ({ requireAdminApi: gate, slugify: (value: string) => value }));
import { DELETE, PATCH } from "@/app/api/admin/schools/[id]/route";
import { DELETE as deleteInstitution } from "@/app/api/admin/institutions/[id]/route";
import { NextRequest } from "next/server";

const id = "1a04579d-9fe5-4b91-a92a-bc5d05e01701";
const context = { params: Promise.resolve({ id }) };
const request = (method: string, body: unknown, origin = "https://example.org") => new Request(`https://example.org/api/admin/schools/${id}`, { method, headers: { "Content-Type": "application/json", origin }, body: JSON.stringify(body) });
const query = { delete: vi.fn(), update: vi.fn(), eq: vi.fn(), select: vi.fn(), maybeSingle: vi.fn() };
const from = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  for (const method of [query.delete, query.update, query.eq, query.select]) method.mockReturnValue(query);
  query.maybeSingle.mockResolvedValue({ data: { id }, error: null });
  from.mockReturnValue(query);
  gate.mockResolvedValue({ ok: true, supabase: { from } });
});
describe("school mutation safeguards", () => {
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
  it("retains institution identities even for an authorised administrator", async () => {
    expect((await deleteInstitution(new NextRequest("https://example.org/api/admin/institutions/example", { method: "DELETE" }), context)).status).toBe(409);
    expect(from).not.toHaveBeenCalled();
  });
});
