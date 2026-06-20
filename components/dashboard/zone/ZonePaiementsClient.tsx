"use client";

import React, { useState, useMemo } from "react";
import { Search, Phone, Eye, CheckCircle2, AlertCircle, Calendar, User, UserX, ExternalLink } from "lucide-react";
import CaptureViewer from "./CaptureViewer";

interface CandidatePaymentData {
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

interface ZonePaiementsClientProps {
  candidates: CandidatePaymentData[];
}

type FilterType = "tous" | "a_valider" | "valide" | "rejete" | "non_soumis";

export default function ZonePaiementsClient({ candidates }: ZonePaiementsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("a_valider"); // Default to pending validation
  const [selectedCandidate, setSelectedCandidate] = useState<CandidatePaymentData | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const handleOpenViewer = (candidate: CandidatePaymentData) => {
    setSelectedCandidate(candidate);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setSelectedCandidate(null);
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      // 1. Search filter
      const fullName = `${candidate.prenom} ${candidate.nom}`.toLowerCase();
      const email = candidate.email.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Status filter
      const status = candidate.paymentStatus || "en_attente";
      switch (activeFilter) {
        case "a_valider":
          return status === "en_cours";
        case "valide":
          return status === "valide";
        case "rejete":
          return status === "rejete";
        case "non_soumis":
          return status === "en_attente";
        case "tous":
        default:
          return true;
      }
    });
  }, [candidates, searchTerm, activeFilter]);

  const stats = useMemo(() => {
    const total = candidates.length;
    const aValider = candidates.filter(c => c.paymentStatus === "en_cours").length;
    const valide = candidates.filter(c => c.paymentStatus === "valide").length;
    const rejete = candidates.filter(c => c.paymentStatus === "rejete").length;
    const nonSoumis = candidates.filter(c => !c.paymentStatus || c.paymentStatus === "en_attente").length;

    return { total, aValider, valide, rejete, nonSoumis };
  }, [candidates]);

  return (
    <div className="space-y-6">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 min-w-0">
        {/* Total Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Total Inscrits</span>
          <span className="text-2xl font-bold text-slate-800 mt-2">{stats.total}</span>
        </div>
        {/* A Valider Card */}
        <div className="bg-amber-50/50 border border-amber-200/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider truncate">À Valider</span>
          <span className="text-2xl font-bold text-amber-700 mt-2">{stats.aValider}</span>
        </div>
        {/* Valide Card */}
        <div className="bg-emerald-50/50 border border-emerald-200/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider truncate">Validés</span>
          <span className="text-2xl font-bold text-emerald-700 mt-2">{stats.valide}</span>
        </div>
        {/* Rejete Card */}
        <div className="bg-rose-50/50 border border-rose-200/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-xs font-bold text-rose-800 uppercase tracking-wider truncate">Rejetés</span>
          <span className="text-2xl font-bold text-rose-700 mt-2">{stats.rejete}</span>
        </div>
        {/* Non Soumis Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1 lg:col-span-1 min-w-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Non Soumis</span>
          <span className="text-2xl font-bold text-slate-600 mt-2">{stats.nonSoumis}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-4 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveFilter("tous")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeFilter === "tous"
                ? "bg-[#0F172A] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 border border-slate-100"
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setActiveFilter("a_valider")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
              activeFilter === "a_valider"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-amber-700 hover:bg-amber-50/50 border border-amber-100/50"
            }`}
          >
            À valider ({stats.aValider})
          </button>
          <button
            onClick={() => setActiveFilter("valide")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeFilter === "valide"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-emerald-700 hover:bg-emerald-50/50 border border-emerald-100/50"
            }`}
          >
            Validés ({stats.valide})
          </button>
          <button
            onClick={() => setActiveFilter("rejete")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeFilter === "rejete"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-rose-700 hover:bg-rose-50/50 border border-rose-100/50"
            }`}
          >
            Rejetés ({stats.rejete})
          </button>
          <button
            onClick={() => setActiveFilter("non_soumis")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeFilter === "non_soumis"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Non soumis ({stats.nonSoumis})
          </button>
        </div>

        {/* Search input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un candidat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017] focus:border-transparent bg-slate-50/50"
          />
        </div>
      </div>

      {/* Candidates List/Table (Desktop version) */}
      <div className="hidden sm:block bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <UserX className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
            <h3 className="font-bold text-slate-700 text-sm">Aucun justificatif</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Il n&apos;y a aucun reçu correspondant à vos critères de recherche ou de filtre.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-bold tracking-wider">
                  <th className="px-6 py-4">Candidat</th>
                  <th className="px-6 py-4">WhatsApp</th>
                  <th className="px-6 py-4">Statut Compte</th>
                  <th className="px-6 py-4">Statut Paiement</th>
                  <th className="px-6 py-4">Date de soumission</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Candidate Identity */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">
                          {candidate.prenom} {candidate.nom}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">{candidate.email}</p>
                      </div>
                    </td>

                    {/* WhatsApp */}
                    <td className="px-6 py-4">
                      {candidate.whatsapp ? (
                        <a
                          href={`https://wa.me/${candidate.whatsapp.replace(/\s+/g, "").replace("+", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-600 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{candidate.whatsapp}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                        </a>
                      ) : (
                        <span className="text-slate-400 italic">Non renseigné</span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="px-6 py-4">
                      {candidate.isActive ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Actif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>En attente</span>
                        </span>
                      )}
                    </td>

                    {/* Payment Status Badge */}
                    <td className="px-6 py-4">
                      {candidate.paymentStatus === "valide" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Validé
                        </span>
                      )}
                      {candidate.paymentStatus === "en_cours" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">
                          À valider
                        </span>
                      )}
                      {candidate.paymentStatus === "rejete" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-100">
                          Rejeté
                        </span>
                      )}
                      {(!candidate.paymentStatus || candidate.paymentStatus === "en_attente") && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-slate-50 text-slate-500 border border-slate-200">
                          Non soumis
                        </span>
                      )}
                    </td>

                    {/* Submission Date */}
                    <td className="px-6 py-4 text-slate-500">
                      {candidate.paymentCreatedAt ? (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(candidate.paymentCreatedAt)}</span>
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {candidate.paymentCaptureUrl ? (
                        <button
                          onClick={() => handleOpenViewer(candidate)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all font-semibold shadow-sm cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>Inspecter</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Aucun reçu</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidates Mobile List (Mobile version) */}
      <div className="sm:hidden space-y-4">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white border border-slate-200/80 rounded-3xl space-y-3 shadow-sm">
            <UserX className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
            <h3 className="font-bold text-slate-700 text-sm">Aucun justificatif</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Il n&apos;y a aucun reçu correspondant à vos critères de recherche ou de filtre.
            </p>
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between min-w-0 gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {candidate.prenom} {candidate.nom}
                    </h4>
                    <p className="text-xs text-slate-400 font-medium truncate">{candidate.email}</p>
                  </div>
                </div>
                
                {/* Payment status badge */}
                <div>
                  {candidate.paymentStatus === "valide" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Validé
                    </span>
                  )}
                  {candidate.paymentStatus === "en_cours" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 animate-pulse">
                      À valider
                    </span>
                  )}
                  {candidate.paymentStatus === "rejete" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                      Rejeté
                    </span>
                  )}
                  {(!candidate.paymentStatus || candidate.paymentStatus === "en_attente") && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">
                      Non soumis
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                {/* WhatsApp info */}
                <div className="min-w-0">
                  <p className="text-slate-400 font-semibold mb-0.5">WhatsApp</p>
                  {candidate.whatsapp ? (
                    <a
                      href={`https://wa.me/${candidate.whatsapp.replace(/\s+/g, "").replace("+", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-700 hover:text-emerald-600 transition-colors font-bold truncate max-w-full"
                    >
                      <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{candidate.whatsapp}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Non renseigné</span>
                  )}
                </div>

                {/* Submission Date */}
                <div>
                  <p className="text-slate-400 font-semibold mb-0.5">Soumission</p>
                  {candidate.paymentCreatedAt ? (
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(candidate.paymentCreatedAt).split(" à ")[0]}</span>
                    </span>
                  ) : (
                    <span>-</span>
                  )}
                </div>
              </div>

              {/* Mobile Action Button */}
              <div className="pt-1 flex gap-2">
                {candidate.paymentCaptureUrl ? (
                  <button
                    onClick={() => handleOpenViewer(candidate)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold shadow-sm transition-all text-xs cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Inspecter le reçu</span>
                  </button>
                ) : (
                  <div className="w-full text-center py-2 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200 italic font-semibold text-xs">
                    Aucun reçu
                  </div>
                )}
              </div>
            </div>
          ))
        )}
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
