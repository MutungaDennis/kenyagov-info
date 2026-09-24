// lib/data/site-search-pages.utils.ts
// Concurrent-safe static page search (no I/O, no shared mutable state)

import { createPageIndex } from "@/lib/search/page-index";
import { searchExcerpt } from "@/lib/search/excerpt";
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

let indexedPages: SiteSearchPage[] | undefined;
let searchIndex: ReturnType<typeof createPageIndex>;

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
  if (pages !== indexedPages) { indexedPages = pages; searchIndex = createPageIndex(pages); }
  return searchIndex(query)
    .map(({ page, rank }) => {
      if (rank <= 0) return null;
      return {
        id: `static:${page.path}`,
        name: page.title,
        snippet: searchExcerpt(page.content || page.snippet, query),
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
