"use client";

import React, { useState } from "react";
import { updateZoneConfigByManager } from "@/app/(zone)/zone/actions";
import { updatePersonalProfile } from "@/app/(dashboard)/dashboard/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Save, MapPin, Phone, CreditCard, User, KeyRound, Mail, User2 } from "lucide-react";

interface ZoneConfigData {
  zone: string;
  lienWave: string | null;
  numeroWave: string | null;
  adresse: string | null;
  telephone: string | null;
}

interface ManagerProfileData {
  nom: string;
  prenom: string;
  email: string;
  whatsapp: string | null;
  avatarUrl: string | null;
}

interface ZoneParametresClientProps {
  initialConfig: ZoneConfigData;
  profile: ManagerProfileData;
}

export default function ZoneParametresClient({ initialConfig, profile }: ZoneParametresClientProps) {
  const router = useRouter();

  // Zone Settings state
  const [isSubmittingZone, setIsSubmittingZone] = useState(false);
  const [zoneForm, setZoneForm] = useState({
    lienWave: initialConfig.lienWave || "",
    numeroWave: initialConfig.numeroWave || "",
    adresse: initialConfig.adresse || "",
    telephone: initialConfig.telephone || "",
  });

  // Profile Settings state
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [nom, setNom] = useState(profile.nom || "");
  const [prenom, setPrenom] = useState(profile.prenom || "");
  const [email, setEmail] = useState(profile.email || "");
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || "");
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Security state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handleZoneChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setZoneForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleZoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingZone(true);

    try {
      const res = await updateZoneConfigByManager({
        lienWave: zoneForm.lienWave.trim() || null,
        numeroWave: zoneForm.numeroWave.trim() || null,
        adresse: zoneForm.adresse.trim() || null,
        telephone: zoneForm.telephone.trim() || null,
      });

      if (res.success) {
        toast.success("Paramètres de la zone mis à jour avec succès !");
      } else {
        toast.error(res.error || "Une erreur est survenue lors de la mise à jour.");
      }
    } catch (error) {
      toast.error("Erreur de communication avec le serveur.");
    } finally {
      setIsSubmittingZone(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingProfile(true);

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

      toast.success("Informations personnelles mises à jour avec succès !");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setIsSubmittingProfile(false);
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

    setIsSubmittingPassword(true);

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
      toast.error(err.message || "Erreur lors du changement de mot de passe.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* LEFT COLUMN: ZONE CONFIGURATION */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-805">
              Configuration de la Zone
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Configurez les coordonnées et les modalités de paiement Wave de votre zone géographique locale.
            </p>
          </div>

          <form onSubmit={handleZoneSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-1.5">
                <label htmlFor="lienWave" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                  <span>Lien Wave Marchand :</span>
                </label>
                <input
                  type="text"
                  id="lienWave"
                  name="lienWave"
                  value={zoneForm.lienWave}
                  onChange={handleZoneChange}
                  placeholder="Ex: https://wave.me/to/..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="numeroWave" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                  <span>Numéro de Téléphone Wave :</span>
                </label>
                <input
                  type="text"
                  id="numeroWave"
                  name="numeroWave"
                  value={zoneForm.numeroWave}
                  onChange={handleZoneChange}
                  placeholder="Ex: 07 08 08 08 08"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="telephone" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Téléphone de Contact Zone :</span>
                </label>
                <input
                  type="text"
                  id="telephone"
                  name="telephone"
                  value={zoneForm.telephone}
                  onChange={handleZoneChange}
                  placeholder="Ex: +225 07 00 00 00 00"
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="adresse" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Adresse Physique / Point de Retrait :</span>
                </label>
                <textarea
                  id="adresse"
                  name="adresse"
                  value={zoneForm.adresse}
                  onChange={handleZoneChange}
                  rows={4}
                  placeholder="Ex: Yamoussoukro, en face de la gare routière..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent bg-slate-50/50 min-h-[100px]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingZone}
                className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmittingZone ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5 text-[#D4A017]" />
                )}
                <span>Enregistrer la Zone</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: PERSONAL PROFILE & SECURITY */}
        <div className="space-y-8">
          
          {/* Card 1: Personal Profile details */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-slate-100">
              <div className="relative w-16 h-16 group">
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
                <h3 className="font-extrabold text-slate-800 text-sm">Informations Personnelles</h3>
                <p className="text-xs text-slate-400 font-medium">Gérez votre identité et vos coordonnées manager.</p>
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="mNom" className="text-xs font-bold text-slate-750 flex items-center gap-1">
                    <User2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nom</span>
                  </label>
                  <input
                    id="mNom"
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="mPrenom" className="text-xs font-bold text-slate-750 flex items-center gap-1">
                    <User2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Prénom</span>
                  </label>
                  <input
                    id="mPrenom"
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="mEmail" className="text-xs font-bold text-slate-755 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Adresse Email</span>
                </label>
                <input
                  id="mEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="mWhatsapp" className="text-xs font-bold text-slate-755 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Numéro WhatsApp Personnel</span>
                </label>
                <input
                  id="mWhatsapp"
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: +225 0503681588"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingProfile}
                  className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingProfile ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-[#D4A017]" />
                  )}
                  <span>Enregistrer Profil</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2: Security settings (password change) */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <span>Changer de Mot de Passe</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Sécurisez l'accès à votre compte manager.</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="mPass" className="text-xs font-bold text-slate-705">Nouveau Mot de Passe</label>
                  <input
                    id="mPass"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-850 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="mConfirm" className="text-xs font-bold text-slate-705">Confirmer</label>
                  <input
                    id="mConfirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ressaisir à l'identique"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50/50 text-slate-850 focus:outline-none focus:ring-2 focus:ring-[#D4A017]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPassword ? (
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
