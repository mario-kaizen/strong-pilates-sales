import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  // thebeach subdomain: block everything except static assets
  if (hostname.includes('thebeach.kaizencollective.com.au')) {
    const path = request.nextUrl.pathname

    // Allow static assets (chart.min.js, fonts, etc)
    if (path.startsWith('/_next/') || path === '/chart.min.js') {
      return NextResponse.next()
    }

    // Root serves the static proposal
    if (path === '/' || path === '') {
      return NextResponse.rewrite(new URL('/thebeach.html', request.url))
    }

    // Block everything else — don't expose the dashboard or wizard
    return new NextResponse('Not found', { status: 404 })
  }

  // Static proposal rewrites — serve HTML reports at clean URLs
  const path = request.nextUrl.pathname
  const staticReports: Record<string, string> = {
    '/wellingtonwest': '/wellingtonwest/index.html',
    '/coalharbour': '/coalharbour.html',
  }

  if (staticReports[path]) {
    return NextResponse.rewrite(new URL(staticReports[path], request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
