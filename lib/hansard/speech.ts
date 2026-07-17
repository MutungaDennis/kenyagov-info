/**
 * Hansard speech helpers — safe Portable Text ↔ plain text round-trips.
 * Prevents wiping existing Sanity content when admin re-saves a sitting.
 */

export type PortableBlock = {
  _type: string;
  _key?: string;
  style?: string;
  children?: Array<{ _type?: string; _key?: string; text?: string; marks?: string[] }>;
  markDefs?: unknown[];
  [key: string]: unknown;
};

function randomKey(): string {
  return Math.random().toString(36).slice(2, 12);
}

/** Plain text for the admin editor and previews. */
export function portableTextToPlain(blocks: unknown): string {
  if (!blocks) return "";
  if (typeof blocks === "string") return blocks;
  if (!Array.isArray(blocks)) return "";

  return blocks
    .map((block: PortableBlock) => {
      if (block?._type === "block" && Array.isArray(block.children)) {
        return block.children.map((c) => c.text || "").join("");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

/** Convert plain text paragraphs into Portable Text blocks. */
export function textToPortableText(text: string): PortableBlock[] {
  if (!text || typeof text !== "string") return [];

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    // Preserve single-line / single-paragraph content without double newlines
    const one = text.trim();
    if (!one) return [];
    return [
      {
        _type: "block",
        _key: randomKey(),
        style: "normal",
        children: [
          {
            _type: "span",
            _key: randomKey(),
            text: one,
            marks: [],
          },
        ],
        markDefs: [],
      },
    ];
  }

  return paragraphs.map((paragraph) => ({
    _type: "block",
    _key: randomKey(),
    style: "normal",
    children: [
      {
        _type: "span",
        _key: randomKey(),
        text: paragraph,
        marks: [],
      },
    ],
    markDefs: [],
  }));
}

/**
 * Normalize any speech payload for Sanity write:
 * - string → Portable Text
 * - non-empty Portable Text array → keep (preserve keys where present)
 * - empty / invalid → []
 */
export function normalizeSpeechForSanity(speech: unknown): PortableBlock[] {
  if (typeof speech === "string") {
    return textToPortableText(speech);
  }
  if (Array.isArray(speech) && speech.length > 0) {
    // Ensure blocks have _key for Sanity array items
    return speech.map((block: PortableBlock, i) => ({
      ...block,
      _key: block._key || `block-${i}-${randomKey()}`,
      children: Array.isArray(block.children)
        ? block.children.map((c, j) => ({
            ...c,
            _key: c._key || `span-${j}-${randomKey()}`,
          }))
        : block.children,
    }));
  }
  return [];
}

/** Leading “Hon. Members:” / “Hon Members -” etc. (display label is shown separately). */
const HON_MEMBERS_PREFIX =
  /^\s*(the\s+)?hon\.?\s*members\s*[:：\-–—]?\s*/i;

/**
 * Strip a leading "Hon. Members:" from plain text so the public UI can show
 * the label once and the body as e.g. "Yes".
 */
export function stripHonMembersPrefix(text: string): string {
  if (!text) return "";
  return text.replace(HON_MEMBERS_PREFIX, "").trim();
}

/**
 * For Hon. Members contributions: remove redundant "Hon. Members:" from the
 * start of Portable Text so the body is only the response.
 */
export function stripHonMembersPrefixFromSpeech(
  speech: unknown,
): PortableBlock[] {
  if (typeof speech === "string") {
    return textToPortableText(stripHonMembersPrefix(speech));
  }
  if (!Array.isArray(speech) || speech.length === 0) return [];

  let done = false;
  return speech.map((block: PortableBlock) => {
    if (done || block?._type !== "block" || !Array.isArray(block.children)) {
      return block as PortableBlock;
    }

    const children = block.children.map((child) => {
      if (done || typeof child.text !== "string" || !child.text.trim()) {
        return child;
      }
      // First non-empty span only
      done = true;
      if (!HON_MEMBERS_PREFIX.test(child.text)) return child;
      return { ...child, text: stripHonMembersPrefix(child.text) };
    });

    return { ...block, children };
  });
}

export function publicHansardDayPath(
  houseType: string,
  sittingDate: string,
): string {
  return `/government/legislature/hansard/${houseType}/${sittingDate}`;
}

export function publicHansardHousePath(houseType: string): string {
  if (houseType === "county-assembly") {
    return "/government/legislature/hansard/county-assemblies";
  }
  if (houseType === "senate") {
    return "/government/legislature/hansard/senate";
  }
  return "/government/legislature/hansard/national-assembly";
}
