"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PaiementUpload from "@/components/forms/PaiementUpload";
import PaiementStatus from "@/components/dashboard/candidat/PaiementStatus";
import { Phone, ShieldAlert, CreditCard, HelpCircle, LogOut, Loader2, ExternalLink } from "lucide-react";

interface ZoneConfigData {
  zone: string;
  lienWave: string | null;
  adresse: string | null;
  telephone: string | null;
}

interface PaiementModalProps {
  isOpen: boolean;
  status: "en_attente" | "en_cours" | "valide" | "rejete";
  notes?: string | null;
  zoneConfig: ZoneConfigData | null;
  onUploadSuccess: () => void;
}

export default function PaiementModal({
  isOpen,
  status,
  notes,
  zoneConfig,
  onUploadSuccess,
}: PaiementModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Déconnexion réussie");
      router.push("/connexion");
      router.refresh();
    } catch {
      toast.error("Erreur lors de la déconnexion");
      setIsLoggingOut(false);
    }
  };

  const formatZoneName = (name: string) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  const isMerchantLink = zoneConfig?.lienWave?.startsWith("http");

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        className="sm:max-w-lg md:max-w-xl max-h-[90vh] overflow-y-auto bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-2xl [&>button]:hidden"
        showCloseButton={false}
      >
        <DialogHeader className="text-center pb-4 border-b border-slate-100">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 text-blue-600 border border-blue-100">
            <CreditCard className="w-6 h-6 text-[#00A3E0]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-[#0F172A]">
            Frais d&apos;Inscription Requis
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium mt-1">
            Pour accéder à l&apos;intégralité des cours et entraînements, veuillez procéder au règlement de vos frais d&apos;inscription unique de <span className="font-bold text-[#00A3E0]">15 000 FCFA</span> via **Wave CI**.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Display */}
          <PaiementStatus status={status} notes={notes} />

          {/* Payment Instructions / Wave Details */}
          {(status === "en_attente" || status === "rejete") && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#0F172A] tracking-wide uppercase">
                1. Effectuez votre versement Wave CI
              </h3>

              {zoneConfig?.lienWave ? (
                <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 space-y-3">
                  <p className="text-xs text-slate-650 font-medium leading-relaxed">
                    {isMerchantLink 
                      ? "Réglez vos frais d'inscription directement en ligne via notre lien de paiement Wave Marchand :"
                      : "Effectuez le transfert de 15 000 FCFA sur le numéro Wave CI suivant :"}
                  </p>

                  {isMerchantLink ? (
                    <div className="space-y-2">
                      <a
                        href={zoneConfig.lienWave!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-[#00A3E0] hover:bg-[#008cc0] text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wide"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Payer via Wave Marchand</span>
                      </a>
                      <p className="text-[10px] text-slate-400 text-center font-medium leading-normal">
                        Ce lien ouvre l'application Wave sur votre téléphone ou la page de paiement sécurisée Wave.
                      </p>
                    </div>
                  ) : (
                    <p className="text-base font-bold text-[#0F172A] select-all bg-white py-1.5 px-3 rounded border border-slate-250 inline-block font-mono">
                      {zoneConfig.lienWave}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center text-xs text-rose-800 font-medium">
                  Aucun compte Wave CI n&apos;est actuellement configuré dans votre zone. Veuillez contacter le responsable ci-dessous.
                </div>
              )}

              {/* Zone Details */}
              <div className="bg-[#0f172a]/5 border border-slate-200/60 rounded-xl p-4 text-xs text-slate-700 space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#D4A017] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">
                      Zone de formation : {zoneConfig ? formatZoneName(zoneConfig.zone) : "Non spécifiée"}
                    </p>
                    <p className="mt-0.5 text-slate-600 font-medium">
                      {zoneConfig?.adresse 
                        ? `Adresse physique : ${zoneConfig.adresse}` 
                        : "Veuillez contacter le responsable pour tout dépôt en espèces."}
                    </p>
                  </div>
                </div>

                {zoneConfig?.telephone && (
                  <div className="flex items-center gap-2 pt-1.5 border-t border-slate-200 text-slate-800">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span className="font-semibold">Responsable de Zone :</span>
                    <a href={`tel:${zoneConfig.telephone}`} className="font-bold hover:underline text-[#0F172A]">
                      {zoneConfig.telephone}
                    </a>
                  </div>
                )}
              </div>

              {/* Upload Title */}
              <div className="pt-2">
                <h3 className="text-sm font-bold text-[#0F172A] tracking-wide uppercase mb-3">
                  2. Soumettez votre reçu de paiement
                </h3>
                <PaiementUpload onUploadSuccess={onUploadSuccess} moyenPaiement="wave" />
              </div>
            </div>
          )}

          {status === "en_cours" && (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                <HelpCircle className="w-5 h-5 animate-pulse" />
              </div>
              <h3 className="font-bold text-[#0F172A] text-base">Validation en cours d&apos;étude</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Nos responsables vérifient la transaction sous un délai moyen de 2 heures. Vous recevrez une notification par email dès la validation de votre accès.
              </p>
              {zoneConfig?.telephone && (
                <div className="pt-4 flex items-center justify-center gap-1.5 text-xs text-slate-650 font-medium">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Besoin d&apos;aide ? Contactez le responsable au</span>
                  <a href={`tel:${zoneConfig.telephone}`} className="font-bold hover:underline text-[#0F172A]">
                    {zoneConfig.telephone}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action de déconnexion */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-rose-600 rounded-xl hover:bg-slate-50 border border-slate-200/80 hover:border-rose-100 transition-all duration-200 disabled:opacity-50 shadow-sm"
          >
            {isLoggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span>Se déconnecter</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
