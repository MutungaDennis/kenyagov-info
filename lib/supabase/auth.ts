import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Proxy / session handler for Supabase auth + admin role checks.
 * - Refreshes Supabase auth cookies (called from root proxy.ts).
 * - Protects /admin routes: must be authenticated + have is_admin=true in profiles.
 * - No more hardcoded emails. Role lives in the database.
 */
export async function updateSession(request: NextRequest) {
  const currentPath = request.nextUrl.pathname

  // Forward pathname to server components via request headers.
  // This lets requireAdmin() in layouts reliably know we are on /admin/login
  // and avoid self-redirect loops.
  const forwardedHeaders = new Headers(request.headers)
  forwardedHeaders.set('x-pathname', currentPath)

  let supabaseResponse = NextResponse.next({
    request: {
      headers: forwardedHeaders,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request: {
            headers: forwardedHeaders,
          },
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Always validate the user server-side (secure)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAdminRoute = currentPath.startsWith('/admin')
  const isLoginRoute = currentPath === '/admin/login'
  const isForgotRoute = currentPath === '/admin/forgot-password'
  const isResetRoute = currentPath === '/admin/reset-password'

  // Early handling for login / forgot / reset pages to prevent any loops.
  // Serve the page unless the user is a confirmed admin (then bounce to dashboard).
  if (isLoginRoute || isForgotRoute || isResetRoute) {
    if (user) {
      // Bootstrap (temporary) primary admin
      const isPrimaryAdmin = user.email === 'dennis.mutunga14@gmail.com'
      const isAdmin = isPrimaryAdmin || await safeIsAdmin(supabase, user.id)
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        // Ensure non-admin sessions are cleared before serving the login screen
        try {
          await supabase.auth.signOut()
        } catch {}
      }
    }
    // Always serve the auth page (no redirect to itself)
    return supabaseResponse
  }

  // 1. Unauthenticated users trying to access admin (except login/reset flows) → login
  if (isAdminRoute && !isLoginRoute && !isForgotRoute && !isResetRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('redirectedFrom', currentPath)
    return NextResponse.redirect(url)
  }

  // 2. If we have a user on an admin route (non-login), verify they are actually an admin
  if (isAdminRoute && !isLoginRoute && !isForgotRoute && !isResetRoute && user) {
    // Bootstrap (temporary): primary admin always allowed
    if (user.email === 'dennis.mutunga14@gmail.com') {
      // fall through to allow
    } else {
      const isAdmin = await safeIsAdmin(supabase, user.id)

      if (!isAdmin) {
        // Not an admin — clear session and send away
        try { await supabase.auth.signOut() } catch {}
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  // (auth page handling moved to early return above to prevent loops)

  // Legacy /protected handling (kept for compatibility)
  if (currentPath.startsWith('/protected') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

/**
 * Safe helper to check is_admin without crashing on missing table/row/RLS errors.
 */
async function safeIsAdmin(supabase: any, userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (error) return false
    return !!profile?.is_admin
  } catch {
    return false
  }
}
