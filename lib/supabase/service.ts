/**
 * Server-only Supabase client for admin data access.
 * Prefer SERVICE_ROLE (bypasses RLS) after requireAdmin() has already gated the page.
 * Falls back to public anon/publishable keys if service role is not set.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
}

export function getSupabaseServiceOrPublicKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    ""
  );
}

export function createServiceClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceOrPublicKey();

  if (!url || !key) {
    throw new Error(
      "Missing Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (preferred for admin) or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY on Cloudflare.",
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function hasServiceRoleKey(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}
