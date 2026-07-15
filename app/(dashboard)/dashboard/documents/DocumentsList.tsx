"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, FileText, CheckSquare, ExternalLink, HelpCircle, Calendar, GraduationCap, Video, Clock, Globe } from "lucide-react";

interface DocumentItem {
  id: string;
  titre: string;
  description: string | null;
  fichierUrl: string | null;
  isExternalLink?: boolean | null;
  concours: string | null;
  type: "cours" | "exercice" | "corrige" | null;
  createdAt: Date | string | null;
  scheduledAt?: Date | string | null;
  meetingUrl?: string | null;
}

interface DocumentsListProps {
  documents: DocumentItem[];
  registeredConcours: string[];
  initialType?: string;
}

export default function DocumentsList({ 
  documents, 
  registeredConcours,
  initialType = "all"
}: DocumentsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeType, setActiveType] = useState<string>(initialType);
  const [activeConcours, setActiveConcours] = useState<string>("all");

  // Filtering logic
  const filteredDocuments = documents.filter((doc) => {
    // 1. Search Query filter
    const matchesSearch =
      doc.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description || "").toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Type filter
    const matchesType = activeType === "all" || doc.type === activeType;

    // 3. Concours filter
    const matchesConcours = activeConcours === "all" || doc.concours === activeConcours;

    return matchesSearch && matchesType && matchesConcours;
  });

  const getDocTypeIcon = (type: string | null) => {
    switch (type) {
      case "cours":
        return <BookOpen className="w-5 h-5 text-amber-650" />;
      case "exercice":
        return <FileText className="w-5 h-5 text-indigo-600" />;
      case "corrige":
        return <CheckSquare className="w-5 h-5 text-emerald-650" />;
      default:
        return <HelpCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getDocTypeLabel = (type: string | null) => {
    switch (type) {
      case "cours":
        return "Cours & Fiches";
      case "exercice":
        return "Sujet d'Entraînement";
      case "corrige":
        return "Corrigé Officiel";
      default:
        return "Document";
    }
  };

  const getDocTypeBadgeStyle = (type: string | null) => {
    switch (type) {
      case "cours":
        return "bg-amber-50 text-amber-800 border-amber-200/50";
      case "exercice":
        return "bg-indigo-50 text-indigo-850 border-indigo-200/50";
      case "corrige":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/50";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getConcoursBadge = (concours: string | null) => {
    if (!concours || concours === "tous") {
      return (
        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-slate-100 text-slate-655 border border-slate-200">
          Commun
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-gold/10 text-gold-950 border border-gold/20 uppercase">
        {concours}
      </span>
    );
  };

  const formatConcoursLabel = (name: string) => {
    if (name === "tous") return "Commun à tous";
    return `Concours ${name.toUpperCase()}`;
  };

  return (
    <div className="space-y-6">
      {/* Filters & Search Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white p-5 rounded-2xl border border-slate-250/60 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un cours, un sujet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all font-medium bg-slate-50/50"
          />
        </div>

        {/* Concours Filter tabs */}
        {registeredConcours.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveConcours("all")}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all border whitespace-nowrap ${
                activeConcours === "all"
                  ? "bg-[#0F172A] border-[#0F172A] text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:border-slate-350"
              }`}
            >
              Tous les concours
            </button>
            {registeredConcours.map((concours) => (
              <button
                key={concours}
                onClick={() => setActiveConcours(concours)}
                className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all border uppercase whitespace-nowrap ${
                  activeConcours === concours
                    ? "bg-[#0F172A] border-[#0F172A] text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:border-slate-350"
                }`}
              >
                {concours}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Type Badges Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveType("all")}
          className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${
            activeType === "all"
              ? "bg-[#0F172A] border-[#0F172A] text-white"
              : "bg-white border-slate-250 text-slate-600 hover:bg-slate-55/30"
          }`}
        >
          Tous les documents
        </button>
        <button
          onClick={() => setActiveType("cours")}
          className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-1.5 transition-all ${
            activeType === "cours"
              ? "bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-500/10"
              : "bg-white border-slate-250 text-slate-600 hover:bg-amber-50/20"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Cours & Fiches</span>
        </button>
        <button
          onClick={() => setActiveType("exercice")}
          className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-1.5 transition-all ${
            activeType === "exercice"
              ? "bg-indigo-650 border-indigo-650 text-white shadow-md shadow-indigo-500/10"
              : "bg-white border-slate-250 text-slate-600 hover:bg-indigo-50/20"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Sujets & Exercices</span>
        </button>
        <button
          onClick={() => setActiveType("corrige")}
          className={`px-4 py-1.5 rounded-full text-sm font-bold border flex items-center gap-1.5 transition-all ${
            activeType === "corrige"
              ? "bg-emerald-650 border-emerald-650 text-white shadow-md shadow-emerald-500/10"
              : "bg-white border-slate-250 text-slate-600 hover:bg-emerald-50/20"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Corrigés</span>
        </button>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => {
            const now = new Date();
            const schedDate = doc.scheduledAt ? new Date(doc.scheduledAt) : null;
            const isLive = schedDate && now >= schedDate && now <= new Date(schedDate.getTime() + 2 * 60 * 60 * 1000);
            const isUpcoming = schedDate && now < schedDate;
            const isExternal = doc.isExternalLink || doc.fichierUrl?.startsWith("http://") || doc.fichierUrl?.startsWith("https://");

            return (
              <div
                key={doc.id}
                className="group bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-gold/30 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className={`p-2.5 rounded-xl border flex items-center justify-center ${
                      schedDate 
                        ? (isLive ? "bg-red-50 text-red-650 border-red-200" : "bg-slate-100 text-slate-500 border-slate-200") 
                        : getDocTypeBadgeStyle(doc.type)
                    }`}>
                      {schedDate ? <Video className="w-5 h-5" /> : getDocTypeIcon(doc.type)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {getConcoursBadge(doc.concours)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                        {schedDate ? "Visioconférence" : getDocTypeLabel(doc.type)}
                      </span>
                      {isLive && (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          ● En direct
                        </span>
                      )}
                      {isUpcoming && (
                        <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          Programmé
                        </span>
                      )}
                      {isExternal && !schedDate && (
                        <span className="flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          <Globe className="w-2.5 h-2.5" /> Drive / Externe
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-gold transition-colors">
                      {doc.titre}
                    </h3>
                    {doc.description && (
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {doc.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold">
                    {schedDate ? <Clock className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                    <span>
                      {schedDate 
                        ? new Date(schedDate).toLocaleString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : (doc.createdAt
                            ? new Date(doc.createdAt).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "Date inconnue")
                      }
                    </span>
                  </div>

                  {schedDate ? (
                    doc.meetingUrl ? (
                      <a
                        href={doc.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold tracking-tight shadow-md transition-all duration-300 ${
                          isLive 
                            ? "bg-red-650 hover:bg-red-700 text-white shadow-red-500/10" 
                            : "bg-slate-100 hover:bg-slate-200 text-slate-650 hover:text-slate-800"
                        }`}
                      >
                        <span>{isLive ? "Rejoindre" : "Lien Meet"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-bold italic">Pas de lien</span>
                    )
                  ) : isExternal ? (
                    <a
                      href={`/api/documents/${doc.id}/view?redirect=true`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white hover:text-white rounded-xl text-sm font-bold tracking-tight shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-300"
                    >
                      <span>Ouvrir Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <Link
                      href={`/dashboard/documents/viewer?id=${doc.id}`}
                      target="_blank"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-[#D4A017] text-white hover:text-white rounded-xl text-sm font-bold tracking-tight shadow-md shadow-slate-900/5 hover:shadow-gold/10 transition-all duration-300"
                    >
                      <span>Ouvrir</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-3xl space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-850 text-sm sm:text-base">Aucun support de cours</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nous n'avons pas trouvé de document correspondant à vos critères de recherche ou de filtre actuels.
            </p>
          </div>
          {(searchQuery || activeType !== "all" || activeConcours !== "all") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveType("all");
                setActiveConcours("all");
              }}
              className="text-xs font-bold text-[#D4A017] hover:underline"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}
    </div>
  );
}
