/**
 * Display-time glossary linking for Constitution / Schedule prose.
 * First hit of each phrase per paragraph/block only.
 */

import type { LinkPhrase } from "@/lib/constitution/link-phrases";
import { findPhraseMatches } from "@/lib/constitution/link-phrases";

export type DisplayLinkSegment =
  | { type: "text"; text: string }
  | {
      type: "link";
      text: string;
      phrase: LinkPhrase;
    };

/**
 * Split plain paragraph text into text/link segments.
 * Each glossary phrase is linked at most once in this paragraph.
 */
export function linkFirstHitsInParagraph(
  text: string,
  phrases: LinkPhrase[],
): DisplayLinkSegment[] {
  if (!text) return [];
  const enabled = (phrases || []).filter((p) => p.enabled !== false && p.phrase?.trim());
  if (enabled.length === 0) return [{ type: "text", text }];

  // findPhraseMatches already: longest-first, non-overlapping, word-ish boundaries
  const matches = findPhraseMatches(text, enabled);
  // Keep only the first match per phrase string (case-insensitive key)
  const seen = new Set<string>();
  const firstOnly = matches.filter((m) => {
    const key = m.phrase.phrase.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (firstOnly.length === 0) return [{ type: "text", text }];

  const sorted = [...firstOnly].sort((a, b) => a.start - b.start);
  const out: DisplayLinkSegment[] = [];
  let cursor = 0;
  for (const m of sorted) {
    if (m.start > cursor) {
      out.push({ type: "text", text: text.slice(cursor, m.start) });
    }
    out.push({
      type: "link",
      text: text.slice(m.start, m.end),
      phrase: m.phrase,
    });
    cursor = m.end;
  }
  if (cursor < text.length) {
    out.push({ type: "text", text: text.slice(cursor) });
  }
  return out;
}

/** Whether a phrase can produce a public href */
export function phraseHasDestination(phrase: LinkPhrase): boolean {
  if (
    phrase.constitutionChapter != null &&
    Number.isFinite(Number(phrase.constitutionChapter))
  ) {
    return true;
  }
  if (phrase.internalHref?.startsWith("/")) return true;
  if (phrase.externalHref) return true;
  return false;
}
