import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Public Supabase config for the browser when NEXT_PUBLIC_* was not inlined
 * at build time (common on Cloudflare if vars are runtime-only).
 * Anon/publishable keys are designed to be public (protect data with RLS).
 */
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";

  return NextResponse.json(
    { supabaseUrl, supabaseAnonKey },
    {
      headers: {
        "Cache-Control": "public, max-age=60",
      },
    },
  );
}
