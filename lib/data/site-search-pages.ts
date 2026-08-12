/**
 * Static high-value pages for site search.
 * Full index: public/data/site-search-pages.json (not embedded in Worker).
 */

import { loadStaticJson } from "@/lib/data/load-static-json";

export type SiteSearchPage = {
  title: string;
  path: string;
  snippet: string;
  keywords: string[];
  type: string;
};

let cache: SiteSearchPage[] | null = null;

export async function loadSiteSearchPages(): Promise<SiteSearchPage[]> {
  if (cache) return cache;
  cache = await loadStaticJson<SiteSearchPage[]>("data/site-search-pages.json");
  return cache;
}

/** Empty at module init — use loadSiteSearchPages(). */
export const SITE_SEARCH_PAGES: SiteSearchPage[] = [];
