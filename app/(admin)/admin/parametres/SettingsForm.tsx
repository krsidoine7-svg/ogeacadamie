"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateSystemSettings, updateSystemConfig } from "../actions";
import { updatePersonalProfile } from "@/app/(dashboard)/dashboard/actions";
import { Save, Key, Globe, Calendar, ShieldAlert, Settings, User, Loader2, KeyRound, Mail, User2, Phone } from "lucide-react";

interface SettingsFormProps {
  initialSettings: {
    webhook_secret: string;
    make_webhook_url: string;
    make_error_webhook_url?: string;
    n8n_webhook_url: string;
    google_calendar_id: string;
    general_link?: string;
  };
  isSuperAdmin: boolean;
  initialSystemConfig: {
    allow_manager_edit: boolean;
    concepteur_whatsapp?: string;
    concepteur_email?: string;
  };
  profile: {
    nom: string;
    prenom: string;
    email: string;
    whatsapp: string | null;
    avatarUrl: string | null;
  };
}

export default function SettingsForm({
  initialSettings,
  isSuperAdmin,
  initialSystemConfig,
  profile,
}: SettingsFormProps) {
  const router = useRouter();

  // Integration settings state
  const [settings, setSettings] = useState({
    webhook_secret: initialSettings.webhook_secret || "",
    make_webhook_url: initialSettings.make_webhook_url || "",
    make_error_webhook_url: initialSettings.make_error_webhook_url || "",
    n8n_webhook_url: initialSettings.n8n_webhook_url || "",
    google_calendar_id: initialSettings.google_calendar_id || "",
    general_link: initialSettings.general_link || "",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // System config state
  const [sysConfig, setSysConfig] = useState(initialSystemConfig);
  const [isSavingSys, setIsSavingSys] = useState(false);

  // Profile Settings state
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [nom, setNom] = useState(profile.nom || "");
  const [prenom, setPrenom] = useState(profile.prenom || "");
  const [email, setEmail] = useState(profile.email || "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Password state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

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

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const result = await updatePersonalProfile({
        nom,
        prenom,
        email,
        whatsapp,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Votre profil personnel a été mis à jour.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur de mise à jour.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAvatarUrl(data.url);
        toast.success("Photo de profil mise à jour !");
        router.refresh();
      } else {
        toast.error(data.error || "Erreur lors de l'upload.");
      }
    } catch (err) {
      toast.error("Erreur de connexion lors de l'upload.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Saisissez un nouveau mot de passe.");
      return;
    }
    if (password.length < 6) {
      toast.error("Minimum 6 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mots de passe non identiques.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const result = await updatePersonalProfile({
        nom,
        prenom,
        email,
        whatsapp,
        password,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Mot de passe modifié avec succès !");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la modification.");
    } finally {
      setIsSavingPassword(false);
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

  const handleSysChange = (key: string, value: string) => {
    setSysConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN: SYSTEM CONFIGURATION & INTEGRATIONS */}
        <div className="space-y-8">
          
          {/* Card 1: Global System Configuration (Super Admin Only) */}
          {isSuperAdmin && (
            <form onSubmit={handleSysSubmit} className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                <h2 className="text-base font-bold text-slate-850 tracking-tight flex items-center gap-2 pb-4 border-b border-slate-100">
                  <Settings className="w-5 h-5 text-[#D4A017]" />
                  <span>Configuration Générale du Système</span>
                </h2>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-150">
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">
                        Autoriser l'édition des centres par les managers
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium leading-relaxed">
                        Permet aux responsables locaux d'éditer l'adresse, le Wave et le téléphone de leur centre géographique.
                      </span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={sysConfig.allow_manager_edit}
                        onChange={handleSysToggle}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-slate-250 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4A017]"></div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        Concepteur WhatsApp (Footer)
                      </label>
                      <input
                        type="text"
                        value={sysConfig.concepteur_whatsapp || ""}
                        onChange={(e) => handleSysChange("concepteur_whatsapp", e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none"
                        placeholder="+225 0503681588"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">
                        Concepteur Email (Footer)
                      </label>
                      <input
                        type="email"
                        value={sysConfig.concepteur_email || ""}
                        onChange={(e) => handleSysChange("concepteur_email", e.target.value)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none"
                        placeholder="krsidoine7@gmail.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSavingSys}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-[#D4A017] text-white rounded-xl font-bold shadow-sm transition-all duration-205 cursor-pointer disabled:opacity-50 text-xs"
                  >
                    {isSavingSys ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5 text-[#D4A017]" />
                    )}
                    <span>Sauvegarder la config</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Card 2: Webhooks & Calendar API Integration Settings */}
          <form onSubmit={handleSettingsSubmit} className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-base font-bold text-slate-850 tracking-tight flex items-center gap-2 pb-4 border-b border-slate-100">
                <Globe className="w-5 h-5 text-[#D4A017]" />
                <span>Intégrations & API Webhooks</span>
              </h2>

              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Lien de Redirection Général
                  </label>
                  <input
                    type="url"
                    value={settings.general_link || ""}
                    onChange={(e) => handleChange("general_link", e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none font-mono text-blue-600"
                    placeholder="https://votre-lien-externe.com"
                  />
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Lien d'orientation externe général utilisé sur le site.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    ID Google Calendar (Agenda Principal)
                  </label>
                  <input
                    type="text"
                    value={settings.google_calendar_id || ""}
                    onChange={(e) => handleChange("google_calendar_id", e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none font-mono"
                    placeholder="example@group.calendar.google.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    Secret de Validation de Signature Webhook
                  </label>
                  <input
                    type="text"
                    value={settings.webhook_secret || ""}
                    onChange={(e) => handleChange("webhook_secret", e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none font-mono"
                    placeholder="secret_de_validation..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    URL Webhook Make (CRM / Notification SMS)
                  </label>
                  <input
                    type="url"
                    value={settings.make_webhook_url || ""}
                    onChange={(e) => handleChange("make_webhook_url", e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none font-mono text-blue-600"
                    placeholder="https://hook.us1.make.com/..."
                  />
                </div>

                <div className="space-y-2 p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-[#D4A017] flex-shrink-0" />
                    <span>URL Webhook Make (Alerte Journal des Erreurs)</span>
                  </div>
                  <input
                    type="url"
                    value={settings.make_error_webhook_url || ""}
                    onChange={(e) => handleChange("make_error_webhook_url", e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-amber-300 bg-white focus:ring-1 focus:ring-[#D4A017] outline-none font-mono text-amber-950 placeholder-slate-400"
                    placeholder="https://hook.eu1.make.com/xxxxxx..."
                  />
                  <p className="text-[11px] text-amber-800/90 font-medium leading-relaxed">
                    Lorsqu&apos;une erreur de niveau <strong>CRITICAL</strong> ou <strong>ERROR</strong> survient (ex: upload refusé par le serveur 413, crash API ou BDD), la plateforme expédie automatiquement un payload JSON propre et structuré à cette URL. Vous pourrez ainsi configurer votre scénario Make.com pour recevoir une alerte immédiate par email ou SMS.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">
                    URL Webhook n8n (Sortant)
                  </label>
                  <input
                    type="url"
                    value={settings.n8n_webhook_url || ""}
                    onChange={(e) => handleChange("n8n_webhook_url", e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-250 focus:ring-1 focus:ring-[#D4A017] outline-none font-mono text-blue-600"
                    placeholder="https://n8n.votredomaine.com/webhook/..."
                  />
                </div>

                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex gap-3 text-[11px] text-slate-650 font-medium">
                  <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <span className="font-bold block text-slate-800 mb-0.5">Note de Sécurité :</span>
                    Les identifiants Google Service Account (email client & clé privée RSA) doivent être configurés dans `.env.local` car ils contiennent des clés d'accès cryptographiques sensibles.
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-[#D4A017] text-white rounded-xl font-bold shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 text-xs"
                >
                  {isSavingSettings ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-[#D4A017]" />
                  )}
                  <span>Sauvegarder les intégrations</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: PERSONAL ADMIN ACCOUNT & SECURITY */}
        <div className="space-y-8">
          
          {/* Card 1: Personal Account fields */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-slate-100">
              <div className="relative w-16 h-16 group flex-shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 text-[#0F172A] flex items-center justify-center shadow-sm">
                    <User className="w-8 h-8" />
                  </div>
                )}
                {avatarUploading ? (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <label className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center text-white text-[9px] font-bold cursor-pointer transition-all">
                    Modifier
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">Mon Compte Administrateur</h3>
                <p className="text-xs text-slate-400 font-medium">Gérez votre identité et vos coordonnées sur la console.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="aNom" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nom</span>
                  </label>
                  <input
                    id="aNom"
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="aPrenom" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Prénom</span>
                  </label>
                  <input
                    id="aPrenom"
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="aEmail" className="text-xs font-bold text-slate-750 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Adresse Email</span>
                </label>
                <input
                  id="aEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="aWhatsapp" className="text-xs font-bold text-slate-750 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Numéro WhatsApp</span>
                </label>
                <input
                  id="aWhatsapp"
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: +225 07 00 00 00 00"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-[#D4A017]" />
                  )}
                  <span>Enregistrer Profil</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Security settings */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Changer de Mot de Passe</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Sécurisez l'accès à votre console administrative.</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="aPass" className="text-xs font-bold text-slate-700">Nouveau Mot de Passe</label>
                  <input
                    id="aPass"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="aConfirm" className="text-xs font-bold text-slate-700">Confirmer</label>
                  <input
                    id="aConfirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ressaisir à l'identique"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSavingPassword ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <KeyRound className="w-3.5 h-3.5 text-[#D4A017]" />
                  )}
                  <span>Modifier le Mot de Passe</span>
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
