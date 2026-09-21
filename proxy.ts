import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/auth";

export async function proxy(
  request: NextRequest,
) {
  return updateSession(request);
}

/**
 * These values must remain statically analysable by Next.js.
 *
 * If the production admin URL changes, update both:
 *
 * 1. lib/admin-path.ts
 * 2. this matcher
 * 3. NEXT_PUBLIC_ADMIN_BASE_PATH in Cloudflare
 */
export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/cg-ke-a5wkqciyjpg940u3/:path*",
  ],
};