import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { systemErrorLogs, profiles } from "@/drizzle/schema";
import { eq, desc, and, isNull, lt, sql } from "drizzle-orm";

async function verifySuperAdminSession() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Non autorisé", status: 401 };
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile || profile.role !== "super_admin") {
    return { error: "Accès strictement réservé au Super Admin.", status: 403 };
  }

  return { user, profile };
}

/**
 * GET /api/admin/logs
 * Récupère les logs avec tri et informations utilisateurs joints
 */
export async function GET(req: Request) {
  try {
    const authCheck = await verifySuperAdminSession();
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const levelFilter = searchParams.get("level");
    const statusFilter = searchParams.get("status");

    // Requête jointe pour inclure le nom/email de l'utilisateur qui a eu l'erreur
    const query = db
      .select({
        log: systemErrorLogs,
        user: {
          id: profiles.id,
          nom: profiles.nom,
          prenom: profiles.prenom,
          email: profiles.email,
          role: profiles.role,
        },
      })
      .from(systemErrorLogs)
      .leftJoin(profiles, eq(systemErrorLogs.userId, profiles.id))
      .where(isNull(systemErrorLogs.deletedAt))
      .orderBy(desc(systemErrorLogs.createdAt))
      .limit(limit);

    const results = await query;

    // Filtrage en mémoire si filtres fournis
    let filtered = results;
    if (levelFilter && levelFilter !== "all") {
      filtered = filtered.filter((r) => r.log.level === levelFilter);
    }
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((r) => r.log.status === statusFilter);
    }

    return NextResponse.json({ success: true, logs: filtered });
  } catch (err: any) {
    console.error("Erreur GET /api/admin/logs:", err);
    return NextResponse.json({ error: "Erreur lors du chargement des logs." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/logs
 * Permet de modifier le statut d'un log (ex: marquer comme "resolu" ou "ignore")
 */
export async function PATCH(req: Request) {
  try {
    const authCheck = await verifySuperAdminSession();
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: "L'identifiant du log et le nouveau statut sont requis." }, { status: 400 });
    }

    await db
      .update(systemErrorLogs)
      .set({ status, updatedAt: new Date() })
      .where(eq(systemErrorLogs.id, id));

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur PATCH /api/admin/logs:", err);
    return NextResponse.json({ error: "Impossible de modifier le statut." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/logs?id=xxx OU ?action=purge
 * Supprime un log ou purge automatiquement les logs résolus de > 30 jours
 */
export async function DELETE(req: Request) {
  try {
    const authCheck = await verifySuperAdminSession();
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const id = searchParams.get("id");

    if (action === "purge") {
      // Purger les logs résolus ou ignorés de plus de 30 jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await db
        .update(systemErrorLogs)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(
          and(
            eq(systemErrorLogs.status, "resolu"),
            lt(systemErrorLogs.createdAt, thirtyDaysAgo),
            isNull(systemErrorLogs.deletedAt)
          )
        );

      return NextResponse.json({ success: true, message: "Purge effectuée avec succès." });
    } else if (id) {
      await db
        .update(systemErrorLogs)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(systemErrorLogs.id, id));

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Identifiant ou action requise." }, { status: 400 });
    }
  } catch (err: any) {
    console.error("Erreur DELETE /api/admin/logs:", err);
    return NextResponse.json({ error: "Erreur lors de la suppression/purge." }, { status: 500 });
  }
}
