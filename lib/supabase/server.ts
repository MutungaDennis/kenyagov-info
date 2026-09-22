import { createServerClient } from "@supabase/ssr";
import type {
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminPath } from "@/lib/admin-path";
import { isAdminUserId } from "@/lib/supabase/admin-access";
import { resolveSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * Creates a request-scoped Supabase client using the current request cookies.
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  const {
    url: supabaseUrl,
    key: supabasePublicKey,
  } = resolveSupabasePublicEnv(false);

  return createServerClient(
    supabaseUrl,
    supabasePublicKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(
              ({
                name,
                value,
                options,
              }) => {
                cookieStore.set(
                  name,
                  value,
                  options,
                );
              },
            );
          } catch {
            /*
             * Cookie writes can fail while rendering Server Components.
             * proxy.ts refreshes sessions before rendering protected pages.
             */
          }
        },
      },
    },
  );
}

/**
 * Returns the validated authenticated user for the current request.
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase =
    await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error(
      "Could not validate current user:",
      error.message,
    );

    return null;
  }

  return user ?? null;
}

/**
 * Returns true only when the current authenticated user has is_admin=true.
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user =
    await getCurrentUser();

  if (!user) {
    return false;
  }

  return isAdminUserId(user.id);
}

/**
 * Protects server-rendered administrator pages.
 *
 * This must only be called from protected layouts, pages, actions, or route
 * handlers. Do not call it from the root app/admin layout because that layout
 * also wraps the login page.
 */
export async function requireAdmin(): Promise<User> {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect(adminPath("login"));
  }

  const isAdmin =
    await isAdminUserId(user.id);

  if (!isAdmin) {
    console.error(
      "Authenticated user is not an administrator:",
      {
        userId: user.id,
        email: user.email,
      },
    );

    redirect(
      `${adminPath(
        "login",
      )}?error=unauthorized`,
    );
  }

  return user;
}
