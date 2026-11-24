import { beforeEach, describe, expect, it, vi } from "vitest";

const gate = vi.hoisted(() => vi.fn());
vi.mock("@/lib/admin-api", () => ({ requireAdminApi: gate }));
import { PATCH } from "@/app/api/admin/schools/[id]/sources/route";

const schoolId = "1a04579d-9fe5-4b91-a92a-bc5d05e01701";
const sourceRecordId = "2b04579d-9fe5-4b91-a92a-bc5d05e01702";
const sourceId = "3c04579d-9fe5-4b91-a92a-bc5d05e01703";
const query = {
  update: vi.fn(),
  select: vi.fn(),
  eq: vi.fn(),
  maybeSingle: vi.fn(),
};
const from = vi.fn();
const context = { params: Promise.resolve({ id: schoolId }) };
const request = (body: unknown, origin = "https://example.org") => new Request(
  `https://example.org/api/admin/schools/${schoolId}/sources`,
  { method: "PATCH", headers: { "Content-Type": "application/json", origin }, body: JSON.stringify(body) },
);

beforeEach(() => {
  vi.clearAllMocks();
  query.update.mockReturnValue(query);
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.maybeSingle
    .mockResolvedValueOnce({ data: { id: sourceRecordId, source_id: sourceId, raw_record: {} }, error: null })
    .mockResolvedValueOnce({ data: { id: sourceId }, error: null })
    .mockResolvedValueOnce({ data: { id: sourceRecordId }, error: null });
  from.mockReturnValue(query);
  gate.mockResolvedValue({ ok: true, supabase: { from } });
});

describe("school source updates", () => {
  it("updates details only after confirming the source is linked to this school", async () => {
    const response = await PATCH(request({
      id: sourceRecordId,
      title: "Updated source title",
      publisher: "Ministry of Education",
      source_url: "https://education.go.ke/report",
      publication_date: null,
      reference_year: 2026,
      licence: "Open data",
      notes: "Verified against the latest report",
      former_school_name: "Mutembuku Secondary School",
      first_published_date: "2017-01-01",
      dataset_last_updated: "2020-08-24",
      metadata_last_updated: "2023-01-20",
    }), context);

    expect(response.status).toBe(200);
    expect(from).toHaveBeenNthCalledWith(1, "education_school_source_records");
    expect(from).toHaveBeenNthCalledWith(2, "education_data_sources");
    expect(query.update).toHaveBeenCalledWith({
      title: "Updated source title",
      publisher: "Ministry of Education",
      source_url: "https://education.go.ke/report",
      publication_date: null,
      reference_year: 2026,
      licence: "Open data",
      notes: "Verified against the latest report",
    });
    expect(query.update).toHaveBeenCalledWith({ raw_record: expect.objectContaining({
      school_metadata: expect.objectContaining({
        former_school_name: "Mutembuku Secondary School",
        first_published_date: "2017-01-01",
        dataset_last_updated: "2020-08-24",
        metadata_last_updated: "2023-01-20",
      }),
    }) });
    expect(query.eq).toHaveBeenCalledWith("school_id", schoolId);
    expect(query.eq).toHaveBeenCalledWith("id", sourceId);
  });

  it("rejects a cross-origin source update", async () => {
    const response = await PATCH(request({ id: sourceRecordId }, "https://other.example"), context);
    expect(response.status).toBe(403);
    expect(from).not.toHaveBeenCalled();
  });
});
