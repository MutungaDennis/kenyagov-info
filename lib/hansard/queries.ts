import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";
import type { ProceedingType } from "./collections";
import type { HansardDocument, SittingRecord, ContributionRecord } from "./document";
export type HansardContribution = {
  _key: string; order: number;
  type: "spoken" | "members" | "procedural" | "header" | "mini-header";
  supabaseLeaderId?: string; speakerName?: string; speakerTitle?: string;
  constituency?: string; party?: string; role?: string; isChairContribution?: boolean;
  startTime?: string; sectionHeader?: string; speech: unknown[];
};
export type HansardSitting = {
  _id: string; title: string; proceedingType: ProceedingType; slug: { current: string };
  houseType: "national-assembly" | "senate" | "county-assembly";
  sittingDate: string; sittingPeriod: string; parliamentaryTerm: string;
  county?: string; countyName?: string; youtubeUrl?: string; officialHansardUrl?: string;
  editorialSummary?: unknown[]; topics?: string[]; keyEvents?: string[];
  presidingOfficer?: { role?: string; displayName?: string; supabaseLeaderId?: string; notes?: string };
  isActive: boolean; contributionCount: number; contributions: HansardContribution[];
};

type SittingRow = SittingRecord & { hansard_contributions?: { count: number }[] };
const blocks = (text: string) => text ? [{ _type: "block", _key: "text", style: "normal", markDefs: [], children: [{ _type: "span", _key: "text", text, marks: [] }] }] : [];
function sitting(row: SittingRow): HansardSitting {
 return { _id: row.id, title: row.title, proceedingType: row.proceeding_type, slug: { current: row.slug }, houseType: row.house_type, sittingDate: row.sitting_date,
 sittingPeriod: row.sitting_period, parliamentaryTerm: row.parliamentary_term || "", county: row.county_id || undefined, countyName: row.county_name || undefined,
 youtubeUrl: row.youtube_url || undefined, officialHansardUrl: row.official_hansard_url || undefined, editorialSummary: blocks(row.summary_text), topics: row.topics,
 presidingOfficer: { displayName: row.presiding_display_name || undefined, role: row.presiding_capacity || undefined, supabaseLeaderId: row.presiding_leader_id || undefined },
 isActive: row.status === "published", contributionCount: row.hansard_contributions?.[0]?.count || 0, contributions: [] };
}
function contribution(row: ContributionRecord, heading?: string): HansardContribution {
 return { sectionHeader: heading, _key: row.contribution_key, order: row.sort_order, type: row.contribution_type === "collective" ? "members" : row.contribution_type === "procedural" ? "procedural" : "spoken",
 supabaseLeaderId: row.leader_id || undefined, speakerName: row.speaker_name, speakerTitle: row.speaker_title || undefined, constituency: row.constituency || undefined,
 party: row.party || undefined, role: row.capacity || undefined, isChairContribution: row.is_chair, startTime: row.spoken_at || undefined, speech: blocks(row.body_text) };
}
const fields = "*,hansard_contributions(count)";
export type ArchiveFilters = { house?: string; proceeding?: string; q?: string; term?: string; year?: string; county?: string; date?: string; page?: number; pageSize?: number };
export async function listHansard(filters: ArchiveFilters = {}, db: SupabaseClient = createPublicClient()) {
 const size = Math.min(500, Math.max(1, filters.pageSize || 25));
 let query = db.from("hansard_sittings").select(fields, { count: "exact" });
 if (filters.house) query = ["national-assembly", "senate"].includes(filters.house) ? query.or(`house_type.eq.${filters.house},proceeding_type.eq.joint-sitting`) : query.eq("house_type", filters.house);
 if (filters.proceeding) query = query.eq("proceeding_type", filters.proceeding);
 if (filters.q?.trim()) query = query.ilike("title", `%${filters.q.trim().replace(/[%_]/g, "")}%`);
 if (filters.term?.trim()) query = query.eq("parliamentary_term", filters.term.trim());
 if (filters.year && /^\d{4}$/.test(filters.year)) query = query.gte("sitting_date", `${filters.year}-01-01`).lte("sitting_date", `${filters.year}-12-31`);
 if (filters.date) query = query.eq("sitting_date", filters.date);
 if (filters.county) query = query.eq("county_name", filters.county);
 const start = (Math.max(1, filters.page || 1) - 1) * size;
 const { data, error, count } = await query.order("sitting_date", { ascending: false }).order("id").range(start, start + size - 1);
 if (error) throw error;
 return { rows: (data || []).map(row => sitting(row as SittingRow)), total: count || 0 };
}
export async function hansardFacets(house: string) {
 const db = createPublicClient(); const terms = new Set<string>(), years = new Set<string>();
 for (let offset = 0; ; offset += 500) {
 const { data, error } = await db.from("hansard_sittings").select("parliamentary_term,sitting_date").or(`house_type.eq.${house},proceeding_type.eq.joint-sitting`).order("id").range(offset, offset + 499);
 if (error) throw error;
 for (const row of data || []) { if (row.parliamentary_term) terms.add(row.parliamentary_term); years.add(row.sitting_date.slice(0, 4)); }
 if (!data || data.length < 500) break;
 }
 return { terms: [...terms].sort().reverse(), years: [...years].sort().reverse() };
}
export async function getHansardDocument(filters: { id?: string; slug?: string; house?: string; date?: string }, db: SupabaseClient = createPublicClient()): Promise<HansardDocument | null> {
 let query = db.from("hansard_sittings").select("*");
 if (filters.id) query = query.eq("id", filters.id);
 else if (filters.slug) query = query.eq("slug", filters.slug);
 else query = query.eq("house_type", filters.house || "").eq("sitting_date", filters.date || "");
 const { data, error } = await query.order("updated_at", { ascending: false }).limit(1).maybeSingle();
 if (error) throw error; if (!data) return null;
 async function children(table: string, order: string) {
 const rows: Record<string, unknown>[] = [];
 for (let offset = 0; ; offset += 500) {
 const result = await db.from(table).select("*").eq("sitting_id", data!.id).order(order).order("id").range(offset, offset + 499);
 if (result.error) throw result.error; rows.push(...(result.data || [])); if (!result.data || result.data.length < 500) break;
 } return rows;
 }
 const [sections, contributions, sources] = await Promise.all([children("hansard_sections", "sort_order"), children("hansard_contributions", "sort_order"), children("hansard_sources", "created_at")]);
 return { schema_version: 2, sitting: data, sections, contributions, sources } as HansardDocument;
}
export async function getHansard(filters: { id?: string; house?: string; date?: string }, db: SupabaseClient = createPublicClient()) {
 const doc = await getHansardDocument(filters, db); if (!doc) return null;
 return { ...sitting(doc.sitting as SittingRecord), contributionCount: doc.contributions.length, contributions: doc.contributions.map(c => contribution(c, doc.sections.find(s => s.section_key === c.section_key)?.heading)) };
}
export async function hansardForLeaders(ids: string[]) {
 if (!ids.length) return [];
 const db = createPublicClient(); const records = new Map<string, HansardSitting>();
 for (let offset = 0; ; offset += 500) {
 const { data, error } = await db.from("hansard_contributions").select("*,section:hansard_sections(heading),sitting:hansard_sittings!inner(*)").in("leader_id", ids).order("sitting_id").order("sort_order").range(offset, offset + 499);
 if (error) throw error;
 for (const row of data || []) { const parent = row.sitting as unknown as SittingRow;
 if (!records.has(parent.id)) records.set(parent.id, sitting(parent));
 records.get(parent.id)!.contributions.push(contribution(row as ContributionRecord, (row.section as unknown as { heading?: string })?.heading)); }
 if (!data || data.length < 500) break;
 }
 return [...records.values()].sort((a,b) => b.sittingDate.localeCompare(a.sittingDate)).map(s => ({ ...s, matchingContributions: s.contributions, contributions: s.contributions.map(c => ({ ...c, id: c.supabaseLeaderId })) }));
}
