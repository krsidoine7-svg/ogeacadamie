import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, concoursInscrits } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import ProfileClient from "./ProfileClient";
import { UserCircle } from "lucide-react";

export default async function ProfilPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // 2. Fetch candidate profile
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile) {
    redirect("/connexion");
  }

  // 3. Fetch registered concours
  const registrations = await db.query.concoursInscrits.findMany({
    where: eq(concoursInscrits.userId, user.id),
  });

  const registeredConcoursList = registrations.map((r) => r.concours as string);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
            <UserCircle className="w-4.5 h-4.5 text-[#D4A017]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Mon Profil Candidat
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Consultez vos informations personnelles et configurez votre mot de passe d'accès.
        </p>
      </div>

      {/* Profile forms container */}
      <ProfileClient
        profile={{
          nom: profile.nom,
          prenom: profile.prenom,
          email: profile.email,
          whatsapp: profile.whatsapp,
          modeFormation: profile.modeFormation,
          zone: profile.zone,
        }}
        registeredConcours={registeredConcoursList}
      />
    </div>
  );
}
