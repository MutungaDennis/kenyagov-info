// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

/**
 * Browser Supabase client (for client components).
 * Use only for non-sensitive operations or when protected by server.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}