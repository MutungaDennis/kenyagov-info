import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

type EntityType = "institution" | "party" | "coalition" | "committee" | "county" | "school" | "person" | "ward" | "article";
type SearchType = EntityType;
type LinkableResult = {
  id: string;
  type: EntityType;
  name: string;
  detail: string;
  href: string;
};
type EntitySearchResult = { type: EntityType; data: LinkableResult[]; total: number; paginationTotal?: number };

const PAGE_SIZE = 8;
const MAX_QUERY_LENGTH = 120;
const MAX_OFFSET = 100_000;
const ENTITY_TYPES: EntityType[] = ["institution", "person", "party", "coalition", "committee", "county", "ward", "article", "school"];
const EMPTY_COUNTS = Object.fromEntries(ENTITY_TYPES.map((type) => [type, 0])) as Record<EntityType, number>;

function searchTokens(query: string) {
  const words = query.normalize("NFKC").match(/[\p{L}\p{N}]+/gu) ?? [];
  return [...new Set(words.filter((word) => word.length > 1))].slice(0, 8);
}

function emptyResponse(type: SearchType, offset: number) {
  return { data: [] as LinkableResult[], counts: EMPTY_COUNTS, total: 0, limit: PAGE_SIZE, offset, type };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const params = request.nextUrl.searchParams;
  const query = (params.get("q") ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  const requestedType = params.get("type") ?? "institution";
  if (!ENTITY_TYPES.includes(requestedType as EntityType)) {
    return NextResponse.json({ error: "Invalid search category." }, { status: 400 });
  }
  const type = requestedType as EntityType;
  const parsedOffset = Number.parseInt(params.get("offset") ?? "0", 10);
  const offset = Number.isFinite(parsedOffset) ? Math.min(MAX_OFFSET, Math.max(0, parsedOffset)) : 0;
  const tokens = searchTokens(query);
  if (query.length < 2 || tokens.length === 0) return NextResponse.json(emptyResponse(type, offset));

  const searchText = tokens.join(" ");
  const sb = auth.supabase;
  const searches: Record<EntityType, () => Promise<EntitySearchResult>> = {
    institution: async () => {
      const { data, count, error } = await sb.from("institutions")
        .select("id, slug, name, short_name, is_active", { count: "exact" })
        .not("slug", "is", null)
        .textSearch("search_vector", searchText, { type: "plain", config: "english" })
        .order("name").range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      return { type, total: count ?? 0, data: (data ?? []).map((row) => ({
        id: String(row.id), type, name: row.name,
        detail: [row.short_name, row.is_active === false ? "Inactive" : ""].filter(Boolean).join(" · "),
        href: `/government/institutions/${encodeURIComponent(row.slug)}`,
      })) };
    },
    party: async () => {
      const { data, count, error } = await sb.from("political_parties")
        .select("id, slug, name, abbreviation, status", { count: "exact" })
        .not("slug", "is", null)
        .textSearch("search_vector", searchText, { type: "plain", config: "english" })
        .order("name").range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      return { type, total: count ?? 0, data: (data ?? []).map((row) => ({
        id: String(row.id), type, name: row.name,
        detail: [row.abbreviation, row.status && row.status !== "active" ? row.status : ""].filter(Boolean).join(" · "),
        href: `/elections/political-parties/${encodeURIComponent(row.slug)}`,
      })) };
    },
    coalition: async () => {
      const safeQuery = searchText.replace(/[(),.%_\\]/g, " ").trim();
      const { data, count, error } = await sb.from("coalitions")
        .select("id, name, abbreviation, coalition_type", { count: "exact" })
        .or(`name.ilike.%${safeQuery}%,abbreviation.ilike.%${safeQuery}%`)
        .order("name").range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      return { type, total: count ?? 0, data: (data ?? []).map((row) => ({
        id: String(row.id), type, name: row.name,
        detail: [row.abbreviation, row.coalition_type === "post_election" ? "Post-election" : "Pre-election"].filter(Boolean).join(" · "),
        href: `/elections/coalitions?q=${encodeURIComponent(row.name)}`,
      })) };
    },
    committee: async () => {
      let query = sb.from("parliamentary_committees")
        .select("id, chamber, category, name, slug, is_active", { count: "exact" })
        .eq("is_published", true)
        .not("slug", "is", null);
      for (const token of tokens) {
        const safe = token.replace(/[(),.%_\\]/g, " ").trim();
        query = query.or(`name.ilike.%${safe}%,category.ilike.%${safe}%,chamber.ilike.%${safe}%`);
      }
      const { data, count, error } = await query.order("name").range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      return { type, total: count ?? 0, data: (data ?? []).map((row) => ({
        id: String(row.id), type, name: row.name,
        detail: [row.chamber === "senate" ? "Senate" : "National Assembly", row.category, row.is_active ? "Active" : "Historical"].filter(Boolean).join(" · "),
        href: `/government/legislature/committees/${encodeURIComponent(row.slug)}`,
      })) };
    },
    county: async () => {
      const { data, count, error } = await sb.from("counties")
        .select("id, slug, name, code, region", { count: "exact" })
        .textSearch("search_vector", searchText, { type: "plain", config: "english" })
        .order("name").range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      return { type, total: count ?? 0, data: (data ?? []).map((row) => ({
        id: String(row.id), type, name: row.name,
        detail: [row.region, row.code ? `County code ${row.code}` : ""].filter(Boolean).join(" · "),
        href: `/government/counties/${encodeURIComponent(row.slug)}`,
      })) };
    },
    person: async () => {
      let leaders = sb.from("leaders")
        .select("id, slug, full_name, first_name, other_names, surname, title, current_organization", { count: "exact" })
        .not("slug", "is", null);
      let mcas = sb.from("mcas")
        .select("id, slug, first_name, other_names, surname, status", { count: "exact" })
        .not("slug", "is", null).neq("status", "Unpublished");
      for (const token of tokens) {
        const safe = token.replace(/[(),.%_]/g, " ").trim();
        leaders = leaders.or(`full_name.ilike.%${safe}%,first_name.ilike.%${safe}%,other_names.ilike.%${safe}%,surname.ilike.%${safe}%,title.ilike.%${safe}%,current_organization.ilike.%${safe}%`);
        mcas = mcas.or(`first_name.ilike.%${safe}%,other_names.ilike.%${safe}%,surname.ilike.%${safe}%`);
      }
      const [leaderRes, mcaRes] = await Promise.all([
        leaders.order("full_name").range(offset, offset + PAGE_SIZE - 1),
        mcas.order("surname").range(offset, offset + PAGE_SIZE - 1),
      ]);
      if (leaderRes.error) throw leaderRes.error;
      if (mcaRes.error) throw mcaRes.error;
      const leaderData = (leaderRes.data ?? []).map((row) => ({
        id: `leader-${row.id}`, type, name: row.full_name || [row.first_name, row.other_names, row.surname].filter(Boolean).join(" "),
        detail: [row.title, row.current_organization].filter(Boolean).join(" · "),
        href: `/government/people/${encodeURIComponent(row.slug)}`,
      }));
      const mcaData = (mcaRes.data ?? []).map((row) => ({
        id: `mca-${row.id}`, type, name: [row.first_name, row.other_names, row.surname].filter(Boolean).join(" "),
        detail: "Member of County Assembly",
        href: `/government/people/${encodeURIComponent(row.slug)}`,
      }));
      return {
        type,
        total: (leaderRes.count ?? 0) + (mcaRes.count ?? 0),
        paginationTotal: Math.max(leaderRes.count ?? 0, mcaRes.count ?? 0),
        data: [...leaderData, ...mcaData].sort((a, b) => a.name.localeCompare(b.name)),
      };
    },
    ward: async () => {
      let q = sb.from("wards").select("id, slug, name, county_name, constituency_name, ward_code", { count: "exact" }).not("slug", "is", null);
      for (const token of tokens) {
        const safe = token.replace(/[(),.%_]/g, " ").trim();
        q = q.or(`name.ilike.%${safe}%,county_name.ilike.%${safe}%,constituency_name.ilike.%${safe}%,ward_code.ilike.%${safe}%`);
      }
      const { data, count, error } = await q.order("name").range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      return { type, total: count ?? 0, data: (data ?? []).map((row) => ({
        id: String(row.id), type, name: row.name,
        detail: [row.constituency_name, row.county_name].filter(Boolean).join(" · "),
        href: `/government/counties/wards/${encodeURIComponent(row.slug)}`,
      })) };
    },
    article: async () => {
      let q = sb.from("constitution_articles").select("id, article_number, title", { count: "exact" });
      for (const token of tokens) {
        const safe = token.replace(/[(),.%_]/g, " ").trim();
        q = q.or(`title.ilike.%${safe}%,body_text.ilike.%${safe}%`);
      }
      const { data, count, error } = await q.order("article_number").range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      return { type, total: count ?? 0, data: (data ?? []).map((row) => ({
        id: String(row.id), type, name: `Article ${row.article_number}: ${row.title}`,
        detail: "Constitution of Kenya, 2010",
        href: `/constitution/article/${row.article_number}`,
      })) };
    },
    school: async () => {
      const { data, error } = await sb.rpc("search_public_schools", {
        q: searchText, directorate: null, county_filter: null, level_filter: null, category_filter: null,
        page_number: Math.floor(offset / PAGE_SIZE) + 1, page_size: PAGE_SIZE,
      });
      if (error) throw error;
      const payload = data as { schools?: Array<{ id: string; slug: string; official_name: string; short_name?: string | null; county?: string | null; main_tier?: string | null }>; total?: number } | null;
      return { type, total: payload?.total ?? 0, data: (payload?.schools ?? []).map((school) => ({
        id: String(school.id), type, name: school.official_name,
        detail: [school.short_name, school.county, school.main_tier].filter(Boolean).join(" · "),
        href: `/government/institutions/${encodeURIComponent(school.slug)}`,
      })) };
    },
  };

  try {
    const result = await searches[type]();
    const counts = { ...EMPTY_COUNTS, [type]: result.paginationTotal ?? result.total };
    return NextResponse.json({ data: result.data, counts, total: result.total, limit: PAGE_SIZE, offset, type });
  } catch (error) {
    console.error("[biography-link-search] Search failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Search is temporarily unavailable. Please try again." }, { status: 500 });
  }
}
