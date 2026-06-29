import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

/**
 * Route API de contournement pour les tests de charge (Locust).
 * Permet d'authentifier un utilisateur côté serveur et de positionner
 * les cookies de session Supabase Auth (HttpOnly) directement sur le client HTTP.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: `Échec d'authentification: ${error.message}` },
        { status: 401 }
      );
    }

    // Supabase a injecté les cookies de session dans le cookieStore.
    // Next.js va les renvoyer dans les en-têtes Set-Cookie de la réponse.
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: `Erreur interne: ${err.message}` },
      { status: 500 }
    );
  }
}
