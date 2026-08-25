/**
 * Detect Kenya Constitution clause hierarchy for display indentation.
 * Markers at the start of a paragraph:
 *   (1) (2)     → level 1  (subsection)
 *   (a) (b)     → level 2  (paragraph)
 *   (i) (ii)    → level 3  (sub-paragraph / roman)
 *   1. 2.       → level 1  (schedule / list item)
 *   Provided…   → level 2  (proviso)
 */

const ROMAN =
  /^(i|ii|iii|iv|v|vi|vii|viii|ix|x|xi|xii|xiii|xiv|xv|xvi|xvii|xviii|xix|xx|xxi|xxii|xxiii|xxiv|xxv)$/i;

export type ClauseLevel = 0 | 1 | 2 | 3 | 4;

/** Plain text from a Portable Text block's spans */
export function blockPlainText(value: {
  children?: Array<{ text?: string }>;
}): string {
  if (!value?.children?.length) return "";
  return value.children.map((c) => c.text || "").join("");
}

/**
 * Returns indent level 0–4 for official constitutional / schedule text.
 */
export function detectClauseLevel(raw: string): ClauseLevel {
  const text = (raw || "").replace(/\u00a0/g, " ").trim();
  if (!text) return 0;

  // Provisos hang under the preceding clause
  if (/^provided(\s|,|:)/i.test(text) || /^provided that\b/i.test(text)) {
    return 2;
  }

  // (1) (12) arabic subsections
  if (/^\(\d+[A-Za-z]?\)\s*/.test(text)) {
    return 1;
  }

  // (i) (ii) (iv) roman — check before single-letter so (i) is level 3
  const romanParen = text.match(/^\(([ivxlcdm]+)\)\s*/i);
  if (romanParen && ROMAN.test(romanParen[1])) {
    return 3;
  }

  // (a) (b) (aa) letter paragraphs
  if (/^\(([a-z]{1,3})\)\s*/i.test(text)) {
    return 2;
  }

  // (A) (B) uppercase letter — rare, treat as level 2
  if (/^\([A-Z]{1,3}\)\s*/.test(text)) {
    return 2;
  }

  // Schedule-style "1." "47." at line start (not Article 1.)
  if (/^\d{1,3}\.\s+\S/.test(text) && !/^article\b/i.test(text)) {
    return 1;
  }

  // "Part 1 —" headings stay flush
  if (/^part\s+\d+/i.test(text)) {
    return 0;
  }

  return 0;
}

export function clauseLevelClass(level: ClauseLevel): string {
  return `app-constitution-clause app-constitution-clause--l${level}`;
}

/**
 * Split a plain paragraph that contains several clause lines
 * (common when paste used single newlines) into separate display lines.
 */
export function splitClauseLines(text: string): string[] {
  const raw = (text || "").replace(/\r\n/g, "\n").trim();
  if (!raw) return [];
  // Split before a line that starts with a clause marker
  const parts = raw.split(
    /\n(?=\s*(?:\(\d+[A-Za-z]?\)|\([a-z]{1,3}\)|\([ivxlcdm]+\)|\([A-Z]{1,3}\)|\d{1,3}\.\s+|Provided\b))/i,
  );
  return parts.map((p) => p.trim()).filter(Boolean);
}
