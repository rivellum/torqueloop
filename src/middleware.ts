import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''

  // When accessed via aplica.veseguro.com, rewrite to /aplica
  if (host.startsWith('aplica.veseguro.com') && request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(new URL('/aplica', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
