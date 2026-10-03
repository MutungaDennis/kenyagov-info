import { expect, it } from "vitest";
import { emptyHansardDocument } from "@/lib/hansard/document";
import { documentFromGrok } from "@/lib/hansard/grok-document";

it("preserves debate transitions, printed metadata and source provenance without approving identities", () => {
  const current = emptyHansardDocument();
  current.sitting.status = "published";
  current.sitting.source_access = "public";
  current.sources = [{ source_url: "https://example.org/report.pdf", is_official_source: true, extraction_method: "manual" }];
  const doc = documentFromGrok(current, { contributions: [
    { type: "header", speech: "PAPERS" },
    { speakerName: "Printed name", speech: "First paragraph.\n\nSecond paragraph.", constituency: "Printed place", party: "Printed party" },
    { speakerName: "Chair name", speech: "Next item.", sectionHeader: "QUESTIONS", role: "Deputy Speaker", startTime: "2.30 pm" },
    { type: "members", speech: "Agreed." },
    { speakerName: "Printed name", sectionHeader: "PAPERS", speech: "Resumed debate." },
  ] });
  expect(doc.sections.map(s => s.heading)).toEqual(["PAPERS", "QUESTIONS", "PAPERS"]);
  expect(doc.contributions.map(c => c.section_key)).toEqual(["debate-1", "debate-2", "debate-2", "debate-3"]);
  expect(doc.contributions[0]).toMatchObject({ constituency: "Printed place", party: "Printed party", leader_id: null, leader_role_id: null, link_status: "unmatched", review_status: "pending" });
  expect(doc.contributions[1]).toMatchObject({ is_chair: true, capacity: "Deputy Speaker", spoken_at: "2.30 pm" });
  expect(doc.contributions[2]).toMatchObject({ speaker_kind: "collective", link_status: "not-applicable" });
  expect(doc.sitting).toMatchObject({ status: "draft", source_access: "unknown", review_status: "pending" });
  expect(doc.sources[0]).toMatchObject({ source_url: "https://example.org/report.pdf", extraction_method: "grok" });
  expect(current.sitting.status).toBe("published");
});

it("rejects an extraction containing headings only", () => {
  expect(() => documentFromGrok(emptyHansardDocument(), { contributions: [{ type: "header", speech: "PAPERS" }] })).toThrow("no speeches");
});
