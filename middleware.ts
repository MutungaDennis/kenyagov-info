import { NextResponse, type NextRequest } from "next/server";
import {
  getAdminBasePath,
  isAdminFilesystemPath,
  isAdminPublicPath,
  isCustomAdminPathEnabled,
} from "@/lib/admin-path";

/**
 * Edge middleware:
 * - Maps secret admin URL → internal /admin/* (app routes stay under app/admin)
 * - Returns 404 for public /admin/* when secret path is active (production default)
 * - Forwards x-pathname for requireAdmin() auth-page detection
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secretBase = getAdminBasePath();
  const requestHeaders = new Headers(request.headers);

  // SEO: consolidate service category query URLs onto clean paths
  // /services?category=money-tax → /services/categories/money-tax (308)
  // Subcategory/org filters stay on the query string of the clean path.
  if (pathname === "/services") {
    const category = request.nextUrl.searchParams.get("category");
    if (category && category !== "all" && category.trim() !== "") {
      const url = request.nextUrl.clone();
      url.pathname = `/services/categories/${encodeURIComponent(category)}`;
      url.searchParams.delete("category");
      return NextResponse.redirect(url, 308);
    }
  }

  // Always hide well-known /admin when secret path is active
  if (isCustomAdminPathEnabled() && isAdminFilesystemPath(pathname)) {
    const notFound = request.nextUrl.clone();
    notFound.pathname = "/not-found-admin";
    requestHeaders.set("x-pathname", pathname);
    // Keep browser URL as /admin but serve a not-found page (no login form)
    return NextResponse.rewrite(notFound, {
      request: { headers: requestHeaders },
    });
  }

  // Rewrite /{secret}/… → /admin/…
  if (isAdminPublicPath(pathname)) {
    const rest = pathname.slice(secretBase.length) || "";
    const url = request.nextUrl.clone();
    url.pathname = rest ? `/admin${rest}` : "/admin";
    requestHeaders.set("x-pathname", pathname);
    requestHeaders.set("x-admin-base", secretBase);
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    });
  }

  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets. Secret admin path must always be rewritten.
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
