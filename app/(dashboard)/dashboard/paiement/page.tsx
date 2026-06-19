import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/db";
import { profiles, paiements } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft, CreditCard, Calendar, ShieldCheck, FileImage, ExternalLink, Download } from "lucide-react";
import Link from "next/link";

export default async function PaiementPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate user session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  // 2. Fetch user profile
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  });

  if (!profile) {
    redirect("/connexion");
  }

  // 3. Fetch payment details
  const payment = await db.query.paiements.findFirst({
    where: eq(paiements.userId, user.id),
  });

  // Calculate secure signed URL for the capture image
  let signedUrl = "";
  if (payment?.captureUrl) {
    try {
      const { data, error } = await supabase.storage
        .from("captures-paiements")
        .createSignedUrl(payment.captureUrl, 3600); // 1 hour expiry
      
      if (!error && data) {
        signedUrl = data.signedUrl;
      }
    } catch (err) {
      console.error("Error generating signed URL for receipt:", err);
    }
  }

  const formatZoneName = (name: string | null) => {
    if (!name) return "Non spécifiée";
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Back to dashboard */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au tableau de bord</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Payment Summary Details (Left/Main Panel) */}
        <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#0F172A]">Frais d'Inscription</h1>
                <p className="text-xs text-slate-400 font-semibold uppercase">Reçu Numérique</p>
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Réglé & Validé
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-slate-400 font-medium text-xs">Montant total</p>
              <p className="font-bold text-slate-900 text-lg">15 000 FCFA</p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-400 font-medium text-xs">Zone associée</p>
              <p className="font-semibold text-slate-700">
                {payment?.zone ? formatZoneName(payment.zone) : formatZoneName(profile.zone)}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-400 font-medium text-xs">Date du dépôt</p>
              <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{payment ? formatDate(payment.createdAt) : formatDate(profile.createdAt)}</span>
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-slate-400 font-medium text-xs">Date de validation</p>
              <p className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{payment?.valideAt ? formatDate(payment.valideAt) : "Automatique"}</span>
              </p>
            </div>
          </div>

          {/* Secure Payment details note */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 text-sm text-slate-500 leading-relaxed">
            <p className="font-bold text-slate-700 mb-1">À propos de vos frais d'inscription</p>
            Ce paiement unique couvre l'accès complet à la plateforme d'apprentissage OGE Académie jusqu'à la date finale des concours visés. Aucun frais additionnel ne sera exigé.
          </div>
        </div>

        {/* Receipt Image Preview Panel (Right Side) */}
        {signedUrl && (
          <div className="w-full md:w-80 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between gap-4 shadow-sm">
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FileImage className="w-4 h-4 text-[#D4A017]" />
                <span>Justificatif de Paiement</span>
              </h3>
              <p className="text-xs text-slate-500">
                Capture d'écran de la transaction soumise pour validation.
              </p>
            </div>

            <div className="relative border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 h-44 flex items-center justify-center">
              <img
                src={signedUrl}
                alt="Capture du reçu"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="flex gap-2">
              <a
                href={signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Agrandir</span>
              </a>
              <a
                href={signedUrl}
                download={`Recu_OGE_${profile.nom}.png`}
                className="bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
