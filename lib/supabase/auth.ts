import { isAdminUserId } from "@/lib/supabase/admin-access";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  NextResponse,
  type NextRequest,
} from "next/server";

import {
  adminPath,
  getAdminBasePath,
  isAdminFilesystemPath,
  isAdminPublicPath,
  isCustomAdminPathEnabled,
} from "@/lib/admin-path";

function copyResponseCookies(
  source: NextResponse,
  target: NextResponse,
): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  return target;
}



function getRelativeAdminPath(
  pathname: string,
): string {
  const base = getAdminBasePath();

  if (pathname === base) {
    return "";
  }

  if (pathname.startsWith(`${base}/`)) {
    return pathname.slice(base.length + 1);
  }

  return "";
}

function isAdminAuthenticationPage(
  pathname: string,
): boolean {
  const relativePath =
    getRelativeAdminPath(pathname);

  return (
    relativePath === "login" ||
    relativePath === "forgot-password" ||
    relativePath === "reset-password"
  );
}

function jsonError(
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  const isAdminApiRoute =
    pathname === "/api/admin" ||
    pathname.startsWith("/api/admin/");

  /*
   * The real app/admin route is available locally but must not be publicly
   * accessible in production.
   */
  if (
    !isAdminApiRoute &&
    isCustomAdminPathEnabled() &&
    isAdminFilesystemPath(pathname)
  ) {
    return new NextResponse("Not Found", {
      status: 404,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type":
          "text/plain; charset=utf-8",
        "X-Robots-Tag":
          "noindex, nofollow, noarchive",
      },
    });
  }

  const isAdminPage =
    isAdminPublicPath(pathname);

  if (!isAdminPage && !isAdminApiRoute) {
    return NextResponse.next();
  }

  const forwardedHeaders = new Headers(
    request.headers,
  );

  forwardedHeaders.set(
    "x-pathname",
    pathname,
  );

  let response = NextResponse.next({
    request: {
      headers: forwardedHeaders,
    },
  });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  const supabasePublicKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabasePublicKey) {
    console.error(
      "Admin authentication is unavailable because Supabase public environment variables are missing.",
    );

    if (isAdminApiRoute) {
      return jsonError(
        "Authentication service unavailable",
        503,
      );
    }

    return new NextResponse(
      "Authentication service unavailable",
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "Content-Type":
            "text/plain; charset=utf-8",
        },
      },
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabasePublicKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          /*
           * Make refreshed cookies visible to the remaining request pipeline.
           */
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(name, value);
            },
          );

          // Forward the refreshed cookies, not the original request header.
          forwardedHeaders.set("cookie", request.cookies.toString());

          response = NextResponse.next({
            request: {
              headers: forwardedHeaders,
            },
          });

          /*
           * Return refreshed cookies to the browser.
           */
          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options,
              );
            },
          );
        },
      },
    },
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const authenticated =
    !userError && Boolean(user);

  /*
   * API requests must receive JSON errors, never page redirects.
   *
   * The API route will perform its own authoritative authorization check
   * through requireAdminApi(). Here we validate/refresh the session early.
   */
  if (isAdminApiRoute) {
    if (!authenticated || !user) {
      return copyResponseCookies(
        response,
        jsonError("Unauthorized", 401),
      );
    }

    const isAdmin =
  await isAdminUserId(user.id);

    if (!isAdmin) {
      return copyResponseCookies(
        response,
        jsonError("Forbidden", 403),
      );
    }

    return response;
  }

  const isAuthenticationPage =
    isAdminAuthenticationPage(pathname);

  /*
   * Auth pages remain available to signed-out users.
   */
  if (isAuthenticationPage) {
    // Recovery must remain reachable after the callback establishes a session.
    if (getRelativeAdminPath(pathname) === "reset-password") return response;
    if (!authenticated || !user) {
      return response;
    }

    const isAdmin =
  await isAdminUserId(user.id);

    if (isAdmin) {
      return copyResponseCookies(
        response,
        NextResponse.redirect(
          new URL(
            adminPath(),
            request.url,
          ),
        ),
      );
    }

    await supabase.auth.signOut();

    return response;
  }

  /*
   * Protected admin page without a valid session.
   */
  if (!authenticated || !user) {
    const loginUrl = new URL(
      adminPath("login"),
      request.url,
    );

    loginUrl.searchParams.set(
      "redirectedFrom",
      pathname,
    );

    return copyResponseCookies(
      response,
      NextResponse.redirect(loginUrl),
    );
  }

    const isAdmin =
  await isAdminUserId(user.id);

  if (!isAdmin) {
    await supabase.auth.signOut();

    const loginUrl = new URL(
      adminPath("login"),
      request.url,
    );

    loginUrl.searchParams.set(
      "error",
      "unauthorized",
    );

    return copyResponseCookies(
      response,
      NextResponse.redirect(loginUrl),
    );
  }

  return response;
}
