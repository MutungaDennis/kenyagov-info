/**
 * Cookie-free Supabase client for public Server Components / sitemaps / ISR.
 * Does NOT call cookies() — keeps pages eligible for static generation / caching.
 *
 * Cloudflare note:
 * - Prefer browser-side createBrowserClientAsync for heavy directories (Worker only
 *   serves HTML; Supabase talk happens off-Worker → stays under Free-tier CPU).
 * - Server-side createPublicClient is fine for small, paginated reads when
 *   NEXT_PUBLIC_SUPABASE_* is set as a Worker *runtime* variable.
 * - Never select entire large tables just to build filter dropdowns.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  hasRealSupabasePublicEnv,
  resolveSupabasePublicEnv,
  type SupabasePublicEnv,
} from "@/lib/supabase/env";

let publicClient: SupabaseClient | null = null;
let publicClientKey: string | null = null;

export function getResolvedPublicEnv(): SupabasePublicEnv {
  return resolveSupabasePublicEnv(true);
}

export function isPublicSupabaseConfigured(): boolean {
  return hasRealSupabasePublicEnv(resolveSupabasePublicEnv(false));
}

/**
 * Shared anon client for public reads. Safe for force-static / revalidate pages.
 * Do not use for authenticated admin actions (use lib/supabase/server.ts).
 */
export function createPublicClient(): SupabaseClient {
  const env = resolveSupabasePublicEnv(true);
  const cacheKey = `${env.url}::${env.key.slice(0, 12)}`;

  if (publicClient && publicClientKey === cacheKey) {
    return publicClient;
  }

  if (!hasRealSupabasePublicEnv(env) && process.env.NODE_ENV === "production") {
    // Placeholder client: queries will fail. Pages must handle empty data.
    console.error(
      "[supabase/public] NEXT_PUBLIC_SUPABASE_URL / PUBLISHABLE_KEY (or ANON_KEY) missing at runtime. Set them as Cloudflare Worker variables (and at build time for client pages).",
    );
  }

  publicClient = createClient(env.url, env.key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      // Keep edge requests lean
      headers: { "X-Client-Info": "citizenguide-public" },
    },
  });
  publicClientKey = cacheKey;
  return publicClient;
}
