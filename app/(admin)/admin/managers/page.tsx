import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, zoneConfig } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
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
          Attribuez des responsables aux différentes zones géographiques et gérez leurs privilèges.
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
        }))}
        zones={zoneConfigs.map((z) => ({
          id: z.id,
          zone: z.zone as any,
          managerId: z.managerId,
          telephone: z.telephone,
        }))}
        currentRole={adminProfile.role}
      />
    </div>
  );
}
