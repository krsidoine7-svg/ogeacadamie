import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, documents } from "@/drizzle/schema";
import { eq, and, or, isNull, desc } from "drizzle-orm";
import ZoneDocumentsClient from "./ZoneDocumentsClient";

export default async function ZoneDocumentsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/connexion");
  }

  // 2. Fetch manager profile
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile || profile.role !== "manager_zone" || !profile.zone) {
    redirect("/connexion");
  }

  // 3. Fetch documents for this zone (or global 'tous' documents from Admin)
  const dbDocs = await db.query.documents.findMany({
    where: and(
      or(
        eq(documents.zone, profile.zone),
        eq(documents.zone, "tous")
      ),
      isNull(documents.deletedAt)
    ),
    orderBy: [desc(documents.createdAt)],
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Supports d'Étude de la Zone
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Publiez des supports PDF de préparation (cours, exercices, corrigés) spécifiques aux candidats de votre zone.
        </p>
      </div>

      <ZoneDocumentsClient initialDocuments={dbDocs} managerZone={profile.zone} />
    </div>
  );
}
