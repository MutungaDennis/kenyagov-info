import { NextRequest, NextResponse } from "next/server";
import {
  AI_AGENT_UA,
  markdownApiPath,
  pathToMarkdownTarget,
} from "@/lib/markdown/path-map";

/**
 * Tiny Next.js 16 Proxy (formerly Middleware).
 * - Prefer Cloudflare for host redirects / heavy rules (CPU budget).
 * - Only rewrite allowlisted civic paths to /api/markdown when:
 *   Accept includes text/markdown, OR a known AI crawler UA.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/studio") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const accept = (request.headers.get("accept") || "").toLowerCase();
  const prefersMarkdown = accept.includes("text/markdown");
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  const isAiAgent = AI_AGENT_UA.some((a) => ua.includes(a));

  if (!prefersMarkdown && !isAiAgent) {
    return NextResponse.next();
  }

  const target = pathToMarkdownTarget(pathname);
  if (!target) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  const apiPath = markdownApiPath(target);
  const [pathOnly, qs] = apiPath.split("?");
  url.pathname = pathOnly;
  url.search = qs ? `?${qs}` : "";

  const response = NextResponse.rewrite(url);
  response.headers.set("Vary", "Accept, User-Agent");
  return response;
}

export const config = {
  matcher: [
    "/government/institutions/:slug",
    "/government/people/:slug",
    "/acts/parliament/:slug",
    "/constitution/chapter/:chapter/article/:article",
    "/:slug",
  ],
};
