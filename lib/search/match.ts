/** Consistent, order-independent matching for page-specific directory filters. */
export function normalizeSearch(value: string): string {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(?:[a-z]\.){2,}[a-z]?\.?/gi, word => word.replaceAll(".", ""))
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

const STOP_WORDS = new Set(["a", "an", "the", "of", "and", "for", "in", "to"]);

/** Bounded Damerau-Levenshtein: adjacent swaps, missing or extra letters. */
export function editDistance(a: string, b: string, maximum = 2): number {
  if (Math.abs(a.length - b.length) > maximum) return maximum + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  let beforePrevious = previous;
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + Number(a[i - 1] !== b[j - 1]));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) current[j] = Math.min(current[j], beforePrevious[j - 2] + 1);
    }
    beforePrevious = previous; previous = current;
  }
  return previous[b.length];
}

export function scoreSearch(query: string, ...values: unknown[]): number {
  const normalized = normalizeSearch(query).slice(0, 120);
  const haystack = normalizeSearch(values.flat(Infinity).filter(v => v != null).join(" "));
  if (!normalized) return 1;
  if (normalized === haystack) return 1;
  const rawTokens = normalized.split(" ");
  const significant = rawTokens.filter(token => !STOP_WORDS.has(token));
  const tokens = (significant.length ? significant : rawTokens).slice(0, 12);
  const words = [...new Set(haystack.split(" "))];
  let total = 0;
  for (const token of tokens) {
    let best = 0;
    for (const word of words) {
      if (word === token) { best = 1; break; }
      if (/^\d+$/.test(token)) continue;
      if (token.length >= 2 && word.startsWith(token)) best = Math.max(best, 0.9);
      else if (token.length >= 4 && word.includes(token)) best = Math.max(best, 0.8);
      if (best < 0.75 && token.length >= 4 && word.length >= 4) {
        const allowance = token.length >= 8 ? 2 : 1;
        const distance = editDistance(token, word, allowance);
        if (distance <= allowance) best = Math.max(best, distance === 1 ? 0.75 : 0.6);
      }
    }
    if (!best) return 0;
    total += best;
  }
  return Math.min(0.99, total / tokens.length * (haystack.includes(normalized) ? 0.99 : 0.95));
}

export function matchesSearch(query: string, ...values: unknown[]): boolean {
  return scoreSearch(query, ...values) > 0;
}
