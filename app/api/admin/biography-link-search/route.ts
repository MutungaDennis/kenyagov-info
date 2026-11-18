import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

type EntityType = "institution" | "party" | "county" | "school";
type SearchType = "all" | EntityType;

type LinkableResult = {
  id: string;
  type: EntityType;
  name: string;
  detail: string;
  href: string;
};

type EntitySearchResult = {
  type: EntityType;
  data: LinkableResult[];
  total: number;
};

const PAGE_SIZE = 8;
const MAX_QUERY_LENGTH = 120;
const MAX_OFFSET = 100_000;
const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "of",
  "the",
  "for",
  "in",
  "to",
  "party",
  "parties",
  "school",
  "schools",
  "county",
  "counties",
  "institution",
  "institutions",
]);
const ENTITY_TYPES: EntityType[] = ["institution", "party", "county", "school"];

function searchTokens(query: string) {
  const words = query.normalize("NFKC").match(/[\p{L}\p{N}]+/gu) ?? [];
  return [...new Set(words.filter((word) => word.length > 1 && !SEARCH_STOP_WORDS.has(word.toLowerCase())))].slice(0, 8);
}

function emptyResponse(type: SearchType, offset: number) {
  return {
    data: [] as LinkableResult[],
    counts: { institution: 0, party: 0, county: 0, school: 0 },
    total: 0,
    limit: PAGE_SIZE,
    offset,
    type,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const params = request.nextUrl.searchParams;
  const query = (params.get("q") ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  const requestedType = params.get("type") ?? "all";
  if (!["all", ...ENTITY_TYPES].includes(requestedType)) {
    return NextResponse.json({ error: "Invalid search category." }, { status: 400 });
  }

  const type = requestedType as SearchType;
  const parsedOffset = Number.parseInt(params.get("offset") ?? "0", 10);
  const offset = Number.isFinite(parsedOffset)
    ? Math.min(MAX_OFFSET, Math.max(0, parsedOffset))
    : 0;
  const tokens = searchTokens(query);
  if (query.length < 2 || tokens.length === 0) {
    return NextResponse.json(emptyResponse(type, offset));
  }

  const searchText = tokens.join(" ");
  const searchInstitution = async (): Promise<EntitySearchResult> => {
    const { data, count, error } = await auth.supabase
      .from("institutions")
      .select("id, slug, name, short_name, is_active", { count: "exact" })
      .not("slug", "is", null)
      .textSearch("search_vector", searchText, { type: "plain", config: "english" })
      .order("name", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;

    return {
      type: "institution",
      total: count ?? 0,
      data: (data ?? []).map((row) => ({
        id: String(row.id),
        type: "institution",
        name: row.name,
        detail: [row.short_name, row.is_active === false ? "Inactive" : ""].filter(Boolean).join(" · "),
        href: `/government/institutions/${encodeURIComponent(row.slug)}`,
      })),
    };
  };

  const searchParty = async (): Promise<EntitySearchResult> => {
    const { data, count, error } = await auth.supabase
      .from("political_parties")
      .select("id, slug, name, abbreviation, status", { count: "exact" })
      .not("slug", "is", null)
      .textSearch("search_vector", searchText, { type: "plain", config: "english" })
      .order("name", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;

    return {
      type: "party",
      total: count ?? 0,
      data: (data ?? []).map((row) => ({
        id: String(row.id),
        type: "party",
        name: row.name,
        detail: [row.abbreviation, row.status && row.status !== "active" ? row.status : ""]
          .filter(Boolean)
          .join(" · "),
        href: `/elections/political-parties/${encodeURIComponent(row.slug)}`,
      })),
    };
  };

  const searchCounty = async (): Promise<EntitySearchResult> => {
    const { data, count, error } = await auth.supabase
      .from("counties")
      .select("id, slug, name, code, region", { count: "exact" })
      .textSearch("search_vector", searchText, { type: "plain", config: "english" })
      .order("name", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw error;

    return {
      type: "county",
      total: count ?? 0,
      data: (data ?? []).map((row) => ({
        id: String(row.id),
        type: "county",
        name: row.name,
        detail: [row.region, row.code ? `County code ${row.code}` : ""].filter(Boolean).join(" · "),
        href: `/government/counties/${encodeURIComponent(row.slug)}`,
      })),
    };
  };

  const searchSchool = async (): Promise<EntitySearchResult> => {
    const { data, error } = await auth.supabase.rpc("search_public_schools", {
      q: searchText,
      directorate: null,
      county_filter: null,
      level_filter: null,
      category_filter: null,
      page_number: Math.floor(offset / PAGE_SIZE) + 1,
      page_size: PAGE_SIZE,
    });
    if (error) throw error;

    const payload = data as {
      schools?: Array<{
        id: string;
        slug: string;
        official_name: string;
        short_name?: string | null;
        county?: string | null;
        main_tier?: string | null;
      }>;
      total?: number;
    } | null;

    return {
      type: "school",
      total: payload?.total ?? 0,
      data: (payload?.schools ?? []).map((school) => ({
        id: String(school.id),
        type: "school",
        name: school.official_name,
        detail: [school.short_name, school.county, school.main_tier]
          .filter(Boolean)
          .join(" · "),
        href: `/government/institutions/${encodeURIComponent(school.slug)}`,
      })),
    };
  };

  const searches: Record<EntityType, () => Promise<EntitySearchResult>> = {
    institution: searchInstitution,
    party: searchParty,
    county: searchCounty,
    school: searchSchool,
  };
  const selectedTypes = type === "all" ? ENTITY_TYPES : [type];

  try {
    const results = await Promise.all(selectedTypes.map((entityType) => searches[entityType]()));
    const counts = { institution: 0, party: 0, county: 0, school: 0 };
    const data: LinkableResult[] = [];

    for (const result of results) {
      counts[result.type] = result.total;
      data.push(...result.data);
    }

    return NextResponse.json({
      data,
      counts,
      total: Object.values(counts).reduce((sum, count) => sum + count, 0),
      limit: PAGE_SIZE,
      offset,
      type,
    });
  } catch (error) {
    console.error(
      "[biography-link-search] Search failed:",
      error instanceof Error ? error.message : "Unknown error",
    );
    return NextResponse.json({ error: "Search is temporarily unavailable. Please try again." }, { status: 500 });
  }
}
