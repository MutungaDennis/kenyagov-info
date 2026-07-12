import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/auth";

/**
 * Edge Middleware for Supabase session refresh + admin protection.
 *
 * Next.js 16 renamed this convention to `proxy.ts` (Node.js runtime by default).
 * OpenNext Cloudflare does not support Node.js middleware yet, so we keep the
 * classic `middleware.ts` Edge entry for Cloudflare deploys.
 *
 * @see https://opennext.js.org/cloudflare — Node Middleware not yet supported
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/protected/:path*",
    // Session refresh on most pages; skip static assets and SEO files
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
