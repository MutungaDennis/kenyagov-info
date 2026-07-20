/**
 * Helpers for admin API routes (JSON, not redirects).
 */
import { NextResponse } from "next/server";
import { getCurrentUser, isCurrentUserAdmin } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function requireAdminApi(): Promise<
  | { ok: true; user: User; supabase: SupabaseClient }
  | { ok: false; response: NextResponse }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  // isCurrentUserAdmin includes temporary email bootstrap
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  try {
    const supabase = createServiceClient();
    return { ok: true, user, supabase };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Admin database client unavailable";
    return {
      ok: false,
      response: NextResponse.json({ error: message }, { status: 500 }),
    };
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
