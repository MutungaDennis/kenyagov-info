import { textToPortableText, type PortableBlock } from "@/lib/hansard/speech";
import { textToPortableTextWithTables } from "@/lib/hansard/tables";

/** Map hansardTable blocks to constitutionTable for Sanity schema. */
function normalizeConstitutionBlocks(blocks: PortableBlock[]): PortableBlock[] {
  return blocks.map((b) => {
    if (b._type === "hansardTable") {
      return { ...b, _type: "constitutionTable" };
    }
    return b;
  });
}

/** Convert paragraph strings (or a single blob) into Sanity Portable Text blocks. */
export function paragraphsToPortableText(
  paragraphs: string[] | string | null | undefined,
): PortableBlock[] {
  if (!paragraphs) return [];
  if (typeof paragraphs === "string") {
    return normalizeConstitutionBlocks(
      textToPortableTextWithTables(paragraphs) as PortableBlock[],
    );
  }
  const joined = paragraphs
    .map((p) => String(p || "").trim())
    .filter(Boolean)
    .join("\n\n");
  // Prefer table-aware conversion (Fifth Schedule etc.)
  if (joined.includes("|") || /\[\[TABLE/i.test(joined)) {
    return normalizeConstitutionBlocks(
      textToPortableTextWithTables(joined) as PortableBlock[],
    );
  }
  return textToPortableText(joined);
}

export function constitutionArticleId(
  chapter: number,
  articleNumber: number,
): string {
  return `constitution-article-${chapter}-${articleNumber}`;
}
