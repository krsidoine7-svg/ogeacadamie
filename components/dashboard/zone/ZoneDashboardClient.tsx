"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, CheckCircle2, Eye, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import CaptureViewer from "./CaptureViewer";

interface CandidateDashboardData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  whatsapp: string | null;
  isActive: boolean | null;
  paymentStatus: "en_attente" | "en_cours" | "valide" | "rejete" | null;
  paymentId: string | null;
  paymentCaptureUrl: string | null;
  paymentNotes: string | null;
  paymentCreatedAt: Date | null;
  signedUrl?: string;
}

interface ZoneDashboardClientProps {
  stats: {
    total: number;
    actifs: number;
    aValider: number;
    rejete: number;
    nonSoumis: number;
  };
  recentSubmissions: CandidateDashboardData[];
  zoneName: string;
}

export default function ZoneDashboardClient({ stats, recentSubmissions, zoneName }: ZoneDashboardClientProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateDashboardData | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleOpenViewer = (candidate: CandidateDashboardData) => {
    setSelectedCandidate(candidate);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedCandidate(null);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const formatZoneName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).replace("-", " ");
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0F172A] p-6 sm:p-8 text-white shadow-md border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-[#D4A017]" />
        </div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <span className="inline-flex items-center gap-1 text-xs font-bold bg-[#D4A017]/25 text-[#D4A017] px-2.5 py-1 rounded-full border border-[#D4A017]/30 uppercase tracking-wider">
            Espace Manager de Zone
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Bienvenue sur votre Tableau de Bord, Zone {formatZoneName(zoneName)}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
            Gerez efficacement les candidatures de votre zone locale. Validez les reçus de paiement de 15 000 FCFA pour activer l&apos;accès aux cours en ligne et en présentiel.
          </p>
        </div>
      </div>

      {/* Grid containing Stats & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Stats Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Statistiques de la zone</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 min-w-0">
            {/* Total Inscrits */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Total Inscrits</span>
              <span className="text-2xl font-bold text-slate-800 mt-2">{stats.total}</span>
            </div>

            {/* Comptes Actifs */}
            <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider truncate">Comptes Actifs</span>
              <span className="text-2xl font-bold text-emerald-700 mt-2">{stats.actifs}</span>
            </div>

            {/* A Valider */}
            <div className="bg-amber-50/40 border border-amber-100/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider truncate">Paiements À Valider</span>
              <span className="text-2xl font-bold text-amber-700 mt-2">{stats.aValider}</span>
            </div>

            {/* Rejetés */}
            <div className="bg-rose-50/40 border border-rose-100/50 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider truncate">Paiements Rejetés</span>
              <span className="text-2xl font-bold text-rose-700 mt-2">{stats.rejete}</span>
            </div>

            {/* Non Soumis */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1 min-w-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Non Soumis</span>
              <span className="text-2xl font-bold text-slate-600 mt-2">{stats.nonSoumis}</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Links */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Accès Rapides</h3>
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
            <Link
              href="/zone/candidats"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition-all group font-semibold text-xs text-slate-700"
            >
              <span>Gérer les Candidats</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/zone/paiements"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition-all group font-semibold text-xs text-slate-700"
            >
              <span>Valider les Paiements</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/zone/parametres"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/70 transition-all group font-semibold text-xs text-slate-700"
            >
              <span>Paramètres de la Zone</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity / Submissions Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dernières soumissions à valider</h3>
          <Link
            href="/zone/paiements"
            className="text-xs font-bold text-[#D4A017] hover:underline flex items-center gap-1"
          >
            <span>Voir tous les paiements</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
          {recentSubmissions.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto stroke-1" />
              <h4 className="font-bold text-slate-700 text-xs">Aucune soumission en attente</h4>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                Tous les paiements soumis ont déjà été traités ou aucun candidat n&apos;a encore soumis de preuve de paiement.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentSubmissions.map((candidate) => (
                <div key={candidate.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 flex-shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs">
                        {candidate.prenom} {candidate.nom}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium truncate">{candidate.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                    {/* Submission Date */}
                    {candidate.paymentCreatedAt && (
                      <span className="text-slate-400 font-medium text-[11px] hidden md:inline">
                        Soumis le {formatDate(candidate.paymentCreatedAt)}
                      </span>
                    )}

                    {/* Badge */}
                    <div>
                      {candidate.paymentStatus === "valide" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Validé
                        </span>
                      )}
                      {candidate.paymentStatus === "en_cours" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          À valider
                        </span>
                      )}
                      {candidate.paymentStatus === "rejete" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                          Rejeté
                        </span>
                      )}
                    </div>

                    {/* Action */}
                    <button
                      onClick={() => handleOpenViewer(candidate)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all font-bold text-[11px] shadow-sm cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Inspecter</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Capture Viewer Modal Overlay */}
      {selectedCandidate && (
        <CaptureViewer
          candidate={selectedCandidate}
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
}
