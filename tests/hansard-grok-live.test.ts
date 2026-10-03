import { expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/hansard/process/route";
import { documentFromGrok } from "@/lib/hansard/grok-document";
import { emptyHansardDocument, prepareHansardDocument } from "@/lib/hansard/document";

// Explicit opt-in only: uses xAI credits. Admin gate is isolated here; its actual
// authorization behavior is covered by admin-routes.test.ts. No database writes.
vi.mock("@/lib/admin-api", () => ({ requireAdminApi: async () => ({ ok: true }) }));
it.skipIf(process.env.RUN_HANSARD_GROK_LIVE !== "1")("parses a real pasted-text request through xAI into a valid editor document", async () => {
  const text = `SYNTHETIC TEST TRANSCRIPT - NOT AN OFFICIAL RECORD
PAPERS
Hon. Example Member (Example Constituency, Example Party): I beg to lay this report on the Table.

The report contains three recommendations for better access to clean water.

QUESTIONS AND STATEMENTS
Hon. Second Example (Second Constituency, Second Party): When will the repairs begin?
Hon. Example Member (Example Constituency, Example Party): The repairs will begin on Monday.`;
  const res = await POST(new NextRequest("http://localhost/api/hansard/process", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, houseType: "national-assembly" }) }));
  expect(res.status).toBe(200);
  const result = await res.json();
  const current = emptyHansardDocument();
  current.sitting = { ...current.sitting, slug: "synthetic-test", title: "Synthetic test", sitting_date: "2026-09-30" };
  const doc = prepareHansardDocument(documentFromGrok(current, result.structured));
  expect(doc.contributions.length).toBe(3);
  expect(doc.sections.map(section => section.heading).join(" ")).toContain("PAPERS");
  expect(doc.sections.map(section => section.heading).join(" ")).toContain("QUESTIONS");
  expect(doc.contributions[0].body_text).toContain("three recommendations");
  expect(doc.contributions[1].body_text).toContain("When will the repairs begin?");
  expect(doc.contributions[2].body_text).toContain("Monday");
  expect(doc.contributions.every(c => c.link_status === "unmatched" && c.leader_id === null)).toBe(true);
  expect(doc.contributions[0].body_html).toContain("<p>");
}, 150_000);
