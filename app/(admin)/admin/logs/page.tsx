import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { systemErrorLogs, profiles } from "@/drizzle/schema";
import { eq, desc, isNull } from "drizzle-orm";
import ErrorLogsClient from "./ErrorLogsClient";

export const dynamic = "force-dynamic";

export default async function ErrorLogsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/connexion");
  }

  const adminProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!adminProfile || adminProfile.role !== "super_admin") {
    redirect("/admin/accueil");
  }

  // Récupérer les 150 dernières anomalies système non supprimées logiquement
  const results = await db
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
    .limit(150);

  // Calcul des statistiques rapides
  const totalErrors = results.length;
  const criticalCount = results.filter((r) => r.log.level === "critical").length;
  const unresolvedCount = results.filter((r) => r.log.status === "nouveau" || r.log.status === "en_cours").length;
  const resolvedCount = results.filter((r) => r.log.status === "resolu").length;

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-12">
      <ErrorLogsClient
        initialLogs={results}
        stats={{
          total: totalErrors,
          critical: criticalCount,
          unresolved: unresolvedCount,
          resolved: resolvedCount,
        }}
      />
    </div>
  );
}
