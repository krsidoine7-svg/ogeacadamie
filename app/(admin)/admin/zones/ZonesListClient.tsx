"use client";

import React, { useState } from "react";
import { updateZoneConfig } from "@/app/(admin)/admin/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Landmark, AlertCircle, Edit, Save, X, Loader2 } from "lucide-react";

interface ZoneConfigItem {
  id: string;
  zone: "yamoussoukro" | "yopougon" | "abobo" | "cocody" | "port-bouet" | "bouake";
  lienWave: string | null;
  numeroWave: string | null;
  adresse: string | null;
  telephone: string | null;
}

interface ZonesListClientProps {
  zones: ZoneConfigItem[];
}

export default function ZonesListClient({ zones }: ZonesListClientProps) {
  const router = useRouter();

  // Edit states
  const [editingZone, setEditingZone] = useState<ZoneConfigItem | null>(null);
  const [wave, setWave] = useState("");
  const [numWave, setNumWave] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startEdit = (zoneItem: ZoneConfigItem) => {
    setEditingZone(zoneItem);
    setWave(zoneItem.lienWave || "");
    setNumWave(zoneItem.numeroWave || "");
    setPhone(zoneItem.telephone || "");
    setAddress(zoneItem.adresse || "");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;

    setIsSubmitting(true);
    try {
      const res = await updateZoneConfig(editingZone.zone, {
        lienWave: wave.trim(),
        numeroWave: numWave.trim(),
        telephone: phone.trim(),
        adresse: address.trim(),
      });

      if (!res.success) throw new Error(res.error);

      toast.success(`Modalités de la zone ${getZoneLabel(editingZone.zone)} mises à jour.`);
      setEditingZone(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Erreur de mise à jour.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getZoneLabel = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Columns: Zones Configurations cards grid */}
      <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {zones.map((zoneItem) => (
          <div
            key={zoneItem.id}
            className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#D4A017]" />
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                    {getZoneLabel(zoneItem.zone)}
                  </h3>
                </div>
                <button
                  onClick={() => startEdit(zoneItem)}
                  className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200 rounded-lg transition-all cursor-pointer"
                  title="Modifier la configuration"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              {/* Body details */}
              <div className="space-y-3 text-sm font-semibold text-slate-700">
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Téléphone Responsable</p>
                    <p className="text-slate-850 mt-0.5">{zoneItem.telephone || "Non configuré"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Landmark className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Lien Wave Marchand</p>
                    <p className="text-slate-800 mt-0.5 text-xs truncate max-w-[180px]" title={zoneItem.lienWave || ""}>
                      {zoneItem.lienWave || "Non configuré"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Landmark className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Numéro de Téléphone Wave</p>
                    <p className="text-slate-800 mt-0.5">{zoneItem.numeroWave || "Non configuré"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Adresse du Centre</p>
                    <p className="text-slate-800 mt-0.5 leading-relaxed">{zoneItem.adresse || "Non renseignée"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Column: Edit form */}
      <div className="lg:col-span-1">
        {editingZone ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-slate-800 text-sm">Configurer la zone</h3>
                <p className="text-xs text-[#D4A017] font-bold uppercase tracking-wide">
                  {getZoneLabel(editingZone.zone)}
                </p>
              </div>
              <button
                onClick={() => setEditingZone(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="space-y-1.5">
                <label htmlFor="ePhone" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Téléphone Responsable de Zone
                </label>
                <input
                  id="ePhone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex : 07 07 07 07 07"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-50/50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="eWave" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Lien Wave Marchand
                </label>
                <input
                  id="eWave"
                  type="text"
                  value={wave}
                  onChange={(e) => setWave(e.target.value)}
                  placeholder="Ex : https://wave.me/to/..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="eWaveNum" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Numéro de Téléphone Wave
                </label>
                <input
                  id="eWaveNum"
                  type="text"
                  value={numWave}
                  onChange={(e) => setNumWave(e.target.value)}
                  placeholder="Ex : 07 08 08 08 08"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="eAddress" className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Adresse physique du centre local
                </label>
                <textarea
                  id="eAddress"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex : Face à la poste, à côté de l'école..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 bg-slate-50/50"
                  rows={3}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-slate-900 hover:bg-[#D4A017] disabled:bg-slate-400 text-white rounded-xl font-bold transition-all shadow-md shadow-slate-900/5 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Enregistrer la configuration</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-center space-y-3">
            <AlertCircle className="w-7 h-7 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-850 text-sm">Éditeur de Configuration</h4>
              <p className="text-xs text-slate-450 leading-relaxed">
                Sélectionnez une zone en cliquant sur l'icône de modification (**crayon**) pour modifier ses coordonnées et informations de facturation Wave CI.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
