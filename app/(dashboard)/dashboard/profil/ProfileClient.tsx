"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { updateCandidateProfile } from "@/app/(dashboard)/dashboard/actions";
import { toast } from "sonner";
import { User, Phone, MapPin, Landmark, BookOpen, KeyRound, CheckCircle2, Loader2, Save } from "lucide-react";

interface ProfileClientProps {
  profile: {
    nom: string;
    prenom: string;
    email: string;
    whatsapp: string | null;
    modeFormation: "presentiel" | "en_ligne" | null;
    zone: "yamoussoukro" | "yopougon" | "abobo" | "cocody" | "port-bouet" | "bouake" | null;
  };
  registeredConcours: string[];
}

export default function ProfileClient({ profile, registeredConcours }: ProfileClientProps) {
  const router = useRouter();
  const supabase = createClient();

  // General profile state
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || "");
  const [modeFormation, setModeFormation] = useState<"presentiel" | "en_ligne">(
    profile.modeFormation || "en_ligne"
  );
  const [zone, setZone] = useState<"yamoussoukro" | "yopougon" | "abobo" | "cocody" | "port-bouet" | "bouake">(
    profile.zone || "yamoussoukro"
  );
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Security state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);

    try {
      const result = await updateCandidateProfile({
        whatsapp,
        modeFormation,
        zone,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success("Profil mis à jour avec succès !");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Impossible de mettre à jour le profil.");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Veuillez saisir un nouveau mot de passe.");
      return;
    }

    if (password.length < 6) {
      toast.error("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      toast.success("Mot de passe modifié avec succès !");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du changement de mot de passe.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getConcoursLabel = (type: string) => {
    switch (type) {
      case "inphb":
        return "Concours INPHB";
      case "esatic":
        return "Concours ESATIC";
      case "cme":
        return "Concours CME";
      default:
        return type.toUpperCase();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left side column: Summary Info & Registrations */}
      <div className="space-y-6 lg:col-span-1">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-slate-105 border border-slate-200 text-[#0F172A] flex items-center justify-center mx-auto shadow-sm">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-800 text-lg">
                {profile.prenom} {profile.nom}
              </h2>
              <p className="text-sm text-slate-400 font-medium">{profile.email}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Statut compte</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-250/50">
                <CheckCircle2 className="w-3 h-3" /> Actif
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400 font-medium">Frais d'inscription</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-250/50">
                <CheckCircle2 className="w-3 h-3" /> Validés
              </span>
            </div>
          </div>
        </div>

        {/* Registered Programs Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#D4A017]" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Programmes Préparés</h3>
          </div>

          <div className="space-y-2">
            {registeredConcours.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between bg-slate-50 border border-slate-200/65 rounded-xl p-3"
              >
                <span className="text-sm font-bold text-slate-750">{getConcoursLabel(item)}</span>
                <span className="text-xs font-bold text-slate-450 uppercase">Actif</span>
              </div>
            ))}

            {registeredConcours.length === 0 && (
              <p className="text-xs text-slate-450 text-center py-2">
                Aucun concours inscrit sur ce profil.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right side columns: Forms */}
      <div className="lg:col-span-2 space-y-6">
        {/* Form 1: Informations Générales */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 text-base">Informations Générales</h3>
            <p className="text-xs text-slate-400 font-medium">
              Gérez vos options de formation et vos coordonnées.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            {/* Disabled Inputs (Nom, Prenom, Email) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-455 uppercase">Nom</label>
                <input
                  type="text"
                  value={profile.nom}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 font-semibold cursor-not-allowed"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-455 uppercase">Prénom</label>
                <input
                  type="text"
                  value={profile.prenom}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 font-semibold cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-455 uppercase">Adresse Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 font-semibold cursor-not-allowed"
              />
            </div>

            {/* Editable Inputs (WhatsApp, Mode, Zone) */}
            <div className="space-y-1.5">
              <label htmlFor="whatsapp" className="text-xs font-bold text-slate-400 uppercase">
                Numéro WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="whatsapp"
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex : +225 0707070707"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="mode" className="text-xs font-bold text-slate-400 uppercase">
                  Mode de Formation
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    id="mode"
                    value={modeFormation}
                    onChange={(e) => setModeFormation(e.target.value as "presentiel" | "en_ligne")}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all bg-white"
                  >
                    <option value="presentiel">Présentiel (En salle)</option>
                    <option value="en_ligne">En Ligne (E-learning)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="zone" className="text-xs font-bold text-slate-400 uppercase">
                  Zone de Formation
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    id="zone"
                    value={zone}
                    onChange={(e) => setZone(e.target.value as any)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all bg-white"
                  >
                    <option value="yamoussoukro">Yamoussoukro</option>
                    <option value="yopougon">Yopougon</option>
                    <option value="abobo">Abobo</option>
                    <option value="cocody">Cocody</option>
                    <option value="port-bouet">Port-Bouët</option>
                    <option value="bouake">Bouaké</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-[#D4A017] disabled:bg-slate-400 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-slate-900/5 hover:shadow-gold/15"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Enregistrer les modifications</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Form 2: Sécurité & Mot de Passe */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 text-base">Sécurité & Mot de Passe</h3>
            <p className="text-xs text-slate-400 font-medium">
              Modifiez votre mot de passe pour sécuriser l'accès à votre espace.
            </p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="pass" className="text-xs font-bold text-slate-400 uppercase">
                  Nouveau Mot de passe
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="pass"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirm" className="text-xs font-bold text-slate-400 uppercase">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ressaisir à l'identique"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-rose-600 disabled:bg-slate-400 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-slate-900/5 hover:shadow-rose-600/15"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Mise à jour...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Modifier le mot de passe</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
