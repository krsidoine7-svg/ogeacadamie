import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, notifications } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import NotificationsClient from "./NotificationsClient";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // 2. Fetch candidate profile
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile) {
    redirect("/connexion");
  }

  // 3. Fetch notifications
  const userNotifications = await db.query.notifications.findMany({
    where: eq(notifications.destinataireId, user.id),
    orderBy: [desc(notifications.createdAt)],
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
            <Bell className="w-4.5 h-4.5 text-[#D4A017]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
            Centre de Notifications
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Suivez l'activité de vos inscriptions, de vos documents de cours et de votre centre.
        </p>
      </div>

      {/* Notifications client UI */}
      <NotificationsClient notifications={userNotifications} />
    </div>
  );
}
