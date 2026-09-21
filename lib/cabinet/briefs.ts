import "server-only";

import { createPublicClient } from "@/lib/supabase/public";
import type {
  CabinetBrief,
  CabinetBriefFilters,
  CabinetBriefListItem,
  CabinetBriefSource,
  CabinetBriefsResult,
} from "./types";

const LIST_COLUMNS = `
  id,
  slug,
  title,
  short_title,
  publication_label,
  brief_date,
  venue,
  locality,
  summary,
  excerpt,
  topics,
  word_count,
  reading_time_minutes,
  canonical_path
`;

function mapListItem(row: any): CabinetBriefListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortTitle: row.short_title,
    publicationLabel: row.publication_label,
    briefDate: row.brief_date,
    venue: row.venue,
    locality: row.locality,
    summary: row.summary,
    excerpt: row.excerpt,
    topics: Array.isArray(row.topics) ? row.topics : [],
    wordCount: row.word_count,
    readingTimeMinutes: row.reading_time_minutes,
    canonicalPath: row.canonical_path || `/government/cabinet/briefs/${row.slug}`,
  };
}

export async function getLatestCabinetBriefs(limit = 3): Promise<CabinetBriefListItem[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("cabinet_briefs")
    .select(LIST_COLUMNS)
    .eq("is_published", true)
    .order("brief_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching latest Cabinet briefs:", error);
    return [];
  }

  return (data ?? []).map(mapListItem);
}

export async function getCabinetBriefs(filters: CabinetBriefFilters = {}): Promise<CabinetBriefsResult> {
  const supabase = createPublicClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 20));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("cabinet_briefs")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("is_published", true);

  if (filters.query?.trim()) {
    const term = filters.query.trim().replace(/[%_,()]/g, " ");
    query = query.or(
      `title.ilike.%${term}%,short_title.ilike.%${term}%,summary.ilike.%${term}%,body_text.ilike.%${term}%`,
    );
  }

  if (filters.label?.trim()) query = query.eq("publication_label", filters.label.trim());
  if (filters.year) {
    query = query
      .gte("brief_date", `${filters.year}-01-01`)
      .lte("brief_date", `${filters.year}-12-31`);
  }

  const { data, error, count } = await query
    .order("brief_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error fetching Cabinet briefs:", error);
    return { items: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const total = count ?? 0;
  return {
    items: (data ?? []).map(mapListItem),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getCabinetBriefBySlug(slug: string): Promise<CabinetBrief | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("cabinet_briefs")
    .select(`
      id, slug, title, short_title, original_title, publication_label, meeting_type,
      brief_date, chair_name, chair_title, venue, locality, county, country,
      summary, excerpt, body_text, body_html, topics, word_count, reading_time_minutes,
      official_source_url, source_publisher, source_title, is_official_source,
      editorial_note, canonical_path, review_status,
      cabinet_brief_sources (
        id, source_type, title, publisher, url, published_at,
        is_primary, is_official, mime_type, notes
      )
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error(`Error fetching Cabinet brief "${slug}":`, error);
    return null;
  }

  const sources: CabinetBriefSource[] = (data.cabinet_brief_sources ?? [])
    .map((source: any) => ({
      id: source.id,
      sourceType: source.source_type,
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      publishedAt: source.published_at,
      isPrimary: source.is_primary,
      isOfficial: source.is_official,
      mimeType: source.mime_type,
      notes: source.notes,
    }))
    .sort((a: CabinetBriefSource, b: CabinetBriefSource) => Number(b.isPrimary) - Number(a.isPrimary));

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    shortTitle: data.short_title,
    originalTitle: data.original_title,
    publicationLabel: data.publication_label,
    meetingType: data.meeting_type,
    briefDate: data.brief_date,
    chairName: data.chair_name,
    chairTitle: data.chair_title,
    venue: data.venue,
    locality: data.locality,
    county: data.county,
    country: data.country,
    summary: data.summary,
    excerpt: data.excerpt,
    bodyText: data.body_text,
    bodyHtml: data.body_html,
    topics: Array.isArray(data.topics) ? data.topics : [],
    wordCount: data.word_count,
    readingTimeMinutes: data.reading_time_minutes,
    officialSourceUrl: data.official_source_url,
    sourcePublisher: data.source_publisher,
    sourceTitle: data.source_title,
    isOfficialSource: data.is_official_source,
    editorialNote: data.editorial_note,
    canonicalPath: data.canonical_path || `/government/cabinet/briefs/${data.slug}`,
    reviewStatus: data.review_status,
    sources,
  };
}

export async function getCabinetBriefFilterOptions() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("cabinet_briefs")
    .select("publication_label, brief_date")
    .eq("is_published", true)
    .order("brief_date", { ascending: false });

  if (error) {
    console.error("Error fetching Cabinet brief filter options:", error);
    return { labels: [] as string[], years: [] as number[] };
  }

  const labels = Array.from(new Set((data ?? []).map((row: any) => row.publication_label).filter(Boolean))).sort();
  const years = Array.from(
    new Set((data ?? []).map((row: any) => Number(String(row.brief_date).slice(0, 4))).filter(Number.isFinite)),
  ).sort((a, b) => b - a);

  return { labels, years };
}
