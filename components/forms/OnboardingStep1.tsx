import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, User, Phone, BookOpen } from "lucide-react";

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
    formState: { errors },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      nom: initialData.nom || "",
      prenom: initialData.prenom || "",
      serie_bac: initialData.serie_bac || "",
      whatsapp: initialData.whatsapp || "",
      email: initialData.email || "",
      password: initialData.password || "",
    },
  });

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

      <div className="space-y-2">
        <Label htmlFor="serie_bac" className="text-slate-700 text-sm font-medium">
          Série de Bac
        </Label>
        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            id="serie_bac"
            {...register("serie_bac")}
            className="w-full pl-9 pr-4 h-10 bg-white border border-slate-200 text-slate-900 rounded-lg focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/20"
          >
            <option value="" disabled className="text-slate-400">
              Sélectionnez votre série
            </option>
            <option value="A1" className="text-slate-900">
              Série A1
            </option>
            <option value="A2" className="text-slate-900">
              Série A2
            </option>
            <option value="C" className="text-slate-900">
              Série C
            </option>
            <option value="D" className="text-slate-900">
              Série D
            </option>
            <option value="E" className="text-slate-900">
              Série E
            </option>
          </select>
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
        {errors.password && (
          <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-gold to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-medium shadow-md shadow-gold/10 h-10 rounded-lg"
      >
        Continuer
      </Button>
    </form>
  );
}
