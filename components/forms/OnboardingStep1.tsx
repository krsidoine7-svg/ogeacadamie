import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Phone, BookOpen, ChevronDown, Check } from "lucide-react";

import { step1Schema, Step1Data } from "@/lib/validations/inscription.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface OnboardingStep1Props {
  initialData: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
}

export default function OnboardingStep1({ initialData, onNext }: OnboardingStep1Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: "onChange",
    defaultValues: {
      nom: initialData.nom || "",
      prenom: initialData.prenom || "",
      serie_bac: initialData.serie_bac || "",
      whatsapp: initialData.whatsapp || "",
      email: initialData.email || "",
      password: initialData.password || "",
      acceptTerms: (initialData.acceptTerms || false) as true,
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedSerie = watch("serie_bac");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nom" className="text-slate-700 text-sm font-medium">
            Nom
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="nom"
              {...register("nom")}
              placeholder="Kouadio"
              className="pl-9 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-gold focus:ring-gold/20"
            />
          </div>
          {errors.nom && <p className="text-xs text-rose-500 font-medium">{errors.nom.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="prenom" className="text-slate-700 text-sm font-medium">
            Prénom
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              id="prenom"
              {...register("prenom")}
              placeholder="Jean"
              className="pl-9 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-gold focus:ring-gold/20"
            />
          </div>
          {errors.prenom && (
            <p className="text-xs text-rose-500 font-medium">{errors.prenom.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2" ref={containerRef}>
        <Label htmlFor="serie_bac" className="text-slate-700 text-sm font-medium">
          Série de Bac
        </Label>
        <div className="relative">
          <button
            id="serie_bac"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between pl-9 pr-4 h-10 bg-white border border-slate-200 text-slate-900 rounded-lg focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20 text-left text-sm cursor-pointer transition-all"
          >
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <span className={selectedSerie ? "text-slate-900 font-medium" : "text-slate-400"}>
              {selectedSerie ? `Série ${selectedSerie}` : "Sélectionnez votre série"}
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-100 max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1 duration-150">
              {["A1", "A2", "C", "D", "E"].map((serie) => {
                const isSelected = selectedSerie === serie;
                return (
                  <button
                    key={serie}
                    type="button"
                    onClick={() => {
                      setValue("serie_bac", serie, { shouldValidate: true });
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-gold/10 text-gold font-semibold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>Série {serie}</span>
                    {isSelected && <Check className="h-4 w-4 text-gold" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {errors.serie_bac && (
          <p className="text-xs text-rose-500 font-medium">{errors.serie_bac.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="whatsapp" className="text-slate-700 text-sm font-medium">
          Numéro WhatsApp
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="whatsapp"
            {...register("whatsapp")}
            placeholder="+2250700000000"
            className="pl-9 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-gold focus:ring-gold/20"
          />
        </div>
        {errors.whatsapp && (
          <p className="text-xs text-rose-500 font-medium">{errors.whatsapp.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-700 text-sm font-medium">
          Adresse e-mail
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="candidat@exemple.com"
            {...register("email")}
            className="pl-9 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-gold focus:ring-gold/20"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-700 text-sm font-medium">
          Mot de passe
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className="pl-9 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-gold focus:ring-gold/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2 pt-1">
          <input
            id="acceptTerms"
            type="checkbox"
            {...register("acceptTerms")}
            className="mt-0.5 h-4 w-4 rounded border-slate-350 text-gold focus:ring-gold/20 accent-[#D4A017] cursor-pointer"
          />
          <label
            htmlFor="acceptTerms"
            className="text-xs text-slate-500 leading-normal select-none cursor-pointer"
          >
            J&apos;accepte les{" "}
            <a
              href="/politique-de-confidentialite"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline font-semibold"
            >
              Conditions Générales d&apos;Utilisation
            </a>{" "}
            et la politique de confidentialité.
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-xs text-rose-500 font-medium">{errors.acceptTerms.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!isValid}
        className="w-full bg-gradient-to-r from-gold to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-medium shadow-md shadow-gold/10 h-10 rounded-lg disabled:opacity-50 disabled:pointer-events-none"
      >
        Continuer
      </Button>
    </form>
  );
}
