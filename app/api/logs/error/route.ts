import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { logSystemError } from "@/lib/errorAlertService";

/**
 * Route publique de journalisation des erreurs (API / Client UI)
 * Reçoit les logs depuis n'importe quel composant (par ex. DocumentsManagerClient en 413)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const errorMessage = body.errorMessage || body.message || body.error;
    const stackTrace = body.stackTrace || body.stack || null;
    const level = body.level || "error";
    const source = body.source || "client";
    const endpoint = body.endpoint || null;
    const metadata = body.metadata || body.context || {};

    if (!errorMessage || typeof errorMessage !== "string") {
      return NextResponse.json(
        { error: "Le paramètre errorMessage (ou message) est requis." },
        { status: 400 }
      );
    }

    // Tenter de récupérer l'utilisateur en cours si session active
    let userId: string | null = null;
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch (e) {
      // Pas de session ou cookie inaccessible, on continue anonymement
    }

    const logResult = await logSystemError({
      level,
      source,
      endpoint,
      errorMessage,
      stackTrace,
      userId,
      metadata,
    });

    return NextResponse.json({ success: true, id: logResult?.id || null });
  } catch (error: any) {
    console.error("Erreur dans /api/logs/error:", error);
    return NextResponse.json(
      { error: "Impossible d'enregistrer le log." },
      { status: 500 }
    );
  }
}
