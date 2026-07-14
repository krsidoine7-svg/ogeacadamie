"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Journaliser l'erreur dans notre système central de supervision
    try {
      fetch("/api/logs/error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `[React ErrorBoundary] ${error.message || "Erreur de rendu interceptée"}`,
          level: "error",
          source: "client",
          stack: error.stack,
          context: {
            digest: error.digest,
            url: window.location.href,
          },
        }),
      }).catch(() => {});
    } catch (_) {}
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50 font-sans">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-2xl p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100 shadow-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Oops ! Une anomalie est survenue
          </h2>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Notre système de supervision a intercepté le problème et l'équipe technique en a été immédiatement alertée.
          </p>
        </div>

        {error.digest && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
            <p className="text-[11px] font-mono text-slate-500 truncate">
              <span className="font-bold text-slate-700">Code d'inspection :</span> {error.digest}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
