/**
 * Apply glossary phrases onto Sanity Portable Text spans as entityLink /
 * constitutionRef marks. Never strips existing marks; longest phrase wins.
 */

export type LinkPhrase = {
  _id?: string;
  phrase: string;
  matchMode?: "exact" | "caseInsensitive";
  internalHref?: string | null;
  externalHref?: string | null;
  externalLabel?: string | null;
  constitutionChapter?: number | null;
  constitutionArticle?: number | null;
  scopeChapters?: number[] | null;
  enabled?: boolean | null;
  sortOrder?: number | null;
};

type Span = {
  _type?: string;
  _key?: string;
  text?: string;
  marks?: string[];
};

type MarkDef = {
  _type: string;
  _key: string;
  [k: string]: unknown;
};

type Block = {
  _type?: string;
  _key?: string;
  children?: Span[];
  markDefs?: MarkDef[];
  [k: string]: unknown;
};

function randomKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function phraseAppliesToChapter(phrase: LinkPhrase, chapter: number): boolean {
  const scope = phrase.scopeChapters;
  if (!scope || scope.length === 0) return true;
  return scope.map(Number).includes(chapter);
}

function buildMarkDef(phrase: LinkPhrase): MarkDef {
  const chapter = phrase.constitutionChapter;
  if (chapter != null && Number.isFinite(Number(chapter))) {
    const def: MarkDef = {
      _type: "constitutionRef",
      _key: `m${randomKey()}`,
      chapter: Number(chapter),
    };
    if (
      phrase.constitutionArticle != null &&
      Number.isFinite(Number(phrase.constitutionArticle))
    ) {
      def.article = Number(phrase.constitutionArticle);
    }
    return def;
  }

  return {
    _type: "entityLink",
    _key: `m${randomKey()}`,
    internalHref: phrase.internalHref || undefined,
    externalHref: phrase.externalHref || undefined,
    externalLabel: phrase.externalLabel || undefined,
  };
}

/** Find non-overlapping matches; prefer longer phrases. */
export function findPhraseMatches(
  text: string,
  phrases: LinkPhrase[],
): Array<{ start: number; end: number; phrase: LinkPhrase }> {
  const sorted = [...phrases].sort((a, b) => {
    const len = (b.phrase?.length || 0) - (a.phrase?.length || 0);
    if (len !== 0) return len;
    return (a.sortOrder || 100) - (b.sortOrder || 100);
  });

  const taken: boolean[] = Array(text.length).fill(false);
  const matches: Array<{ start: number; end: number; phrase: LinkPhrase }> =
    [];

  for (const phrase of sorted) {
    const needle = phrase.phrase?.trim();
    if (!needle) continue;
    const ci = phrase.matchMode !== "exact";
    const hay = ci ? text.toLowerCase() : text;
    const ndl = ci ? needle.toLowerCase() : needle;
    let from = 0;
    while (from <= hay.length - ndl.length) {
      const idx = hay.indexOf(ndl, from);
      if (idx < 0) break;
      const end = idx + ndl.length;
      let overlap = false;
      for (let i = idx; i < end; i++) {
        if (taken[i]) {
          overlap = true;
          break;
        }
      }
      if (!overlap) {
        // Prefer word-ish boundaries when alphanumeric adjacent
        const before = idx > 0 ? text[idx - 1] : " ";
        const after = end < text.length ? text[end] : " ";
        const boundaryOk =
          !/[A-Za-z0-9]/.test(before) && !/[A-Za-z0-9]/.test(after);
        if (boundaryOk || needle.includes(" ")) {
          for (let i = idx; i < end; i++) taken[i] = true;
          matches.push({ start: idx, end, phrase });
        }
      }
      from = idx + 1;
    }
  }

  return matches.sort((a, b) => a.start - b.start);
}

function annotatePlainSpan(
  span: Span,
  phrases: LinkPhrase[],
): { children: Span[]; markDefs: MarkDef[] } {
  const text = span.text || "";
  if (!text || (span.marks && span.marks.length > 0)) {
    // Already marked — leave alone (do not nest)
    return { children: [span], markDefs: [] };
  }

  const allMatches = findPhraseMatches(text, phrases);
  // First hit per phrase only (aligns with public display-time rule)
  const seenPhrase = new Set<string>();
  const matches = allMatches.filter((m) => {
    const key = m.phrase.phrase.trim().toLowerCase();
    if (seenPhrase.has(key)) return false;
    seenPhrase.add(key);
    return true;
  });
  if (matches.length === 0) {
    return { children: [span], markDefs: [] };
  }

  const children: Span[] = [];
  const markDefs: MarkDef[] = [];
  let cursor = 0;

  for (const m of matches) {
    if (m.start > cursor) {
      children.push({
        _type: "span",
        _key: randomKey(),
        text: text.slice(cursor, m.start),
        marks: [],
      });
    }
    const def = buildMarkDef(m.phrase);
    markDefs.push(def);
    children.push({
      _type: "span",
      _key: randomKey(),
      text: text.slice(m.start, m.end),
      marks: [def._key],
    });
    cursor = m.end;
  }

  if (cursor < text.length) {
    children.push({
      _type: "span",
      _key: randomKey(),
      text: text.slice(cursor),
      marks: [],
    });
  }

  return { children, markDefs };
}

export function applyPhrasesToBlocks(
  blocks: unknown,
  phrases: LinkPhrase[],
  chapter: number,
): { blocks: Block[]; matchCount: number; changed: boolean } {
  if (!Array.isArray(blocks)) {
    return { blocks: [], matchCount: 0, changed: false };
  }

  const usable = phrases.filter(
    (p) =>
      p.enabled !== false &&
      p.phrase?.trim() &&
      phraseAppliesToChapter(p, chapter) &&
      (p.internalHref ||
        p.externalHref ||
        (p.constitutionChapter != null &&
          Number.isFinite(Number(p.constitutionChapter)))),
  );

  let matchCount = 0;
  let changed = false;
  const out: Block[] = [];

  for (const raw of blocks) {
    const block = { ...(raw as Block) };
    if (block._type !== "block" || !Array.isArray(block.children)) {
      out.push(block);
      continue;
    }

    const newChildren: Span[] = [];
    const newDefs: MarkDef[] = [...(block.markDefs || [])];

    for (const child of block.children) {
      if (child._type && child._type !== "span") {
        newChildren.push(child);
        continue;
      }
      const { children, markDefs } = annotatePlainSpan(child, usable);
      if (markDefs.length > 0) {
        changed = true;
        matchCount += markDefs.length;
        newDefs.push(...markDefs);
      }
      newChildren.push(...children);
    }

    out.push({
      ...block,
      children: newChildren,
      markDefs: newDefs,
    });
  }

  return { blocks: out, matchCount, changed };
}

export function countPhraseHitsInText(
  text: string,
  phrases: LinkPhrase[],
): Array<{ phrase: string; count: number }> {
  return phrases.map((p) => ({
    phrase: p.phrase,
    count: findPhraseMatches(text, [p]).length,
  }));
}
