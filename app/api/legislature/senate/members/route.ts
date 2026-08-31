import { NextResponse } from "next/server";
import { fetchSenateMembers } from "@/lib/legislature/members";
import { isPublicSupabaseConfigured } from "@/lib/supabase/public";

/** Runtime-only: never bake a roster at Cloudflare build (env is placeholder there). */
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isPublicSupabaseConfigured()) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Database not configured on this server. Set NEXT_PUBLIC_SUPABASE_URL and anon/publishable key as Worker variables.",
        data: [],
        total: 0,
      },
      { status: 503 },
    );
  }

  try {
    const data = await fetchSenateMembers();
    return NextResponse.json(
      { success: true, data, total: data.length },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Failed to load senators",
        data: [],
        total: 0,
      },
      { status: 500 },
    );
  }
}
