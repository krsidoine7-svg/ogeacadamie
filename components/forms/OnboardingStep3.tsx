import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, User, Phone, BookOpen, Monitor, Users } from "lucide-react";

import { step3Schema, Step3Data } from "@/lib/validations/inscription.schema";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface OnboardingStep3Props {
  initialData: Partial<Step3Data>;
  recapData: {
    nom: string;
    prenom: string;
    serie_bac: string;
    whatsapp: string;
    email: string;
    concours: string[];
    mode_formation: string;
  };
  onSubmit: (data: Step3Data) => void;
  onBack: () => void;
  isLoading: boolean;
}

const zones = [
  { id: "yamoussoukro", name: "Yamoussoukro", desc: "Centre principal & Internat" },
  { id: "cocody", name: "Cocody", desc: "Abidjan Est" },
  { id: "yopougon", name: "Yopougon", desc: "Abidjan Ouest" },
  { id: "abobo", name: "Abobo", desc: "Abidjan Nord" },
  { id: "port-bouet", name: "Port-Bouët", desc: "Abidjan Sud" },
  { id: "bouake", name: "Bouaké", desc: "Centre-Nord" },
] as const;

export default function OnboardingStep3({
  initialData,
  recapData,
  onSubmit,
  onBack,
  isLoading,
}: OnboardingStep3Props) {
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    mode: "onChange",
    defaultValues: {
      zone: initialData.zone || undefined,
    },
  });

  const selectedZone = watch("zone");

  const handleSelectZone = (zoneId: "yamoussoukro" | "yopougon" | "abobo" | "cocody" | "port-bouet" | "bouake") => {
    setValue("zone", zoneId, { shouldValidate: true });
  };

  const getConcoursLabel = (c: string) => {
    switch (c) {
      case "inphb":
        return "INP-HB";
      case "esatic":
        return "ESATIC";
      case "cme":
        return "CME";
      default:
        return c.toUpperCase();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Sélection de Zone */}
      <div className="space-y-3">
        <Label className="text-slate-700 text-sm font-medium">Sélectionnez votre Zone Géographique</Label>
        <div className="grid grid-cols-2 gap-3">
          {zones.map((z) => {
            const isSelected = selectedZone === z.id;
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => handleSelectZone(z.id)}
                className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all duration-300 ${
                  isSelected
                    ? "bg-gold/10 border-gold shadow-md shadow-gold/5"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-slate-800 font-bold text-sm">{z.name}</span>
                  <span className="text-slate-500 text-[10px] mt-0.5">{z.desc}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? "bg-gold border-gold text-white" : "border-slate-300"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>
        {errors.zone && (
          <p className="text-xs text-rose-500 font-medium">{errors.zone.message}</p>
        )}
      </div>

      {/* Récapitulatif */}
      <div className="space-y-3">
        <Label className="text-slate-700 text-sm font-medium">Récapitulatif de votre candidature</Label>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-slate-700 text-sm">
          {/* Identité */}
          <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
            <User className="w-5 h-5 text-gold shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-900">
                {recapData.nom} {recapData.prenom}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className="text-slate-400">Email :</span> {recapData.email}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">WhatsApp :</span> {recapData.whatsapp}
              </p>
            </div>
          </div>

          {/* Bac et Concours */}
          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Série de Bac</span>
              <span className="text-slate-900 font-semibold flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-gold" />
                Série {recapData.serie_bac}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium block">Mode de préparation</span>
              <span className="text-slate-900 font-semibold flex items-center gap-1.5">
                {recapData.mode_formation === "presentiel" ? (
                  <>
                    <Users className="w-4 h-4 text-amber-500" />
                    Présentiel
                  </>
                ) : (
                  <>
                    <Monitor className="w-4 h-4 text-amber-500" />
                    En Ligne
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Concours Choisis */}
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium block">Concours préparés</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {recapData.concours.map((c) => (
                <span
                  key={c}
                  className="bg-gold/10 text-gold border border-gold/20 px-2 py-0.5 rounded text-xs font-semibold"
                >
                  {getConcoursLabel(c)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Boutons d'Action */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-1/3 border border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50 font-medium h-10 rounded-lg"
        >
          Retour
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !isValid}
          className="w-2/3 bg-gradient-to-r from-gold to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-medium shadow-md shadow-gold/10 h-10 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Inscription...
            </>
          ) : (
            "Confirmer mon inscription"
          )}
        </Button>
      </div>
    </form>
  );
}
