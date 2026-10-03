import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/hansard/process/route";
import { chunkText } from "@/lib/hansard/grok-extract";
import { documentFromGrok } from "@/lib/hansard/grok-document";
import { emptyHansardDocument } from "@/lib/hansard/document";
vi.mock("@/lib/admin-api", () => ({ requireAdminApi: async () => ({ ok: true }) }));
const fetchMock = vi.fn();
const passage = "PAPERS\nHon. Example Member (Example Place, Example Party): I table this report.\n\nIt contains the figures requested.";
beforeEach(() => { vi.stubEnv("XAI_API_KEY", "test-only"); vi.stubGlobal("fetch", fetchMock); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); fetchMock.mockReset(); });
function request(body: unknown) { return new NextRequest("http://localhost/api/hansard/process", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }); }
function response(content: string, finish_reason = "stop") {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ choices: [{ finish_reason, message: { content } }] }), { headers: { "content-type": "application/json" } }));
}
it.each(["json", "plain", "multipart"])("extracts %s pasted text and loads an unmatched editor draft", async format => {
  response(JSON.stringify({ contributions: [{ type: "spoken", speakerName: "Example Member", sectionHeader: "PAPERS", speech: "I table this report.\n\nIt contains the figures requested.", party: null }], suggestedTopics: null, editorialSummary: null }));
  const form = new FormData(); form.set("text", passage);
  const req = format === "json" ? request({ text: passage }) : new NextRequest("http://localhost/api/hansard/process", { method: "POST", ...(format === "plain" ? { headers: { "content-type": "text/plain" }, body: passage } : { body: form }) });
  const res = await POST(req);
  expect(res.status).toBe(200);
  const data = await res.json();
  const doc = documentFromGrok(emptyHansardDocument(), data.structured);
  expect(doc.sections[0].heading).toBe("PAPERS");
  expect(doc.contributions[0]).toMatchObject({ speaker_name: "Example Member", link_status: "unmatched", body_text: "I table this report.\n\nIt contains the figures requested." });
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
  expect(sent.messages[0].content).toContain("EVERY real speech");
  expect(sent.messages[1].content).toContain(passage);
});
it("retains a short final chunk", () => {
  const text = "A".repeat(45_000) + "\nFinal words.";
  expect(chunkText(text).join("\n")).toBe(text);
});
it.each([
  ['{"contributions":[{"speech":"complete"},{"speech":"unfinished', "stop"],
  ['{"contributions":[{"speech":"partial"}]}', "length"],
  ['{"contributions":[null]}', "stop"],
])("rejects incomplete or malformed extraction without partial success", async (content, reason) => {
  response(content, reason);
  const res = await POST(request({ text: passage }));
  expect(res.status).toBe(502);
  expect((await res.json()).success).toBe(false);
});
it.each([null, [], { text: {} }, { text: "short" }])("rejects invalid input without a paid request", async body => {
  expect((await POST(request(body))).status).toBe(400);
  expect(fetchMock).not.toHaveBeenCalled();
});
it("handles provider throttling without echoing provider response bodies", async () => {
  fetchMock.mockResolvedValue(new Response("private provider diagnostics", { status: 429 }));
  const res = await POST(request({ text: passage }));
  expect(res.status).toBe(429);
  expect(await res.text()).not.toContain("private provider diagnostics");
});
it("returns a helpful timeout error", async () => {
  fetchMock.mockRejectedValue(new DOMException("timeout", "TimeoutError"));
  const res = await POST(request({ text: passage }));
  expect(res.status).toBe(504);
  expect((await res.json()).error).toContain("shorter passage");
});
