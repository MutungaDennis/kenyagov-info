/**
 * Apply service glossary phrases onto Portable Text spans as entityLink marks.
 * Longest phrase wins; never strips existing marks.
 */

export type ServiceLinkPhrase = {
  _id?: string;
  phrase: string;
  matchMode?: "exact" | "caseInsensitive";
  internalHref?: string | null;
  externalHref?: string | null;
  externalLabel?: string | null;
  scopeServiceSlugs?: string[] | null;
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

function phraseAppliesToService(
  phrase: ServiceLinkPhrase,
  serviceSlug: string,
): boolean {
  const scope = phrase.scopeServiceSlugs;
  if (!scope || scope.length === 0) return true;
  return scope.map(String).includes(serviceSlug);
}

function buildMarkDef(phrase: ServiceLinkPhrase): MarkDef {
  return {
    _type: "entityLink",
    _key: `m${randomKey()}`,
    internalHref: phrase.internalHref || undefined,
    externalHref: phrase.externalHref || undefined,
    externalLabel: phrase.externalLabel || undefined,
  };
}

export function findPhraseMatches(
  text: string,
  phrases: ServiceLinkPhrase[],
): Array<{ start: number; end: number; phrase: ServiceLinkPhrase }> {
  const sorted = [...phrases].sort((a, b) => {
    const len = (b.phrase?.length || 0) - (a.phrase?.length || 0);
    if (len !== 0) return len;
    return (a.sortOrder || 100) - (b.sortOrder || 100);
  });

  const taken: boolean[] = Array(text.length).fill(false);
  const matches: Array<{
    start: number;
    end: number;
    phrase: ServiceLinkPhrase;
  }> = [];

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
  phrases: ServiceLinkPhrase[],
): { children: Span[]; markDefs: MarkDef[] } {
  const text = span.text || "";
  if (!text || (span.marks && span.marks.length > 0)) {
    return { children: [span], markDefs: [] };
  }

  const allMatches = findPhraseMatches(text, phrases);
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

export function applyServicePhrasesToBlocks(
  blocks: unknown,
  phrases: ServiceLinkPhrase[],
  serviceSlug: string,
): { blocks: Block[]; matchCount: number; changed: boolean } {
  if (!Array.isArray(blocks)) {
    return { blocks: [], matchCount: 0, changed: false };
  }

  const usable = phrases.filter(
    (p) =>
      p.enabled !== false &&
      p.phrase?.trim() &&
      phraseAppliesToService(p, serviceSlug) &&
      (p.internalHref || p.externalHref),
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
      const { children, markDefs } = annotatePlainSpan(child, usable);
      if (markDefs.length > 0) {
        matchCount += markDefs.length;
        changed = true;
      }
      newChildren.push(...children);
      newDefs.push(...markDefs);
    }

    block.children = newChildren;
    block.markDefs = newDefs;
    out.push(block);
  }

  return { blocks: out, matchCount, changed };
}
