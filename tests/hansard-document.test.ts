import { describe, expect, it } from "vitest";
import { emptyHansardDocument, prepareHansardDocument, publicationIssues } from "@/lib/hansard/document";

function fixture() {
  const doc = emptyHansardDocument();
  doc.sitting = { ...doc.sitting, slug: "senate-2026-09-29-morning", title: "Morning sitting", house_type: "senate", sitting_date: "2026-09-29" };
  doc.contributions = [{ contribution_key: "speech-1", section_key: "debate-1", sort_order: 1, contribution_type: "speech", speaker_kind: "unknown", speaker_name: "Speaker from PDF", body_html: "", body_text: "First paragraph.\n\nSecond paragraph.", language: "en", is_chair: false, link_status: "unmatched", review_status: "pending" }];
  return doc;
}
describe("Hansard PDF import contract", () => {
  it("prepares plain paragraphs for display and preserves formatted tables", () => {
    const doc = fixture();
    expect(prepareHansardDocument(doc).contributions[0].body_html).toContain("<p>Second paragraph.</p>");
    doc.contributions[0].body_html = '<p><strong>Statement</strong></p><table><tbody><tr><td colspan="2">Value</td></tr></tbody></table>';
    const prepared = prepareHansardDocument(doc);
    expect(prepared.contributions[0].body_html).toContain('colspan="2"');
    expect(prepared.contributions[0].body_text).toContain("Value");
    expect(prepareHansardDocument(prepared)).toEqual(prepared);
  });
  it("removes scripts and unsafe links before saving", () => {
    const doc = fixture(); doc.contributions[0].body_html = '<script>alert(1)</script><p onclick="bad()">Hello <a href="javascript:bad()">world</a></p>';
    const html = prepareHansardDocument(doc).contributions[0].body_html;
    expect(html).not.toMatch(/script|onclick|javascript|alert/);
    expect(html).toContain("Hello");
  });
  it("preserves pasted plain text paragraphs and searchable punctuation", () => {
    const doc = fixture(); doc.contributions[0].body_html = "One & two.\n\nThree < four.";
    const c = prepareHansardDocument(doc).contributions[0];
    expect(c.body_html).toBe("<p>One &amp; two.</p><p>Three &lt; four.</p>");
    expect(c.body_text).toBe("One & two.\nThree < four.");
  });
  it("rejects ambiguous keys, order and section trees", () => {
    const doc = fixture(); doc.contributions.push({ ...doc.contributions[0] });
    expect(() => prepareHansardDocument(doc)).toThrow("keys must be unique");
    doc.contributions[1].contribution_key = "second";
    expect(() => prepareHansardDocument(doc)).toThrow("order must be unique");
    doc.contributions.pop(); doc.sections[0].parent_key = "debate-1";
    expect(() => prepareHansardDocument(doc)).toThrow("cannot form a cycle");
    doc.sections[0].parent_key = null; doc.contributions[0].section_key = "missing";
    expect(() => prepareHansardDocument(doc)).toThrow("Unknown section");
  });
  it("requires reviewed content and confirmed historical roles for members", () => {
    const doc = fixture(); expect(publicationIssues(doc).length).toBeGreaterThan(0);
    doc.sitting.review_status = "reviewed";
    doc.sitting.source_access = "public";
    Object.assign(doc.contributions[0], { review_status: "reviewed", speaker_kind: "member", link_status: "confirmed", leader_id: "123" });
    expect(publicationIssues(doc)).toContain("Contribution 1: select the member's parliamentary role on this date.");
    doc.contributions[0].leader_role_id = "role";
    expect(publicationIssues(doc)).toEqual([]);
  });
  it("fails closed for unverified, restricted and misclassified sources", () => {
    const doc = fixture();
    expect(publicationIssues(doc)).toContain("Verify that the source is publicly accessible before publishing.");
    doc.sitting.source_access = "public";
    doc.sitting.source_community_id = "1653b0ba-1c30-45fa-be00-98afccf14b49";
    expect(publicationIssues(doc)).toContain("The source community is restricted or does not match the proceeding type.");
    doc.sitting.source_community_id = null;
    doc.sitting.proceeding_type = "bound-volume";
    expect(publicationIssues(doc)).toContain("Restricted proceedings cannot be published on this site.");
    doc.sitting.proceeding_type = "joint-sitting";
    doc.sitting.source_community_id = "2fa15201-cbe0-4290-9fcb-eed7ffb03c9b";
    expect(publicationIssues(doc)).toContain("The source community is restricted or does not match the proceeding type.");
    doc.sitting.source_community_id = null;
    doc.sitting.official_hansard_url = "https://hansardna.parliament.go.ke/communities/ab0cdf0a-fcf7-4fec-b07c-63d4d122b379";
    expect(publicationIssues(doc)).toContain("The source URL points to a restricted community.");
  });
});
