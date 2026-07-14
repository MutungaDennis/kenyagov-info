/**
 * Lightweight Portable Text helpers — keep out of AI/PDF bundles.
 */

export function textToPortableText(text: string) {
  if (!text || typeof text !== "string") return [];

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs.map((paragraph) => ({
    _type: "block" as const,
    _key: Math.random().toString(36).substring(2, 12),
    style: "normal" as const,
    children: [
      {
        _type: "span" as const,
        _key: Math.random().toString(36).substring(2, 12),
        text: paragraph,
        marks: [] as string[],
      },
    ],
    markDefs: [] as unknown[],
  }));
}
