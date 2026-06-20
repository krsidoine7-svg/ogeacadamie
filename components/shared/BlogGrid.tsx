"use client";

import React, { useState } from "react";
import { Calendar, ArrowRight, X, GraduationCap } from "lucide-react";

export interface BlogArticle {
  id: string;
  titre: string;
  slug: string;
  contenu: string | null;
  extrait: string | null;
  imageUrl: string | null;
  concours: string | null;
  auteurId: string | null;
  isPublished: boolean | null;
  publishedAt: Date | string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  deletedAt: Date | string | null;
}

interface BlogGridProps {
  articles: BlogArticle[];
}

export default function BlogGrid({ articles }: BlogGridProps) {
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-50 border border-slate-100 rounded-3xl text-slate-400 text-xs font-light">
        Aucune actualité publiée pour le moment. Revenez bientôt !
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div
            key={article.id}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:border-[#D4A017]/35 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                  {!article.concours || article.concours === "general" ? "Tous Concours" : article.concours.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(article.publishedAt || article.createdAt || new Date()).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-light tracking-tight text-slate-900 leading-snug">
                  {article.titre}
                </h4>
                <p className="text-slate-550 text-xs font-light leading-relaxed line-clamp-3">
                  {article.extrait || article.contenu?.slice(0, 120)}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedArticle(article)}
                className="flex items-center gap-1.5 text-xs font-bold text-[#D4A017] hover:text-yellow-600 transition-all cursor-pointer"
              >
                Savoir plus
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reading Article Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#D4A017] uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                    {!selectedArticle.concours || selectedArticle.concours === "general" ? "Général" : selectedArticle.concours.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedArticle.publishedAt || selectedArticle.createdAt || new Date()).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                  {selectedArticle.titre}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-full transition-all"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-650 text-sm font-light leading-relaxed whitespace-pre-line">
              {selectedArticle.imageUrl && (
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.titre}
                  className="w-full h-48 md:h-64 object-cover rounded-2xl shadow-sm border border-slate-100 mb-4"
                />
              )}
              {selectedArticle.contenu}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#D4A017]" />
                <span>OGE Académie — Infos admission</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
              >
                Fermer la lecture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
