import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  // Serve static proposal for thebeach subdomain
  if (hostname.includes('thebeach.kaizencollective.com.au')) {
    if (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '') {
      return NextResponse.rewrite(new URL('/thebeach.html', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}
