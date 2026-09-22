import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/auth";

export async function proxy(
  request: NextRequest,
) {
  return updateSession(request);
}

/** The broad matcher supports configured admin prefixes without manual edits. */
export const config = {
  // Match configurable admin prefixes too. updateSession returns immediately
  // for public routes, without contacting Supabase.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
