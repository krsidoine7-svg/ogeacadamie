import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Header from "@/components/dashboard/Header";
import { ZoneSidebarNav, ZoneMobileNav } from "@/components/dashboard/zone/ZoneNavigation";

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export default async function ManagerLayout({ children }: ManagerLayoutProps) {
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

  // 2. Fetch manager profile with retry for transient connection errors (ECONNRESET)
  let profile;
  try {
    profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    });
  } catch (err) {
    // Retry once on transient connection error
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      profile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id),
      });
    } catch {
      console.error("[ManagerLayout] Database query failed after retry:", err);
      redirect("/connexion");
    }
  }

  if (!profile) {
    redirect("/connexion");
  }

  // 3. Prevent non-manager roles from accessing this layout
  if (profile.role !== "manager_zone") {
    if (profile.role === "user") {
      redirect("/dashboard");
    } else if (profile.role === "admin" || profile.role === "super_admin") {
      redirect("/admin");
    } else {
      redirect("/connexion");
    }
  }

  const formatZoneName = (name: string | null) => {
    if (!name) return "Zone non définie";
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  return (
    <div className="h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">
      {/* Universal header customized for manager session */}
      <Header
        profile={{
          nom: profile.nom,
          prenom: profile.prenom,
          email: profile.email,
          zone: profile.zone,
        }}
      />

      {/* Mobile Navigation Bar */}
      <ZoneMobileNav />

      <div className="flex flex-1 max-w-7xl w-full mx-auto overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 hidden md:block border-r border-slate-200/80 pt-8 px-4 space-y-6 flex-shrink-0 h-full overflow-y-auto">
          <div className="px-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Navigation Manager
            </span>
          </div>

          <ZoneSidebarNav />

          <div className="pt-6 border-t border-slate-100 px-3">
            <div className="bg-amber-50/50 border border-amber-200/40 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <MapPin className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                <span>Zone Assignée</span>
              </div>
              <p className="text-xs font-semibold text-amber-700 leading-normal">
                Vous gérez les candidats et paiements inscrits à : <span className="font-bold underline text-amber-900">{formatZoneName(profile.zone)}</span>.
              </p>
            </div>
          </div>
        </aside>

        {/* Content Main Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto h-full pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
