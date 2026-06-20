"use client";

import React, { useState, useTransition } from "react";
import { Shield, ShieldAlert, Loader2 } from "lucide-react";
import { togglePdfSecurity } from "./actions";
import { toast } from "sonner";

interface Props {
  initialEnabled: boolean;
}

export default function PdfSecurityToggleButton({ initialEnabled }: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        const res = await togglePdfSecurity();
        if (res.success) {
          setEnabled(res.enabled!);
          toast.success(
            res.enabled
              ? "Sécurité des PDF activée : filigranes et restrictions anti-copie activés."
              : "Sécurité des PDF désactivée : filigranes masqués, téléchargement et impression autorisés."
          );
        } else {
          toast.error(res.error || "Une erreur est survenue lors de la configuration.");
        }
      } catch (err: any) {
        toast.error("Impossible de modifier la configuration.");
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-200 ${
        enabled ? "text-emerald-600" : "text-slate-400"
      }`}>
        {enabled ? "Sécurisé" : "Libre"}
      </span>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4A017] border shadow-inner ${
          enabled
            ? "bg-emerald-500 border-emerald-600 focus:ring-emerald-400"
            : "bg-slate-300 border-slate-400 focus:ring-slate-400"
        } ${isPending ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className="sr-only">Basculer la sécurité PDF</span>
        
        {/* Sliding indicator circle */}
        <span
          className={`flex h-6.5 w-6.5 items-center justify-center rounded-full bg-white shadow-md transform transition-all duration-300 ${
            enabled ? "translate-x-8.5" : "translate-x-0.5"
          }`}
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 text-[#D4A017] animate-spin" />
          ) : enabled ? (
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          )}
        </span>
      </button>
    </div>
  );
}
