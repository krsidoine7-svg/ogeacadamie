import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ROLE_REDIRECTS: Record<string, string> = {
  user: '/dashboard',
  manager_zone: '/zone',
  admin: '/admin',
  super_admin: '/admin',
}

export async function middleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // Routes protégées
  const protectedPaths = ['/dashboard', '/admin', '/zone']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  // Non connecté sur route protégée → redirection vers connexion
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/connexion', request.url))
  }

  // Connecté sur page auth (connexion/inscription) → redirection selon rôle
  if (user && (pathname === '/connexion' || pathname === '/inscription')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'user'
    const redirect = ROLE_REDIRECTS[role] ?? '/dashboard'
    return NextResponse.redirect(new URL(redirect, request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
