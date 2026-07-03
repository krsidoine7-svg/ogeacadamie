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
  const pathname = request.nextUrl.pathname

  // Routes protégées
  const protectedPaths = ['/dashboard', '/admin', '/zone']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))
  const isAuthPage = pathname === '/connexion' || pathname === '/inscription'

  // Éviter tout appel API réseau ou BDD Supabase pour les pages publiques non authentifiées
  if (!isProtected && !isAuthPage) {
    return supabaseResponse
  }

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

  // Non connecté sur route protégée → redirection vers connexion
  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/connexion', request.url))
  }

  // Connecté
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, force_password_reset')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'user'
    const forceReset = profile?.force_password_reset ?? false

    // Si réinitialisation forcée et qu'on n'est pas sur la page dédiée
    if (forceReset && pathname !== '/nouveau-mot-de-passe') {
      return NextResponse.redirect(new URL('/nouveau-mot-de-passe', request.url))
    }

    // Connecté sur page d'authentification (ou sur /nouveau-mot-de-passe sans que ce soit forcé)
    if (isAuthPage || (pathname === '/nouveau-mot-de-passe' && !forceReset)) {
      const redirectPath = ROLE_REDIRECTS[role] ?? '/dashboard'
      return NextResponse.redirect(new URL(redirectPath, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
