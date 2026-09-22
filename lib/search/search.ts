import type { SupabaseClient } from "@supabase/supabase-js";
import { searchStaticPages } from "@/lib/data/site-search-pages.utils";
import { searchSanityContent } from "@/lib/sanity/client";
import { scoreSearch } from "./match";
import { rankResults, type SearchHit } from "./results";

type ContentHit = { _id: string; _type: string; title?: string; name?: string; shortTitle?: string; articleTitle?: string; articleNumber?: number; snippet?: string; slug?: string; base_route?: string };
const CONTENT_TYPES: Record<string, string> = { guide: "Guide", service: "Service", news: "News", page: "Page", constitutionArticle: "Constitutional Article", actOfParliament: "Act of Parliament", presidentialTrip: "Presidential Trip", courtPronouncement: "Court Pronouncement", reportMandate: "Report / Mandate", governmentMinistry: "Institution", governmentCategory: "Service Category", institutionContent: "Institution" };

async function bounded<T>(promise: PromiseLike<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  try { return await Promise.race([Promise.resolve(promise), new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Search source timed out")), milliseconds); })]); }
  finally { clearTimeout(timer!); }
}

export async function searchSite(db: SupabaseClient, input: string, type = "", limit = 100, onProgress?: (results: SearchHit[]) => void) {
  const query = input.trim().replace(/\s+/g, " ").slice(0, 120);
  if (!/[\p{L}\p{N}]/u.test(query)) return { results: [] as SearchHit[], partialFailure: false };
  const hits: SearchHit[] = [];
  const publish = (batch: SearchHit[]) => {
    hits.push(...batch);
    onProgress?.(rankResults(query, hits, type, limit));
  };
  const sources = await Promise.allSettled([
    bounded(searchStaticPages(query, 100), 5000).then(publish),
    bounded(db.rpc("search_public", { q: query, filter_type: type || null, lim: 100 }).then(result => {
      if (result.error) throw new Error("Government directory search unavailable");
      return (result.data || []) as SearchHit[];
    }), 8000).then(rows => publish(rows.map(hit => ({ ...hit, rank: Math.min(1, (hit.rank || 0) / 4) })))),
    bounded(searchSanityContent(query, 60) as Promise<ContentHit[]>, 5000).then(rows => {
    const content: SearchHit[] = [];
    for (const hit of rows) {
      const name = hit.title || hit.name || hit.shortTitle || hit.articleTitle || "";
      const rank = scoreSearch(query, name, hit.snippet);
      if (!name || !rank) continue;
      const article = hit._type === "constitutionArticle" && hit.articleNumber != null;
      content.push({ id: hit._id, name: article ? `Article ${hit.articleNumber}: ${name}` : name,
        slug: article ? String(hit.articleNumber) : hit.slug || "", base_route: article ? "/constitution/article" : hit.base_route || "/",
        snippet: hit.snippet, entity_type: CONTENT_TYPES[hit._type] || "Content", rank });
    }
    publish(content);
    }),
  ]);
  return { results: rankResults(query, hits, type, limit), partialFailure: sources.some(source => source.status === "rejected") };
}
