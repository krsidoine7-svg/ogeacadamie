import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, zoneConfig } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import ZonesListClient from "./ZonesListClient";
import { MapPin } from "lucide-react";

export default async function AdminZonesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // 2. Fetch admin profile to check authorization
  const adminProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!adminProfile || (adminProfile.role !== "admin" && adminProfile.role !== "super_admin")) {
    redirect("/connexion");
  }

  // 3. Fetch all zone configurations
  const zoneConfigs = await db.query.zoneConfig.findMany();

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
            <MapPin className="w-4.5 h-4.5 text-[#D4A017]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Modalités de Paiement par Zone
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Mettez à jour les liens de paiement Wave, les numéros Orange Money/MTN et les adresses physiques des centres pour chaque ville.
        </p>
      </div>

      {/* Zones list manager component */}
      <ZonesListClient
        zones={zoneConfigs.map((z) => ({
          id: z.id,
          zone: z.zone as any,
          lienWave: z.lienWave,
          adresse: z.adresse,
          telephone: z.telephone,
        }))}
      />
    </div>
  );
}
