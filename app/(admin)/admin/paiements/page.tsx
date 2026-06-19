import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, paiements } from "@/drizzle/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import PaiementsListClient from "./PaiementsListClient";
import { CreditCard } from "lucide-react";

export default async function AdminPaiementsPage() {
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

  // 3. Fetch all payments from database
  const paiementsList = await db
    .select({
      id: paiements.id,
      userId: paiements.userId,
      zone: paiements.zone,
      montant: paiements.montant,
      statut: paiements.statut,
      captureUrl: paiements.captureUrl,
      notes: paiements.notes,
      createdAt: paiements.createdAt,
    })
    .from(paiements)
    .where(isNull(paiements.deletedAt))
    .orderBy(desc(paiements.createdAt));

  // 4. Resolve candidate names & generate signed Storage URLs for each receipt in bulk
  const extendedPayments = await Promise.all(
    paiementsList.map(async (p) => {
      const candidate = await db.query.profiles.findFirst({
        where: eq(profiles.id, p.userId),
      });

      let signedCaptureUrl = null;
      if (p.captureUrl) {
        const { data: signData } = await supabase.storage
          .from("captures-paiements")
          .createSignedUrl(p.captureUrl, 3600); // 1 hour validity
        signedCaptureUrl = signData?.signedUrl || null;
      }

      return {
        id: p.id,
        userId: p.userId,
        candidateName: candidate ? `${candidate.prenom} ${candidate.nom}` : "Candidat Inconnu",
        candidateEmail: candidate?.email || "-",
        zone: p.zone,
        montant: p.montant,
        statut: p.statut,
        captureUrl: p.captureUrl,
        signedCaptureUrl,
        notes: p.notes,
        createdAt: p.createdAt,
      };
    })
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
            <CreditCard className="w-4.5 h-4.5 text-[#D4A017]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Vérification des Règlements
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Examinez les captures d'écran des virements, validez ou rejetez les versements et exportez les données comptables.
        </p>
      </div>

      {/* Interactive payment validation dashboard component */}
      <PaiementsListClient payments={extendedPayments} />
    </div>
  );
}
