import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Monitor, Users } from "lucide-react";

import { step2Schema, Step2Data } from "@/lib/validations/inscription.schema";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface OnboardingStep2Props {
  initialData: Partial<Step2Data>;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}

export default function OnboardingStep2({ initialData, onNext, onBack }: OnboardingStep2Props) {
  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      concours: initialData.concours || [],
      mode_formation: initialData.mode_formation || "presentiel",
    },
  });

  const selectedConcours = watch("concours") || [];
  const selectedMode = watch("mode_formation");

  const toggleConcours = (value: "inphb" | "esatic" | "cme") => {
    if (selectedConcours.includes(value)) {
      setValue(
        "concours",
        selectedConcours.filter((c) => c !== value),
        { shouldValidate: true }
      );
    } else {
      setValue("concours", [...selectedConcours, value], { shouldValidate: true });
    }
  };

  const setMode = (value: "presentiel" | "en_ligne") => {
    setValue("mode_formation", value, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <div className="space-y-3">
        <Label className="text-slate-700 text-sm font-medium">Concours visés</Label>
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              id: "inphb",
              name: "INP-HB",
              school: "CPGE / DTS",
              desc: "Institut National Polytechnique Félix Houphouët-Boigny",
            },
            {
              id: "esatic",
              name: "ESATIC",
              school: "Licence Numérique",
              desc: "École Supérieure Africaine des TIC",
            },
            {
              id: "cme",
              name: "CME",
              school: "Filières Électricité",
              desc: "Centre des Métiers de l'Électricité",
            },
          ].map((item) => {
            const isSelected = selectedConcours.includes(item.id as any);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleConcours(item.id as any)}
                className={`w-full p-4 rounded-xl border text-left flex items-start justify-between transition-all duration-300 ${
                  isSelected
                    ? "bg-gold/10 border-gold shadow-md shadow-gold/5"
                    : "bg-white border-slate-200 hover:border-slate-350 text-slate-700"
                }`}
              >
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-bold text-base">{item.name}</span>
                    <span className="text-xs text-gold font-medium bg-gold/10 px-2 py-0.5 rounded-full">
                      {item.school}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5">{item.desc}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? "bg-gold border-gold text-white" : "border-slate-300"
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                      <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {errors.concours && (
          <p className="text-xs text-rose-500 font-medium">{errors.concours.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-slate-700 text-sm font-medium">Mode de préparation</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "presentiel", label: "Présentiel", icon: Users, desc: "Cours physiques" },
            { id: "en_ligne", label: "En Ligne", icon: Monitor, desc: "Via Internet" },
          ].map((item) => {
            const isSelected = selectedMode === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id as any)}
                className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all duration-300 ${
                  isSelected
                    ? "bg-gold/10 border-gold shadow-md shadow-gold/5"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? "bg-gold text-white"
                      : "bg-slate-50 border border-slate-200 text-slate-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-800 font-bold text-sm block">{item.label}</span>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">{item.desc}</span>
                </div>
              </button>
            );
          })}
        </div>
        {errors.mode_formation && (
          <p className="text-xs text-rose-500 font-medium">{errors.mode_formation.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          onClick={onBack}
          className="w-1/3 border border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50 font-medium h-10 rounded-lg"
        >
          Retour
        </Button>
        <Button
          type="submit"
          className="w-2/3 bg-gradient-to-r from-gold to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-medium shadow-md shadow-gold/10 h-10 rounded-lg"
        >
          Continuer
        </Button>
      </div>
    </form>
  );
}
