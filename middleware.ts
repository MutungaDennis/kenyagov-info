import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/auth";

// OpenNext 1.x supports Edge middleware, but not Next 16's Node-only proxy.ts.
// Keep this convention until the adapter supports Node middleware. Protected
// layouts and API handlers independently verify administrator authorisation.
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// BEGIN AUTH MATCHERS
export const config = { matcher: [
  "/admin",
  "/admin/((?!.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)",
  "/api/admin",
  "/api/admin/((?!.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)",
  "/cg-ke-a5wkqciyjpg940u3",
  "/cg-ke-a5wkqciyjpg940u3/((?!.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)"
] };
// END AUTH MATCHERS
