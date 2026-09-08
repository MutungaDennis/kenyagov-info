// lib/supabase/server.ts

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminPath } from "@/lib/admin-path";
import { resolveSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Creates a Supabase server client using request cookies.
 *
 * Cookie writes work in Server Actions and Route Handlers. They can throw
 * from Server Components, so setAll deliberately tolerates that case.
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
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Expected when called while rendering a Server Component.
          // Session mutation should be performed by a Server Action or
          // Route Handler instead.
        }
      },
    },
  });
}

/**
 * Returns the currently authenticated Supabase user, or null.
 *
 * getUser() validates the session with Supabase rather than trusting only
 * local cookie/JWT contents.
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Returns true only when the signed-in user's profiles row has is_admin=true.
 *
 * There is intentionally no hard-coded email bypass here. Admin privilege
 * should be data-driven and revocable.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const supabase = await createClient();

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Admin profile lookup failed:", error.message);
      return false;
    }

    return profile?.is_admin === true;
  } catch (error) {
    console.error("Admin profile lookup failed:", error);
    return false;
  }
}

/**
 * Requires a valid administrator.
 *
 * IMPORTANT:
 * This function performs no pathname detection.
 *
 * It must only be called from the protected admin route-group layout:
 *   app/admin/(protected)/layout.tsx
 *
 * Authentication pages live under:
 *   app/admin/(auth)/
 *
 * Because route groups do not appear in the URL, public paths remain:
 *   /admin/login
 *   /admin
 *   /admin/legislation
 * etc.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(adminPath("login"));
  }

  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    redirect(`${adminPath("login")}?error=unauthorized`);
  }

  return user;
}
