// lib/data/site-search-pages.utils.ts
// Concurrent-safe static page search (no I/O, no shared mutable state)

import { wordLikeSimilarity } from "@/lib/fuzzy";
import { SITE_SEARCH_PAGES, type SiteSearchPage } from "./site-search-pages";

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
  const query = q.toLowerCase().trim();
  if (!query) return 0;

  const title = page.title.toLowerCase();
  const snippet = page.snippet.toLowerCase();
  const path = page.path.toLowerCase();
  const keywords = page.keywords.map((k) => k.toLowerCase());

  // Exact / prefix title
  if (title === query) return 1;
  if (title.startsWith(query)) return 0.95;
  if (title.includes(query)) return 0.9;

  // Keyword exact
  if (keywords.some((k) => k === query)) return 0.92;
  if (keywords.some((k) => k.includes(query) || query.includes(k))) return 0.85;

  // Path segment
  if (path.includes(query.replace(/\s+/g, "-"))) return 0.8;

  // Snippet contains
  if (snippet.includes(query)) return 0.75;

  // Fuzzy on title + keywords bag
  const bag = `${page.title} ${page.keywords.join(" ")} ${page.snippet}`;
  const sim = wordLikeSimilarity(query, bag);
  if (sim >= 0.2) return Math.min(0.72, sim);

  // Multi-word: all tokens somewhere
  const tokens = query.split(/\s+/).filter((t) => t.length > 1);
  if (tokens.length > 1) {
    const hay = bag.toLowerCase();
    const hitCount = tokens.filter((t) => hay.includes(t)).length;
    if (hitCount === tokens.length) return 0.7;
    if (hitCount >= Math.ceil(tokens.length * 0.6)) return 0.55;
  }

  return 0;
}

/**
 * Search curated static pages. Always available — does not depend on Supabase/Sanity.
 */
export function searchStaticPages(
  q: string,
  limit = 10,
): StaticSearchHit[] {
  const query = q.trim();
  if (!query || query.length < 1) return [];

  return SITE_SEARCH_PAGES.map((page) => {
    const rank = scorePage(query, page);
    if (rank <= 0) return null;
    // Split path into base_route + slug for existing result UI (base_route/slug)
    // Prefer single path: base_route = path, slug = ""
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
export function suggestStaticPages(q: string, limit = 5): StaticSearchHit[] {
  return searchStaticPages(q, limit);
}
