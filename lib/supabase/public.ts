/**
 * Cookie-free Supabase client for public Server Components / sitemaps / ISR.
 * Does NOT call cookies() — keeps pages eligible for static generation / caching.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { resolveSupabasePublicEnv } from "@/lib/supabase/env";

let publicClient: SupabaseClient | null = null;
let publicClientKey: string | null = null;

/**
 * Shared anon client for public reads. Safe for force-static / revalidate pages.
 * Do not use for authenticated admin actions (use lib/supabase/server.ts).
 */
export function createPublicClient(): SupabaseClient {
  const { url, key } = resolveSupabasePublicEnv(true);
  const cacheKey = `${url}::${key.slice(0, 12)}`;

  if (publicClient && publicClientKey === cacheKey) {
    return publicClient;
  }

  publicClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  publicClientKey = cacheKey;
  return publicClient;
}
