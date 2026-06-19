import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, concoursInscrits, paiements } from "@/drizzle/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import CandidatsListClient from "./CandidatsListClient";
import { Users } from "lucide-react";

export default async function AdminCandidatsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // 2. Fetch admin profile
  const adminProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!adminProfile || (adminProfile.role !== "admin" && adminProfile.role !== "super_admin")) {
    redirect("/connexion");
  }

  // 3. Fetch all candidates (role = 'user')
  const candidatesList = await db
    .select({
      id: profiles.id,
      nom: profiles.nom,
      prenom: profiles.prenom,
      email: profiles.email,
      whatsapp: profiles.whatsapp,
      zone: profiles.zone,
      modeFormation: profiles.modeFormation,
      isActive: profiles.isActive,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(
      and(
        eq(profiles.role, "user"),
        isNull(profiles.deletedAt)
      )
    )
    .orderBy(desc(profiles.createdAt));

  // 4. Fetch details (concours registrations and payments) for each candidate
  const extendedCandidates = await Promise.all(
    candidatesList.map(async (candidate) => {
      // Concours inscrits
      const regs = await db.query.concoursInscrits.findMany({
        where: eq(concoursInscrits.userId, candidate.id),
      });
      const registeredConcours = regs.map((r) => r.concours as string);

      // Statut paiement
      const pm = await db.query.paiements.findFirst({
        where: eq(paiements.userId, candidate.id),
      });
      const paymentStatus = pm?.statut || "non_soumis";

      return {
        ...candidate,
        registeredConcours,
        paymentStatus,
      };
    })
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
            <Users className="w-4.5 h-4.5 text-[#D4A017]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Base de Données des Candidats
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Gérez l'accès des inscrits, modifiez les comptes et suivez les dossiers de préparation.
        </p>
      </div>

      {/* Interative candidates grid component */}
      <CandidatsListClient candidates={extendedCandidates} />
    </div>
  );
}
