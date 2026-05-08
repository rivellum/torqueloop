import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const host = request.headers.get('host') || ''

  // Supabase PKCE / email OTP flows can send auth params to site_url root —
  // normalize them to the callback route without dropping next/type metadata.
  if (
    request.nextUrl.pathname === '/' &&
    (request.nextUrl.searchParams.get('code') || request.nextUrl.searchParams.get('token_hash'))
  ) {
    const callbackUrl = new URL('/auth/callback', request.url)
    request.nextUrl.searchParams.forEach((value, key) => {
      callbackUrl.searchParams.set(key, value)
    })
    return NextResponse.redirect(callbackUrl)
  }

  // When accessed via aplica.veseguro.com, rewrite to /aplica
  if (host.startsWith('aplica.veseguro.com') && request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/aplica', request.url))
  }

  // Auth guard for /dashboard/* routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            )
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones that start with:
     * - login (login page)
     * - auth/callback (OAuth callback)
     * - api (API routes)
     * - aplica (public landing)
     * - lp (public landing pages)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!login|auth/callback|api|aplica|lp|_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
