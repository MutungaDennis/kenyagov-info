export type HomepageHighlight = {
  id: string;
  category: string;
  title: string;
  description: string;
  href: string;
};

export type HomepageHighlightsConfig = {
  sectionTitle: string;
  items: HomepageHighlight[];
};

export type HomepageHighlightsParseResult =
  | { success: true; data: HomepageHighlightsConfig }
  | { success: false };

export const DEFAULT_HOMEPAGE_HIGHLIGHTS: HomepageHighlightsConfig = {
  sectionTitle: "Coming up",
  items: [],
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeHomepageHref(value: string): boolean {
  if (/[\u0000-\u001f\u007f]/.test(value)) return false;

  if (value.startsWith("/")) {
    return !value.startsWith("//") && !value.startsWith("/\\");
  }

  try {
    const url = new URL(value);
    return (
      (url.protocol === "https:" || url.protocol === "http:") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function parseHomepageHighlight(value: unknown): HomepageHighlight | null {
  if (!isRecord(value)) return null;

  const id = typeof value.id === "string" ? value.id.trim() : "";
  const category = typeof value.category === "string" ? value.category.trim() : "";
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const description = typeof value.description === "string" ? value.description.trim() : "";
  const href = typeof value.href === "string" ? value.href.trim() : "";

  if (
    !UUID_PATTERN.test(id) ||
    !category || category.length > 40 ||
    !title || title.length > 120 ||
    description.length > 240 ||
    !href || href.length > 500 ||
    !isSafeHomepageHref(href)
  ) {
    return null;
  }

  return { id, category, title, description, href };
}

export function parseHomepageHighlightsConfig(
  value: unknown,
): HomepageHighlightsParseResult {
  if (!isRecord(value)) return { success: false };

  const sectionTitle =
    typeof value.sectionTitle === "string" ? value.sectionTitle.trim() : "";
  if (!sectionTitle || sectionTitle.length > 80 || !Array.isArray(value.items)) {
    return { success: false };
  }

  if (value.items.length > 3) return { success: false };

  const items = value.items.map(parseHomepageHighlight);
  if (items.some((item) => item === null)) return { success: false };

  const parsedItems = items as HomepageHighlight[];
  if (new Set(parsedItems.map((item) => item.id)).size !== parsedItems.length) {
    return { success: false };
  }

  return {
    success: true,
    data: { sectionTitle, items: parsedItems },
  };
}
