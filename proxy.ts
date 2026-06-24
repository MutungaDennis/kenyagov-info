import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/auth'

export async function proxy(request: NextRequest) {
  // Entry point for Next.js Proxy (replaces deprecated middleware).
  // Delegates to our auth session + role handler.
  return await updateSession(request)
}

// Also support default export for maximum compatibility with Next.js proxy convention
export default proxy;

export const config = {
  // Matcher configurations targeting /admin, /protected, and all subpaths
  matcher: [
    '/admin/:path*',
    '/protected/:path*',
    // Added sitemap.xml and robots.txt to the exclusion list below
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
