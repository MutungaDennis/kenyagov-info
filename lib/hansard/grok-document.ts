import { emptyHansardDocument, type HansardDocument } from "./document";

type ExtractedTurn = {
  type?: string; speakerName?: string; speakerTitle?: string; constituency?: string;
  party?: string; role?: string; speech?: string; startTime?: string; sectionHeader?: string;
};

/** Keep extracted debate boundaries and printed metadata; never approve AI identities. */
export function documentFromGrok(current: HansardDocument, result: {
  contributions: ExtractedTurn[]; editorialSummary?: string; suggestedTopics?: string[];
}): HansardDocument {
  const next = emptyHansardDocument();
  next.sitting = { ...current.sitting, id: undefined, status: "draft", review_status: "pending",
    source_access: "unknown", summary_text: result.editorialSummary || "", summary_html: "",
    topics: result.suggestedTopics || [] };
  next.sections = [];
  next.sources = current.sources.map(source => ({ ...source, extraction_method: "grok" }));
  let active: HansardDocument["sections"][number] | undefined;
  for (const turn of result.contributions) {
    const header = turn.type === "header" || turn.type === "mini-header";
    const heading = (turn.sectionHeader || (header ? turn.speech || turn.speakerName : "") || "").trim();
    if (!active || (heading && active.heading !== heading)) {
      active = { section_key: `debate-${next.sections.length + 1}`, heading: heading || "Proceedings",
        section_type: "debate", sort_order: next.sections.length + 1, body_html: "", body_text: "" };
      next.sections.push(active);
    }
    if (header) continue;
    const collective = turn.type === "members";
    next.contributions.push({ contribution_key: `speech-${next.contributions.length + 1}`,
      section_key: active.section_key, sort_order: next.contributions.length + 1,
      contribution_type: collective ? "collective" : turn.type === "procedural" ? "procedural" : "speech",
      speaker_kind: collective ? "collective" : "unknown", speaker_name: turn.speakerName || "",
      speaker_title: turn.speakerTitle, constituency: turn.constituency, party: turn.party,
      capacity: turn.role, spoken_at: turn.startTime,
      is_chair: /\b(speaker|chairperson|chairman|chairwoman)\b/i.test(`${turn.speakerTitle || ""} ${turn.role || ""}`),
      leader_id: null, leader_role_id: null, body_html: "", body_text: turn.speech || "", language: "en",
      link_status: collective ? "not-applicable" : "unmatched", review_status: "pending" });
  }
  if (!next.contributions.length) throw new Error("Grok returned no speeches. Review the source text and try again.");
  return next;
}
