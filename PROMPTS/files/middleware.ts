// ============================================================
// middleware.ts (ou fusionner avec votre middleware existant)
// Protège /admin contre les accès non-super_admin
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // On ne protège que les routes /admin
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // Crée le client Supabase côté serveur (middleware)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Pas connecté → redirection login
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Vérifie le rôle super_admin
  const role =
    user.user_metadata?.role || user.app_metadata?.role || null;

  if (role !== "super_admin") {
    // Connecté mais pas super_admin → page 403
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
