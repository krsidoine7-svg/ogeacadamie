import { db } from "./db";
import { pageSections } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

interface DocumentWebhookData {
  id: string;
  titre: string;
  description: string | null;
  fichierUrl: string | null;
  concours: string | null;
  type: string | null;
  scheduledAt?: string | null;
  meetingUrl?: string | null;
  createdAt: string;
}

export async function triggerNewDocumentWebhook(document: DocumentWebhookData) {
  try {
    const configRow = await db.query.pageSections.findFirst({
      where: eq(pageSections.cle, "parametres"),
    });

    const config = configRow?.contenu as any || {};
    const makeUrl = config.make_webhook_url;
    const n8nUrl = config.n8n_webhook_url;
    const secret = config.webhook_secret || "secret123";

    const payload = {
      event: "document.created",
      document: {
        id: document.id,
        titre: document.titre,
        description: document.description,
        fichierUrl: document.fichierUrl,
        concours: document.concours,
        type: document.type,
        scheduledAt: document.scheduledAt,
        meetingUrl: document.meetingUrl,
        createdAt: document.createdAt,
      },
    };

    const headers = {
      "Content-Type": "application/json",
      "X-OGE-Webhook-Secret": secret,
    };

    // Send to Make.com if configured (in background, do not block thread)
    if (makeUrl && makeUrl.trim().startsWith("http")) {
      fetch(makeUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }).catch((err) => console.error("Error sending webhook to Make:", err));
    }

    // Send to n8n if configured
    if (n8nUrl && n8nUrl.trim().startsWith("http")) {
      fetch(n8nUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      }).catch((err) => console.error("Error sending webhook to n8n:", err));
    }
  } catch (error) {
    console.error("Error in triggerNewDocumentWebhook:", error);
  }
}
