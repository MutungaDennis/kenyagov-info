import { editDistance, normalizeSearch, scoreSearch } from './match';
import type { SiteSearchPage } from '@/lib/data/site-search-pages';

const stop = new Set(['a', 'an', 'the', 'of', 'and', 'for', 'in', 'to', 'how', 'do', 'i', 'is', 'can']);

/** A small inverted index: body searches examine vocabulary, not every page. */
export function createPageIndex(pages: SiteSearchPage[]) {
  const vocabulary = new Map<string, Set<number>>();
  pages.forEach((page, id) => {
    for (const word of new Set(normalizeSearch([page.title, ...page.keywords, page.snippet, page.content || ''].join(' ')).split(' '))) {
      if (!word || stop.has(word)) continue;
      if (!vocabulary.has(word)) vocabulary.set(word, new Set());
      vocabulary.get(word)!.add(id);
    }
  });
  return (query: string) => {
    const tokens = [...new Set(normalizeSearch(query).split(' ').filter(t => t && !stop.has(t)))].slice(0, 12);
    if (!tokens.length) return [];
    let candidates: Map<number, number> | undefined;
    for (const token of tokens) {
      const matches = new Map<number, number>();
      for (const [word, ids] of vocabulary) {
        let quality = word === token ? 1 : token.length >= 2 && !/^\d+$/.test(token) && word.startsWith(token) ? 0.85 : 0;
        if (!quality && token.length >= 4 && word.length >= 4 && Math.abs(word.length - token.length) <= 1 && editDistance(token, word, 1) <= 1) quality = 0.65;
        if (quality) for (const id of ids) matches.set(id, Math.max(matches.get(id) || 0, quality));
      }
      if (!candidates) candidates = matches;
      else for (const [id, score] of candidates) {
        if (!matches.has(id)) candidates.delete(id);
        else candidates.set(id, score + matches.get(id)!);
      }
      if (!candidates.size) return [];
    }
    return [...candidates!].map(([id, score]) => {
      const page = pages[id];
      const title = scoreSearch(query, page.title);
      const keywords = scoreSearch(query, page.title, page.keywords);
      return { page, rank: title || (keywords ? keywords * 0.85 : score / tokens.length * 0.6) };
    }).sort((a, b) => b.rank - a.rank);
  };
}
