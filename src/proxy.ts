import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Skipping middleware for static assets and API routes (except for admin API)
  const { pathname } = req.nextUrl
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return res
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // If accessing /admin (but not /admin/login) and no session → redirect to login
  if (pathname.startsWith('/admin') && !pathname.includes('/login')) {
    if (!session) {
      const loginUrl = new URL('/admin/login', req.url)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If already on /admin/login and has session → redirect to /admin
  if (pathname === '/admin/login' && session) {
    const adminUrl = new URL('/admin', req.url)
    return NextResponse.redirect(adminUrl)
  }

  return res
}

export const config = {
  matcher: '/admin/:path*',
}