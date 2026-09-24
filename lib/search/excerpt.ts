import { normalizeSearch } from './match';

/** Plain text only: safe to render through React, including database headlines. */
export function searchExcerpt(text: string, query: string, length = 240): string {
  const plain = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plain.length <= length) return plain;
  const tokens = normalizeSearch(query).split(' ').filter(t => t.length > 2);
  const lower = plain.toLowerCase();
  let best = 0, score = 0;
  for (const token of tokens) {
    let offset = lower.indexOf(token), checked = 0;
    while (offset >= 0 && checked++ < 30) {
      const start = Math.max(0, offset - 65);
      const window = lower.slice(start, start + length);
      const matches = tokens.filter(t => window.includes(t)).length;
      if (matches > score) { best = start; score = matches; }
      offset = lower.indexOf(token, offset + token.length);
    }
  }
  if (best > 0) { const space = plain.indexOf(' ', best); if (space < best + 25) best = space + 1; }
  return `${best ? '…' : ''}${plain.slice(best, best + length).trim()}${best + length < plain.length ? '…' : ''}`;
}
