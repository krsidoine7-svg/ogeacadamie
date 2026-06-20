import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, paiements, zoneConfig, notifications, pageSections } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import Header from "@/components/dashboard/Header";
import PaiementModalWrapper from "@/components/dashboard/candidat/PaiementModalWrapper";
import CandidatMobileNav from "@/components/dashboard/CandidatMobileNav";
import { ShieldAlert, LayoutDashboard, BookOpen, UserCircle, Bell, CreditCard } from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate user session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/connexion");
  }

  // 2. Fetch candidate profile
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile) {
    redirect("/connexion");
  }

  // 3. Prevent non-candidate roles from accessing this layout
  if (profile.role !== "user") {
    if (profile.role === "manager_zone") {
      redirect("/zone");
    } else if (profile.role === "admin" || profile.role === "super_admin") {
      redirect("/admin");
    } else {
      redirect("/connexion");
    }
  }

  // 4. Check payment status
  const payment = await db.query.paiements.findFirst({
    where: eq(paiements.userId, user.id),
  });

  const paymentStatus = payment?.statut || "en_attente";

  // 5. Load specific zone configuration if not yet validated
  let zoneConfigData = null;
  if (paymentStatus !== "valide" && profile.zone) {
    zoneConfigData = await db.query.zoneConfig.findFirst({
      where: eq(zoneConfig.zone, profile.zone),
    });
  }



  // 6. Fetch unread notification count
  let unreadNotifCount = 0;
  if (paymentStatus === "valide") {
    const unreadNotifs = await db.query.notifications.findMany({
      where: and(
        eq(notifications.destinataireId, user.id),
        eq(notifications.lu, false)
      ),
    });
    unreadNotifCount = unreadNotifs.length;
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Universal header containing candidate session info & logout button */}
      <Header
        profile={{
          nom: profile.nom,
          prenom: profile.prenom,
          email: profile.email,
          zone: profile.zone,
        }}
      />

      {paymentStatus === "valide" ? (
        <div className="flex flex-col md:flex-row flex-1 max-w-7xl w-full mx-auto overflow-hidden">
          {/* Mobile Navigation Bar */}
          <CandidatMobileNav
            profile={{
              nom: profile.nom,
              prenom: profile.prenom,
              email: profile.email,
              role: profile.role,
            }}
            unreadNotifCount={unreadNotifCount}
          />

          {/* Navigation Sidebar */}
          <aside className="w-64 hidden md:block border-r border-slate-200/80 pt-8 px-4 space-y-6 flex-shrink-0 h-full overflow-y-auto">
            <div className="px-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Espace Candidat
              </span>
            </div>

            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-400 group-hover:text-gold" />
                <span>Tableau de bord</span>
              </Link>

              <Link
                href="/dashboard/documents"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-755 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
              >
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span>Ressources & Cours</span>
              </Link>

              <Link
                href="/dashboard/profil"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-755 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
              >
                <UserCircle className="w-4 h-4 text-slate-400" />
                <span>Mon Profil</span>
              </Link>

              <Link
                href="/dashboard/paiement"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-755 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
              >
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Mes Paiements</span>
              </Link>

              <Link
                href="/dashboard/notifications"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-755 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-slate-400" />
                  <span>Notifications</span>
                </div>
                {unreadNotifCount > 0 && (
                  <span className="bg-rose-500 text-white font-extrabold text-xs px-2 py-0.5 rounded-full">
                    {unreadNotifCount}
                  </span>
                )}
              </Link>
            </nav>
          </aside>

          {/* Content Main Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto h-full pb-20 md:pb-8">
            {children}
          </main>
        </div>
      ) : (
        /* Blocked dashboard area when payment is not approved */
        <main className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
          <div className="text-center space-y-4 max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-xl">
            <div className="w-12 h-12 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-center mx-auto text-[#D4A017]">
              <ShieldAlert className="w-6 h-6 text-[#D4A017]" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">Accès Restreint</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Votre compte est en cours d'activation. Afin d'accéder aux cours, entraînements et documents, veuillez régulariser vos frais d'inscription de <span className="font-bold text-slate-900">15 000 FCFA</span> dans la boîte de dialogue.
            </p>
          </div>

          <PaiementModalWrapper
            status={paymentStatus}
            notes={payment?.notes ?? null}
            zoneConfig={zoneConfigData ? {
              zone: zoneConfigData.zone,
              lienWave: zoneConfigData.lienWave,
              numeroWave: zoneConfigData.numeroWave,
              adresse: zoneConfigData.adresse,
              telephone: zoneConfigData.telephone,
            } : null}
          />
        </main>
      )}
    </div>
  );
}
