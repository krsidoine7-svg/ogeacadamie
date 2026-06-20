import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, paiements } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import ZoneDashboardClient from "@/components/dashboard/zone/ZoneDashboardClient";
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

  // 3. Fetch all candidates (role='user') in this zone with payment status to compute stats
  const allCandidates = await db
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
    );

  const total = allCandidates.length;
  const actifs = allCandidates.filter((c) => c.isActive === true).length;
  const aValider = allCandidates.filter((c) => c.paymentStatus === "en_cours").length;
  const rejete = allCandidates.filter((c) => c.paymentStatus === "rejete").length;
  const nonSoumis = allCandidates.filter(
    (c) => !c.paymentStatus || c.paymentStatus === "en_attente"
  ).length;

  const stats = { total, actifs, aValider, rejete, nonSoumis };

  // 4. Get the 5 most recent candidates who have a payment capture uploaded, prioritized by status 'en_cours' first
  const candidatesForRecent = allCandidates
    .filter((c) => c.paymentCaptureUrl)
    .sort((a, b) => {
      // Prioritize 'en_cours' status
      if (a.paymentStatus === "en_cours" && b.paymentStatus !== "en_cours") return -1;
      if (a.paymentStatus !== "en_cours" && b.paymentStatus === "en_cours") return 1;
      // Then order by date desc
      const dateA = a.paymentCreatedAt ? new Date(a.paymentCreatedAt).getTime() : 0;
      const dateB = b.paymentCreatedAt ? new Date(b.paymentCreatedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // Resolve signed Storage URLs for the 5 recent submissions
  const recentSubmissions = await Promise.all(
    candidatesForRecent.map(async (c) => {
      let signedUrl = undefined;
      if (c.paymentCaptureUrl) {
        try {
          const { data, error } = await supabase.storage
            .from("captures-paiements")
            .createSignedUrl(c.paymentCaptureUrl, 3600);
          if (!error && data) {
            signedUrl = data.signedUrl;
          }
        } catch (err) {
          console.error("Error generating signed URL for candidate receipt:", err);
        }
      }
      return {
        ...c,
        signedUrl,
      };
    })
  );

  return (
    <ZoneDashboardClient
      stats={stats}
      recentSubmissions={recentSubmissions}
      zoneName={managerProfile.zone}
    />
  );
}
