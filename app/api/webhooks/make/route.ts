import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pageSections, profiles, paiements, notifications } from "@/drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";
import { logSystemError } from "@/lib/errorAlertService";

export async function POST(req: Request) {
  try {
    const headers = req.headers;
    const receivedSecret = headers.get("X-OGE-Webhook-Secret") || headers.get("x-oge-webhook-secret");

    // 1. Fetch configured webhook secret from database
    const configRow = await db.query.pageSections.findFirst({
      where: eq(pageSections.cle, "parametres"),
    });

    const config = configRow?.contenu as any || {};
    const configuredSecret = config.webhook_secret || "secret123";

    if (!receivedSecret || receivedSecret !== configuredSecret) {
      return NextResponse.json(
        { error: "Non autorisé. Clé secrète de webhook invalide." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action manquante dans la requête." },
        { status: 400 }
      );
    }

    // ACTION: NOTIFIER CANDIDAT
    if (action === "notifier_candidat") {
      const { destinataire_email, titre, message, type, lien } = body;
      if (!destinataire_email || !titre || !message) {
        return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
      }

      const user = await db.query.profiles.findFirst({
        where: and(eq(profiles.email, destinataire_email), isNull(profiles.deletedAt)),
      });

      if (!user) {
        return NextResponse.json({ error: "Candidat introuvable." }, { status: 404 });
      }

      await db.insert(notifications).values({
        destinataireId: user.id,
        titre,
        message,
        type: type || "info",
        lien: lien || null,
        lu: false,
      });

      return NextResponse.json({ success: true, message: "Notification envoyée." });
    }

    // ACTION: VALIDER PAIEMENT
    if (action === "valider_paiement") {
      const { user_email, notes } = body;
      if (!user_email) {
        return NextResponse.json({ error: "Email utilisateur manquant." }, { status: 400 });
      }

      const user = await db.query.profiles.findFirst({
        where: and(eq(profiles.email, user_email), isNull(profiles.deletedAt)),
      });

      if (!user) {
        return NextResponse.json({ error: "Candidat introuvable." }, { status: 404 });
      }

      // Update candidate profile to active
      await db.update(profiles)
        .set({ isActive: true, updatedAt: new Date() })
        .where(eq(profiles.id, user.id));

      // Find or create payment
      const payment = await db.query.paiements.findFirst({
        where: and(eq(paiements.userId, user.id), isNull(paiements.deletedAt)),
      });

      if (payment) {
        await db.update(paiements)
          .set({
            statut: "valide",
            valideAt: new Date(),
            notes: notes || payment.notes,
            updatedAt: new Date(),
          })
          .where(eq(paiements.id, payment.id));
      } else {
        await db.insert(paiements).values({
          userId: user.id,
          zone: user.zone || "yamoussoukro",
          statut: "valide",
          valideAt: new Date(),
          notes: notes || "Validé par webhook",
        });
      }

      // Send Success Email via Resend if API Key exists
      if (process.env.RESEND_API_KEY) {
        try {
          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: process.env.SENDER_EMAIL || "onboarding@resend.dev",
              to: user.email,
              subject: "✅ Paiement validé — OGE Académie",
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #10B981;">Bonjour ${user.prenom},</h2>
                  <p>Bonne nouvelle ! Votre paiement de 15 000 FCFA a été validé.</p>
                  <p>Vous pouvez maintenant accéder à tous vos cours et documents sur votre espace candidat.</p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://oge-academie.ci"}/connexion" 
                     style="display: inline-block; background-color: #0F172A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 15px;">
                    Accéder à mon espace
                  </a>
                  <p style="margin-top: 20px; font-size: 12px; color: #64748B;">— L'équipe OGE Académie</p>
                </div>
              `,
            }),
          });
          if (!resendResponse.ok) {
            console.error("Resend API error inside Webhook valider_paiement");
          }
        } catch (mailErr) {
          console.error("Failed to send webhook success email:", mailErr);
        }
      }

      return NextResponse.json({ success: true, message: "Paiement validé et candidat activé." });
    }

    return NextResponse.json(
      { error: `Action '${action}' non prise en charge.` },
      { status: 400 }
    );
  } catch (error: any) {
    await logSystemError({
      errorMessage: `Erreur de traitement Webhook Make : ${error.message || error}`,
      level: "error",
      source: "webhook",
      stackTrace: error.stack,
    });
    return NextResponse.json(
      { error: "Une erreur interne est survenue." },
      { status: 500 }
    );
  }
}
