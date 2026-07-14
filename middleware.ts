import { NextResponse, type NextRequest } from "next/server";
import {
  getAdminBasePath,
  isAdminFilesystemPath,
  isAdminPublicPath,
  isCustomAdminPathEnabled,
} from "@/lib/admin-path";

/**
 * Edge middleware:
 * - Maps secret admin URL → internal /admin/* (filesystem routes unchanged)
 * - Returns 404 for /admin/* when a custom base path is configured
 * - Forwards x-pathname for requireAdmin() auth-page detection
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secretBase = getAdminBasePath();
  const requestHeaders = new Headers(request.headers);

  // Hide well-known /admin when a random path is configured
  if (isCustomAdminPathEnabled() && isAdminFilesystemPath(pathname)) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  // Rewrite /{secret}/… → /admin/…
  if (isAdminPublicPath(pathname)) {
    const rest = pathname.slice(secretBase.length) || "";
    const url = request.nextUrl.clone();
    url.pathname = `/admin${rest}` || "/admin";
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
  // Broad matcher so secret admin path is always rewritten (cannot be env-dynamic in matcher)
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
