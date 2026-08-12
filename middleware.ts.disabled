import { NextResponse, type NextRequest } from "next/server";
import {
  getAdminBasePath,
  isAdminFilesystemPath,
  isAdminPublicPath,
  isCustomAdminPathEnabled,
} from "@/lib/admin-path";

/**
 * Edge middleware (keep CPU minimal for Cloudflare Free 10ms budget):
 * - Apex → www host redirect (single canonical host for Google)
 * - Secret admin rewrite / hide /admin
 * - /services?category= consolidation redirect
 * - Early no-op path avoids header cloning on ordinary public pages
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host")?.toLowerCase() ?? "";

  // SEO: force https://www.citizenguide.ke (avoid apex/www duplicate indexing).
  // Prefer also setting this as a Cloudflare Redirect Rule (0 Worker CPU).
  const hostname = host.split(":")[0];
  if (hostname === "citizenguide.ke") {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.hostname = "www.citizenguide.ke";
    url.port = "";
    return NextResponse.redirect(url, 308);
  }

  // SEO: /services?category=money-tax → /services/categories/money-tax
  if (pathname === "/services") {
    const category = request.nextUrl.searchParams.get("category");
    if (category && category !== "all" && category.trim() !== "") {
      const url = request.nextUrl.clone();
      url.pathname = `/services/categories/${encodeURIComponent(category)}`;
      url.searchParams.delete("category");
      return NextResponse.redirect(url, 308);
    }
  }

  const secretEnabled = isCustomAdminPathEnabled();

  // Hide well-known /admin when secret path is active
  if (secretEnabled && isAdminFilesystemPath(pathname)) {
    const notFound = request.nextUrl.clone();
    notFound.pathname = "/not-found-admin";
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.rewrite(notFound, {
      request: { headers: requestHeaders },
    });
  }

  // Rewrite /{secret}/… → /admin/…
  if (isAdminPublicPath(pathname)) {
    const secretBase = getAdminBasePath();
    const rest = pathname.slice(secretBase.length) || "";
    const url = request.nextUrl.clone();
    url.pathname = rest ? `/admin${rest}` : "/admin";
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    requestHeaders.set("x-admin-base", secretBase);
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  // Public pages: zero header mutation — cheapest path for Free tier
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match HTML/app routes only. Skip static assets and common files.
     * Admin secret path still matches and is rewritten above.
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
