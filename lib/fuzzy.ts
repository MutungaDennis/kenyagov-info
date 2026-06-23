// Simple trigram-based similarity (mimics pg_trgm word_similarity behavior for typo tolerance)
// Pure JS, no dependencies. Good enough for Sanity results (small result sets).

export function getTrigrams(str: string): Set<string> {
  const s = `  ${str.toLowerCase()}  `;
  const trigrams = new Set<string>();
  for (let i = 0; i < s.length - 2; i++) {
    trigrams.add(s.slice(i, i + 3));
  }
  return trigrams;
}

export function trigramSimilarity(query: string, text: string): number {
  if (!query || !text) return 0;
  const qTrigrams = getTrigrams(query);
  const tTrigrams = getTrigrams(text);
  if (qTrigrams.size === 0 || tTrigrams.size === 0) return 0;

  let intersection = 0;
  for (const tri of qTrigrams) {
    if (tTrigrams.has(tri)) intersection++;
  }

  // Use word-like scoring: favor matches in the text
  const union = qTrigrams.size + tTrigrams.size - intersection;
  return (2 * intersection) / (qTrigrams.size + tTrigrams.size); // basic dice
}

export function wordLikeSimilarity(query: string, text: string): number {
  // Approximate word_similarity: find best "word" match
  const words = text.toLowerCase().split(/\s+/);
  let best = 0;
  const q = query.toLowerCase();
  for (const w of words) {
    if (!w) continue;
    const sim = trigramSimilarity(q, w);
    if (sim > best) best = sim;
  }
  // Also consider full phrase similarity
  const fullSim = trigramSimilarity(q, text);
  return Math.max(best, fullSim * 0.6);
}

export function isFuzzyMatch(query: string, text: string, threshold = 0.12): boolean {
  return wordLikeSimilarity(query, text) >= threshold;
}