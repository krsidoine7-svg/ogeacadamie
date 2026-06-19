"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, concoursInscrits } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function registerCandidate(formData: {
  nom: string;
  prenom: string;
  serie_bac: string;
  whatsapp: string;
  email: string;
  password: string;
  concours: Array<"inphb" | "esatic" | "cme">;
  mode_formation: "presentiel" | "en_ligne";
  zone: "yamoussoukro" | "yopougon" | "abobo" | "cocody" | "port-bouet" | "bouake";
}) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 1. Create the user in Supabase Auth
    // This will trigger public.handle_new_user() database trigger automatically to insert a profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          nom: formData.nom,
          prenom: formData.prenom,
        },
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const userId = authData.user?.id;
    if (!userId) {
      return { success: false, error: "La création de l'utilisateur a échoué." };
    }

    // 2. Direct database update via Drizzle to bypass client RLS issues (for unverified email sessions)
    await db
      .update(profiles)
      .set({
        whatsapp: formData.whatsapp,
        serieBac: formData.serie_bac,
        zone: formData.zone,
        modeFormation: formData.mode_formation,
        role: "user",
        isActive: false, // Inactive by default until payment validation
      })
      .where(eq(profiles.id, userId));

    // 3. Register chosen contests
    const concoursInserts = formData.concours.map((c) => ({
      userId: userId,
      concours: c,
    }));

    if (concoursInserts.length > 0) {
      await db.insert(concoursInscrits).values(concoursInserts);
    }

    // 4. Send Confirmation Email via Resend if API Key exists
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
            to: [formData.email],
            subject: "Bienvenue sur OGE Académie !",
            html: `
              <div style="font-family: sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h1 style="color: #0284c7; text-align: center;">Bienvenue sur OGE Académie !</h1>
                <p>Bonjour <strong>${formData.prenom} ${formData.nom}</strong>,</p>
                <p>Votre inscription a été reçue avec succès. Nous sommes ravis de vous compter parmi nos candidats pour cette session de préparation.</p>
                
                <h3 style="color: #4f46e5; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px;">Détails de votre inscription :</h3>
                <ul>
                  <li><strong>Série de Bac :</strong> Série ${formData.serie_bac}</li>
                  <li><strong>Mode de préparation :</strong> ${formData.mode_formation === "presentiel" ? "Présentiel" : "En Ligne"}</li>
                  <li><strong>Zone de formation :</strong> ${formData.zone.toUpperCase()}</li>
                  <li><strong>Concours ciblés :</strong> ${formData.concours.map(c => c.toUpperCase()).join(", ")}</li>
                </ul>

                <p style="margin-top: 20px; padding: 15px; background-color: #f0f9ff; border-left: 4px solid #0284c7; font-size: 0.9em; line-height: 1.5;">
                  <strong>Prochaine étape :</strong> Pour activer définitivement votre compte et accéder à nos supports de cours et devoirs, veuillez vous connecter et soumettre votre reçu de paiement de 15 000 FCFA dans votre espace candidat.
                </p>

                <div style="text-align: center; margin-top: 30px;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/connexion" 
                     style="background: linear-gradient(135deg, #0ea5e9, #4f46e5); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Se Connecter
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
          console.error("Resend API error response:", errData);
        }
      } catch (emailErr) {
        console.error("Email confirmation failed to send:", emailErr);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in registerCandidate server action:", error);
    return { success: false, error: error.message || "Une erreur inconnue est survenue." };
  }
}
