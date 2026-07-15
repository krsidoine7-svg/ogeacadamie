"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, zoneConfig, notifications, concoursInscrits, paiements, pageSections, temoignages, blogArticles, documents, adminPendingActions } from "@/drizzle/schema";
import { eq, and, isNull, inArray, sql, or } from "drizzle-orm";
import { createCalendarEvent, deleteCalendarEvent } from "@/lib/googleCalendar";
import { triggerNewDocumentWebhook } from "@/lib/webhooks";

/**
 * Helper to verify if the logged-in user is an Admin or Super Admin
 */
async function verifyAdminSession() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Non autorisé. Session expirée.");
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    throw new Error("Accès refusé. Privilèges insuffisants.");
  }

  return { user, profile };
}

/**
 * Helper to verify if the logged-in user is a Super Admin
 */
async function verifySuperAdminSession() {
  const { user, profile } = await verifyAdminSession();
  if (profile.role !== "super_admin") {
    throw new Error("Accès refusé. Cette action requiert le rôle Super Administrateur.");
  }
  return { user, profile };
}

/**
 * Toggles a candidate's active status
 */
export async function toggleUserActive(userId: string, active: boolean) {
  try {
    await verifyAdminSession();

    await db
      .update(profiles)
      .set({
        isActive: active,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));

    revalidatePath("/admin/candidats");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in toggleUserActive action:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Soft deletes a candidate profile
 */
export async function softDeleteUser(userId: string) {
  try {
    await verifyAdminSession();

    await db
      .update(profiles)
      .set({
        deletedAt: new Date(),
        isActive: false, // Deactivate on deletion
      })
      .where(eq(profiles.id, userId));

    revalidatePath("/admin/candidats");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in softDeleteUser action:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Promotes an existing candidate or user to manager_zone and links them to a zone
 */
export async function promoteUserToManager(
  email: string,
  zone: "yamoussoukro" | "yopougon" | "abobo" | "cocody" | "port-bouet" | "bouake"
) {
  try {
    await verifySuperAdminSession();

    // Find the user profile by email
    const targetProfile = await db.query.profiles.findFirst({
      where: and(
        eq(profiles.email, email.trim().toLowerCase()),
        isNull(profiles.deletedAt)
      ),
    });

    if (!targetProfile) {
      return { success: false, error: "Aucun utilisateur trouvé avec cette adresse e-mail." };
    }

    // Update profile role and zone
    await db
      .update(profiles)
      .set({
        role: "manager_zone",
        zone: zone,
        isActive: true, // Auto-activate managers
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, targetProfile.id));

    // Update zone configuration
    await db
      .update(zoneConfig)
      .set({
        managerId: targetProfile.id,
        updatedAt: new Date(),
      })
      .where(eq(zoneConfig.zone, zone));

    revalidatePath("/admin/managers");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in promoteUserToManager action:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Assigns a manager profile to a zone config (Super Admin only)
 */
export async function assignZoneManager(
  zone: "yamoussoukro" | "yopougon" | "abobo" | "cocody" | "port-bouet" | "bouake",
  managerId: string | null
) {
  try {
    await verifySuperAdminSession();

    if (managerId) {
      // 1. Verify manager profile
      const manager = await db.query.profiles.findFirst({
        where: eq(profiles.id, managerId),
      });

      if (!manager || manager.role !== "manager_zone") {
        return { success: false, error: "Profil introuvable ou le rôle n'est pas Manager." };
      }

      // 2. Set zone for the manager profile
      await db
        .update(profiles)
        .set({
          zone: zone,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, managerId));

      // 3. Assign manager to the zoneConfig
      await db
        .update(zoneConfig)
        .set({
          managerId: managerId,
          updatedAt: new Date(),
        })
        .where(eq(zoneConfig.zone, zone));
    } else {
      // Unassigning
      // Find the current manager for this zone
      const currentConfig = await db.query.zoneConfig.findFirst({
        where: eq(zoneConfig.zone, zone),
      });

      if (currentConfig?.managerId) {
        // Reset their profile zone
        await db
          .update(profiles)
          .set({
            zone: null,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, currentConfig.managerId));
      }

      // Clear the managerId in config
      await db
        .update(zoneConfig)
        .set({
          managerId: null,
          updatedAt: new Date(),
        })
        .where(eq(zoneConfig.zone, zone));
    }

    revalidatePath("/admin/managers");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in assignZoneManager action:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Updates banking/contact configurations for a local zone
 */
export async function updateZoneConfig(
  zone: "yamoussoukro" | "yopougon" | "abobo" | "cocody" | "port-bouet" | "bouake",
  data: {
    lienWave: string;
    numeroWave: string;
    adresse: string;
    telephone: string;
  }
) {
  try {
    await verifyAdminSession();

    await db
      .update(zoneConfig)
      .set({
        lienWave: data.lienWave,
        numeroWave: data.numeroWave,
        lienMomo: null, // Deactivated
        lienOrange: null, // Deactivated
        adresse: data.adresse,
        telephone: data.telephone,
        updatedAt: new Date(),
      })
      .where(eq(zoneConfig.zone, zone));

    revalidatePath("/admin/zones");
    revalidatePath("/dashboard"); // For candidates to see updated info instantly
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateZoneConfig action:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Sends a bulk, targeted in-app notification to candidates
 */
export async function sendGroupNotification(
  filters: {
    zone?: string;
    concours?: string;
    all?: boolean;
  },
  title: string,
  message: string,
  type: "info" | "alerte" | "cours" = "info"
) {
  try {
    await verifyAdminSession();

    if (!title.trim() || !message.trim()) {
      return { success: false, error: "Le titre et le message ne peuvent pas être vides." };
    }

    // 1. Gather target candidate IDs based on filtering
    let targetUserIds: string[] = [];

    if (filters.concours) {
      // Find candidate user IDs registered in this contest
      const registrations = await db.query.concoursInscrits.findMany({
        where: eq(concoursInscrits.concours, filters.concours as any),
      });
      targetUserIds = registrations.map((r) => r.userId);

      // If no candidate is registered to this contest, we can stop early
      if (targetUserIds.length === 0) {
        return { success: true, count: 0 };
      }
    }

    // 2. Query target profile list
    const conditions = [
      eq(profiles.role, "user"), // Candidates only
      isNull(profiles.deletedAt),
    ];

    if (filters.zone && filters.zone !== "all") {
      conditions.push(eq(profiles.zone, filters.zone as any));
    }

    if (filters.concours) {
      conditions.push(inArray(profiles.id, targetUserIds));
    }

    const matchedProfiles = await db.query.profiles.findMany({
      where: and(...conditions),
    });

    if (matchedProfiles.length === 0) {
      return { success: true, count: 0 };
    }

    // 3. Bulk insert notifications
    const notificationValues = matchedProfiles.map((p) => ({
      destinataireId: p.id,
      titre: title.trim(),
      message: message.trim(),
      type: type,
      lu: false,
    }));

    await db.insert(notifications).values(notificationValues);

    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard");
    return { success: true, count: matchedProfiles.length };
  } catch (error: any) {
    console.error("Error in sendGroupNotification action:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Admins can globally approve candidate payments and activate their accounts
 */
export async function adminApprovePayment(paymentId: string, candidateId: string) {
  try {
    const { user } = await verifyAdminSession();

    // 1. Fetch candidate profile and payment
    const candidateProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, candidateId),
    });

    if (!candidateProfile) {
      return { success: false, error: "Le candidat spécifié n'existe pas." };
    }

    // 2. Update payment in database
    await db
      .update(paiements)
      .set({
        statut: "valide",
        validePar: user.id,
        valideAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(paiements.id, paymentId));

    // 3. Activate candidate profile
    await db
      .update(profiles)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, candidateId));

    // 4. Send Success Email via Resend if API Key exists
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.SENDER_EMAIL || "onboarding@resend.dev",
            to: [candidateProfile.email],
            subject: "✅ Inscription validée — OGE Académie",
            html: `
              <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h1 style="color: #16a34a; text-align: center;">Accès Activé !</h1>
                <p>Bonjour <strong>${candidateProfile.prenom} ${candidateProfile.nom}</strong>,</p>
                <p>Bonne nouvelle ! Votre paiement de 15 000 FCFA a été validé avec succès par l'administration.</p>
                
                <p style="margin: 20px 0; padding: 15px; background-color: #f0fdf4; border-left: 4px solid #16a34a; font-size: 0.95em; line-height: 1.5; color: #14532d;">
                  <strong>Félicitations :</strong> Votre compte est désormais pleinement actif. Vous pouvez dès maintenant accéder à l'intégralité des cours, entraînements et documents de préparation sur votre espace candidat.
                </p>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard" 
                     style="background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Accéder à mon espace
                  </a>
                </div>

                <p style="font-size: 0.8em; color: #64748b; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
                  L'équipe OGE Académie<br />
                  contact@oge-academie.com
                </p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Validation email failed to send:", emailErr);
      }
    }

    revalidatePath("/admin/paiements");
    revalidatePath("/admin/candidats");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in adminApprovePayment:", error);
    return { success: false, error: error.message || "Une erreur interne est survenue." };
  }
}

/**
 * Admins can globally reject candidate payments with a feedback note
 */
export async function adminRejectPayment(paymentId: string, notes: string) {
  try {
    await verifyAdminSession();

    // 1. Fetch payment
    const payment = await db.query.paiements.findFirst({
      where: eq(paiements.id, paymentId),
    });

    if (!payment) {
      return { success: false, error: "Le paiement spécifié n'existe pas." };
    }

    const candidateProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, payment.userId),
    });

    if (!candidateProfile) {
      return { success: false, error: "Le candidat associé à ce paiement n'existe pas." };
    }

    // 2. Update payment in database
    await db
      .update(paiements)
      .set({
        statut: "rejete",
        notes: notes || "Reçu de paiement illisible ou non valide.",
        updatedAt: new Date(),
      })
      .where(eq(paiements.id, paymentId));

    // 3. Send Rejection Email via Resend if API Key exists
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.SENDER_EMAIL || "onboarding@resend.dev",
            to: [candidateProfile.email],
            subject: "⚠️ Reçu de paiement rejeté — OGE Académie",
            html: `
              <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h1 style="color: #dc2626; text-align: center;">Reçu non validé</h1>
                <p>Bonjour <strong>${candidateProfile.prenom} ${candidateProfile.nom}</strong>,</p>
                <p>Le reçu de paiement que vous avez soumis sur votre espace candidat n'a pas pu être validé par l'administration.</p>
                
                <div style="margin: 20px 0; padding: 15px; background-color: #fef2f2; border-left: 4px solid #dc2626; font-size: 0.95em; line-height: 1.5; color: #991b1b;">
                  <strong>Motif du rejet :</strong> ${notes || "Aucun motif spécifique fourni."}
                </div>

                <p>Nous vous invitons à vous reconnecter sur votre espace pour soumettre à nouveau une preuve de paiement correcte.</p>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/connexion" 
                     style="background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Se Connecter & Soumettre à nouveau
                  </a>
                </div>

                <p style="font-size: 0.8em; color: #64748b; margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
                  L'équipe OGE Académie<br />
                  contact@oge-academie.com
                </p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Rejection email failed to send:", emailErr);
      }
    }

    revalidatePath("/admin/paiements");
    revalidatePath("/admin/candidats");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in adminRejectPayment:", error);
    return { success: false, error: error.message || "Une erreur interne est survenue." };
  }
}

/**
 * Admins can update a candidate's profile information
 */
export async function updateCandidateProfile(
  userId: string,
  data: {
    nom: string;
    prenom: string;
    whatsapp: string;
    zone: string;
    modeFormation: string;
  }
) {
  try {
    await verifyAdminSession();

    // Validate inputs
    if (!data.nom.trim() || !data.prenom.trim()) {
      return { success: false, error: "Le nom et le prénom sont obligatoires." };
    }

    // Verify the target user exists and is a candidate
    const targetProfile = await db.query.profiles.findFirst({
      where: and(
        eq(profiles.id, userId),
        isNull(profiles.deletedAt)
      ),
    });

    if (!targetProfile) {
      return { success: false, error: "Le candidat spécifié n'existe pas ou a été supprimé." };
    }

    if (targetProfile.role !== "user") {
      return { success: false, error: "Seuls les profils candidats peuvent être modifiés ici." };
    }

    // Update profile
    await db
      .update(profiles)
      .set({
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        whatsapp: data.whatsapp.trim() || null,
        zone: (data.zone as any) || null,
        modeFormation: (data.modeFormation as any) || null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));

    revalidatePath("/admin/candidats");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateCandidateProfile:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Toggles homepage section visibility
 */
export async function toggleSectionActive(sectionId: string, isActive: boolean) {
  try {
    await verifyAdminSession();
    await db
      .update(pageSections)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(pageSections.id, sectionId));
    revalidatePath("/");
    revalidatePath("/admin/contenu");
    revalidateTag("page-sections", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in toggleSectionActive:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Updates homepage section content
 */
export async function updateSectionContent(sectionId: string, titre: string, contenu: any) {
  try {
    await verifyAdminSession();
    await db
      .update(pageSections)
      .set({ titre, contenu, updatedAt: new Date() })
      .where(eq(pageSections.id, sectionId));
    revalidatePath("/");
    revalidatePath("/admin/contenu");
    revalidateTag("page-sections", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateSectionContent:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Creates a new testimonial
 */
export async function createTestimonial(data: {
  nom: string;
  prenom?: string;
  zone?: any;
  concours?: any;
  message: string;
  note?: number;
  photoUrl?: string;
}) {
  try {
    await verifyAdminSession();
    if (!data.nom || !data.message) {
      return { success: false, error: "Le nom et le message sont obligatoires." };
    }
    await db.insert(temoignages).values({
      nom: data.nom,
      prenom: data.prenom || null,
      zone: data.zone || null,
      concours: data.concours || null,
      message: data.message,
      note: data.note ?? 5,
      photoUrl: data.photoUrl || null,
      isActive: true,
    });
    revalidatePath("/");
    revalidatePath("/admin/contenu");
    revalidateTag("testimonials", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in createTestimonial:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Updates a testimonial
 */
export async function updateTestimonial(
  id: string,
  data: {
    nom: string;
    prenom?: string;
    zone?: any;
    concours?: any;
    message: string;
    note?: number;
    photoUrl?: string;
  }
) {
  try {
    await verifyAdminSession();
    if (!data.nom || !data.message) {
      return { success: false, error: "Le nom et le message sont obligatoires." };
    }
    await db
      .update(temoignages)
      .set({
        nom: data.nom,
        prenom: data.prenom || null,
        zone: data.zone || null,
        concours: data.concours || null,
        message: data.message,
        note: data.note ?? 5,
        photoUrl: data.photoUrl || null,
      })
      .where(eq(temoignages.id, id));
    revalidatePath("/");
    revalidatePath("/admin/contenu");
    revalidateTag("testimonials", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateTestimonial:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Toggles a testimonial visibility status
 */
export async function toggleTestimonialActive(id: string, isActive: boolean) {
  try {
    await verifyAdminSession();
    await db
      .update(temoignages)
      .set({ isActive })
      .where(eq(temoignages.id, id));
    revalidatePath("/");
    revalidatePath("/admin/contenu");
    revalidateTag("testimonials", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in toggleTestimonialActive:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Soft deletes a testimonial
 */
export async function deleteTestimonial(id: string) {
  try {
    await verifyAdminSession();
    await db
      .update(temoignages)
      .set({ deletedAt: new Date() })
      .where(eq(temoignages.id, id));
    revalidatePath("/");
    revalidatePath("/admin/contenu");
    revalidateTag("testimonials", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteTestimonial:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Helper to slugify a string
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Remove duplicate hyphens
}

/**
 * Creates a new blog article
 */
export async function createBlogArticle(data: {
  titre: string;
  contenu: string;
  extrait?: string;
  imageUrl?: string;
  concours?: string;
  isPublished?: boolean;
}) {
  try {
    const { profile } = await verifyAdminSession();
    if (!data.titre) {
      return { success: false, error: "Le titre de l'article est obligatoire." };
    }

    const baseSlug = slugify(data.titre);
    // Generate a unique slug if there is a collision
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await db.query.blogArticles.findFirst({
        where: eq(blogArticles.slug, slug),
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    await db.insert(blogArticles).values({
      titre: data.titre,
      slug: slug,
      contenu: data.contenu || "",
      extrait: data.extrait || data.contenu?.slice(0, 150) || "",
      imageUrl: data.imageUrl || null,
      concours: data.concours || "general",
      auteurId: profile.id,
      isPublished: data.isPublished || false,
      publishedAt: data.isPublished ? new Date() : null,
    });

    revalidatePath("/");
    revalidatePath("/admin/contenu");
    revalidateTag("blog-articles", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in createBlogArticle:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Updates a blog article
 */
export async function updateBlogArticle(
  id: string,
  data: {
    titre: string;
    contenu: string;
    extrait?: string;
    imageUrl?: string;
    concours?: string;
    isPublished?: boolean;
  }
) {
  try {
    await verifyAdminSession();
    if (!data.titre) {
      return { success: false, error: "Le titre de l'article est obligatoire." };
    }

    const currentArticle = await db.query.blogArticles.findFirst({
      where: eq(blogArticles.id, id),
    });

    if (!currentArticle) {
      return { success: false, error: "L'article spécifié n'existe pas." };
    }

    let slug = currentArticle.slug;
    if (data.titre !== currentArticle.titre) {
      const baseSlug = slugify(data.titre);
      slug = baseSlug;
      let counter = 1;
      while (true) {
        const collisionOther = await db.query.blogArticles.findFirst({
          where: eq(blogArticles.slug, slug),
        });
        if (!collisionOther || collisionOther.id === id) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    await db
      .update(blogArticles)
      .set({
        titre: data.titre,
        slug: slug,
        contenu: data.contenu || "",
        extrait: data.extrait || data.contenu?.slice(0, 150) || "",
        imageUrl: data.imageUrl || null,
        concours: data.concours || "general",
        isPublished: data.isPublished || false,
        publishedAt: data.isPublished ? (currentArticle.isPublished ? currentArticle.publishedAt : new Date()) : null,
        updatedAt: new Date(),
      })
      .where(eq(blogArticles.id, id));

    revalidatePath("/");
    revalidatePath("/admin/contenu");
    revalidateTag("blog-articles", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateBlogArticle:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Toggles dynamic blog article publishing
 */
export async function toggleBlogArticlePublished(id: string, isPublished: boolean) {
  try {
    await verifyAdminSession();
    await db
      .update(blogArticles)
      .set({
        isPublished: isPublished,
        publishedAt: isPublished ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(blogArticles.id, id));

    revalidatePath("/");
    revalidatePath("/admin/contenu");
    revalidateTag("blog-articles", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in toggleBlogArticlePublished:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Soft deletes a blog article
 */
export async function deleteBlogArticle(id: string) {
  try {
    await verifyAdminSession();
    await db
      .update(blogArticles)
      .set({ deletedAt: new Date() })
      .where(eq(blogArticles.id, id));

    revalidatePath("/");
    revalidatePath("/admin/contenu");
    revalidateTag("blog-articles", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteBlogArticle:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Updates system parameters (webhooks, calendar ID)
 */
export async function updateSystemSettings(settings: any) {
  try {
    await verifyAdminSession();
    
    const existing = await db.query.pageSections.findFirst({
      where: eq(pageSections.cle, "parametres"),
    });
    
    if (existing) {
      await db.update(pageSections)
        .set({
          contenu: {
            webhook_secret: settings.webhook_secret || "",
            make_webhook_url: settings.make_webhook_url || "",
            make_error_webhook_url: settings.make_error_webhook_url || "",
            n8n_webhook_url: settings.n8n_webhook_url || "",
            google_calendar_id: settings.google_calendar_id || "",
          },
          updatedAt: new Date(),
        })
        .where(eq(pageSections.cle, "parametres"));
    } else {
      await db.insert(pageSections).values({
        cle: "parametres",
        titre: "Paramètres Plateforme",
        contenu: {
          webhook_secret: settings.webhook_secret || "",
          make_webhook_url: settings.make_webhook_url || "",
          make_error_webhook_url: settings.make_error_webhook_url || "",
          n8n_webhook_url: settings.n8n_webhook_url || "",
          google_calendar_id: settings.google_calendar_id || "",
        },
        ordre: 99,
        isActive: false,
      });
    }
    
    revalidatePath("/admin/parametres");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateSystemSettings:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Creates a course or PDF document, schedules Meet session, sends notifications and webhooks
 */
export async function createDocument(data: any) {
  try {
    const admin = await verifyAdminSession();
    
    let meetingUrl = "";
    let calendarEventId = "";
    
    // If it's a live course (date is provided)
    if (data.type === "cours" && data.scheduledAt) {
      let targetEmails: string[] = [];
      
      if (data.concours && data.concours !== "tous") {
        const candidates = await db.select({ email: profiles.email })
          .from(profiles)
          .innerJoin(concoursInscrits, eq(concoursInscrits.userId, profiles.id))
          .where(
            and(
              eq(concoursInscrits.concours, data.concours),
              eq(profiles.isActive, true),
              isNull(profiles.deletedAt)
            )
          );
        targetEmails = candidates.map(c => c.email);
      } else {
        const candidates = await db.select({ email: profiles.email })
          .from(profiles)
          .where(
            and(
              eq(profiles.role, "user"),
              eq(profiles.isActive, true),
              isNull(profiles.deletedAt)
            )
          );
        targetEmails = candidates.map(c => c.email);
      }
      
      const startTime = new Date(data.scheduledAt);
      const endTime = new Date(startTime.getTime() + (Number(data.durationHours) || 2) * 60 * 60 * 1000);
      
      const calendarRes = await createCalendarEvent({
        title: data.titre,
        description: data.description || `Session de préparation en direct pour le concours ${data.concours.toUpperCase()}`,
        startTime,
        endTime,
        attendees: targetEmails,
      });
      
      if (calendarRes) {
        meetingUrl = calendarRes.meetingUrl;
        calendarEventId = calendarRes.eventId;
      }
    }
    // Insert document record in DB
    const [newDoc] = await db.insert(documents).values({
      titre: data.titre,
      description: data.description || null,
      fichierUrl: data.fichierUrl || null,
      isExternalLink: Boolean(data.isExternalLink),
      concours: data.concours || "tous",
      type: data.type || "cours",
      modeFormation: data.modeFormation || "tous",
      zone: data.zone || "tous",
      ordre: Number(data.ordre) || 0,
      isActive: true,
      scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
      meetingUrl: meetingUrl || null,
      calendarEventId: calendarEventId || null,
      createdBy: admin.profile.id,
    }).returning();
    
    // Create notifications for candidates
    let targetUsers: { id: string }[] = [];
    
    const conditions = [
      eq(profiles.role, "user"),
      eq(profiles.isActive, true),
      isNull(profiles.deletedAt),
    ];
    
    if (data.zone && data.zone !== "tous") {
      conditions.push(eq(profiles.zone, data.zone as any));
    }
    
    if (data.modeFormation && data.modeFormation !== "tous") {
      conditions.push(eq(profiles.modeFormation, data.modeFormation as any));
    }

    if (data.concours && data.concours !== "tous") {
      targetUsers = await db.select({ id: profiles.id })
        .from(profiles)
        .innerJoin(concoursInscrits, eq(concoursInscrits.userId, profiles.id))
        .where(
          and(
            eq(concoursInscrits.concours, data.concours),
            ...conditions
          )
        );
    } else {
      targetUsers = await db.select({ id: profiles.id })
        .from(profiles)
        .where(
          and(...conditions)
        );
    }
    
    if (targetUsers.length > 0) {
      const notifType = data.type === "cours" ? "cours" : "info";
      const notifMessage = data.scheduledAt
        ? `Un nouveau cours en direct "${data.titre}" a été planifié le ${new Date(data.scheduledAt).toLocaleString("fr-FR")}.`
        : `Un nouveau document "${data.titre}" (${data.type}) est disponible pour le concours ${data.concours.toUpperCase()}.`;
      
      const notificationValues = targetUsers.map(u => ({
        destinataireId: u.id,
        titre: data.scheduledAt ? "🔴 Cours en direct planifié" : "📚 Nouveau document disponible",
        message: notifMessage,
        type: notifType as any,
        lu: false,
        lien: "/dashboard/documents",
      }));
      
      await db.insert(notifications).values(notificationValues);
    }
    
    // Trigger webhook call
    await triggerNewDocumentWebhook({
      id: newDoc.id,
      titre: newDoc.titre,
      description: newDoc.description,
      fichierUrl: newDoc.fichierUrl,
      concours: newDoc.concours,
      type: newDoc.type,
      modeFormation: newDoc.modeFormation,
      zone: newDoc.zone,
      scheduledAt: newDoc.scheduledAt ? newDoc.scheduledAt.toISOString() : null,
      meetingUrl: newDoc.meetingUrl,
      createdAt: newDoc.createdAt ? newDoc.createdAt.toISOString() : new Date().toISOString(),
    });
    
    revalidatePath("/dashboard/documents");
    revalidatePath("/admin/documents");
    revalidateTag("all-active-documents", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in createDocument:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Toggles document active status
 */
export async function toggleDocumentActive(id: string, isActive: boolean) {
  try {
    await verifyAdminSession();
    
    await db.update(documents)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(documents.id, id));
      
    revalidatePath("/dashboard/documents");
    revalidatePath("/admin/documents");
    revalidateTag("all-active-documents", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in toggleDocumentActive:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Soft deletes document and cleans up Calendar event
 */
export async function deleteDocument(id: string) {
  try {
    await verifyAdminSession();
    
    const doc = await db.query.documents.findFirst({
      where: eq(documents.id, id),
    });
    
    if (!doc) {
      throw new Error("Document introuvable.");
    }
    
    if (doc.calendarEventId) {
      await deleteCalendarEvent(doc.calendarEventId);
    }
    
    await db.update(documents)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(documents.id, id));
    
    revalidatePath("/dashboard/documents");
    revalidatePath("/admin/documents");
    revalidateTag("all-active-documents", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in deleteDocument:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Submits a zone manager action (edit, block, activate, deactivate) for dual-confirmation
 */
export async function submitManagerActionRequest(
  type: "edit_manager" | "block_manager" | "activate_manager" | "deactivate_manager",
  targetId: string,
  details: any
) {
  try {
    const { profile: initiator } = await verifyAdminSession();

    // Verify target profile exists and is a manager
    const target = await db.query.profiles.findFirst({
      where: eq(profiles.id, targetId),
    });

    if (!target || target.role !== "manager_zone") {
      return { success: false, error: "Le manager cible n'existe pas ou n'est pas un manager de zone." };
    }

    // If the initiator is a Super Admin, execute the action immediately (bypass dual confirmation)
    if (initiator.role === "super_admin") {
      return await executeManagerActionDirectly(type, targetId, details, initiator.id);
    }

    // Verify that the global system configuration allows manager modification
    const sysConfigRow = await db.query.pageSections.findFirst({
      where: eq(pageSections.cle, "system_config"),
    });
    const sysConfig = sysConfigRow?.contenu as any || { allow_manager_edit: true };
    if (!sysConfig.allow_manager_edit) {
      return { success: false, error: "La modification des managers de zone est actuellement désactivée par le Super Administrateur." };
    }

    // Create the pending action request in the database
    const [insertedRequest] = await db.insert(adminPendingActions).values({
      type,
      targetId,
      initiatedBy: initiator.id,
      details: details || {},
      statut: "en_attente",
    }).returning();

    // Find all other admins to notify
    const otherAdmins = await db.query.profiles.findMany({
      where: and(
        inArray(profiles.role, ["admin", "super_admin"]),
        eq(profiles.isActive, true),
        isNull(profiles.deletedAt)
      ),
    });

    const notifValues = otherAdmins
      .filter((admin) => admin.id !== initiator.id)
      .map((admin) => {
        let label = "de modification";
        if (type === "block_manager") label = "de blocage";
        if (type === "activate_manager") label = "de réactivation";
        if (type === "deactivate_manager") label = "de désactivation";

        return {
          destinataireId: admin.id,
          titre: `Demande de double confirmation`,
          message: `${initiator.prenom} ${initiator.nom} a initié une demande ${label} pour le manager ${target.prenom} ${target.nom}.`,
          type: "alerte" as const,
          lu: false,
          lien: `/admin/managers?request=${insertedRequest.id}`,
        };
      });

    if (notifValues.length > 0) {
      await db.insert(notifications).values(notifValues);
    }

    revalidatePath("/admin/managers");
    revalidatePath("/admin");
    return { success: true, pending: true, requestId: insertedRequest.id };
  } catch (error: any) {
    console.error("Error in submitManagerActionRequest:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Internal helper to directly execute the database updates when a request is approved or bypassed
 */
async function executeManagerActionDirectly(
  type: "edit_manager" | "block_manager" | "activate_manager" | "deactivate_manager",
  targetId: string,
  details: any,
  approverId: string
) {
  const target = await db.query.profiles.findFirst({
    where: eq(profiles.id, targetId),
  });
  if (!target) throw new Error("Profil cible introuvable.");

  if (type === "edit_manager") {
    const { nom, prenom, email, whatsapp, zone } = details;
    if (!nom?.trim() || !prenom?.trim()) {
      throw new Error("Le nom et le prénom sont obligatoires.");
    }

    // 1. Update profiles table
    await db.update(profiles)
      .set({
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim().toLowerCase(),
        whatsapp: whatsapp?.trim() || null,
        zone: zone || null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, targetId));

    // 1.5 Update auth.users and auth.identities email via security definer if changed
    if (email.trim().toLowerCase() !== target.email) {
      await db.execute(sql`
        SELECT public.admin_update_auth_user_email(${targetId}, ${email.trim().toLowerCase()})
      `);
    }

    // 2. If zone has changed, re-assign configurations
    if (zone !== target.zone) {
      // Clear from previous zone config
      if (target.zone) {
        await db.update(zoneConfig)
          .set({ managerId: null, updatedAt: new Date() })
          .where(eq(zoneConfig.zone, target.zone as any));
      }
      // Assign to new zone config
      if (zone) {
        await db.update(zoneConfig)
          .set({ managerId: targetId, updatedAt: new Date() })
          .where(eq(zoneConfig.zone, zone as any));
      }
    }
  } else if (type === "block_manager") {
    await db.update(profiles)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(profiles.id, targetId));
  } else if (type === "activate_manager") {
    await db.update(profiles)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(profiles.id, targetId));
  } else if (type === "deactivate_manager") {
    // Demote and unassign
    await db.update(profiles)
      .set({
        role: "user",
        zone: null,
        isActive: false, // Deactivate candidacy access until payment is done
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, targetId));

    if (target.zone) {
      await db.update(zoneConfig)
        .set({ managerId: null, updatedAt: new Date() })
        .where(eq(zoneConfig.zone, target.zone as any));
    }
  }

  revalidatePath("/admin/managers");
  revalidatePath("/admin");
  return { success: true };
}

/**
 * Approves a manager action request (Second Admin only)
 */
export async function approveManagerAction(requestId: string) {
  try {
    const { profile: approver } = await verifyAdminSession();

    // 1. Fetch pending action request
    const request = await db.query.adminPendingActions.findFirst({
      where: eq(adminPendingActions.id, requestId),
    });

    if (!request || request.statut !== "en_attente") {
      return { success: false, error: "La demande d'approbation est introuvable ou a déjà été traitée." };
    }

    // 2. Dual-control enforcement: verify that the approver is a DIFFERENT admin
    if (request.initiatedBy === approver.id) {
      return { success: false, error: "Double contrôle requis : Vous ne pouvez pas approuver votre propre demande." };
    }

    // 3. Apply changes directly
    await executeManagerActionDirectly(request.type as any, request.targetId, request.details, approver.id);

    // 4. Mark request as approved
    await db.update(adminPendingActions)
      .set({
        statut: "approuve",
        traitePar: approver.id,
        traiteAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(adminPendingActions.id, requestId));

    // 5. Notify the initiator about the approval
    await db.insert(notifications).values({
      destinataireId: request.initiatedBy,
      titre: "Demande approuvée",
      message: `Votre demande d'action sur le manager a été approuvée par ${approver.prenom} ${approver.nom}.`,
      type: "info" as const,
      lu: false,
      lien: "/admin/managers",
    });

    revalidatePath("/admin/managers");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in approveManagerAction:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Rejects a manager action request
 */
export async function rejectManagerAction(requestId: string) {
  try {
    const { profile: rejecter } = await verifyAdminSession();

    // 1. Fetch pending action request
    const request = await db.query.adminPendingActions.findFirst({
      where: eq(adminPendingActions.id, requestId),
    });

    if (!request || request.statut !== "en_attente") {
      return { success: false, error: "La demande est introuvable ou a déjà été traitée." };
    }

    // 2. Mark request as rejected
    await db.update(adminPendingActions)
      .set({
        statut: "rejete",
        traitePar: rejecter.id,
        traiteAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(adminPendingActions.id, requestId));

    // 3. Notify the initiator about the rejection
    await db.insert(notifications).values({
      destinataireId: request.initiatedBy,
      titre: "Demande rejetée",
      message: `Votre demande d'action sur le manager a été annulée/rejetée par ${rejecter.prenom} ${rejecter.nom}.`,
      type: "alerte" as const,
      lu: false,
      lien: "/admin/managers",
    });

    revalidatePath("/admin/managers");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in rejectManagerAction:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Updates global system toggles (Super Admin only)
 */
export async function updateSystemConfig(config: {
  allow_manager_edit: boolean;
  enable_wave: boolean;
  enable_momo: boolean;
  enable_orange: boolean;
  concepteur_whatsapp?: string;
  concepteur_email?: string;
}) {
  try {
    await verifySuperAdminSession();

    const existingRow = await db.query.pageSections.findFirst({
      where: eq(pageSections.cle, "system_config"),
    });

    const currentConfig = existingRow?.contenu as any || {};
    const mergedConfig = {
      ...currentConfig,
      ...config,
    };

    if (existingRow) {
      await db.update(pageSections)
        .set({
          contenu: mergedConfig,
          updatedAt: new Date(),
        })
        .where(eq(pageSections.cle, "system_config"));
    } else {
      await db.insert(pageSections).values({
        cle: "system_config",
        titre: "Configuration Système",
        contenu: mergedConfig,
        ordre: 99,
        isActive: true,
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/parametres");
    revalidatePath("/admin/managers");
    revalidatePath("/dashboard/paiement");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateSystemConfig:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Toggles the global PDF security configuration (Admin & Super Admin)
 */
export async function togglePdfSecurity() {
  try {
    await verifyAdminSession();

    const existingRow = await db.query.pageSections.findFirst({
      where: eq(pageSections.cle, "system_config"),
    });

    let currentConfig: any = {
      allow_manager_edit: false,
      enable_wave: true,
      enable_momo: false,
      enable_orange: false,
      enable_pdf_security: true,
    };

    if (existingRow && existingRow.contenu) {
      currentConfig = { ...currentConfig, ...(existingRow.contenu as any) };
    }

    currentConfig.enable_pdf_security = !currentConfig.enable_pdf_security;

    if (existingRow) {
      await db.update(pageSections)
        .set({
          contenu: currentConfig,
          updatedAt: new Date(),
        })
        .where(eq(pageSections.cle, "system_config"));
    } else {
      await db.insert(pageSections).values({
        cle: "system_config",
        titre: "Configuration Système",
        contenu: currentConfig,
        ordre: 99,
        isActive: true,
      });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/parametres");
    revalidatePath("/dashboard/documents");
    return { success: true, enabled: currentConfig.enable_pdf_security };
  } catch (error: any) {
    console.error("Error in togglePdfSecurity:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Resets a user's password, deletes their sessions, and forces reset flag. (Super Admin only)
 */
export async function adminResetUserPassword(userId: string, newPassword: string) {
  try {
    await verifySuperAdminSession();

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Le mot de passe doit faire au moins 6 caractères." };
    }

    // 1. Update password and invalidate sessions in Supabase Auth via security definer
    await db.execute(sql`
      SELECT public.admin_reset_user_password_and_sessions(${userId}, ${newPassword})
    `);

    // 3. Mark force_password_reset in profiles
    await db.update(profiles)
      .set({
        forcePasswordReset: true,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error in adminResetUserPassword:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Updates a user's profile details and email address. (Super Admin only)
 */
export async function adminUpdateUserProfile(
  userId: string,
  data: {
    nom: string;
    prenom: string;
    email: string;
    role: "user" | "manager_zone" | "admin" | "super_admin";
    whatsapp?: string;
    zone?: any;
  }
) {
  try {
    await verifySuperAdminSession();

    const newEmail = data.email.trim().toLowerCase();

    // Verify email uniqueness if it has changed
    const existing = await db.query.profiles.findFirst({
      where: and(eq(profiles.email, newEmail), sql`id != ${userId}`),
    });
    if (existing) {
      return { success: false, error: "Cette adresse email est déjà utilisée." };
    }

    const currentProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, userId),
    });

    if (!currentProfile) {
      return { success: false, error: "Profil introuvable." };
    }

    // Update profiles table
    await db.update(profiles)
      .set({
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        email: newEmail,
        role: data.role,
        whatsapp: data.whatsapp?.trim() || null,
        zone: data.zone || null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, userId));

    // Update auth.users table email via security definer function
    await db.execute(sql`
      SELECT public.admin_update_auth_user_email(${userId}, ${newEmail})
    `);

    // If zone config needs to be updated
    if (data.zone !== currentProfile.zone) {
      if (currentProfile.zone) {
        await db.update(zoneConfig)
          .set({ managerId: null, updatedAt: new Date() })
          .where(eq(zoneConfig.zone, currentProfile.zone as any));
      }
      if (data.zone && data.role === "manager_zone") {
        await db.update(zoneConfig)
          .set({ managerId: userId, updatedAt: new Date() })
          .where(eq(zoneConfig.zone, data.zone as any));
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/candidats");
    revalidatePath("/admin/managers");
    return { success: true };
  } catch (error: any) {
    console.error("Error in adminUpdateUserProfile:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Toggles the activation of documents, articles, testimonials or affiches for moderation. (Admin / Super Admin)
 */
export async function adminToggleContentActive(
  type: "document" | "blog" | "testimonial" | "affiche",
  id: string,
  active: boolean
) {
  try {
    await verifyAdminSession();

    if (type === "document") {
      await db.update(documents).set({ isActive: active, updatedAt: new Date() }).where(eq(documents.id, id));
      revalidatePath("/admin/documents");
      revalidatePath("/dashboard/documents");
    } else if (type === "blog") {
      await db.update(blogArticles).set({ isPublished: active, updatedAt: new Date() }).where(eq(blogArticles.id, id));
      revalidatePath("/admin/contenu");
      revalidatePath("/");
    } else if (type === "testimonial") {
      await db.update(temoignages).set({ isActive: active }).where(eq(temoignages.id, id));
      revalidatePath("/admin/contenu");
      revalidatePath("/");
    } else if (type === "affiche") {
      // For campaigns posters, fetch the affiches page section, update the image isActive property
      const sec = await db.query.pageSections.findFirst({
        where: eq(pageSections.cle, "affiches"),
      });
      if (sec && sec.contenu) {
        const contenu = sec.contenu as any;
        const images = (contenu.images || []).map((img: any) => {
          if (img.id === id) {
            return { ...img, isActive: active };
          }
          return img;
        });
        await db.update(pageSections)
          .set({ contenu: { ...contenu, images }, updatedAt: new Date() })
          .where(eq(pageSections.cle, "affiches"));
      }
      revalidatePath("/admin/contenu");
      revalidatePath("/");
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in adminToggleContentActive:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}



