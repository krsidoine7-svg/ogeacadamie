import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, zoneConfig } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import ZoneSettingsForm from "@/components/dashboard/zone/ZoneSettingsForm";
import { MapPin } from "lucide-react";

export default async function ZoneParametresPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // 2. Fetch manager profile to confirm role & zone
  const managerProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!managerProfile || managerProfile.role !== "manager_zone") {
    redirect("/connexion");
  }

  // Check if zone is configured
  if (!managerProfile.zone) {
    return (
      <div className="max-w-2xl mx-auto my-8 bg-amber-50 border border-amber-200 p-6 rounded-2xl text-amber-800 space-y-2">
        <div className="flex items-center gap-2 font-bold text-base">
          <MapPin className="w-5 h-5 text-gold" />
          <span>Zone non configurée</span>
        </div>
        <p className="text-xs leading-relaxed">
          Aucune zone géographique n'est associée à votre compte manager. Veuillez contacter un administrateur général de la plateforme.
        </p>
      </div>
    );
  }

  // 3. Fetch current zone config
  const existingConfig = await db.query.zoneConfig.findFirst({
    where: eq(zoneConfig.zone, managerProfile.zone),
  });

  const initialConfig = {
    zone: managerProfile.zone,
    lienWave: existingConfig?.lienWave ?? null,
    numeroWave: existingConfig?.numeroWave ?? null,
    adresse: existingConfig?.adresse ?? null,
    telephone: existingConfig?.telephone ?? null,
  };

  const formatZoneName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Paramètres de la Zone</h1>
        <p className="text-slate-500 text-xs mt-1">
          Configurez le numéro de téléphone, l'adresse et les comptes de paiement Wave CI de votre zone :{" "}
          <span className="font-bold text-[#0F172A] uppercase">
            {formatZoneName(managerProfile.zone)}
          </span>
        </p>
      </div>

      {/* Settings Form */}
      <ZoneSettingsForm initialConfig={initialConfig} />
    </div>
  );
}
