import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getCachedUserProfile, getCachedAllActiveDocuments } from "@/lib/cached-queries";
import { db } from "@/lib/db";
import { profiles, documents, concoursInscrits, paiements } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import DocumentsList from "./DocumentsList";
import { BookOpen, AlertCircle } from "lucide-react";

interface DocumentsPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function DocumentsPage({ searchParams }: DocumentsPageProps) {
  const params = await searchParams;
  const initialType = params.type || "all";
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // 2. Fetch profile (cached)
  const profile = await getCachedUserProfile(user.id);

  if (!profile) {
    redirect("/connexion");
  }

  // 3. Verify active status and payment
  const payment = await db.query.paiements.findFirst({
    where: eq(paiements.userId, user.id),
  });

  if (!profile.isActive || !payment || payment.statut !== "valide") {
    redirect("/dashboard");
  }

  // 4. Fetch candidate's concours registrations
  const registrations = await db.query.concoursInscrits.findMany({
    where: eq(concoursInscrits.userId, user.id),
  });

  const registeredConcoursList = registrations.map((r) => r.concours as string);

  // 5. Fetch documents related to candidate's registered concours, mode of training, and zone (cached & filtered in-memory)
  const allActiveDocs = await getCachedAllActiveDocuments();
  
  const availableDocuments = allActiveDocs.filter((doc) => {
    const matchConcours = registeredConcoursList.length > 0
      ? (doc.concours === "tous" || registeredConcoursList.includes(doc.concours as string))
      : (doc.concours === "tous");
      
    const matchMode = !profile.modeFormation || doc.modeFormation === "tous" || doc.modeFormation === profile.modeFormation;
    const matchZone = !profile.zone || doc.zone === "tous" || doc.zone === profile.zone;
    
    return matchConcours && matchMode && matchZone;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-[#D4A017]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
              Mes Supports de Préparation
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Accédez à vos fiches de cours, sujets de concours blancs et corrigés officiels.
          </p>
        </div>
      </div>

      {/* Info notice about download/print restriction */}
      <div className="bg-amber-50/40 border border-amber-200/50 rounded-2xl p-4 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-[#D4A017] flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-amber-900">Lecture en Ligne Sécurisée</p>
          <p className="text-amber-800/80 leading-relaxed">
            Par mesure de protection des droits d'auteur, les documents sont consultables via un visualiseur sécurisé. Le téléchargement, l'impression et les captures d'écran sont strictement interdits. Votre adresse IP et identifiant sont incrustés en filigrane pour assurer le traçage.
          </p>
        </div>
      </div>

      {/* Documents filterable list */}
      <DocumentsList
        documents={availableDocuments}
        registeredConcours={registeredConcoursList}
        initialType={initialType}
      />
    </div>
  );
}
