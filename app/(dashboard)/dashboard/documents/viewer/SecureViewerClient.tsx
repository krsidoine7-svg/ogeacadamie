"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";

interface SecureViewerClientProps {
  pdfUrl: string;
  documentTitle: string;
  candidateEmail: string;
}

export default function SecureViewerClient({
  pdfUrl,
  documentTitle,
  candidateEmail,
}: SecureViewerClientProps) {
  const [isBlurred, setIsBlurred] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Block right click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.warning("Clic droit désactivé pour la sécurité du document.");
    };

    // 2. Block shortcut combinations (Print, Save, Dev Tools)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const isPrint = (isMac ? e.metaKey : e.ctrlKey) && e.key === "p";
      const isSave = (isMac ? e.metaKey : e.ctrlKey) && e.key === "s";
      const isInspect =
        e.key === "F12" ||
        ((isMac ? e.metaKey : e.ctrlKey) &&
          e.shiftKey &&
          (e.key === "I" || e.key === "i" || e.key === "C" || e.key === "c"));
      const isSource = (isMac ? e.metaKey : e.ctrlKey) && (e.key === "u" || e.key === "U");

      if (isPrint || isSave || isInspect || isSource) {
        e.preventDefault();
        e.stopPropagation();
        toast.error("Cette action est bloquée sur les documents sécurisés.");
        
        // If they try to print, let's clear the clipboard
        if (isPrint) {
          try {
            navigator.clipboard.writeText("ACCÈS SÉCURISÉ — PROPRIÉTÉ DE OGE ACADÉMIE. IMPRESSION NON AUTORISÉE.");
          } catch (_) {}
        }
      }
    };

    // 3. Clear clipboard on PrintScreen keyup
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        try {
          navigator.clipboard.writeText("CAPTURE D'ÉCRAN NON AUTORISÉE.");
          toast.error("Les captures d'écran sont interdites.");
        } catch (_) {}
      }
    };

    // 4. Blur screen when window loses focus (preventing screenshot capture applications/switching)
    const handleWindowBlur = () => {
      setIsBlurred(true);
    };

    const handleWindowFocus = () => {
      setIsBlurred(false);
    };

    // Add event listeners
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  // Generate repeating array of watermarks
  const watermarkText = `${candidateEmail} • OGE ACADÉMIE • ACCÈS SÉCURISÉ`;
  const watermarkItems = Array.from({ length: 48 });

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white flex flex-col font-sans select-none overflow-hidden relative">
      {/* Top Secure Header */}
      <header className="h-16 border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur px-4 sm:px-6 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/documents"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl border border-slate-850 hover:border-slate-700 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-bold text-xs sm:text-sm text-slate-200 truncate max-w-[200px] sm:max-w-md">
              {documentTitle}
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                Visualiseur Protégé
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/40 border border-slate-750 text-[10px] font-semibold text-slate-300">
          <Lock className="w-3.5 h-3.5 text-[#D4A017]" />
          <span className="hidden sm:inline">Identifiant : </span>
          <span className="font-mono text-[#D4A017]">{candidateEmail}</span>
        </div>
      </header>

      {/* Main View Area */}
      <div
        className="flex-1 w-full max-w-7xl mx-auto p-2 sm:p-4 md:p-6 flex items-center justify-center relative z-10 overflow-hidden"
        ref={containerRef}
      >
        {/* Repeating Watermark Grid Cover */}
        <div className="absolute inset-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-16 pointer-events-none z-20 overflow-hidden py-12 px-6">
          {watermarkItems.map((_, i) => (
            <div
              key={i}
              className="text-[11px] font-bold text-slate-650 opacity-[0.06] select-none tracking-widest whitespace-nowrap transform -rotate-25 text-center"
            >
              {watermarkText}
            </div>
          ))}
        </div>

        {/* PDF Frame */}
        <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-800 bg-white shadow-2xl flex items-center justify-center">
          <iframe
            src={pdfUrl}
            className={`w-full h-full border-none transition-all duration-300 ${
              isBlurred ? "blur-md scale-95 opacity-50" : ""
            }`}
            title={documentTitle}
          />

          {/* Pause overlay when blurred */}
          {isBlurred && (
            <div className="absolute inset-0 bg-[#0B0F19]/80 backdrop-blur-sm flex flex-col items-center justify-center text-center space-y-3 z-30 p-4">
              <div className="w-12 h-12 bg-slate-850 border border-slate-700/50 rounded-2xl flex items-center justify-center text-[#D4A017] animate-pulse">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="font-bold text-sm text-slate-100">Lecture en Pause</h2>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Cliquez n'importe où dans la fenêtre pour reprendre la lecture de votre support de cours.
              </p>
              <button
                onClick={() => setIsBlurred(false)}
                className="text-[11px] font-bold bg-white text-slate-950 px-4 py-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all shadow-lg"
              >
                Reprendre la lecture
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CSS styling specifically to prevent user text selection or browser default actions */}
      <style jsx global>{`
        body {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        iframe {
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
}
