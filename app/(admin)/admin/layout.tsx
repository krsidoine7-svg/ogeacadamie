import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import Header from "@/components/dashboard/Header";
import { LayoutDashboard, Users, CreditCard, UserCheck, MapPin, Send, ShieldCheck, Globe, FileText, Settings } from "lucide-react";
import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
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

  // 2. Fetch admin profile
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile) {
    redirect("/connexion");
  }

  // 3. Prevent non-admin roles from accessing this layout
  if (profile.role !== "admin" && profile.role !== "super_admin") {
    if (profile.role === "user") {
      redirect("/dashboard");
    } else if (profile.role === "manager_zone") {
      redirect("/zone");
    } else {
      redirect("/connexion");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Universal header customized for admin session */}
      <Header
        profile={{
          nom: profile.nom,
          prenom: profile.prenom,
          email: profile.email,
          zone: null, // Admins don't have a zone
        }}
      />

      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-b border-slate-200 bg-white px-2 py-3 flex items-center justify-around text-xs font-bold text-slate-500 shadow-sm flex-shrink-0">
        <Link
          href="/admin"
          className="flex flex-col items-center gap-1 py-1 px-2 hover:text-[#0F172A] transition-all text-[#D4A017]"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <Link
          href="/admin/candidats"
          className="flex flex-col items-center gap-1 py-1 px-2 hover:text-[#0F172A] transition-all"
        >
          <Users className="w-4 h-4" />
          <span>Candidats</span>
        </Link>
        <Link
          href="/admin/paiements"
          className="flex flex-col items-center gap-1 py-1 px-2 hover:text-[#0F172A] transition-all"
        >
          <CreditCard className="w-4 h-4" />
          <span>Paiements</span>
        </Link>
        <Link
          href="/admin/managers"
          className="flex flex-col items-center gap-1 py-1 px-2 hover:text-[#0F172A] transition-all"
        >
          <UserCheck className="w-4 h-4" />
          <span>Managers</span>
        </Link>
        <Link
          href="/admin/zones"
          className="flex flex-col items-center gap-1 py-1 px-2 hover:text-[#0F172A] transition-all"
        >
          <MapPin className="w-4 h-4" />
          <span>Zones</span>
        </Link>
        <Link
          href="/admin/notifications"
          className="flex flex-col items-center gap-1 py-1 px-2 hover:text-[#0F172A] transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Annonces</span>
        </Link>
        <Link
          href="/admin/contenu"
          className="flex flex-col items-center gap-1 py-1 px-2 hover:text-[#0F172A] transition-all"
        >
          <Globe className="w-4 h-4" />
          <span>Accueil</span>
        </Link>
      </div>

      <div className="flex flex-1 max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar */}
        <aside className="w-64 hidden md:block border-r border-slate-200/80 pt-8 px-4 space-y-6 flex-shrink-0">
          <div className="px-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Administration
            </span>
          </div>

          <nav className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-755 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Tableau de bord</span>
            </Link>

            <Link
              href="/admin/candidats"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-755 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Gestion Candidats</span>
            </Link>

            <Link
              href="/admin/paiements"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-755 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
            >
              <CreditCard className="w-4 h-4 text-slate-400" />
              <span>Suivi Paiements</span>
            </Link>

            <Link
              href="/admin/managers"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-755 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
            >
              <UserCheck className="w-4 h-4 text-slate-400" />
              <span>Responsables de Zone</span>
            </Link>

            <Link
              href="/admin/zones"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-755 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
            >
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>Configurations Zone</span>
            </Link>

            <Link
              href="/admin/notifications"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-755 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
            >
              <Send className="w-4 h-4 text-slate-400" />
              <span>Annonces Groupées</span>
            </Link>

            <Link
              href="/admin/contenu"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-755 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
            >
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Éditeur Accueil</span>
            </Link>

            <Link
              href="/admin/documents"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-755 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
            >
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Supports & Directs</span>
            </Link>

            <Link
              href="/admin/parametres"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-755 hover:bg-slate-100 font-semibold text-sm tracking-tight transition-all duration-200"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Paramètres</span>
            </Link>
          </nav>

          <div className="pt-6 border-t border-slate-100 px-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-white">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4A017]">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Console Centrale</span>
              </div>
              <p className="text-xs font-medium text-slate-450 leading-relaxed">
                Vous êtes connecté en tant que <span className="font-bold text-[#D4A017] uppercase">{profile.role.replace("_", " ")}</span>.
              </p>
            </div>
          </div>
        </aside>

        {/* Content Main Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
