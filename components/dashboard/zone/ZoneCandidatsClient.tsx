"use client";

import React, { useState, useMemo } from "react";
import { Search, Phone, CheckCircle2, AlertCircle, Calendar, User, UserX, ExternalLink } from "lucide-react";

interface CandidateData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  whatsapp: string | null;
  isActive: boolean | null;
  paymentStatus: "en_attente" | "en_cours" | "valide" | "rejete" | null;
  paymentCreatedAt: Date | null;
}

interface ZoneCandidatsClientProps {
  candidates: CandidateData[];
}

type FilterType = "tous" | "actif" | "en_attente" | "non_soumis";

export default function ZoneCandidatsClient({ candidates }: ZoneCandidatsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("tous");

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  };

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const fullName = `${candidate.prenom} ${candidate.nom}`.toLowerCase();
      const email = candidate.email.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      switch (activeFilter) {
        case "actif":
          return candidate.isActive === true;
        case "en_attente":
          return candidate.isActive === false && candidate.paymentStatus === "en_cours";
        case "non_soumis":
          return !candidate.paymentStatus || candidate.paymentStatus === "en_attente";
        case "tous":
        default:
          return true;
      }
    });
  }, [candidates, searchTerm, activeFilter]);

  const stats = useMemo(() => {
    const total = candidates.length;
    const actifs = candidates.filter(c => c.isActive === true).length;
    const enAttenteValidation = candidates.filter(c => c.isActive === false && c.paymentStatus === "en_cours").length;
    const nonSoumis = candidates.filter(c => !c.paymentStatus || c.paymentStatus === "en_attente").length;

    return { total, actifs, enAttenteValidation, nonSoumis };
  }, [candidates]);

  return (
    <div className="space-y-6">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 min-w-0">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Total Inscrits</span>
          <span className="text-2xl font-bold text-slate-800 mt-2">{stats.total}</span>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-200/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider truncate">Comptes Actifs</span>
          <span className="text-2xl font-bold text-emerald-700 mt-2">{stats.actifs}</span>
        </div>
        <div className="bg-amber-50/50 border border-amber-200/40 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider truncate">En Attente</span>
          <span className="text-2xl font-bold text-amber-700 mt-2">{stats.enAttenteValidation}</span>
        </div>
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-w-0">
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
            onClick={() => setActiveFilter("actif")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeFilter === "actif"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-emerald-700 hover:bg-emerald-50/50 border border-emerald-100/50"
            }`}
          >
            Comptes Actifs ({stats.actifs})
          </button>
          <button
            onClick={() => setActiveFilter("en_attente")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeFilter === "en_attente"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-amber-700 hover:bg-amber-50/50 border border-amber-100/50"
            }`}
          >
            En Attente ({stats.enAttenteValidation})
          </button>
          <button
            onClick={() => setActiveFilter("non_soumis")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeFilter === "non_soumis"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Non Soumis ({stats.nonSoumis})
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
            <h3 className="font-bold text-slate-700 text-sm">Aucun candidat trouvé</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Il n&apos;y a aucun inscrit correspondant à vos critères de recherche.
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
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
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
            <h3 className="font-bold text-slate-700 text-sm">Aucun candidat trouvé</h3>
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <div key={candidate.id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3 min-w-0">
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
                
                <div>
                  {candidate.isActive ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-200">
                      En attente
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 min-w-0">
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

                <div className="min-w-0">
                  <p className="text-slate-400 font-semibold mb-0.5">Paiement</p>
                  {candidate.paymentStatus === "valide" && <span className="font-bold text-emerald-600">Validé</span>}
                  {candidate.paymentStatus === "en_cours" && <span className="font-bold text-amber-600">À valider</span>}
                  {candidate.paymentStatus === "rejete" && <span className="font-bold text-rose-600">Rejeté</span>}
                  {(!candidate.paymentStatus || candidate.paymentStatus === "en_attente") && <span className="text-slate-400 italic font-medium">Non soumis</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
