import { NextResponse, type NextRequest } from "next/server";

/**
 * Lightweight Edge middleware for Cloudflare Worker size limits.
 *
 * Full Supabase session refresh used to pull ~750KB (gzip ~150KB+) into the
 * middleware isolate. Admin protection remains in `app/admin/layout.tsx`
 * via `requireAdmin()` / `getUser()` on the Node server function.
 *
 * Pathname is still forwarded so requireAdmin can avoid redirect loops.
 */
export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
