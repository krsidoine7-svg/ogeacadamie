"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { updateSystemSettings, updateSystemConfig } from "../actions";
import { Save, Key, Globe, Calendar, ShieldAlert, Settings } from "lucide-react";

interface SettingsFormProps {
  initialSettings: {
    webhook_secret: string;
    make_webhook_url: string;
    n8n_webhook_url: string;
    google_calendar_id: string;
  };
  isSuperAdmin: boolean;
  initialSystemConfig: {
    allow_manager_edit: boolean;
    concepteur_whatsapp?: string;
    concepteur_email?: string;
  };
}

export default function SettingsForm({
  initialSettings,
  isSuperAdmin,
  initialSystemConfig,
}: SettingsFormProps) {
  // Integration settings state
  const [settings, setSettings] = useState(initialSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // System config state
  const [sysConfig, setSysConfig] = useState(initialSystemConfig);
  const [isSavingSys, setIsSavingSys] = useState(false);

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);

    try {
      const res = await updateSystemSettings(settings);
      if (res.success) {
        toast.success("Paramètres d'intégration mis à jour avec succès.");
      } else {
        toast.error(res.error || "Une erreur est survenue.");
      }
    } catch (error) {
      toast.error("Erreur de connexion lors de la sauvegarde.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSysSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;

    setIsSavingSys(true);
    try {
      const res = await updateSystemConfig({
        allow_manager_edit: sysConfig.allow_manager_edit,
        enable_wave: true,
        enable_momo: false,
        enable_orange: false,
        concepteur_whatsapp: sysConfig.concepteur_whatsapp,
        concepteur_email: sysConfig.concepteur_email,
      });
      if (res.success) {
        toast.success("Configuration système mise à jour avec succès.");
      } else {
        toast.error(res.error || "Une erreur est survenue.");
      }
    } catch (error) {
      toast.error("Erreur de connexion lors de la sauvegarde.");
    } finally {
      setIsSavingSys(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSysToggle = () => {
    setSysConfig((prev) => ({
      ...prev,
      allow_manager_edit: !prev.allow_manager_edit,
    }));
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* 1. Global System Configuration (Super Admin Only) */}
      {isSuperAdmin ? (
        <form onSubmit={handleSysSubmit} className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 pb-4 border-b border-slate-100">
              <Settings className="w-5 h-5 text-[#D4A017]" />
              Configuration Générale Système (Super-Admin)
            </h2>

            <div className="space-y-5">
              {/* Toggle allow_manager_edit */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 uppercase block">
                    Autoriser la modification des managers
                  </span>
                  <span className="text-[11px] text-slate-450 leading-normal font-medium block max-w-md">
                    Si désactivé, les boutons de modification, blocage et suppression des managers seront masqués pour les administrateurs standards.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sysConfig.allow_manager_edit}
                    onChange={handleSysToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                </label>
              </div>

              <div className="bg-blue-50/50 border border-blue-200/50 p-4 rounded-2xl text-xs text-blue-800 font-medium">
                Note : La plateforme est configurée pour accepter uniquement les paiements via **Wave CI**. Chaque zone dispose de son propre compte Wave Marchand.
              </div>

              {/* Contacts Concepteur / Développeur */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                  Contacts du Concepteur (Affichés dans le Footer public)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">
                      Numéro WhatsApp du Concepteur
                    </label>
                    <input
                      type="text"
                      value={sysConfig.concepteur_whatsapp || ""}
                      onChange={(e) => setSysConfig(prev => ({ ...prev, concepteur_whatsapp: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-gold/30 focus:border-gold outline-none"
                      placeholder="ex: +225 0503681588"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase">
                      Email de contact du Concepteur
                    </label>
                    <input
                      type="email"
                      value={sysConfig.concepteur_email || ""}
                      onChange={(e) => setSysConfig(prev => ({ ...prev, concepteur_email: e.target.value }))}
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-1 focus:ring-gold/30 focus:border-gold outline-none"
                      placeholder="ex: krsidoine7@gmail.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingSys}
              className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-[#D4A017] text-white rounded-xl font-bold shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 text-xs"
            >
              <Save className="w-4 h-4" />
              {isSavingSys ? "Enregistrement..." : "Sauvegarder la Configuration Système"}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 text-xs text-slate-500 font-medium">
          <ShieldAlert className="w-5 h-5 text-slate-400 inline-block mr-1.5 align-middle" />
          Les configurations système globales sont verrouillées et visibles uniquement par le **Super-Administrateur**.
        </div>
      )}

      {/* 2. Integration / Services configuration */}
      <form onSubmit={handleSettingsSubmit} className="space-y-6">
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

          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex gap-3 text-xs text-slate-650">
            <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <span className="font-bold block text-slate-805">Note de Sécurité importante :</span>
              Les identifiants techniques du compte de service Google (adresse email et clé privée RSA PEM) doivent être configurés dans le fichier `.env.local` du serveur car ils contiennent des clés de sécurité trop longues et sensibles pour être stockées dans une table de contenu ordinaire.
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSavingSettings}
            className="flex items-center gap-2 px-6 py-3 bg-[#D4A017] hover:bg-yellow-600 text-white rounded-xl font-bold shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 text-xs"
          >
            <Save className="w-4 h-4" />
            {isSavingSettings ? "Enregistrement..." : "Sauvegarder les Paramètres d'Intégration"}
          </button>
        </div>
      </form>
    </div>
  );
}
