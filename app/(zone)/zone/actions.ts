"use server";

import { cookies } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, paiements, zoneConfig, documents, notifications, concoursInscrits } from "@/drizzle/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { triggerNewDocumentWebhook } from "@/lib/webhooks";

/**
 * Approves a candidate's payment and activates their account.
 */
export async function approveCandidatePayment(paymentId: string, candidateId: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Get current logged-in manager user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Non autorisé. Session expirée." };
    }

    const managerProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    });

    if (!managerProfile || managerProfile.role !== "manager_zone") {
      return { success: false, error: "Non autorisé. Seuls les managers de zone peuvent valider les paiements." };
    }

    // 2. Fetch candidate profile and payment
    const candidateProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, candidateId),
    });

    if (!candidateProfile) {
      return { success: false, error: "Le candidat spécifié n'existe pas." };
    }

    // Security check: Make sure manager can only validate payments for their own zone
    if (candidateProfile.zone !== managerProfile.zone) {
      return { success: false, error: "Non autorisé. Ce candidat n'est pas dans votre zone." };
    }

    // 3. Update payment in database
    await db
      .update(paiements)
      .set({
        statut: "valide",
        validePar: user.id,
        valideAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(paiements.id, paymentId));

    // 4. Activate candidate profile
    await db
      .update(profiles)
      .set({
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, candidateId));

    // 5. Send Success Email via Resend if API Key exists
    if (process.env.RESEND_API_KEY) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
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
                <p>Bonne nouvelle ! Votre paiement de 15 000 FCFA a été validé avec succès par le responsable de votre zone.</p>
                
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

        if (!response.ok) {
          const errData = await response.json();
          console.error("Resend validation email error response:", errData);
        }
      } catch (emailErr) {
        console.error("Validation email failed to send:", emailErr);
      }
    }

    revalidatePath("/zone");
    return { success: true };
  } catch (error: any) {
    console.error("Error in approveCandidatePayment:", error);
    return { success: false, error: error.message || "Une erreur interne est survenue." };
  }
}

/**
 * Rejects a candidate's payment with a feedback note.
 */
export async function rejectCandidatePayment(paymentId: string, notes: string) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Get current logged-in manager user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Non autorisé. Session expirée." };
    }

    const managerProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    });

    if (!managerProfile || managerProfile.role !== "manager_zone") {
      return { success: false, error: "Non autorisé. Seuls les managers de zone peuvent rejeter les paiements." };
    }

    // 2. Fetch candidate payment
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

    // Security check: Make sure manager can only reject payments for their own zone
    if (candidateProfile.zone !== managerProfile.zone) {
      return { success: false, error: "Non autorisé. Ce candidat n'est pas dans votre zone." };
    }

    // 3. Update payment in database
    await db
      .update(paiements)
      .set({
        statut: "rejete",
        notes: notes || "Reçu de paiement illisible ou non valide.",
        updatedAt: new Date(),
      })
      .where(eq(paiements.id, paymentId));

    // 4. Send Rejection Email via Resend if API Key exists
    if (process.env.RESEND_API_KEY) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
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
                <p>Le reçu de paiement que vous avez soumis sur votre espace candidat n'a pas pu être validé par notre responsable de zone.</p>
                
                <div style="margin: 20px 0; padding: 15px; background-color: #fef2f2; border-left: 4px solid #dc2626; font-size: 0.95em; line-height: 1.5; color: #991b1b;">
                  <strong>Motif du rejet :</strong> ${notes || "Aucun motif spécifique fourni. Veuillez vous assurer que la capture d'écran est bien lisible et montre la transaction complète."}
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

        if (!response.ok) {
          const errData = await response.json();
          console.error("Resend rejection email error response:", errData);
        }
      } catch (emailErr) {
        console.error("Rejection email failed to send:", emailErr);
      }
    }

    revalidatePath("/zone");
    return { success: true };
  } catch (error: any) {
    console.error("Error in rejectCandidatePayment:", error);
    return { success: false, error: error.message || "Une erreur interne est survenue." };
  }
}

/**
 * Updates the manager's assigned zone configuration details.
 */
export async function updateZoneConfigByManager(formData: {
  lienWave: string | null;
  numeroWave: string | null;
  adresse: string | null;
  telephone: string | null;
}) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Get current logged-in manager user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Non autorisé. Session expirée." };
    }

    const managerProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    });

    if (!managerProfile || managerProfile.role !== "manager_zone" || !managerProfile.zone) {
      return { success: false, error: "Non autorisé. Seuls les managers de zone avec zone configurée peuvent modifier les paramètres." };
    }

    // 2. Upsert zone configuration in database
    const existingConfig = await db.query.zoneConfig.findFirst({
      where: eq(zoneConfig.zone, managerProfile.zone),
    });

    if (existingConfig) {
      await db
        .update(zoneConfig)
        .set({
          managerId: managerProfile.id,
          lienWave: formData.lienWave,
          numeroWave: formData.numeroWave,
          lienMomo: null, // Deactivated
          lienOrange: null, // Deactivated
          adresse: formData.adresse,
          telephone: formData.telephone,
          updatedAt: new Date(),
        })
        .where(eq(zoneConfig.zone, managerProfile.zone));
    } else {
      await db
        .insert(zoneConfig)
        .values({
          zone: managerProfile.zone,
          managerId: managerProfile.id,
          lienWave: formData.lienWave,
          numeroWave: formData.numeroWave,
          lienMomo: null,
          lienOrange: null,
          adresse: formData.adresse,
          telephone: formData.telephone,
          updatedAt: new Date(),
        });
    }

    revalidatePath("/zone/parametres");
    revalidatePath("/zone");
    return { success: true };
  } catch (error: any) {
    console.error("Error in updateZoneConfigByManager:", error);
    return { success: false, error: error.message || "Une erreur interne est survenue." };
  }
}

/**
 * Helper to verify that the logged-in user is a Zone Manager
 */
async function verifyManagerSession() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error("Non autorisé. Session expirée.");
  }

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile || profile.role !== "manager_zone" || !profile.zone) {
    throw new Error("Accès refusé. Privilèges de manager de zone requis.");
  }

  return { user, profile };
}

/**
 * Creates a document targeting the manager's assigned zone
 */
export async function managerCreateDocument(data: {
  titre: string;
  description?: string;
  fichierUrl: string;
  isExternalLink?: boolean;
  concours: string;
  modeFormation: string;
  type: "cours" | "exercice" | "corrige";
  ordre?: string;
}) {
  try {
    const { profile: manager } = await verifyManagerSession();

    if (!data.titre) {
      return { success: false, error: "Le titre est obligatoire." };
    }
    if (!data.fichierUrl) {
      return { success: false, error: "Le fichier PDF ou lien externe est obligatoire." };
    }

    // Insert document record in DB, forcing zone to be manager's zone
    const [newDoc] = await db.insert(documents).values({
      titre: data.titre,
      description: data.description || null,
      fichierUrl: data.fichierUrl,
      isExternalLink: Boolean(data.isExternalLink),
      concours: data.concours || "tous",
      type: data.type || "cours",
      modeFormation: data.modeFormation || "tous",
      zone: manager.zone!, // Force manager's zone
      ordre: Number(data.ordre) || 0,
      isActive: true,
      createdBy: manager.id,
    }).returning();

    // Create notifications for candidates in the manager's zone
    let targetUsers: { id: string }[] = [];

    const conditions = [
      eq(profiles.role, "user"),
      eq(profiles.isActive, true),
      isNull(profiles.deletedAt),
      eq(profiles.zone, manager.zone!), // Enforce manager's zone targeting
    ];

    if (data.modeFormation && data.modeFormation !== "tous") {
      conditions.push(eq(profiles.modeFormation, data.modeFormation as any));
    }

    if (data.concours && data.concours !== "tous") {
      targetUsers = await db.select({ id: profiles.id })
        .from(profiles)
        .innerJoin(concoursInscrits, eq(concoursInscrits.userId, profiles.id))
        .where(
          and(
            eq(concoursInscrits.concours, data.concours as any),
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
      const notifMessage = `Un nouveau document "${data.titre}" (${data.type}) est disponible pour le concours ${data.concours.toUpperCase()}.`;

      const notificationValues = targetUsers.map(u => ({
        destinataireId: u.id,
        titre: "📚 Nouveau document disponible",
        message: notifMessage,
        type: "info" as const,
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
      scheduledAt: null,
      meetingUrl: null,
      createdAt: newDoc.createdAt ? newDoc.createdAt.toISOString() : new Date().toISOString(),
    });

    revalidatePath("/dashboard/documents");
    revalidatePath("/zone/documents");
    revalidateTag("all-active-documents", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in managerCreateDocument:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Toggles a document's active status (only if created by the manager or targets their zone)
 */
export async function managerToggleDocumentActive(id: string, isActive: boolean) {
  try {
    const { profile: manager } = await verifyManagerSession();

    const doc = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, id),
        isNull(documents.deletedAt)
      ),
    });

    if (!doc) {
      return { success: false, error: "Document introuvable." };
    }

    // Enforce that the manager can only update documents for their own zone
    if (doc.zone !== manager.zone) {
      return { success: false, error: "Non autorisé. Ce document appartient à une autre zone." };
    }

    await db.update(documents)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(documents.id, id));

    revalidatePath("/dashboard/documents");
    revalidatePath("/zone/documents");
    revalidateTag("all-active-documents", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in managerToggleDocumentActive:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}

/**
 * Soft deletes a document targeting the manager's zone
 */
export async function managerDeleteDocument(id: string) {
  try {
    const { profile: manager } = await verifyManagerSession();

    const doc = await db.query.documents.findFirst({
      where: and(
        eq(documents.id, id),
        isNull(documents.deletedAt)
      ),
    });

    if (!doc) {
      return { success: false, error: "Document introuvable." };
    }

    // Enforce that the manager can only delete documents for their own zone
    if (doc.zone !== manager.zone) {
      return { success: false, error: "Non autorisé. Ce document appartient à une autre zone." };
    }

    await db.update(documents)
      .set({ deletedAt: new Date(), isActive: false })
      .where(eq(documents.id, id));

    revalidatePath("/dashboard/documents");
    revalidatePath("/zone/documents");
    revalidateTag("all-active-documents", "max");
    return { success: true };
  } catch (error: any) {
    console.error("Error in managerDeleteDocument:", error);
    return { success: false, error: error.message || "Une erreur est survenue." };
  }
}
