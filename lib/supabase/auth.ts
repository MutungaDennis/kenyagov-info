import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { adminPath, getAdminBasePath, isAdminFilesystemPath, isAdminPublicPath, isCustomAdminPathEnabled } from "@/lib/admin-path";

function withCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach(cookie => target.cookies.set(cookie));
  return target;
}

/** Refresh protected sessions only; authoritative role checks stay in server guards. */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const api = pathname === "/api/admin" || pathname.startsWith("/api/admin/");
  if (!api && isCustomAdminPathEnabled() && isAdminFilesystemPath(pathname)) {
    return new NextResponse("Not Found", { status: 404, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow, noarchive" } });
  }
  // Defence in depth: no client creation, cookies or network work on public paths.
  if (!api && !isAdminPublicPath(pathname)) return NextResponse.next();
  const forwarded = new Headers(request.headers);
  forwarded.set("x-pathname", pathname);
  let response = NextResponse.next({ request: { headers: forwarded } });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return NextResponse.json({ error: "Authentication service unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        forwarded.set("cookie", request.cookies.toString());
        response = NextResponse.next({ request: { headers: forwarded } });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  // Verifies JWT claims and refreshes expired sessions. Asymmetric keys can be
  // checked locally; Supabase falls back to its Auth server for legacy keys.
  // Server layouts/API guards still call getUser and check is_admin before data access.
  const { data, error } = await supabase.auth.getClaims();
  const authenticated = !error && Boolean(data?.claims?.sub);
  if (api) return authenticated ? response : withCookies(response, NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } }));
  const relative = pathname.slice(getAdminBasePath().length).replace(/^\//, "");
  // Never redirect here based on roles: this avoids loops for non-admin users
  // redirected back by requireAdmin(), and keeps recovery sessions reachable.
  if (["login", "forgot-password", "reset-password"].includes(relative)) return response;
  if (!authenticated) {
    const login = new URL(adminPath("login"), request.url);
    login.searchParams.set("redirectedFrom", pathname);
    return withCookies(response, NextResponse.redirect(login));
  }
  return response;
}
