"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";

interface HeaderNavbarProps {
  activeMap: Record<string, boolean>;
  dbArticlesLength: number;
}

export default function HeaderNavbar({ activeMap, dbArticlesLength }: HeaderNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 py-4 sm:px-8 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Mobile & Tablet Mode: Hamburger Menu Trigger on the LEFT */}
        <div className="flex md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Menu principal"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Mode: Logo on the LEFT */}
        <div className="hidden md:flex">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-[#0F172A] fill-[#D4A017]/25" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              OGE <span className="text-[#D4A017]">Académie</span>
            </span>
          </Link>
        </div>

        {/* Desktop Mode: Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
          {activeMap.hero && <a href="#accueil" className="hover:text-[#D4A017] transition-all">Accueil</a>}
          {activeMap.historique && <a href="#historique" className="hover:text-[#D4A017] transition-all">Historique</a>}
          {activeMap.formation && <a href="#formations" className="hover:text-[#D4A017] transition-all">Formations</a>}
          {activeMap.resultats && <a href="#statistiques" className="hover:text-[#D4A017] transition-all">Résultats</a>}
          {dbArticlesLength > 0 && <a href="#blog" className="hover:text-[#D4A017] transition-all">Blog</a>}
        </nav>

        {/* Desktop Mode: Action Buttons on the RIGHT */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/connexion"
            className="text-sm font-bold text-slate-700 hover:text-[#0F172A] transition-all py-2 px-4"
            id="nav-connexion-btn"
          >
            Connexion
          </Link>
          <Link
            href="/inscription"
            className="text-sm font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] border border-transparent rounded-xl py-2 px-5 transition-all shadow-md"
            id="nav-inscription-btn"
          >
            S'inscrire
          </Link>
        </div>

        {/* Mobile & Tablet Mode: Logo on the RIGHT */}
        <div className="flex md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-[#0F172A] fill-[#D4A017]/25" />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              OGE <span className="text-[#D4A017]">Académie</span>
            </span>
          </Link>
        </div>

      </div>

      {/* Mobile & Tablet Dropdown Navigation (Glassmorphic & Premium style) */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-100 space-y-4 animate-slide-up bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-slate-100">
          <nav className="flex flex-col gap-3 text-sm font-bold text-slate-750">
            {activeMap.hero && (
              <a
                href="#accueil"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Accueil
              </a>
            )}
            {activeMap.historique && (
              <a
                href="#historique"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Historique
              </a>
            )}
            {activeMap.formation && (
              <a
                href="#formations"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Formations
              </a>
            )}
            {activeMap.resultats && (
              <a
                href="#statistiques"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Résultats
              </a>
            )}
            {dbArticlesLength > 0 && (
              <a
                href="#blog"
                onClick={() => setIsMenuOpen(false)}
                className="px-3 py-2 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Blog
              </a>
            )}
          </nav>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
            <Link
              href="/connexion"
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-bold text-slate-700 hover:text-[#0F172A] hover:bg-slate-50 rounded-xl transition-all border border-slate-200"
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              onClick={() => setIsMenuOpen(false)}
              className="w-full text-center py-2.5 text-sm font-bold text-white bg-[#0F172A] hover:bg-slate-800 rounded-xl transition-all shadow-md"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
