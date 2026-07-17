/**
 * Hansard schedule / estimate tables inside contributions.
 * Admin pastes Markdown pipe tables (or [[TABLE]]…[[/TABLE]] blocks);
 * we store structured hansardTable blocks and render GOV.UK tables publicly.
 */

function randomKey(): string {
  return Math.random().toString(36).slice(2, 12);
}

/** Minimal PT-like block (avoids circular import with speech.ts) */
export type SpeechBlock = {
  _type: string;
  _key?: string;
  style?: string;
  children?: Array<{
    _type?: string;
    _key?: string;
    text?: string;
    marks?: string[];
  }>;
  markDefs?: unknown[];
  [key: string]: unknown;
};

export type HansardTableBlock = {
  _type: "hansardTable";
  _key: string;
  caption?: string;
  headers: string[];
  rows: Array<{ _key: string; cells: string[] }>;
};

const TABLE_FENCE_OPEN = /^\[\[TABLE(?:\|([^\]]*))?\]\]\s*$/i;
const TABLE_FENCE_CLOSE = /^\[\[\/TABLE\]\]\s*$/i;

/** True if a line looks like a Markdown table separator: |---|---| */
function isMdSeparator(line: string): boolean {
  const t = line.trim();
  if (!t.includes("-")) return false;
  // | --- | --- |  or  ---|---
  return /^\|?[\s:|-]+\|[\s:|-]*\|?$/.test(t) || /^[\s|:-]+$/.test(t);
}

function splitPipeRow(line: string): string[] {
  let t = line.trim();
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|")) t = t.slice(0, -1);
  return t.split("|").map((c) => c.trim());
}

function looksLikePipeTableLine(line: string): boolean {
  const t = line.trim();
  if (!t.includes("|")) return false;
  // at least 2 cells
  return splitPipeRow(t).length >= 2;
}

/**
 * Parse a contiguous pipe-table into a hansardTable block.
 * Returns null if not a valid table.
 */
export function parseMarkdownTable(
  lines: string[],
  caption?: string,
): HansardTableBlock | null {
  const cleaned = lines.map((l) => l.trim()).filter((l) => l.length > 0);
  if (cleaned.length < 2) return null;

  let headerLine = cleaned[0];
  let bodyStart = 1;

  if (cleaned.length >= 2 && isMdSeparator(cleaned[1])) {
    bodyStart = 2;
  } else if (cleaned.length >= 2 && looksLikePipeTableLine(cleaned[0])) {
    // Header without separator — treat first row as headers
    bodyStart = 1;
  } else {
    return null;
  }

  if (!looksLikePipeTableLine(headerLine)) return null;

  const headers = splitPipeRow(headerLine);
  if (headers.length < 2) return null;

  const rows: HansardTableBlock["rows"] = [];
  for (let i = bodyStart; i < cleaned.length; i++) {
    if (isMdSeparator(cleaned[i])) continue;
    if (!looksLikePipeTableLine(cleaned[i])) {
      // allow non-pipe lines to abort? better skip blank already filtered
      continue;
    }
    const cells = splitPipeRow(cleaned[i]);
    // Pad / trim to header length
    while (cells.length < headers.length) cells.push("");
    rows.push({
      _key: randomKey(),
      cells: cells.slice(0, headers.length),
    });
  }

  if (rows.length === 0) return null;

  return {
    _type: "hansardTable",
    _key: randomKey(),
    caption: caption?.trim() || undefined,
    headers,
    rows,
  };
}

/** Serialize table back to markdown for admin plain-text editing */
export function tableToMarkdown(table: HansardTableBlock): string {
  const headers = table.headers || [];
  const lines: string[] = [];
  if (table.caption) {
    lines.push(`[[TABLE|${table.caption}]]`);
  } else {
    lines.push("[[TABLE]]");
  }
  lines.push(`| ${headers.join(" | ")} |`);
  lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
  for (const row of table.rows || []) {
    const cells = row.cells || [];
    const padded = headers.map((_, i) => cells[i] ?? "");
    lines.push(`| ${padded.join(" | ")} |`);
  }
  lines.push("[[/TABLE]]");
  return lines.join("\n");
}

/**
 * Split plain speech into paragraphs + table segments, returning mixed PT blocks.
 */
export function textToPortableTextWithTables(text: string): SpeechBlock[] {
  if (!text || typeof text !== "string") return [];

  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: SpeechBlock[] = [];
  let paraBuf: string[] = [];
  let i = 0;

  const flushParas = () => {
    const joined = paraBuf.join("\n").trim();
    paraBuf = [];
    if (!joined) return;
    // Split double newlines into separate blocks
    for (const p of joined.split(/\n\s*\n/)) {
      const t = p.trim();
      if (!t) continue;
      out.push(textParagraphBlock(t));
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const fenceOpen = line.trim().match(TABLE_FENCE_OPEN);
    if (fenceOpen) {
      flushParas();
      const caption = fenceOpen[1]?.trim();
      i++;
      const tableLines: string[] = [];
      while (i < lines.length && !TABLE_FENCE_CLOSE.test(lines[i].trim())) {
        tableLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip close
      const table = parseMarkdownTable(tableLines, caption);
      if (table) out.push(table as unknown as SpeechBlock);
      else if (tableLines.length) {
        out.push(textParagraphBlock(tableLines.join("\n")));
      }
      continue;
    }

    // Auto-detect markdown pipe table (3+ lines: header, sep?, rows)
    if (looksLikePipeTableLine(line)) {
      const start = i;
      const tableLines: string[] = [];
      while (i < lines.length && (looksLikePipeTableLine(lines[i]) || isMdSeparator(lines[i]) || lines[i].trim() === "")) {
        if (lines[i].trim() !== "") tableLines.push(lines[i]);
        // stop if blank line after we already have a table body
        if (lines[i].trim() === "" && tableLines.length >= 2) {
          i++;
          break;
        }
        i++;
        // safety: if next non-empty isn't table-like and we have enough, stop
        if (i < lines.length) {
          const next = lines[i].trim();
          if (
            next &&
            !looksLikePipeTableLine(next) &&
            !isMdSeparator(next)
          ) {
            break;
          }
        }
      }
      const table = parseMarkdownTable(tableLines);
      if (table && table.rows.length > 0) {
        flushParas();
        out.push(table as unknown as SpeechBlock);
        continue;
      }
      // Not a valid table — treat first line as paragraph content
      i = start;
      paraBuf.push(lines[i]);
      i++;
      continue;
    }

    paraBuf.push(line);
    i++;
  }
  flushParas();
  return out;
}

function textParagraphBlock(text: string): SpeechBlock {
  return {
    _type: "block",
    _key: randomKey(),
    style: "normal",
    children: [
      {
        _type: "span",
        _key: randomKey(),
        text,
        marks: [],
      },
    ],
    markDefs: [],
  };
}

export function isHansardTableBlock(
  block: unknown,
): block is HansardTableBlock {
  return (
    typeof block === "object" &&
    block !== null &&
    (block as HansardTableBlock)._type === "hansardTable"
  );
}

/** Admin visual table editor state */
export type SpeechTableDraft = {
  id: string;
  caption: string;
  columnCount: number;
  headers: string[];
  rows: string[][];
};

export function createEmptyTable(
  columnCount = 4,
  dataRows = 2,
): SpeechTableDraft {
  const cols = Math.min(12, Math.max(1, columnCount));
  return {
    id: randomKey(),
    caption: "",
    columnCount: cols,
    headers: Array.from({ length: cols }, (_, i) =>
      cols === 4 && i === 0
        ? "Vote No."
        : cols === 4 && i === 1
          ? "Service or Purpose"
          : cols === 4 && i === 2
            ? "Supply (Ksh)"
            : cols === 4 && i === 3
              ? "Appropriation in Aid (Ksh)"
              : `Column ${i + 1}`,
    ),
    rows: Array.from({ length: Math.max(1, dataRows) }, () =>
      Array.from({ length: cols }, () => ""),
    ),
  };
}

export function resizeTableColumns(
  table: SpeechTableDraft,
  columnCount: number,
): SpeechTableDraft {
  const cols = Math.min(12, Math.max(1, columnCount));
  const headers = Array.from({ length: cols }, (_, i) => table.headers[i] ?? "");
  const rows = table.rows.map((row) =>
    Array.from({ length: cols }, (_, i) => row[i] ?? ""),
  );
  return { ...table, columnCount: cols, headers, rows };
}

export function draftToHansardBlock(draft: SpeechTableDraft): HansardTableBlock {
  return {
    _type: "hansardTable",
    _key: draft.id || randomKey(),
    caption: draft.caption.trim() || undefined,
    headers: draft.headers.map((h) => h.trim() || " "),
    rows: draft.rows
      .filter((row) => row.some((c) => String(c).trim()))
      .map((row) => ({
        _key: randomKey(),
        cells: draft.headers.map((_, i) => String(row[i] ?? "").trim()),
      })),
  };
}

export function hansardBlockToDraft(block: HansardTableBlock): SpeechTableDraft {
  const headers =
    block.headers?.length > 0 ? [...block.headers] : ["Column 1", "Column 2"];
  const columnCount = headers.length;
  const rows =
    block.rows?.length > 0
      ? block.rows.map((r) =>
          Array.from({ length: columnCount }, (_, i) => r.cells?.[i] ?? ""),
        )
      : [Array.from({ length: columnCount }, () => "")];
  return {
    id: block._key || randomKey(),
    caption: block.caption || "",
    columnCount,
    headers,
    rows,
  };
}

/** Split PT speech into plain text (no tables) + visual drafts */
export function extractTablesFromSpeech(speech: unknown): {
  text: string;
  tables: SpeechTableDraft[];
} {
  if (!speech) return { text: "", tables: [] };
  if (typeof speech === "string") {
    // Keep string as-is; tables may be markdown fences in text
    return { text: speech, tables: [] };
  }
  if (!Array.isArray(speech)) return { text: "", tables: [] };

  const textParts: string[] = [];
  const tables: SpeechTableDraft[] = [];

  for (const block of speech) {
    if (isHansardTableBlock(block)) {
      tables.push(hansardBlockToDraft(block));
      continue;
    }
    if (
      typeof block === "object" &&
      block &&
      (block as SpeechBlock)._type === "block" &&
      Array.isArray((block as SpeechBlock).children)
    ) {
      const t = (block as SpeechBlock).children!
        .map((c) => c.text || "")
        .join("");
      if (t.trim()) textParts.push(t);
    }
  }

  return {
    text: textParts.join("\n\n").trim(),
    tables,
  };
}

/**
 * Build final PT for save: prose blocks + structured table blocks.
 * Table markdown in `text` is still parsed if present.
 */
export function composeSpeechWithTables(
  text: string,
  tables: SpeechTableDraft[],
): SpeechBlock[] {
  const fromText = textToPortableTextWithTables(text || "");
  // Drop auto-parsed tables from text if we also have structured drafts?
  // Keep both: prose from text (including any pasted markdown tables) + UI tables
  const structured = (tables || [])
    .map(draftToHansardBlock)
    .filter((t) => t.headers.length > 0 && t.rows.length > 0)
    .map((t) => t as unknown as SpeechBlock);
  return [...fromText, ...structured];
}
