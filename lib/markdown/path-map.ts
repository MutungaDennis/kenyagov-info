/**
 * Map public HTML paths → /api/markdown query for content negotiation.
 * Keep allowlist tiny for Cloudflare Free proxy CPU.
 */

export type MarkdownTarget = {
  type: string;
  slug?: string;
  chapter?: string;
  article?: string;
};

export function pathToMarkdownTarget(pathname: string): MarkdownTarget | null {
  const path = pathname.replace(/\/$/, "") || "/";

  let m = path.match(/^\/government\/institutions\/([^/]+)$/);
  if (m) return { type: "institution", slug: m[1] };

  m = path.match(/^\/government\/people\/([^/]+)$/);
  if (m) return { type: "leader", slug: m[1] };

  m = path.match(/^\/acts\/parliament\/([^/]+)$/);
  if (m) return { type: "act", slug: m[1] };

  m = path.match(
    /^\/constitution\/chapter\/(\d+)\/article\/(\d+)$/,
  );
  if (m) return { type: "constitution-article", chapter: m[1], article: m[2] };

  // Flat GOV.UK-style service guides (single segment, not reserved)
  const reserved = new Set([
    "government",
    "constitution",
    "acts",
    "services",
    "elections",
    "open-data",
    "guides",
    "documents",
    "admin",
    "api",
    "studio",
    "search",
    "about",
    "contact",
    "disclaimer",
    "scams",
    "ecitizen",
    "help",
    "sitemap",
  ]);
  m = path.match(/^\/([^/]+)$/);
  if (m && !reserved.has(m[1])) {
    return { type: "service", slug: m[1] };
  }

  return null;
}

export function markdownApiPath(target: MarkdownTarget): string {
  const params = new URLSearchParams();
  params.set("type", target.type);
  if (target.slug) params.set("slug", target.slug);
  if (target.chapter) params.set("chapter", target.chapter);
  if (target.article) params.set("article", target.article);
  return `/api/markdown?${params.toString()}`;
}

/** Known AI crawler substrings (lowercase). */
export const AI_AGENT_UA = [
  "gptbot",
  "chatgpt-user",
  "oai-searchbot",
  "anthropic-ai",
  "claude-web",
  "claudebot",
  "perplexity",
  "perplexitybot",
  "google-extended",
  "applebot-extended",
  "cohere-ai",
  "amazonbot",
];
