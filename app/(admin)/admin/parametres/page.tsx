import React from "react";
import { db } from "@/lib/db";
import { pageSections } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import SettingsForm from "./SettingsForm";

export default async function SettingsPage() {
  const configRow = await db.query.pageSections.findFirst({
    where: eq(pageSections.cle, "parametres"),
  });

  const config = configRow?.contenu as any || {
    webhook_secret: "secret123",
    make_webhook_url: "",
    n8n_webhook_url: "",
    google_calendar_id: "",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Paramètres d'Intégration</h1>
        <p className="text-sm text-slate-500 mt-1">
          Configurez vos webhooks Make.com / n8n et l'identifiant de votre agenda Google Calendar.
        </p>
      </div>

      <SettingsForm initialSettings={config} />
    </div>
  );
}
