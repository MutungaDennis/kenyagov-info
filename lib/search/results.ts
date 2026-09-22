import { normalizeSearch, scoreSearch } from "./match";

export type SearchHit = { id?: string; name: string; slug: string; base_route: string; path?: string; snippet?: string | null; entity_type: string; rank?: number };

export function resultHref(item: Pick<SearchHit, "path" | "base_route" | "slug">): string {
  const base = (item.base_route || "").replace(/\/$/, "");
  const href = item.path || (item.slug ? `${base}/${item.slug.replace(/^\//, "")}` : base) || "/";
  return href.startsWith("/") && !href.startsWith("//") && !/[\\\u0000-\u001f]/.test(href) ? href : "/search";
}

export function rankResults(query: string, hits: SearchHit[], type = "", limit = 100): SearchHit[] {
  const q = normalizeSearch(query);
  const ranked = hits.filter(hit => (!type || hit.entity_type === type) && hit.name && resultHref(hit) !== "/search").map(hit => {
    const titleScore = scoreSearch(query, hit.name);
    const exact = normalizeSearch(hit.name) === q || normalizeSearch(hit.slug) === q;
    const databaseScore = Math.min(1, Math.max(0, hit.rank || 0));
    return { ...hit, rank: exact ? 2 : titleScore > 0 ? 0.7 + titleScore * 0.5 + databaseScore * 0.05 : databaseScore * 0.65 };
  }).sort((a, b) => b.rank - a.rank || a.name.localeCompare(b.name));
  const seen = new Set<string>();
  return ranked.filter(hit => {
    const key = resultHref(hit);
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(0, limit);
}
