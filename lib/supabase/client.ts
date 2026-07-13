// lib/supabase/client.ts
import { createBrowserClient, type SupabaseClient } from "@supabase/ssr";
import {
  hasRealSupabasePublicEnv,
  readSupabasePublicEnv,
  resolveSupabasePublicEnv,
  SUPABASE_BUILD_PLACEHOLDER,
} from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;
let browserClientKey: string | null = null;

function clientCacheKey(url: string, key: string) {
  return `${url}::${key.slice(0, 12)}`;
}

/**
 * Browser Supabase client (for client components).
 * Never throws when URL/key are missing — uses a build placeholder so
 * Cloudflare/CI prerender of client pages does not fail.
 *
 * Prefer createBrowserClientAsync() inside useEffect so runtime Worker env
 * can be loaded via /api/public-env when NEXT_PUBLIC_* was not inlined at build.
 */
export function createClient(): SupabaseClient {
  const env = resolveSupabasePublicEnv(true);
  const cacheKey = clientCacheKey(env.url, env.key);

  if (browserClient && browserClientKey === cacheKey) {
    return browserClient;
  }

  browserClient = createBrowserClient(env.url, env.key);
  browserClientKey = cacheKey;
  return browserClient;
}

/**
 * Async browser client: if public env was not available at build time,
 * fetch it from the Worker at runtime (same values as NEXT_PUBLIC_*).
 */
export async function createBrowserClientAsync(): Promise<SupabaseClient> {
  if (typeof window === "undefined") {
    return createClient();
  }

  let env = readSupabasePublicEnv();

  if (!hasRealSupabasePublicEnv(env)) {
    try {
      const res = await fetch("/api/public-env", { cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as {
          supabaseUrl?: string;
          supabaseAnonKey?: string;
        };
        if (data.supabaseUrl && data.supabaseAnonKey) {
          env = { url: data.supabaseUrl, key: data.supabaseAnonKey };
          (
            window as unknown as {
              __CG_PUBLIC_ENV: {
                supabaseUrl: string;
                supabaseAnonKey: string;
              };
            }
          ).__CG_PUBLIC_ENV = {
            supabaseUrl: env.url,
            supabaseAnonKey: env.key,
          };
        }
      }
    } catch {
      // fall through to placeholder / process.env
    }
  }

  if (!hasRealSupabasePublicEnv(env)) {
    env = SUPABASE_BUILD_PLACEHOLDER;
  }

  const cacheKey = clientCacheKey(env.url, env.key);
  if (browserClient && browserClientKey === cacheKey) {
    return browserClient;
  }

  browserClient = createBrowserClient(env.url, env.key);
  browserClientKey = cacheKey;
  return browserClient;
}
