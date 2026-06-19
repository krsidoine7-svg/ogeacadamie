"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { updateSystemSettings } from "../actions";
import { Save, Key, Globe, Calendar, ShieldAlert } from "lucide-react";

interface SettingsFormProps {
  initialSettings: {
    webhook_secret: string;
    make_webhook_url: string;
    n8n_webhook_url: string;
    google_calendar_id: string;
  };
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await updateSystemSettings(settings);
      if (res.success) {
        toast.success("Paramètres mis à jour avec succès.");
      } else {
        toast.error(res.error || "Une erreur est survenue.");
      }
    } catch (error) {
      toast.error("Erreur de connexion lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 pb-4 border-b border-slate-100">
          <Globe className="w-5 h-5 text-[#D4A017]" />
          Configuration des Services
        </h2>

        {/* Google Calendar ID */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            Identifiant d'Agenda Google Calendar (Calendar ID)
          </label>
          <input
            type="text"
            value={settings.google_calendar_id || ""}
            onChange={(e) => handleChange("google_calendar_id", e.target.value)}
            className="w-full text-sm p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none"
            placeholder="ex: oge.academie@gmail.com ou oge-calendar-id@group.calendar.google.com"
          />
          <p className="text-[11px] text-slate-400 font-medium">
            Entrez l'adresse email de votre agenda principal ou l'ID de l'agenda partagé sur lequel créer les cours en direct.
          </p>
        </div>

        {/* Webhook Secret */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
            <Key className="w-4 h-4 text-slate-400" />
            Clé Secrète de Webhook (Webhook Secret)
          </label>
          <input
            type="text"
            value={settings.webhook_secret || ""}
            onChange={(e) => handleChange("webhook_secret", e.target.value)}
            className="w-full text-sm p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none font-mono"
            placeholder="secret_partage_pour_securiser_les_webhooks"
          />
          <p className="text-[11px] text-slate-400 font-medium">
            Cette clé secrète sera envoyée dans le header `X-OGE-Webhook-Secret` lors des appels sortants. Elle devra aussi être fournie par n8n/Make lors des appels entrants.
          </p>
        </div>

        {/* Webhook URL Make */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-slate-400" />
            URL Webhook Make.com (Sortant)
          </label>
          <input
            type="url"
            value={settings.make_webhook_url || ""}
            onChange={(e) => handleChange("make_webhook_url", e.target.value)}
            className="w-full text-sm p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none font-mono text-blue-600"
            placeholder="https://hook.eu1.make.com/..."
          />
          <p className="text-[11px] text-slate-400 font-medium">
            URL du scénario Make.com à appeler pour propager la création de cours. Laissez vide si inutilisé.
          </p>
        </div>

        {/* Webhook URL n8n */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-slate-400" />
            URL Webhook n8n (Sortant)
          </label>
          <input
            type="url"
            value={settings.n8n_webhook_url || ""}
            onChange={(e) => handleChange("n8n_webhook_url", e.target.value)}
            className="w-full text-sm p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none font-mono text-blue-600"
            placeholder="https://n8n.votredomaine.com/webhook/..."
          />
          <p className="text-[11px] text-slate-400 font-medium">
            URL du workflow n8n à appeler pour propager la création de cours. Laissez vide si inutilisé.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex gap-3 text-xs text-slate-600">
          <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <span className="font-bold block text-slate-800">Note de Sécurité importante :</span>
            Les identifiants techniques du compte de service Google (adresse email et clé privée RSA PEM) doivent être configurés dans le fichier `.env.local` du serveur car ils contiennent des clés de sécurité trop longues et sensibles pour être stockées dans une table de contenu ordinaire.
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-[#D4A017] hover:bg-yellow-600 text-white rounded-xl font-bold shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Enregistrement..." : "Sauvegarder les Paramètres"}
        </button>
      </div>
    </form>
  );
}
