"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, notifications } from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

/**
 * Updates the logged-in candidate's profile settings.
 */
export async function updateCandidateProfile(formData: {
  whatsapp: string;
}) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Non autorisé. Session expirée." };
    }

    // 2. Update profile in database (only WhatsApp is editable by candidate)
    await db
      .update(profiles)
      .set({
        whatsapp: formData.whatsapp,
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

/**
 * Clears the force_password_reset flag for the logged-in user.
 */
export async function clearForcePasswordResetStatus() {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Non autorisé. Session expirée." };
    }

    await db.update(profiles)
      .set({
        forcePasswordReset: false,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id));

    return { success: true };
  } catch (error: any) {
    console.error("Error in clearForcePasswordResetStatus:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Updates the logged-in user's profile details (nom, prenom, email, whatsapp, password).
 */
export async function updatePersonalProfile(data: {
  nom: string;
  prenom: string;
  email: string;
  whatsapp: string;
  password?: string;
}) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Non autorisé. Session expirée." };
    }

    const newEmail = data.email.trim().toLowerCase();

    // Verify email uniqueness if email has changed
    const existing = await db.query.profiles.findFirst({
      where: and(eq(profiles.email, newEmail), sql`id != ${user.id}`),
    });
    if (existing) {
      return { success: false, error: "Cette adresse email est déjà utilisée." };
    }

    // 1. Update profiles table
    await db.update(profiles)
      .set({
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        email: newEmail,
        whatsapp: data.whatsapp.trim(),
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id));

    // 2. Update email in auth.users via security definer
    await db.execute(sql`
      SELECT public.admin_update_auth_user_email(${user.id}, ${newEmail})
    `);

    // 3. Update password if provided via security definer
    if (data.password && data.password.length >= 6) {
      await db.execute(sql`
        SELECT public.admin_reset_user_password_and_sessions(${user.id}, ${data.password})
      `);
    }

    revalidatePath("/dashboard/profil");
    revalidatePath("/zone/parametres");
    revalidatePath("/admin/parametres");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updatePersonalProfile:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

