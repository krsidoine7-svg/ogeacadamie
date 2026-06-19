import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, paiements } from "@/drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import PaiementZoneTable from "@/components/dashboard/zone/PaiementZoneTable";
import { MapPin } from "lucide-react";

export default async function ManagerDashboardPage() {
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
          Aucune zone géographique n'est associée à votre compte manager. Veuillez contacter un administrateur général de la plateforme pour qu'il vous attribue une zone (ex: Yamoussoukro, Yopougon, Abobo, etc.).
        </p>
      </div>
    );
  }

  // 3. Fetch candidates (role='user') in this zone with their payment details
  const candidatesData = await db
    .select({
      id: profiles.id,
      nom: profiles.nom,
      prenom: profiles.prenom,
      email: profiles.email,
      whatsapp: profiles.whatsapp,
      isActive: profiles.isActive,
      paymentStatus: paiements.statut,
      paymentId: paiements.id,
      paymentCaptureUrl: paiements.captureUrl,
      paymentNotes: paiements.notes,
      paymentCreatedAt: paiements.createdAt,
    })
    .from(profiles)
    .leftJoin(paiements, eq(profiles.id, paiements.userId))
    .where(
      and(
        eq(profiles.role, "user"),
        eq(profiles.zone, managerProfile.zone)
      )
    )
    .orderBy(desc(paiements.createdAt));

  // 4. Batch generate signed URLs for payment captures
  const paths = candidatesData
    .map((c) => c.paymentCaptureUrl)
    .filter((url): url is string => !!url);

  const signedUrlsMap: Record<string, string> = {};

  if (paths.length > 0) {
    try {
      const { data: signedData, error: signedError } = await supabase.storage
        .from("captures-paiements")
        .createSignedUrls(paths, 3600); // 1 hour expiry

      if (!signedError && signedData) {
        signedData.forEach((item) => {
          if (item.signedUrl && item.path) {
            signedUrlsMap[item.path] = item.signedUrl;
          }
        });
      }
    } catch (err) {
      console.error("Error generating batch signed URLs for manager dashboard:", err);
    }
  }

  // Map signed URLs to corresponding candidate object
  const candidatesWithSignedUrls = candidatesData.map((c) => ({
    ...c,
    signedUrl: c.paymentCaptureUrl ? signedUrlsMap[c.paymentCaptureUrl] : undefined,
  }));

  const formatZoneName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">Tableau de Bord</h1>
        <p className="text-slate-500 text-xs mt-1">
          Suivi des inscriptions et validation des paiements pour la zone :{" "}
          <span className="font-bold text-[#0F172A] uppercase">
            {formatZoneName(managerProfile.zone)}
          </span>
        </p>
      </div>

      {/* Main interactive table & statistics */}
      <PaiementZoneTable candidates={candidatesWithSignedUrls} />
    </div>
  );
}
