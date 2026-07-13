// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { resolveSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Creates a Supabase server client using the request cookies.
 * Soft-resolves URL/key so Cloudflare builds do not crash when NEXT_PUBLIC_*
 * are only configured as Worker runtime vars.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url: supabaseUrl, key: supabaseAnonKey } =
    resolveSupabasePublicEnv(true);

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Ignore cookie writes from Server Components / RSC
        }
      },
    },
  });
}

/**
 * Returns the current authenticated user or null.
 * Always uses getUser() (validates with Supabase, not just local JWT).
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Checks whether the current user is an admin by looking up the profiles table.
 * Returns false if not authenticated, no row, or is_admin is not true.
 * Gracefully handles missing table or RLS issues.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // Bootstrap (temporary): primary admin always treated as admin
  // TODO remove once is_admin flag set for dennis.mutunga14@gmail.com
  if (user.email === "dennis.mutunga14@gmail.com") return true;

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (error) {
      // Table may not exist yet, or no row for this user → not admin
      return false;
    }

    return !!profile?.is_admin;
  } catch {
    return false;
  }
}

/**
 * Requires an admin user.
 * - On protected admin pages: redirects to /admin/login if not admin.
 * - When already on /admin/login (or forgot/reset): returns null instead of redirecting
 *   to avoid redirect loops.
 */
export async function requireAdmin() {
  const headersList = await headers();
  const forwardedPath = headersList.get("x-pathname") || "";

  // Very strong guard: if the proxy told us this is an auth page, never redirect.
  // This completely prevents redirect loops on /admin/login etc.
  if (
    forwardedPath.includes("/login") ||
    forwardedPath.includes("/forgot-password") ||
    forwardedPath.includes("/reset-password")
  ) {
    return null;
  }

  const user = await getCurrentUser();

  // Detect current path (for other admin pages)
  let currentPath = forwardedPath;

  // Fallbacks
  if (!currentPath) {
    const referer = headersList.get("referer") || "";
    const urlHeader = headersList.get("x-url") || referer;
    try {
      if (urlHeader) currentPath = new URL(urlHeader).pathname;
    } catch {
      /* ignore */
    }
  }

  const isAuthPage =
    currentPath === "/admin/login" ||
    currentPath === "/admin/forgot-password" ||
    currentPath === "/admin/reset-password";

  if (!user) {
    if (isAuthPage) return null;
    redirect("/admin/login");
  }

  // Bootstrap (temporary)
  if (user.email === "dennis.mutunga14@gmail.com") return user;

  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    const supabase = await createClient();
    await supabase.auth.signOut();

    if (isAuthPage) return null;
    redirect("/admin/login?error=unauthorized");
  }

  return user;
}
