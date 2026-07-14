import { db } from "@/lib/db";
import { systemErrorLogs, profiles, notifications, pageSections } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

interface LogErrorOptions {
  level?: "info" | "warning" | "error" | "critical";
  source?: "client" | "api" | "database" | "auth" | "upload" | string;
  endpoint?: string;
  errorMessage: string;
  stackTrace?: string | null;
  userId?: string | null;
  metadata?: any;
}

/**
 * Enregistre une erreur technique ou métier dans la table system_error_logs
 * et déclenche les alertes (Notifications internes + Webhook Make.com) si nécessaire.
 */
export async function logSystemError(options: LogErrorOptions) {
  try {
    const level = options.level || "error";
    const source = options.source || "client";
    const errorMessage = options.errorMessage || "Erreur inconnue";
    
    // 1. Enregistrement dans la base de données
    const [insertedLog] = await db
      .insert(systemErrorLogs)
      .values({
        level,
        source,
        endpoint: options.endpoint || null,
        errorMessage,
        stackTrace: options.stackTrace || null,
        userId: options.userId || null,
        metadata: options.metadata || {},
        status: "nouveau",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // 2. Déclenchement asynchrone des alertes si niveau critical ou error
    if (level === "critical" || level === "error") {
      // Nous exécutons l'alerte sans faire planter ou ralentir l'appelant en cas de défaillance réseau du webhook
      sendErrorAlerts(insertedLog).catch((err) => {
        console.error("Erreur lors de l'envoi des alertes système (Webhook/Notifications):", err);
      });
    }

    return insertedLog;
  } catch (err) {
    console.error("Echec critique du service logSystemError:", err);
    return null;
  }
}

/**
 * Fonction unifiée pour logError, acceptant indifféremment message/errorMessage et stack/stackTrace.
 */
export async function logError(options: {
  message?: string;
  errorMessage?: string;
  stack?: string;
  stackTrace?: string;
  level?: "info" | "warning" | "error" | "critical";
  source?: "client" | "api" | "database" | "auth" | "upload" | string;
  endpoint?: string;
  userId?: string | null;
  metadata?: any;
}) {
  return logSystemError({
    errorMessage: options.message || options.errorMessage || "Erreur inconnue",
    stackTrace: options.stack || options.stackTrace || undefined,
    level: options.level || "error",
    source: options.source || "api",
    endpoint: options.endpoint,
    userId: options.userId,
    metadata: options.metadata,
  });
}

/**
 * Objet d'interface unifiée pour logError et logSystemError.
 */
export const errorAlertService = {
  logError,
  logSystemError,
};

export default errorAlertService;

/**
 * Envoie une notification interne aux Super Admins et expédie le payload propre vers Make.com
 */
async function sendErrorAlerts(logEntry: any) {
  try {
    // A. Récupérer les profils Super Admins pour envoi de notification Drizzle
    const superAdmins = await db.query.profiles.findMany({
      where: eq(profiles.role, "super_admin"),
    });

    if (superAdmins.length > 0) {
      const notifsToInsert = superAdmins.map((admin) => ({
        destinataireId: admin.id,
        titre: `🚨 Alerte [${logEntry.level.toUpperCase()}] : Anomalie Système`,
        message: `${logEntry.errorMessage.slice(0, 120)}... (Source : ${logEntry.source})`,
        type: "alerte" as const,
        lien: "/admin/logs",
        lu: false,
        createdAt: new Date(),
      }));

      await db.insert(notifications).values(notifsToInsert);
    }

    // B. Récupérer la configuration Webhook dans la table pageSections (clé : "parametres")
    const paramSection = await db.query.pageSections.findFirst({
      where: eq(pageSections.cle, "parametres"),
    });

    let makeWebhookUrl = "";
    let webhookSecret = "";

    if (paramSection && paramSection.contenu) {
      const content = paramSection.contenu as any;
      makeWebhookUrl = content.make_error_webhook_url || content.make_webhook_url || "";
      webhookSecret = content.webhook_secret || "";
    }

    // Si une URL Make est configurée, on prépare le payload propre
    if (makeWebhookUrl && makeWebhookUrl.startsWith("http")) {
      let userInfo = null;
      if (logEntry.userId) {
        const userProfile = await db.query.profiles.findFirst({
          where: eq(profiles.id, logEntry.userId),
        });
        if (userProfile) {
          userInfo = {
            id: userProfile.id,
            nom: userProfile.nom,
            prenom: userProfile.prenom,
            email: userProfile.email,
            role: userProfile.role,
            zone: userProfile.zone,
          };
        }
      }

      const cleanPayload = {
        event: "system.error.alert",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "production",
        error: {
          id: logEntry.id,
          level: logEntry.level,
          source: logEntry.source,
          endpoint: logEntry.endpoint,
          message: logEntry.errorMessage,
          stack: logEntry.stackTrace,
          metadata: logEntry.metadata,
        },
        user: userInfo,
        platform: {
          name: "OGE Académie",
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || "https://oge-academie.com"}/admin/logs`,
        },
      };

      await fetch(makeWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-OGE-Signature": webhookSecret || "oge-secret",
        },
        body: JSON.stringify(cleanPayload),
      });
    }
  } catch (error) {
    console.error("sendErrorAlerts failure:", error);
  }
}
