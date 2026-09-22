// lib/data/site-search-pages.utils.ts
// Concurrent-safe static page search (no I/O, no shared mutable state)

import { scoreSearch } from "@/lib/search/match";
import {
  loadSiteSearchPages,
  type SiteSearchPage,
} from "./site-search-pages";

export type StaticSearchHit = {
  id: string;
  name: string;
  snippet: string;
  entity_type: string;
  /** Full path (starts with /) — use as href directly */
  path: string;
  /** Kept for parity with Supabase results shape */
  slug: string;
  base_route: string;
  rank: number;
};

function scorePage(q: string, page: SiteSearchPage): number {
  const title = scoreSearch(q, page.title);
  const keywords = scoreSearch(q, page.title, page.keywords);
  const content = scoreSearch(q, page.title, page.keywords, page.snippet);
  if (!q.trim() || content === 0) return 0;
  return title > 0 ? title : keywords > 0 ? keywords * 0.85 : content * 0.65;
}

/**
 * Search curated static pages. Always available — does not depend on Supabase/Sanity.
 */
export async function searchStaticPages(
  q: string,
  limit = 10,
): Promise<StaticSearchHit[]> {
  const query = q.trim();
  if (!query || query.length < 1) return [];

  const pages = await loadSiteSearchPages();
  return pages
    .map((page) => {
      const rank = scorePage(query, page);
      if (rank <= 0) return null;
      return {
        id: `static:${page.path}`,
        name: page.title,
        snippet: page.snippet,
        entity_type: page.type,
        path: page.path,
        slug: "",
        base_route: page.path,
        rank,
      } satisfies StaticSearchHit;
    })
    .filter((h): h is StaticSearchHit => h != null && h.rank > 0.35)
    .sort((a, b) => b.rank - a.rank)
    .slice(0, limit);
}

/** Autocomplete suggestions from static pages only */
export async function suggestStaticPages(
  q: string,
  limit = 5,
): Promise<StaticSearchHit[]> {
  return searchStaticPages(q, limit);
}
