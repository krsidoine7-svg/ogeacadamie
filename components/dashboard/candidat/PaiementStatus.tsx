"use client";

import React from "react";
import { Clock, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

interface PaiementStatusProps {
  status: "en_attente" | "en_cours" | "valide" | "rejete";
  notes?: string | null;
}

export default function PaiementStatus({ status, notes }: PaiementStatusProps) {
  const config = {
    en_attente: {
      color: "bg-slate-50 text-slate-700 border-slate-200",
      icon: Clock,
      label: "En attente de paiement",
      description: "Vous devez effectuer votre paiement d'inscription de 15 000 FCFA et soumettre la capture du reçu ci-dessous.",
    },
    en_cours: {
      color: "bg-amber-50 text-amber-800 border-amber-200",
      icon: Clock,
      label: "Vérification en cours",
      description: "Votre reçu de paiement a été soumis et est en cours de validation par nos équipes.",
    },
    valide: {
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      icon: CheckCircle2,
      label: "Paiement Validé",
      description: "Votre inscription est validée ! Vous avez maintenant un accès complet à tous les cours et entraînements.",
    },
    rejete: {
      color: "bg-rose-50 text-rose-800 border-rose-200",
      icon: AlertCircle,
      label: "Paiement Rejeté",
      description: "Votre preuve de paiement a été rejetée. Veuillez vérifier le motif et soumettre à nouveau une capture valide.",
    },
  };

  const current = config[status] || {
    color: "bg-slate-50 text-slate-700 border-slate-200",
    icon: HelpCircle,
    label: "Statut inconnu",
    description: "Statut de paiement non reconnu.",
  };

  const Icon = current.icon;

  return (
    <div className={`p-4 rounded-xl border ${current.color} flex flex-col sm:flex-row items-start sm:items-center gap-3.5 transition-all duration-300`}>
      <div className="p-2.5 bg-white rounded-lg shadow-sm border border-black/5 flex-shrink-0 flex items-center justify-center">
        <Icon className="w-5 h-5 text-current" />
      </div>
      <div className="flex-1 space-y-1">
        <h4 className="font-semibold text-sm leading-none text-slate-900">{current.label}</h4>
        <p className="text-xs text-slate-600 font-medium leading-normal">{current.description}</p>
        {status === "rejete" && notes && (
          <div className="mt-2 text-xs font-semibold bg-white/80 p-2 rounded-lg border border-rose-200 text-rose-950">
            <span className="font-bold text-rose-800">Motif du rejet :</span> {notes}
          </div>
        )}
      </div>
    </div>
  );
}
