"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, notifications } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Updates the logged-in candidate's profile settings.
 */
export async function updateCandidateProfile(formData: {
  whatsapp: string;
  modeFormation: "presentiel" | "en_ligne";
  zone: "yamoussoukro" | "yopougon" | "abobo" | "cocody" | "port-bouet" | "bouake";
}) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Non autorisé. Session expirée." };
    }

    // 2. Update profile in database
    await db
      .update(profiles)
      .set({
        whatsapp: formData.whatsapp,
        modeFormation: formData.modeFormation,
        zone: formData.zone,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id));

    revalidatePath("/dashboard/profil");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateCandidateProfile server action:", error);
    return { success: false, error: error.message || "Une erreur est survenue lors de la mise à jour." };
  }
}

/**
 * Marks a notification as read for the logged-in candidate.
 */
export async function markNotificationAsRead(notifId: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Non autorisé. Session expirée." };
    }

    // 2. Update notification status in DB (checking destination for safety)
    await db
      .update(notifications)
      .set({
        lu: true,
      })
      .where(
        and(
          eq(notifications.id, notifId),
          eq(notifications.destinataireId, user.id)
        )
      );

    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error in markNotificationAsRead server action:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Marks all notifications as read for the logged-in candidate.
 */
export async function markAllNotificationsAsRead() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Non autorisé. Session expirée." };
    }

    // 2. Update all unread notifications for this user in DB
    await db
      .update(notifications)
      .set({
        lu: true,
      })
      .where(
        and(
          eq(notifications.destinataireId, user.id),
          eq(notifications.lu, false)
        )
      );

    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error in markAllNotificationsAsRead server action:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

