/**
 * Shared Supabase public env helpers.
 *
 * Cloudflare Git builds often have Worker *runtime* vars but do not inject
 * NEXT_PUBLIC_* into `next build`. @supabase/ssr throws if URL/key are empty
 * during prerender — use placeholders only for that path, then resolve real
 * values at runtime (server process.env or /api/public-env for the browser).
 */

export type SupabasePublicEnv = {
  url: string;
  key: string;
};

/** Valid-looking dummy values so createBrowserClient / createServerClient accept them */
export const SUPABASE_BUILD_PLACEHOLDER: SupabasePublicEnv = {
  url: "https://placeholder.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjAsImV4cCI6MH0.placeholder",
};

export function readSupabasePublicEnv(): SupabasePublicEnv {
  // Browser: prefer runtime injection (Worker vars → /api/public-env → window)
  if (typeof window !== "undefined") {
    const injected = (
      window as unknown as {
        __CG_PUBLIC_ENV?: { supabaseUrl?: string; supabaseAnonKey?: string };
      }
    ).__CG_PUBLIC_ENV;
    if (injected?.supabaseUrl && injected?.supabaseAnonKey) {
      return { url: injected.supabaseUrl, key: injected.supabaseAnonKey };
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";

  return { url, key };
}

export function hasRealSupabasePublicEnv(env: SupabasePublicEnv): boolean {
  return (
    Boolean(env.url && env.key) &&
    !env.url.includes("placeholder.supabase.co")
  );
}

export function resolveSupabasePublicEnv(
  allowPlaceholder = true,
): SupabasePublicEnv {
  const env = readSupabasePublicEnv();
  if (hasRealSupabasePublicEnv(env)) return env;
  if (allowPlaceholder) return SUPABASE_BUILD_PLACEHOLDER;
  return env;
}
