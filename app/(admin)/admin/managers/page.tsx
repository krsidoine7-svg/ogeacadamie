import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, zoneConfig, adminPendingActions, pageSections } from "@/drizzle/schema";
import { eq, and, isNull, desc, inArray } from "drizzle-orm";
import ManagersListClient from "./ManagersListClient";
import { UserCheck } from "lucide-react";

export default async function AdminManagersPage() {
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

  // 3. Fetch all manager profiles
  const managerProfiles = await db.query.profiles.findMany({
    where: and(
      eq(profiles.role, "manager_zone"),
      isNull(profiles.deletedAt)
    ),
  });

  // 4. Fetch all zone configurations
  const zoneConfigs = await db.query.zoneConfig.findMany();

  // 5. Fetch all pending actions for dual confirmation
  const pendingRequests = await db.query.adminPendingActions.findMany({
    where: eq(adminPendingActions.statut, "en_attente"),
    orderBy: [desc(adminPendingActions.createdAt)],
  });

  // Fetch all admin profiles to resolve initiator names
  const allAdmins = await db.query.profiles.findMany({
    where: inArray(profiles.role, ["admin", "super_admin"]),
  });

  const pendingActionsWithInitiators = pendingRequests.map((req) => {
    const initiator = allAdmins.find((a) => a.id === req.initiatedBy);
    const target = managerProfiles.find((m) => m.id === req.targetId) || allAdmins.find((a) => a.id === req.targetId);
    return {
      id: req.id,
      type: req.type,
      targetId: req.targetId,
      initiatedBy: req.initiatedBy,
      details: req.details as any,
      statut: req.statut,
      createdAt: req.createdAt,
      initiatorName: initiator ? `${initiator.prenom} ${initiator.nom}` : "Admin inconnu",
      targetName: target ? `${target.prenom} ${target.nom}` : "Manager inconnu",
    };
  });

  // 6. Fetch global system configuration
  const systemConfigRow = await db.query.pageSections.findFirst({
    where: eq(pageSections.cle, "system_config"),
  });
  const systemConfig = systemConfigRow?.contenu as any || {
    allow_manager_edit: true,
    enable_wave: true,
    enable_momo: true,
    enable_orange: true,
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
            <UserCheck className="w-4.5 h-4.5 text-[#D4A017]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Responsables de Zone
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Attribuez des responsables aux différentes zones géographiques, modifiez leurs informations et gérez leurs privilèges.
        </p>
      </div>

      {/* Interactive managers list / promote component */}
      <ManagersListClient
        managers={managerProfiles.map((m) => ({
          id: m.id,
          nom: m.nom,
          prenom: m.prenom,
          email: m.email,
          zone: m.zone,
          isActive: m.isActive ?? false,
          whatsapp: m.whatsapp || "",
        }))}
        zones={zoneConfigs.map((z) => ({
          id: z.id,
          zone: z.zone as any,
          managerId: z.managerId,
          telephone: z.telephone,
        }))}
        currentRole={adminProfile.role}
        currentUserId={user.id}
        pendingActions={pendingActionsWithInitiators}
        systemConfig={systemConfig}
      />
    </div>
  );
}
