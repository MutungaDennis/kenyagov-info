/**
 * Portable Text → Markdown for agent endpoints.
 * Prefers @portabletext/to-markdown when installed; falls back to a local serializer
 * that understands our constitution/service marks (entityLink, internalPage, etc.).
 */

import { SITE_URL } from "@/lib/seo";

function absUrl(href: string): string {
  if (!href) return "";
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("/")) return `${SITE_URL}${href}`;
  return `${SITE_URL}/${href}`;
}

type Span = { _type?: string; text?: string; marks?: string[] };
type MarkDef = {
  _type?: string;
  _key?: string;
  href?: string;
  internalHref?: string;
  externalHref?: string;
  title?: string;
  externalLabel?: string;
};
type Block = {
  _type?: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: Span[];
  markDefs?: MarkDef[];
  caption?: string;
  headers?: string[];
  rows?: Array<{ cells?: string[] }>;
};

function applyMarks(text: string, marks: string[], defs: MarkDef[]): string {
  let out = text;
  const defMap = new Map(defs.map((d) => [d._key, d]));
  for (const m of marks || []) {
    if (m === "strong") out = `**${out}**`;
    else if (m === "em") out = `*${out}*`;
    else {
      const def = defMap.get(m);
      if (!def) continue;
      if (def._type === "link" || def._type === "externalUrl") {
        const href = absUrl(String(def.href || ""));
        if (href) out = `[${out}](${href})`;
      } else if (def._type === "internalPage") {
        const href = absUrl(String(def.href || ""));
        if (href) out = `[${out}](${href})`;
      } else if (def._type === "entityLink") {
        const href = absUrl(
          String(def.internalHref || def.externalHref || ""),
        );
        if (href) out = `[${out}](${href})`;
      } else if (def._type === "constitutionRef") {
        const ch = (def as { chapter?: number }).chapter;
        const art = (def as { article?: number }).article;
        if (ch != null && art != null) {
          out = `[${out}](${SITE_URL}/constitution/chapter/${ch}/article/${art})`;
        } else if (ch != null) {
          out = `[${out}](${SITE_URL}/constitution/chapter/${ch})`;
        }
      }
    }
  }
  return out;
}

function renderBlock(block: Block): string {
  if (block._type === "constitutionTable" || block._type === "table") {
    const headers = block.headers || [];
    const rows = block.rows || [];
    if (!headers.length && !rows.length) return "";
    const lines: string[] = [];
    if (block.caption) lines.push(`*${block.caption}*`, "");
    if (headers.length) {
      lines.push(`| ${headers.join(" | ")} |`);
      lines.push(`| ${headers.map(() => "---").join(" | ")} |`);
    }
    for (const row of rows) {
      const cells = row.cells || [];
      lines.push(`| ${cells.join(" | ")} |`);
    }
    return lines.join("\n");
  }

  if (block._type !== "block" || !Array.isArray(block.children)) return "";

  const defs = block.markDefs || [];
  const text = block.children
    .map((c) => applyMarks(c.text || "", c.marks || [], defs))
    .join("");

  if (!text.trim()) return "";

  const indent = "  ".repeat(Math.max(0, (block.level || 1) - 1));

  if (block.listItem === "number") {
    return `${indent}1. ${text}`;
  }
  if (block.listItem === "bullet") {
    return `${indent}- ${text}`;
  }

  switch (block.style) {
    case "h1":
      return `# ${text}`;
    case "h2":
      return `## ${text}`;
    case "h3":
      return `### ${text}`;
    case "h4":
      return `#### ${text}`;
    case "blockquote":
      return `> ${text}`;
    default:
      return text;
  }
}

/** Local PT → Markdown (constitution / service marks aware). */
export function portableTextToMarkdownLocal(blocks: unknown): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";
  const lines: string[] = [];
  for (const raw of blocks) {
    const line = renderBlock(raw as Block);
    if (line) lines.push(line, "");
  }
  return lines.join("\n").trim();
}

/** Prefer @portabletext/markdown when available; keep local fallback for our marks/tables. */
export async function portableTextToMarkdown(blocks: unknown): Promise<string> {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";
  try {
    const mod = await import("@portabletext/markdown");
    if (typeof mod.portableTextToMarkdown === "function") {
      // Use package for standard blocks; merge custom types via local for tables/marks we care about
      const hasCustom = (blocks as Array<{ _type?: string }>).some(
        (b) =>
          b?._type === "constitutionTable" ||
          b?._type === "table" ||
          b?._type === "hansardTable",
      );
      if (!hasCustom) {
        return mod.portableTextToMarkdown(blocks as never);
      }
    }
  } catch {
    /* fall through */
  }
  return portableTextToMarkdownLocal(blocks);
}
