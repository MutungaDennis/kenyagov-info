import { z } from "zod";
import { safeHtml, escapeHtml } from "@/lib/safe-html";
import sanitizeHtml from "sanitize-html";
import { PUBLIC_PROCEEDINGS, REPOSITORY_COMMUNITIES } from "./collections";

const uuid = z.string().uuid().nullable().optional();
const text = z.string().nullable().optional();
const page = z.number().int().positive().nullable().optional();
const key = z.string().regex(/^[a-zA-Z0-9_-]+$/).max(100);
const httpUrl = z.union([z.literal(""), z.url().refine(v => /^https?:\/\//i.test(v), "Use an HTTP or HTTPS URL")]).nullable().optional();
export const hansardDocumentSchema = z.object({
  schema_version: z.literal(2),
  sitting: z.object({
    id: uuid, slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/).max(180), title: z.string().trim().min(1).max(500),
    house_type: z.enum(["national-assembly", "senate", "county-assembly"]),
    proceeding_type: z.enum(["house-proceeding", "joint-sitting", "state-opening", "committee-proceeding", "bound-volume"]).default("house-proceeding"),
    source_access: z.enum(["unknown", "public", "restricted"]).default("unknown"),
    source_community_id: uuid, source_collection_id: uuid, source_item_id: uuid,
    sitting_date: z.iso.date(), sitting_period: z.string().default("Morning Sitting"),
    sitting_number: text, parliament_number: page, session_number: page, parliamentary_term: text,
    county_id: uuid, county_name: text, starts_at: text, ends_at: text,
    official_hansard_url: httpUrl, youtube_url: httpUrl,
    summary_html: z.string().default(""), summary_text: z.string().default(""), topics: z.array(z.string()).default([]),
    status: z.enum(["draft", "review", "published", "archived"]).default("draft"),
    review_status: z.enum(["pending", "reviewed"]).default("pending"),
    presiding_leader_id: uuid, presiding_role_id: uuid, presiding_display_name: text, presiding_capacity: text,
  }),
  sections: z.array(z.object({
    section_key: key, parent_key: key.nullable().optional(), heading: z.string().trim().min(1),
    section_type: z.enum(["debate", "question", "statement", "motion", "bill", "petition", "paper", "procedural", "other"]).default("debate"),
    sort_order: z.number().int().nonnegative(), body_html: z.string().default(""), body_text: z.string().default(""),
    source_page_start: page, source_page_end: page,
  })).max(2000),
  contributions: z.array(z.object({
    contribution_key: key, section_key: key, sort_order: z.number().int().positive(),
    contribution_type: z.enum(["speech", "interjection", "procedural", "collective", "written"]).default("speech"),
    speaker_kind: z.enum(["member", "office-holder", "guest", "collective", "unknown"]).default("unknown"),
    leader_id: uuid, leader_role_id: uuid, speaker_name: z.string().default(""), speaker_title: text,
    constituency: text, county: text, party: text, capacity: text, is_chair: z.boolean().default(false),
    body_html: z.string().default(""), body_text: z.string().default(""), language: z.string().default("en"),
    spoken_at: text, source_page: page, source_column: text,
    link_status: z.enum(["unmatched", "suggested", "confirmed", "not-applicable"]).default("unmatched"),
    review_status: z.enum(["pending", "reviewed"]).default("pending"),
  })).max(10000),
  sources: z.array(z.object({
    source_url: httpUrl, file_name: text, storage_path: text, document_file_id: uuid,
    page_count: page, sha256: z.string().regex(/^[a-fA-F0-9]{64}$/).nullable().optional(),
    is_official_source: z.boolean().default(true),
    extraction_method: z.enum(["manual", "pdf-text", "ocr", "grok", "other"]).default("manual"),
    extracted_at: z.iso.datetime().nullable().optional(),
  })).default([]),
});
export type HansardDocument = z.infer<typeof hansardDocumentSchema>;
export type SittingRecord = HansardDocument["sitting"] & { id: string; published_at?: string; created_at?: string; updated_at?: string };
export type ContributionRecord = HansardDocument["contributions"][number];
export type MemberCandidate = { leader_id: string; leader_role_id: string; full_name: string; slug: string; title: string; party?: string; constituency?: string; county?: string; term_start_date: string; term_end_date?: string };

export function preparedBody(html: string, plain: string) {
  const source = html || plain;
  const body_html = safeHtml(html && /<[a-z][^>]*>/i.test(html) ? html : source.split(/\n\s*\n/).map(p => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`).join(""));
  const body_text = sanitizeHtml(body_html.replace(/<br\s*\/?\s*>|<\/(p|div|h[1-6]|tr|li)>/gi, "\n"), { allowedTags: [], allowedAttributes: {} })
    .replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (_match, entity: string) => ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" })[entity] || "").trim();
  return { body_html, body_text };
}
export function prepareHansardDocument(input: unknown): HansardDocument {
  const doc = hansardDocumentSchema.parse(input);
  const sectionKeys = new Set(doc.sections.map(s => s.section_key));
  if (sectionKeys.size !== doc.sections.length) throw new Error("Section keys must be unique");
  const keys = new Set(doc.contributions.map(c => c.contribution_key));
  if (keys.size !== doc.contributions.length) throw new Error("Contribution keys must be unique");
  const order = new Set(doc.contributions.map(c => c.sort_order));
  if (order.size !== doc.contributions.length) throw new Error("Contribution order must be unique");
  for (const section of doc.sections) {
    const seen = new Set([section.section_key]);
    let parent = section.parent_key;
    while (parent) {
      if (!sectionKeys.has(parent) || seen.has(parent)) throw new Error("Section parents must exist and cannot form a cycle");
      seen.add(parent); parent = doc.sections.find(s => s.section_key === parent)?.parent_key;
    }
    Object.assign(section, preparedBody(section.body_html, section.body_text));
  }
  for (const contribution of doc.contributions) {
    if (!sectionKeys.has(contribution.section_key)) throw new Error(`Unknown section for ${contribution.contribution_key}`);
    Object.assign(contribution, preparedBody(contribution.body_html, contribution.body_text));
  }
  const summary = preparedBody(doc.sitting.summary_html, doc.sitting.summary_text);
  doc.sitting.summary_html = summary.body_html; doc.sitting.summary_text = summary.body_text;
  return doc;
}
export function publicationIssues(doc: HansardDocument): string[] {
  const issues: string[] = [];
  if (doc.sitting.source_access !== "public") issues.push("Verify that the source is publicly accessible before publishing.");
  if (!PUBLIC_PROCEEDINGS.includes(doc.sitting.proceeding_type)) issues.push("Restricted proceedings cannot be published on this site.");
  const community = REPOSITORY_COMMUNITIES.find(c => c.id === doc.sitting.source_community_id);
  if (community && (!community.public || community.type !== doc.sitting.proceeding_type)) issues.push("The source community is restricted or does not match the proceeding type.");
  const urls = [doc.sitting.official_hansard_url, ...doc.sources.map(s => s.source_url)].filter(Boolean);
  if (REPOSITORY_COMMUNITIES.some(c => !c.public && urls.some(url => url!.includes(c.id)))) issues.push("The source URL points to a restricted community.");
  if (!doc.contributions.length) issues.push("Add at least one contribution.");
  if (doc.sitting.review_status !== "reviewed") issues.push("Mark the sitting metadata as reviewed.");
  for (const c of doc.contributions) {
    const label = `Contribution ${c.sort_order}`;
    if (c.review_status !== "reviewed") issues.push(`${label}: review the text.`);
    if (!c.body_text.trim()) issues.push(`${label}: add the speech text.`);
    if (c.speaker_kind === "unknown") issues.push(`${label}: identify the speaker type.`);
    if (["unmatched", "suggested"].includes(c.link_status)) issues.push(`${label}: confirm the member or mark this as a non-member contribution.`);
    if (c.speaker_kind === "member" && (!c.leader_id || !c.leader_role_id || c.link_status !== "confirmed")) issues.push(`${label}: select the member's parliamentary role on this date.`);
  }
  return issues;
}
export function emptyHansardDocument(): HansardDocument {
  return { schema_version: 2, sitting: { slug: "", title: "", house_type: "national-assembly", proceeding_type: "house-proceeding", source_access: "unknown", sitting_date: "", sitting_period: "Morning Sitting", status: "draft", review_status: "pending", summary_html: "", summary_text: "", topics: [] },
    sections: [{ section_key: "debate-1", heading: "Proceedings", section_type: "debate", sort_order: 1, body_html: "", body_text: "" }], contributions: [], sources: [] };
}
