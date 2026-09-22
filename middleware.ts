import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/auth";

// OpenNext 1.x supports Edge middleware, but not Next 16's Node-only proxy.ts.
// Keep this convention until the adapter supports Node middleware. Protected
// layouts and API handlers independently verify administrator authorisation.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
