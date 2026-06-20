"use client";

import React, { useState } from "react";
import { updateZoneConfigByManager } from "@/app/(zone)/zone/actions";
import { toast } from "sonner";
import { Loader2, Save, MapPin, Phone, CreditCard } from "lucide-react";

interface ZoneConfigData {
  id?: string;
  zone: string;
  lienWave: string | null;
  adresse: string | null;
  telephone: string | null;
}

interface ZoneSettingsFormProps {
  initialConfig: ZoneConfigData;
}

export default function ZoneSettingsForm({ initialConfig }: ZoneSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    lienWave: initialConfig.lienWave || "",
    adresse: initialConfig.adresse || "",
    telephone: initialConfig.telephone || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await updateZoneConfigByManager({
        lienWave: formData.lienWave.trim() || null,
        lienMomo: null, // Deactivated/cleared
        lienOrange: null, // Deactivated/cleared
        adresse: formData.adresse.trim() || null,
        telephone: formData.telephone.trim() || null,
      });

      if (res.success) {
        toast.success("Paramètres de la zone mis à jour avec succès !");
      } else {
        toast.error(res.error || "Une erreur est survenue lors de la mise à jour.");
      }
    } catch (error) {
      toast.error("Erreur de communication avec le serveur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatZoneName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">
          Détails de Paiement & Contact ({formatZoneName(initialConfig.zone)})
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Ces informations seront affichées sur l&apos;espace des candidats de votre zone pour qu&apos;ils puissent effectuer leur paiement de 15 000 FCFA par **Wave CI**.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Wave Payment Detail */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="lienWave" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-500" />
              <span>Numéro ou Lien Wave Marchand :</span>
            </label>
            <input
              type="text"
              id="lienWave"
              name="lienWave"
              value={formData.lienWave}
              onChange={handleChange}
              placeholder="Ex: https://wave.me/to/... ou 07 00 00 00 00"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent bg-slate-50/50"
              required
            />
          </div>

          {/* Contact Telephone */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="telephone" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-500" />
              <span>Téléphone de Contact Zone :</span>
            </label>
            <input
              type="text"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="Ex: +225 07 00 00 00 00"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent bg-slate-50/50"
            />
          </div>

          {/* Physical Office Address */}
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="adresse" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>Adresse Physique / Point de Retrait :</span>
            </label>
            <textarea
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              rows={3}
              placeholder="Ex: Yamoussoukro, en face de la gare routière, Immeuble Golden, 2ème étage."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent bg-slate-50/50 min-h-[80px]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold text-xs py-2.5 px-6 rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-[#D4A017]" />
            )}
            <span>Enregistrer les paramètres</span>
          </button>
        </div>
      </form>
    </div>
  );
}
