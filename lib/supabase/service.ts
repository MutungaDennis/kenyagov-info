/**
 * Server-only Supabase service-role client.
 *
 * This client bypasses Row Level Security and must never be imported into a
 * Client Component or exposed to browser code.
 *
 * Only use it after the requesting user's Supabase session has been validated.
 */

import "server-only";

import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

export function getSupabaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL is not configured.",
    );
  }

  return url;
}

export function getSupabaseServiceRoleKey(): string {
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. Admin operations require the server-only Supabase service-role key.",
    );
  }

  const publishableKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      ?.trim();

  const anonymousKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY
      ?.trim();

  /*
   * Prevent accidental configuration where a public key is copied into the
   * service-role variable.
   */
  if (
    serviceRoleKey === publishableKey ||
    serviceRoleKey === anonymousKey
  ) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY contains a public Supabase key. Configure the real server-only service-role key.",
    );
  }

  return serviceRoleKey;
}

/**
 * Backwards-compatible export.
 *
 * Existing server files may still import this older function name. It now
 * returns only the service-role key and never falls back to a public key.
 */
export function getSupabaseServiceOrPublicKey(): string {
  return getSupabaseServiceRoleKey();
}

/**
 * Creates an RLS-bypassing Supabase client for trusted server operations.
 *
 * The client does not persist sessions because it represents the application
 * service, not the currently signed-in user.
 */
export function createServiceClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const serviceRoleKey =
    getSupabaseServiceRoleKey();

  return createClient(
    url,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },

      global: {
        headers: {
          "X-Client-Info":
            "citizenguide-admin-server",
        },
      },
    },
  );
}

export function hasServiceRoleKey(): boolean {
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!serviceRoleKey) {
    return false;
  }

  const publishableKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      ?.trim();

  const anonymousKey =
    process.env
      .NEXT_PUBLIC_SUPABASE_ANON_KEY
      ?.trim();

  return (
    serviceRoleKey !== publishableKey &&
    serviceRoleKey !== anonymousKey
  );
}