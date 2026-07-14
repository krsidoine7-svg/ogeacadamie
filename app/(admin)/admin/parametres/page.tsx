import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { pageSections, profiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import SettingsForm from "./SettingsForm";
import { Settings } from "lucide-react";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // 2. Fetch admin profile to check credentials & roles
  const adminProfile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!adminProfile || (adminProfile.role !== "admin" && adminProfile.role !== "super_admin")) {
    redirect("/connexion");
  }

  const isSuperAdmin = adminProfile.role === "super_admin";

  // 3. Fetch integration settings
  const configRow = await db.query.pageSections.findFirst({
    where: eq(pageSections.cle, "parametres"),
  });

  const config = configRow?.contenu as any || {
    webhook_secret: "secret123",
    make_webhook_url: "",
    make_error_webhook_url: "",
    n8n_webhook_url: "",
    google_calendar_id: "",
  };

  // 4. Fetch global system configuration
  const systemConfigRow = await db.query.pageSections.findFirst({
    where: eq(pageSections.cle, "system_config"),
  });
  const systemConfig = systemConfigRow?.contenu as any || {
    allow_manager_edit: true,
    enable_wave: true,
    enable_momo: true,
    enable_orange: true,
    concepteur_whatsapp: "+225 0503681588",
    concepteur_email: "krsidoine7@gmail.com",
  };

  if (systemConfig.concepteur_whatsapp === undefined) systemConfig.concepteur_whatsapp = "+225 0503681588";
  if (systemConfig.concepteur_email === undefined) systemConfig.concepteur_email = "krsidoine7@gmail.com";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
            <Settings className="w-4.5 h-4.5 text-[#D4A017]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Configuration Système & Services
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Gérez l'activation des fonctionnalités, les moyens de paiement et la configuration des webhooks et de l'agenda.
        </p>
      </div>

      <SettingsForm 
        initialSettings={config} 
        isSuperAdmin={isSuperAdmin}
        initialSystemConfig={systemConfig}
        profile={{
          nom: adminProfile.nom,
          prenom: adminProfile.prenom,
          email: adminProfile.email,
          whatsapp: adminProfile.whatsapp,
          avatarUrl: adminProfile.avatarUrl,
        }}
      />
    </div>
  );
}
